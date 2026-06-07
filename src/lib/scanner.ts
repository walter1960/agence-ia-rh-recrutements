import { prisma } from "./prisma";
import { scoreCV } from "./gemini";

let pdfParse: any = null;
try {
  pdfParse = require("pdf-parse");
} catch (e) {
  console.warn("pdf-parse non disponible");
}

export async function scanEmailsForJob(jobId: string, userId: string) {
  // 1. Get user's account to find the access token
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
    await scanGmail(account.access_token, job);
  } else if (account.provider === "azure-ad") {
    await scanOutlook(account.access_token, job);
  }

  // 3. Update top candidates to SELECTED
  await updateTopCandidates(job.id, job.targetCount);
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
      if (part.filename && part.filename.toLowerCase().endsWith(".pdf") && part.body.attachmentId) {
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
        const b64 = attData.data.replace(/-/g, '+').replace(/_/, '/');
        const buffer = Buffer.from(b64, 'base64');
        await processPdfBuffer(buffer, filename, job);
      }
    }
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
        break; // Process one PDF per email to save time
      }
    }
  }
}

async function processPdfBuffer(buffer: Buffer, filename: string, job: any) {
  let cvText = "Texte du CV illisible ou pdf-parse non disponible.";
  if (pdfParse) {
    try {
      const data = await pdfParse(buffer);
      cvText = data.text;
    } catch(e) {
      console.error("PDF Parse error", e);
    }
  }

  if (cvText.trim().length > 50) {
    const aiResult = await scoreCV(cvText, job.criteria);
    
    await prisma.candidate.create({
      data: {
        jobId: job.id,
        name: aiResult.name || filename,
        email: aiResult.email,
        phone: aiResult.phone,
        score: aiResult.score,
        summary: aiResult.summary,
        cvText: cvText.substring(0, 5000),
        status: "PENDING"
      }
    });
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
