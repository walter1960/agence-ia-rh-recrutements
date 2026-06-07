import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Users, ArrowRight, Plus, Briefcase } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const jobs = await prisma.job.findMany({
    where: { userId: (session?.user as any)?.id },
    include: {
      _count: {
        select: { candidates: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tableau de Bord</h1>
          <p className="text-slate-400 mt-1">Gérez vos offres et consultez les sélections de l'IA.</p>
        </div>
        
        <Link 
          href="/dashboard/job/new"
          className="sm:hidden flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-500"
        >
          <Plus className="h-5 w-5" />
          Nouvelle offre
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 py-24 text-center backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 mb-6">
            <FileText className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">Aucune offre active</h3>
          <p className="mt-2 text-slate-400 max-w-sm">
            Créez votre première offre d'emploi pour commencer à recevoir et filtrer automatiquement les CV.
          </p>
          <Link
            href="/dashboard/job/new"
            className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Créer ma première offre
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/dashboard/job/${job.id}`} className="group block">
              <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-800/50 hover:shadow-xl hover:shadow-indigo-500/10">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-indigo-500/10 p-3">
                      <Briefcase className="h-6 w-6 text-indigo-400" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                      Actif
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white line-clamp-1">{job.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                    {job.description || job.criteria}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>{job._count.candidates} CV analysés</span>
                  </div>
                  <div className="flex items-center justify-center rounded-full bg-slate-800 p-2 text-white transition-transform group-hover:bg-indigo-600 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
