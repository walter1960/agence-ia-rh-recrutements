"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    criteria: "",
    targetCount: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Erreur lors de la création de l'offre");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Créer une offre d'emploi
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </h1>
        <p className="text-slate-400 mt-2">
          Définissez précisément vos critères. L'IA utilisera ces informations pour filtrer les CV.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
              Titre du poste <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="ex: Développeur Fullstack Senior"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description / Contexte (optionnel)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Un bref résumé du poste et de l'équipe..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="criteria" className="block text-sm font-medium text-slate-300 mb-1 flex justify-between">
              <span>Critères de sélection pour l'IA <span className="text-red-400">*</span></span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Soyez précis (ex: "Minimum 5 ans d'expérience en React, maîtrise de Node.js, diplôme d'ingénieur").
            </p>
            <textarea
              id="criteria"
              required
              rows={5}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
              placeholder="- Au moins 3 ans sur React&#10;- Bilingue anglais&#10;- Expérience AWS..."
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-slate-300 mb-1">
              Nombre de candidats souhaités au final <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-2">
              L'IA retiendra uniquement les X meilleurs profils qui correspondent aux critères.
            </p>
            <input
              type="number"
              id="targetCount"
              min="1"
              max="50"
              required
              className="w-full sm:w-48 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={formData.targetCount}
              onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 5 })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {loading ? "Création..." : "Lancer le recrutement"}
          </button>
        </div>
      </form>
    </div>
  );
}
