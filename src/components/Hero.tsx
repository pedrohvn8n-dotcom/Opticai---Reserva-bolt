import React from 'react';
import { ArrowRight, Bot, Zap, TrendingUp } from 'lucide-react';

const Hero = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Olá! Quero conhecer a OpticAI e transformar minha ótica";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 px-4 py-2 rounded-full border border-cyan-500/20">
                <Bot className="h-5 w-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Revolucione sua ótica</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transforme sua ótica com{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              A OpticAI é mais que um software. É o seu sistema de gestão inteligente e 
              a sua equipe de agentes de IA trabalhando 24/7 para automatizar processos, 
              impulsionar vendas e liberar você para focar no crescimento do negócio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center space-x-2"
              >
                <span>Quero Conhecer a OpticAI</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-cyan-400 mr-2" />
                  <span className="text-2xl font-bold text-white">24/7</span>
                </div>
                <p className="text-sm text-slate-400">Automação Inteligente</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-cyan-400 mr-2" />
                  <span className="text-2xl font-bold text-white">+40%</span>
                </div>
                <p className="text-sm text-slate-400">Aumento em Vendas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Bot className="h-6 w-6 text-cyan-400 mr-2" />
                  <span className="text-2xl font-bold text-white">5</span>
                </div>
                <p className="text-sm text-slate-400">Agentes de IA</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl">
              {/* Mock Dashboard */}
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Dashboard OpticAI</h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 p-3 rounded-lg border border-cyan-500/30">
                    <p className="text-cyan-400 text-sm">Vendas Hoje</p>
                    <p className="text-white text-xl font-bold">R$ 12.450</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 p-3 rounded-lg border border-green-500/30">
                    <p className="text-green-400 text-sm">Leads Ativos</p>
                    <p className="text-white text-xl font-bold">23</p>
                  </div>
                </div>
              </div>

              {/* Mock AI Chat */}
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Bot className="h-5 w-5 text-cyan-400 mr-2" />
                  <span className="text-white font-semibold">Atendente Digital</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-cyan-500/20 p-2 rounded-lg border-l-2 border-cyan-400">
                    <p className="text-slate-300 text-sm">Olá! Posso te ajudar com informações sobre seus óculos?</p>
                  </div>
                  <div className="bg-slate-600 p-2 rounded-lg">
                    <p className="text-slate-300 text-sm">Meu óculos já chegou?</p>
                  </div>
                  <div className="bg-cyan-500/20 p-2 rounded-lg border-l-2 border-cyan-400">
                    <p className="text-slate-300 text-sm">Sim! Seus óculos chegaram ontem. Pode buscar a partir das 9h. 😊</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-cyan-400 w-6 h-6 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;