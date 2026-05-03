import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Activity, BarChart2, TrendingUp } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full"></div>
        {/* Simulating the glowing stars/comets from the image */}
        <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_2px_rgba(250,204,21,0.8)]"></div>
        <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_15px_3px_rgba(250,204,21,0.8)]"></div>
        <div className="absolute top-[40%] left-[40%] w-0.5 h-0.5 bg-yellow-400 rounded-full shadow-[0_0_5px_1px_rgba(250,204,21,0.8)]"></div>
        <div className="absolute top-[15%] right-[10%] w-1 h-1 bg-yellow-400 rounded-full shadow-[0_0_10px_2px_rgba(250,204,21,0.8)]"></div>

        {/* Comets */}
        <div className="absolute top-[30%] left-[5%] w-32 h-0.5 bg-gradient-to-r from-transparent to-yellow-400 transform -rotate-45 opacity-60 blur-[1px]"></div>
        <div className="absolute top-[15%] right-[15%] w-48 h-0.5 bg-gradient-to-r from-transparent to-yellow-400 transform rotate-12 opacity-60 blur-[1px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-6 pt-10 pb-4 md:py-6 max-w-7xl mx-auto header-safe">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-xl font-bold font-display">Quantara</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/auth')} className="text-sm font-medium hover:text-gray-300 transition-colors">Login</button>
          <button onClick={() => navigate('/auth')} className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors">Start Free</button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-display mb-6">
          Quantara: Trading Lab
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
          Discover hidden patterns in financial market data and maximize your trading profits with our advanced analysis platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={() => navigate('/auth')} className="bg-yellow-500 text-black px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors w-full sm:w-auto justify-center">
            Get Started <ArrowRight size={18} />
          </button>
          <button className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors w-full sm:w-auto justify-center">
            <Play size={18} /> Watch Demo
          </button>
        </div>
      </main>

      {/* Trusted By */}
      <section className="relative z-10 py-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 font-medium mb-6">Trusted by traders worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
            {/* Placeholder logos */}
            <div className="flex items-center gap-2 font-bold text-xl"><Activity size={24} /> AA</div>
            <div className="flex items-center gap-2 font-bold text-xl"><BarChart2 size={24} /> Financial Bank</div>
            <div className="flex items-center gap-2 font-bold text-xl"><TrendingUp size={24} /> UNBU</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Activity size={24} /> Smallkwood</div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative z-10 py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-16 font-display">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold">Advanced Pattern Recognition</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Advanced pattern Recognition in financial market data and maximize your trading with advanced series.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-bold">Real-time Market Data</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Real-time market data is discover hidden analysis platform tour performances to anneurs market data.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold">Performance Analytics</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Performance analytics is really new and optimizes understanding relevancy and performance analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; 2024 Quantara. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
