import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function scorePdfCV(pdfBuffer: Buffer, jobCriteria: string): Promise<{ score: number, summary: string, name: string, email: string, phone: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
Tu es un expert en recrutement (RH) ultra compétent.
On te donne un CV (sous forme de fichier PDF) et les critères d'une offre d'emploi.
Ta mission est d'analyser le CV et de fournir un résultat au format JSON strict (sans Markdown autour, juste le JSON).

CRITÈRES DE L'OFFRE :
${jobCriteria}

Analyse le CV par rapport aux critères et retourne UNIQUEMENT cet objet JSON :
{
  "name": "Nom du candidat s'il est trouvé, sinon ''",
  "email": "Email du candidat s'il est trouvé, sinon ''",
  "phone": "Téléphone du candidat s'il est trouvé, sinon ''",
  "score": <un entier entre 0 et 100 représentant la correspondance avec les critères>,
  "summary": "Un résumé (en français, max 3 phrases) expliquant concisément pourquoi ce score a été attribué (points forts et points faibles par rapport à l'offre)."
}
`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      }
    ]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up if the model wrapped it in markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return {
      score: parsed.score || 0,
      summary: parsed.summary || "Erreur lors de la génération du résumé.",
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || ""
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 0,
      summary: "Erreur d'analyse par l'IA.",
      name: "",
      email: "",
      phone: ""
    };
  }
}

export async function scoreCV(cvText: string, jobCriteria: string): Promise<{ score: number, summary: string, name: string, email: string, phone: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
Tu es un expert en recrutement (RH) ultra compétent.
On te donne un CV (sous forme de texte) et les critères d'une offre d'emploi.
Ta mission est d'analyser le CV et de fournir un résultat au format JSON strict (sans Markdown autour, juste le JSON).

CRITÈRES DE L'OFFRE :
${jobCriteria}

TEXTE DU CV :
${cvText}

Analyse le CV par rapport aux critères et retourne UNIQUMENT cet objet JSON :
{
  "name": "Nom du candidat s'il est trouvé, sinon ''",
  "email": "Email du candidat s'il est trouvé, sinon ''",
  "phone": "Téléphone du candidat s'il est trouvé, sinon ''",
  "score": <un entier entre 0 et 100 représentant la correspondance avec les critères>,
  "summary": "Un résumé (en français, max 3 phrases) expliquant concisément pourquoi ce score a été attribué (points forts et points faibles par rapport à l'offre)."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up if the model wrapped it in markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return {
      score: parsed.score || 0,
      summary: parsed.summary || "Erreur lors de la génération du résumé.",
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || ""
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      score: 0,
      summary: "Erreur d'analyse par l'IA.",
      name: "",
      email: "",
      phone: ""
    };
  }
}
