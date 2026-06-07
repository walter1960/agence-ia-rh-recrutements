"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Plus, UserCircle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <Briefcase className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Smart<span className="text-indigo-400">RH</span>
                </span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/job/new"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Plus className="h-4 w-4" />
              Nouvelle offre
            </Link>
            
            <div className="hidden sm:block h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium text-slate-200">{session?.user?.name}</span>
                <span className="text-xs text-slate-500">{session?.user?.email}</span>
              </div>
              {session?.user?.image ? (
                <img className="h-9 w-9 rounded-full border border-slate-700" src={session.user.image} alt="" />
              ) : (
                <UserCircle className="h-9 w-9 text-slate-400" />
              )}
              
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
