import { useEffect, useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Card, { CardBody } from '../components/ui/Card.jsx';
import * as academicService from '../services/academicService.js';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await academicService.getNotifications({ page: 1, limit: 100 });
      setNotifications(response?.data?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    await academicService.markNotificationRead(id);
    await loadNotifications();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Notifications</h1>
        <p className="section-subtitle">Timetable updates, notices, and events for your scope.</p>
      </div>

      {error && <Card><CardBody><p className="text-sm text-red-700">{error}</p></CardBody></Card>}
      {loading && <Card><CardBody>Loading...</CardBody></Card>}
      {!loading && notifications.length === 0 && (
        <Card><CardBody>No notifications for your account.</CardBody></Card>
      )}
      {!loading &&
        notifications.map((notification) => (
          <Card key={notification.id} hoverable>
            <CardBody>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-surface-900">{notification.title}</h2>
                    <Badge variant={notification.priority === 'high' ? 'warning' : 'neutral'}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-surface-700">{notification.message}</p>
                  <p className="mt-2 text-xs text-surface-500">
                    {new Date(notification.scheduledAt || notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!(notification.readBy || []).length && (
                  <button type="button" className="btn-secondary shrink-0" onClick={() => markRead(notification.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
    </div>
  );
};

export default NotificationsPage;
