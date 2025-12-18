import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiTrendingUp, FiUsers, FiZap, FiBarChart3 } from 'react-icons/fi';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiZap,
      title: 'Deal Clarity Score',
      description: 'AI-powered scoring system to identify high-probability deals and prioritize your pipeline.'
    },
    {
      icon: FiUsers,
      title: 'Multi-user Teams',
      description: 'Collaborate seamlessly with your sales team. Real-time updates, shared pipelines, and team analytics.'
    },
    {
      icon: FiBarChart3,
      title: 'Automation Engine',
      description: 'Automate repetitive tasks, auto-sync with your CRM, and trigger workflows based on deal progress.'
    },
    {
      icon: FiTrendingUp,
      title: 'Advanced Analytics',
      description: 'Get actionable insights into deal velocity, win rates, and team performance in real-time.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Sales Manager, TechCorp',
      quote: 'Deal Clarity transformed how our team tracks commitments. We increased deal velocity by 23%.'
    },
    {
      name: 'Michael Chen',
      role: 'Director of Sales, InnovateCo',
      quote: 'The automation alone saved us 5+ hours per week. The team absolutely loves it.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FiBarChart3 size={24} />
            </div>
            <span className="text-2xl font-bold">Deal Clarity</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              The team-focused CRM with built-in deal clarity scoring.
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Stop guessing which deals will close. Score your pipeline, automate follow-ups, and scale your sales team with confidence.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                Start Free Trial <FiArrowRight />
              </button>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="px-8 py-3 border border-gray-400 hover:border-white rounded-lg font-bold transition-colors"
              >
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              ⭐ Trusted by 120+ sales teams. No credit card required.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-3xl opacity-30"></div>
              <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-8">
                <div className="space-y-4">
                  <div className="h-12 bg-slate-700 rounded-lg"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-slate-700 rounded-lg"></div>
                    <div className="h-24 bg-slate-700 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-slate-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything you need to close more deals
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
                  <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                    <Icon size={28} className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-5xl font-bold text-blue-400 mb-2">120+</h3>
            <p className="text-gray-300">Teams use Deal Clarity daily</p>
          </div>
          <div className="text-center">
            <h3 className="text-5xl font-bold text-indigo-400 mb-2">23%</h3>
            <p className="text-gray-300">Average deal velocity increase</p>
          </div>
          <div className="text-center">
            <h3 className="text-5xl font-bold text-blue-400 mb-2">5+ hrs</h3>
            <p className="text-gray-300">Saved per week per team</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-800/50 border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">What sales leaders say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8">
                <p className="text-lg mb-6 italic text-gray-300">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-center text-gray-300 mb-16">Start free, upgrade when you're ready.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Free</h3>
            <p className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-400">/forever</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Up to 5 deals</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Basic tracking</li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 border border-gray-400 rounded-lg font-bold hover:border-white transition-colors"
            >
              Start Free
            </button>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-400/50 rounded-xl p-8 relative">
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">Most Popular</div>
            <h3 className="text-2xl font-bold mb-4">Pro Monthly</h3>
            <p className="text-3xl font-bold mb-6">$29<span className="text-lg text-gray-400">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Unlimited deals</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Auto CRM sync</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Advanced analytics</li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Upgrade Now
            </button>
          </div>
          <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Pro Yearly</h3>
            <p className="text-3xl font-bold mb-2">$290<span className="text-lg text-gray-400">/year</span></p>
            <p className="text-green-400 font-semibold text-sm mb-6">Save 17%</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Everything in Pro</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Priority support</li>
              <li className="flex items-center gap-2"><FiCheckCircle className="text-green-400" /> Custom integrations</li>
            </ul>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to close more deals?</h2>
          <p className="text-xl text-blue-100 mb-8">Join 120+ teams already using Deal Clarity to transform their sales process.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 mx-auto"
          >
            Get Started Free <FiArrowRight />
          </button>
          <p className="text-sm text-blue-100 mt-6">No credit card required. Start free forever.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2025 Deal Clarity. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
