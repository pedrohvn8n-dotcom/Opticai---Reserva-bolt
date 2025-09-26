import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import ManagementSystem from './components/ManagementSystem';
import AIAgents from './components/AIAgents';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Hero />
      <ProblemSolution />
      <ManagementSystem />
      <AIAgents />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;