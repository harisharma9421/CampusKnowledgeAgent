import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge.jsx';
import Card, { CardBody, CardHeader } from '../components/ui/Card.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const branchLabels = {
  computer_engineering: 'Computer Engineering',
  electronics_engineering: 'Electronics Engineering',
  civil_engineering: 'Civil Engineering',
  mechanical_engineering: 'Mechanical Engineering',
};

const roleContent = {
  student: {
    title: 'Student Dashboard',
    summary: 'Timetable, notices, events, faculty, and FAQ answers are routed through the AI assistant.',
    prompts: [
      'What is my timetable today?',
      'Show my latest notices',
      'Which faculty can help with Data Structures?',
    ],
  },
  faculty: {
    title: 'Faculty Dashboard',
    summary: 'Academic notices, event context, and schedule updates are available through backend AI orchestration.',
    prompts: [
      'Show schedule update notifications',
      'Which events are upcoming?',
      'Summarize the latest academic notices',
    ],
  },
  admin: {
    title: 'Admin Dashboard',
    summary: 'Institution-wide academic context is connected to diagnostics, semantic search, and response validation.',
    prompts: [
      'Test the AI pipeline for latest notices',
      'Find semantic matches for postponed workshop',
      'Show current AI retrieval status',
    ],
  },
};

const pipelineCards = [
  { label: 'Intent Engine', value: 'DistilBERT', status: 'Active' },
  { label: 'Semantic Search', value: 'FAISS', status: 'Active' },
  { label: 'Enhancement', value: 'Gemini', status: 'Guarded' },
  { label: 'Data Source', value: 'Firestore', status: 'Grounded' },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const content = roleContent[user?.role] || roleContent.student;
  const academicScope = [
    user?.branch ? branchLabels[user.branch] || user.branch : null,
    user?.semester ? `Semester ${user.semester}` : null,
    user?.division ? `Division ${user.division}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="section-title">{content.title}</h1>
          <p className="section-subtitle">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}.
          </p>
        </div>
        <Link to="/chat" className="btn-primary w-full md:w-auto">
          <ChatIcon />
          Open Chatbot
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant="success">AI platform online</Badge>
                <h2 className="mt-3 text-xl font-semibold text-surface-900">
                  Backend-orchestrated academic assistant
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-surface-600">
                  {content.summary}
                </p>
              </div>
              <div className="rounded-lg border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-600">
                <p className="font-medium text-surface-900">{user?.role || 'member'}</p>
                <p className="mt-1">{academicScope.join(' / ') || 'Campus scope'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-surface-800">Account Scope</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <ScopeRow label="Role" value={user?.role || 'member'} />
            <ScopeRow label="Branch" value={user?.branch ? branchLabels[user.branch] || user.branch : 'All'} />
            <ScopeRow label="Semester" value={user?.semester ? String(user.semester) : 'All'} />
            <ScopeRow label="Division" value={user?.division || 'All'} />
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pipelineCards.map((item) => (
          <Card key={item.label}>
            <CardBody>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-surface-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-surface-900">{item.value}</p>
                </div>
                <Badge variant="primary">{item.status}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-surface-800">Quick Chat</h2>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 md:grid-cols-3">
              {content.prompts.map((prompt) => (
                <Link
                  key={prompt}
                  to="/chat"
                  state={{ prompt }}
                  className="rounded-lg border border-surface-200 bg-white p-4 text-sm font-medium text-surface-700 transition hover:border-primary-200 hover:text-primary-700 hover:shadow-card"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-surface-800">Pipeline Contract</h2>
          </CardHeader>
          <CardBody>
            <ol className="space-y-3 text-sm text-surface-600">
              {['Backend receives query', 'AI engine classifies intent', 'FAISS ranks context', 'Gemini polishes grounded response'].map((step) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

const ScopeRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-surface-500">{label}</span>
    <span className="truncate font-medium capitalize text-surface-800">{value}</span>
  </div>
);

const ChatIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m8-2a9 9 0 11-4.25-7.64L21 4l-.86 4.25A8.96 8.96 0 0121 12z" />
  </svg>
);

ScopeRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default DashboardPage;

