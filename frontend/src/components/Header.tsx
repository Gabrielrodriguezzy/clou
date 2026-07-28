"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-sm" style={{ willChange: "transform" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo-clou.png"
              alt="Clou"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Clou</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
              Serviços
            </Link>
            <Link href="/#como-funciona" className="text-sm text-slate-400 hover:text-white transition-colors">
              Como Funciona
            </Link>
            <Link href="/#precos" className="text-sm text-slate-400 hover:text-white transition-colors">
              Preços
            </Link>
            <Link href="/#faq" className="text-sm text-slate-400 hover:text-white transition-colors">
              FAQ
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-800">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-accent text-sm !py-2 !px-4"
              >
                Criar Conta
              </Link>
            </div>
          </nav>

          {/* Theme Toggle + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in-up">
            <Link href="/" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Serviços</Link>
            <Link href="/#como-funciona" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Como Funciona</Link>
            <Link href="/#precos" className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileOpen(false)}>Preços</Link>
            <div className="pt-2 border-t border-slate-800 flex gap-3">
              <Link href="/login" className="btn-secondary text-sm !py-2 !px-4 flex-1 text-center" onClick={() => setMobileOpen(false)}>Entrar</Link>
              <Link href="/register" className="btn-accent text-sm !py-2 !px-4 flex-1 text-center" onClick={() => setMobileOpen(false)}>Criar Conta</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
