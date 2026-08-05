"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.05)] bg-[#08090a]/70 backdrop-blur-sm" style={{ willChange: "transform" }}>
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
            <Link href="/" className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors">
              Serviços
            </Link>
            <Link href="/instagram" className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all duration-200">
              Instagram
            </Link>
            <Link href="/#como-funciona" className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors">
              Como Funciona
            </Link>
            <Link href="/#precos" className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors">
              Preços
            </Link>
            <Link href="/#faq" className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors">
              FAQ
            </Link>
            <Link href="/afiliados" className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors font-medium">
              Afiliados
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[rgba(255,255,255,0.05)]">
              <Link
                href="/login"
                className="text-sm text-[#d0d6e0] hover:text-[#f7f8f8] transition-colors font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm !py-2 !px-4"
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
            <Link href="/" className="block text-sm text-[#d0d6e0] hover:text-[#f7f8f8] py-2" onClick={() => setMobileOpen(false)}>Serviços</Link>
            <Link href="/instagram" className="block text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent py-2" onClick={() => setMobileOpen(false)}>Instagram</Link>
            <Link href="/#como-funciona" className="block text-sm text-[#d0d6e0] hover:text-[#f7f8f8] py-2" onClick={() => setMobileOpen(false)}>Como Funciona</Link>
            <Link href="/#precos" className="block text-sm text-[#d0d6e0] hover:text-[#f7f8f8] py-2" onClick={() => setMobileOpen(false)}>Preços</Link>
            <Link href="/#faq" className="block text-sm text-[#d0d6e0] hover:text-[#f7f8f8] py-2" onClick={() => setMobileOpen(false)}>FAQ</Link>
            <Link href="/afiliados" className="block text-sm text-[#d0d6e0] hover:text-[#f7f8f8] font-medium py-2" onClick={() => setMobileOpen(false)}>Afiliados</Link>
            <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] flex gap-3">
              <Link href="/login" className="btn-secondary text-sm !py-2 !px-4 flex-1 text-center" onClick={() => setMobileOpen(false)}>Entrar</Link>
              <Link href="/register" className="btn-primary text-sm !py-2 !px-4 flex-1 text-center" onClick={() => setMobileOpen(false)}>Criar Conta</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}