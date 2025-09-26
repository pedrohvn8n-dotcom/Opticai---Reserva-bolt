import React, { useState } from 'react';
import { Menu, X, Eye } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Olá! Gostaria de saber mais sobre a OpticAI";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="fixed w-full top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-400 p-2 rounded-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="text-xl font-bold">
              <span className="text-white">Optic</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#gestao" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Sistema de Gestão
            </a>
            <a href="#agentes" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Agentes de IA
            </a>
            <a href="#solucoes" className="text-slate-300 hover:text-cyan-400 transition-colors">
              Soluções
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
            >
              Falar no WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-800 rounded-lg mt-2">
              <a
                href="#gestao"
                className="block px-3 py-2 text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sistema de Gestão
              </a>
              <a
                href="#agentes"
                className="block px-3 py-2 text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Agentes de IA
              </a>
              <a
                href="#solucoes"
                className="block px-3 py-2 text-slate-300 hover:text-cyan-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Soluções
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 mt-4"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;