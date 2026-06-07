"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, Mail, Briefcase, ChevronRight } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Bot className="h-12 w-12 text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[40%] -left-[10%] h-[70%] w-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute -bottom-[40%] -right-[10%] h-[70%] w-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="z-10 flex w-full max-w-6xl flex-col items-center lg:flex-row lg:justify-between lg:gap-12">
        {/* Left side: Copy & Value prop */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left lg:w-1/2"
        >
          <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-md">
            <Sparkles className="mr-2 h-4 w-4" />
            La révolution du recrutement est là
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">RH</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg text-slate-400 sm:text-xl">
            Connectez votre boîte mail en un clic. Laissez notre IA analyser, filtrer et extraire les meilleurs CV selon vos critères précis, pendant que vous dormez.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">Lecture Automatique</span>
                <span className="text-sm text-slate-500">Scanner vos emails entrants</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                <Briefcase className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">Analyse IA</span>
                <span className="text-sm text-slate-500">Sélection des top profils</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-16 w-full max-w-md lg:mt-0 lg:w-1/2"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-[50px]" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="mb-2 text-2xl font-bold text-white">Connexion RH</h2>
              <p className="mb-8 text-slate-400 text-sm">
                Connectez votre adresse professionnelle pour démarrer l'automatisation.
              </p>

              <div className="w-full space-y-4">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-lg active:scale-95"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuer avec Google (Gmail)
                  <ChevronRight className="absolute right-4 h-5 w-5 text-slate-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-[#00a4ef]/10 border border-[#00a4ef]/30 px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-[#00a4ef]/20 hover:shadow-lg active:scale-95"
                >
                  <svg className="h-5 w-5" viewBox="0 0 21 21">
                    <path fill="#f35325" d="M0 0h10v10H0z" />
                    <path fill="#81bc06" d="M11 0h10v10H11z" />
                    <path fill="#05a6f0" d="M0 11h10v10H0z" />
                    <path fill="#ffba08" d="M11 11h10v10H11z" />
                  </svg>
                  Continuer avec Microsoft (Outlook)
                  <ChevronRight className="absolute right-4 h-5 w-5 text-slate-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <div className="h-px w-8 bg-slate-800" />
                <span>Sécurisé et RGPD Compliant</span>
                <div className="h-px w-8 bg-slate-800" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
