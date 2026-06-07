import { prisma } from "./prisma";
import { scoreCV, scorePdfCV } from "./gemini";

export async function scanEmailsForJob(jobId: string, userId: string) {
  const account = await prisma.account.findFirst({
    where: { 
      userId, 
      provider: { in: ["google", "azure-ad"] } 
    }
  });

  if (!account || !account.access_token) {
    throw new Error("Aucun compte Google ou Microsoft connecté, ou token d'accès manquant.");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  if (account.provider === "google") {
    const validToken = await getValidGoogleToken(account);
    await scanGmail(validToken, job);
  } else if (account.provider === "azure-ad") {
    await scanOutlook(account.access_token, job);
  }

  await updateTopCandidates(job.id, job.targetCount);
  return { success: true };
}

async function getValidGoogleToken(account: any) {
  const isExpired = !account.expires_at || account.expires_at * 1000 < Date.now() + 5 * 60 * 1000;
  
  if (!isExpired) {
    return account.access_token;
  }

  if (!account.refresh_token) {
    throw new Error("Token expiré et aucun refresh token disponible. Veuillez vous reconnecter.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  const tokens = await response.json();

  if (!response.ok) {
    throw new Error(`Erreur lors du rafraîchissement du token: ${JSON.stringify(tokens)}`);
  }

  const newExpiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      expires_at: newExpiresAt,
      ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
    },
  });

  return tokens.access_token;
}

async function scanGmail(accessToken: string, job: any) {
  const query = encodeURIComponent("has:attachment filename:pdf");
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=5`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    throw new Error(`Gmail API error: ${await listRes.text()}`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  for (const msg of messages) {
    const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const msgData = await msgRes.json();

    const parts = msgData.payload?.parts || [];
    let attachmentId = null;
    let filename = "";

    for (const part of parts) {
      if (part.filename && part.filename.toLowerCase().endsWith(".pdf") && part.body?.attachmentId) {
        attachmentId = part.body.attachmentId;
        filename = part.filename;
        break;
      }
    }

    if (attachmentId) {
      const attRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const attData = await attRes.json();

      if (attData.data) {
        const b64 = attData.data.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(b64, 'base64');
        await processPdfBuffer(buffer, filename, job);
      }
    }
    
    // Mark as read
    await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ removeLabelIds: ["UNREAD"] })
    });
  }
}

async function scanOutlook(accessToken: string, job: any) {
  const listUrl = `https://graph.microsoft.com/v1.0/me/messages?$filter=hasAttachments eq true&$top=5`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    throw new Error(`Microsoft Graph API error: ${await listRes.text()}`);
  }

  const listData = await listRes.json();
  const messages = listData.value || [];

  for (const msg of messages) {
    const attUrl = `https://graph.microsoft.com/v1.0/me/messages/${msg.id}/attachments`;
    const attRes = await fetch(attUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const attData = await attRes.json();
    const attachments = attData.value || [];

    for (const att of attachments) {
      if (att.name && att.name.toLowerCase().endsWith(".pdf") && att.contentBytes) {
        const buffer = Buffer.from(att.contentBytes, 'base64');
        await processPdfBuffer(buffer, att.name, job);
        break; 
      }
    }
  }
}

async function processPdfBuffer(buffer: Buffer, filename: string, job: any) {
  try {
    const aiResult = await scorePdfCV(buffer, job.criteria);
    
    // Ignore results with 0 score and empty name if AI failed completely
    if (aiResult.score === 0 && !aiResult.name) {
      console.log(`Skipped ${filename} because AI could not extract data properly.`);
      return;
    }
    
    await prisma.candidate.create({
      data: {
        jobId: job.id,
        name: aiResult.name || filename,
        email: aiResult.email || "",
        phone: aiResult.phone || "",
        score: aiResult.score,
        summary: aiResult.summary,
        cvText: "(PDF analysé nativement par Gemini)",
        status: "PENDING"
      }
    });
  } catch(e) {
    console.error(`Error processing PDF ${filename} with Gemini natively`, e);
  }
}

async function updateTopCandidates(jobId: string, targetCount: number) {
  const allCandidates = await prisma.candidate.findMany({
    where: { jobId },
    orderBy: { score: 'desc' }
  });

  const topN = allCandidates.slice(0, targetCount);
  
  for (const c of topN) {
    await prisma.candidate.update({
      where: { id: c.id },
      data: { status: "SELECTED" }
    });
  }
  
  const others = allCandidates.slice(targetCount);
  for (const c of others) {
     if (c.status !== "REJECTED") {
       await prisma.candidate.update({
         where: { id: c.id },
         data: { status: "REJECTED" }
       });
     }
  }
}
