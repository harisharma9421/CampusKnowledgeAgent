import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';

/**
 * LandingPage — Public marketing/entry page
 * First page users see. Showcases the product and directs to the app.
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-primary-950 to-surface-900 text-white flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Logo size="md" linkTo={false} />
        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-surface-300 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link to="/login" className="btn-primary text-sm px-4 py-2 rounded-lg">
            Access Portal
          </Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/60 border border-primary-700/50 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-slow" />
          AI-Powered Smart Campus System
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-4xl mb-6 animate-slide-up">
          Your Campus,{' '}
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Intelligently
          </span>{' '}
          Connected
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mb-10 leading-relaxed animate-slide-up">
          Campus Knowledge Agent uses DistilBERT, Semantic Search, and Gemini AI to answer your
          academic queries instantly — timetables, notices, events, and more.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
          <Link
            to="/login"
            className="btn bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 text-base rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
          >
            Sign in to Dashboard
          </Link>
          <a
            href="https://github.com/harisharma9421/CampusKnowledgeAgent"
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 text-base rounded-xl transition-all duration-200"
          >
            View on GitHub
          </a>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16 animate-fade-in">
          {[
            '🧠 DistilBERT Intent Engine',
            '🔍 FAISS Semantic Search',
            '🤖 Gemini AI Reasoning',
            '📚 Academic Data API',
            '🔐 JWT Authentication',
            '⚡ Real-time Responses',
          ].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-surface-300 text-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </main>

      {/* ── Architecture Preview ────────────────────────────────────────────── */}
      <section className="px-6 py-12 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-lg font-semibold text-surface-400 mb-6 uppercase tracking-wider">
            System Architecture
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { layer: 'Frontend', tech: 'React + Vite', color: 'from-blue-500 to-cyan-500' },
              { layer: 'API Layer', tech: 'Node.js + Express', color: 'from-green-500 to-emerald-500' },
              { layer: 'AI Engine', tech: 'Python + FastAPI', color: 'from-purple-500 to-violet-500' },
              { layer: 'Database', tech: 'Firebase Firestore', color: 'from-orange-500 to-amber-500' },
            ].map((item) => (
              <div
                key={item.layer}
                className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${item.color} mb-3`} />
                <p className="text-sm font-semibold text-white">{item.layer}</p>
                <p className="text-xs text-surface-400 mt-1">{item.tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-6 border-t border-white/10 text-center text-surface-500 text-sm">
        <p>Campus Knowledge Agent — Semester 3 Software Engineering Hackathon Project</p>
        <p className="mt-1">Built with React, Node.js, Python FastAPI &amp; Firebase</p>
      </footer>
    </div>
  );
};

export default LandingPage;
