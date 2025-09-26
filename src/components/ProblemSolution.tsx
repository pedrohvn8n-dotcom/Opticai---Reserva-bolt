import React from 'react';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const ProblemSolution = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Quero resolver os problemas da minha ótica com a OpticAI";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="py-20 bg-slate-900" id="solucoes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Cansado do <span className="text-red-400">Caos</span> na sua ótica?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A OpticAI transforma problemas complexos em soluções automatizadas, 
            liberando você para focar no que realmente importa: crescer o negócio.
          </p>
        </div>

        {/* Main Problem/Solution */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Problem */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 p-8 rounded-2xl border border-red-500/20">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">O Problema</h3>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 text-lg">
                A gestão da sua ótica é confusa: você gasta horas procurando informações de vendas, 
                não tem clareza do faturamento e não sabe o que seus clientes realmente pensam.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Relatórios desorganizados ou inexistentes
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Perda de leads por falta de agilidade no atendimento
                </li>
                <li className="flex items-center text-slate-300">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Clientes esquecidos, sem follow-up
                </li>
              </ul>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/5 p-8 rounded-2xl border border-cyan-500/20">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-cyan-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">A Solução OpticAI</h3>
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 text-lg">
                <strong className="text-cyan-400">Centralize todo o controle da sua ótica em um só lugar</strong> com 
                nosso ERP inteligente. Ao mesmo tempo, impulsione suas vendas e automatize a comunicação 
                com clientes através de agentes de IA dedicados no WhatsApp.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  Dashboard intuitivo com dados em tempo real
                </li>
                <li className="flex items-center text-slate-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  Atendimento automático 24/7 no WhatsApp
                </li>
                <li className="flex items-center text-slate-300">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                  Automação completa de follow-up e relacionamento
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            <span>Quero Acabar com o Caos da Minha Ótica</span>
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;