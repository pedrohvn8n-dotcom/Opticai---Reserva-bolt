import React from 'react';
import { MessageCircle, Zap, TrendingUp, Clock } from 'lucide-react';

const CTA = () => {
  const whatsappNumber = "5581988984547";
  const whatsappMessage = "Quero transformar minha ótica com a OpticAI agora!";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main CTA */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-12 rounded-3xl border border-slate-700 shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Revolucionar
            </span>{' '}
            sua Ótica?
          </h2>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Pare de perder tempo com tarefas repetitivas e oportunidades de venda. 
            A OpticAI está pronta para trabalhar 24/7 na sua ótica.
          </p>

          {/* Benefits Row */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <span className="text-slate-300">Implementação Rápida</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <span className="text-slate-300">Resultados Imediatos</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              <span className="text-slate-300">ROI Comprovado</span>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:from-cyan-400 hover:to-blue-500 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
          >
            <MessageCircle className="mr-3 h-6 w-6" />
            <span>Falar com Especialista Agora</span>
          </a>

          <p className="text-sm text-slate-400 mt-4">
            Resposta em até 5 minutos • WhatsApp: (81) 9 8898-4547
          </p>
        </div>

        {/* Secondary CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Tem Dúvidas?</h3>
            <p className="text-slate-300 text-sm mb-4">
              Fale conosco e entenda como a OpticAI pode transformar sua ótica
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
            >
              Tirar Dúvidas no WhatsApp →
            </a>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">Quer Ver Funcionando?</h3>
            <p className="text-slate-300 text-sm mb-4">
              Agende uma demonstração personalizada para sua ótica
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
            >
              Agendar Demonstração →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;