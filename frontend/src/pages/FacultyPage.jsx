import { useEffect, useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Card, { CardBody } from '../components/ui/Card.jsx';
import * as academicService from '../services/academicService.js';

const FacultyPage = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFaculty = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await academicService.getFaculty({ page: 1, limit: 100 });
        setFaculty(response?.data?.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load faculty.');
      } finally {
        setLoading(false);
      }
    };

    loadFaculty();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Faculty</h1>
        <p className="section-subtitle">Faculty directory filtered by student branch where applicable.</p>
      </div>

      {error && <Card><CardBody><p className="text-sm text-red-700">{error}</p></CardBody></Card>}
      {loading && <Card><CardBody>Loading...</CardBody></Card>}
      {!loading && faculty.length === 0 && <Card><CardBody>No faculty records found.</CardBody></Card>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {faculty.map((member) => (
          <Card key={member.id} hoverable>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-surface-900">{member.displayName}</h2>
                  <p className="mt-1 text-sm text-surface-500">{member.email}</p>
                </div>
                <Badge variant="neutral">{member.designation}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-surface-600">
                <p>{member.department}</p>
                <p>{member.office}</p>
                <p>{Array.isArray(member.subjects) ? member.subjects.slice(0, 3).join(', ') : ''}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacultyPage;
