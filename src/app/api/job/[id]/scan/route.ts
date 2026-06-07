import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scanEmailsForJob } from "@/lib/scanner";

export const maxDuration = 60; // Allow up to 60 seconds for processing multiple CVs

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await scanEmailsForJob(jobId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
