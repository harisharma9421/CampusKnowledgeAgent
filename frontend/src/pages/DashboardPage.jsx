import Card, { CardBody, CardHeader } from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';

/**
 * DashboardPage — Main application dashboard
 * Shows system status, quick stats, and navigation cards.
 * Data will be populated in later phases.
 */
const DashboardPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Welcome to Campus Knowledge Agent</p>
      </div>

      {/* ── System Status Banner ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 border border-primary-200">
        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse-slow shrink-0" />
        <p className="text-sm text-primary-700 font-medium">
          Phase 1 — Foundation complete. Backend API and AI Engine will be connected in upcoming phases.
        </p>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Main Content Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Development Roadmap */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-surface-800">Development Roadmap</h2>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-surface-100">
                {roadmapItems.map((item) => (
                  <RoadmapItem key={item.phase} {...item} />
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Tech Stack */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-surface-800">Tech Stack</h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {techStack.map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm font-medium text-surface-700">{item.name}</span>
                    </div>
                    <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>
                      {item.version}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

import PropTypes from 'prop-types';

const StatCard = ({ label, value, icon, color }) => (
  <Card hoverable>
    <CardBody className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-surface-900">{value}</p>
        <p className="text-sm text-surface-500">{label}</p>
      </div>
    </CardBody>
  </Card>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

const RoadmapItem = ({ phase, title, status, description }) => {
  const statusConfig = {
    complete: { badge: 'success', label: 'Complete' },
    'in-progress': { badge: 'warning', label: 'In Progress' },
    upcoming: { badge: 'neutral', label: 'Upcoming' },
  };
  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <li className="flex items-start gap-4 px-6 py-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-600">
        {phase}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-surface-800">{title}</p>
          <Badge variant={config.badge}>{config.label}</Badge>
        </div>
        <p className="text-xs text-surface-500 mt-0.5">{description}</p>
      </div>
    </li>
  );
};

RoadmapItem.propTypes = {
  phase: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['complete', 'in-progress', 'upcoming']).isRequired,
  description: PropTypes.string.isRequired,
};

// ── Static Data ───────────────────────────────────────────────────────────────

const statCards = [
  { label: 'API Endpoints', value: '1', icon: '⚡', color: 'bg-blue-50' },
  { label: 'AI Models', value: '3', icon: '🧠', color: 'bg-purple-50' },
  { label: 'Data Collections', value: '6', icon: '🗄️', color: 'bg-orange-50' },
  { label: 'Team Members', value: '6', icon: '👥', color: 'bg-green-50' },
];

const roadmapItems = [
  { phase: 1, title: 'Monorepo Foundation', status: 'complete', description: 'React frontend, Node.js backend, Python AI engine scaffolding' },
  { phase: 2, title: 'Firebase Setup', status: 'upcoming', description: 'Firestore schema, collections, and dummy ERP dataset' },
  { phase: 3, title: 'Authentication', status: 'upcoming', description: 'JWT-based auth with role-based access control' },
  { phase: 4, title: 'Dummy ERP Dataset', status: 'upcoming', description: '200+ students, timetables, notices, events, faculty' },
  { phase: 5, title: 'REST API Layer', status: 'upcoming', description: 'All academic data endpoints with Firebase integration' },
  { phase: 6, title: 'DistilBERT Intent Engine', status: 'upcoming', description: 'NLP intent classification for academic queries' },
  { phase: 7, title: 'Semantic Search (FAISS)', status: 'upcoming', description: 'Sentence Transformers + FAISS vector search' },
  { phase: 8, title: 'Gemini Integration', status: 'upcoming', description: 'Advanced reasoning via Vertex AI' },
  { phase: 9, title: 'Chatbot UI', status: 'upcoming', description: 'Full conversational chat interface' },
];

const techStack = [
  { name: 'React + Vite', emoji: '⚛️', version: '18.3', status: 'active' },
  { name: 'Tailwind CSS', emoji: '🎨', version: '3.4', status: 'active' },
  { name: 'Node.js + Express', emoji: '🟢', version: '4.19', status: 'active' },
  { name: 'Python FastAPI', emoji: '🐍', version: '0.111', status: 'active' },
  { name: 'Firebase Firestore', emoji: '🔥', version: 'Phase 2', status: 'pending' },
  { name: 'DistilBERT', emoji: '🧠', version: 'Phase 6', status: 'pending' },
  { name: 'FAISS', emoji: '🔍', version: 'Phase 7', status: 'pending' },
  { name: 'Gemini AI', emoji: '🤖', version: 'Phase 8', status: 'pending' },
];

export default DashboardPage;
