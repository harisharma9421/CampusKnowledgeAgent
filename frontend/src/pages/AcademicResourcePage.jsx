import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Badge from '../components/ui/Badge.jsx';
import Card, { CardBody, CardHeader } from '../components/ui/Card.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as academicService from '../services/academicService.js';

const BRANCHES = [
  { value: 'all', label: 'All branches' },
  { value: 'computer_engineering', label: 'Computer Engineering' },
  { value: 'electronics_engineering', label: 'Electronics Engineering' },
  { value: 'civil_engineering', label: 'Civil Engineering' },
  { value: 'mechanical_engineering', label: 'Mechanical Engineering' },
];

const TIMETABLE_BRANCHES = BRANCHES.filter((branch) => branch.value !== 'all');
const DIVISIONS = ['D1', 'D2', 'D3', 'D4'];
const NOTICE_CATEGORIES = ['academic', 'exam', 'administrative', 'placement'];
const EVENT_CATEGORIES = ['academic', 'technical', 'cultural', 'sports', 'placement'];
const FAQ_CATEGORIES = ['erp', 'timetable', 'notices', 'events', 'faculty', 'academic'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const sampleSchedule = {
  monday: [
    {
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Data Structures',
      subjectCode: 'CE301',
      type: 'theory',
      facultyName: 'Faculty Name',
      room: 'A-CR-301',
      batch: 'all',
    },
  ],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
};

const resourceConfig = {
  timetable: {
    title: 'Timetable',
    subtitle: 'Students see only their branch, semester, and division timetable.',
    empty: 'No timetable records found for your scope.',
    fetch: academicService.getTimetable,
    create: academicService.createTimetable,
    update: academicService.updateTimetable,
    initialForm: {
      branch: 'computer_engineering',
      semester: 5,
      division: 'D1',
      academicYear: '2026-2027',
      effectiveFrom: '2026-06-15',
      effectiveTo: '2026-11-30',
      scheduleText: JSON.stringify(sampleSchedule, null, 2),
    },
  },
  notices: {
    title: 'Notices',
    subtitle: 'Notices are created by staff and scoped to the intended student audience.',
    empty: 'No notices found for your scope.',
    fetch: academicService.getNotices,
    create: academicService.createNotice,
    update: academicService.updateNotice,
    initialForm: {
      title: '',
      content: '',
      category: 'academic',
      branch: 'all',
      semester: 0,
      division: 'all',
      priority: 'normal',
    },
  },
  events: {
    title: 'Events',
    subtitle: 'Events can target all students or a specific branch and semester.',
    empty: 'No events found for your scope.',
    fetch: academicService.getEvents,
    create: academicService.createEvent,
    update: academicService.updateEvent,
    initialForm: {
      title: '',
      description: '',
      eventDate: '',
      venue: '',
      category: 'academic',
      branch: 'all',
      semester: 0,
      maxParticipants: '',
      registrationUrl: '',
    },
  },
  faq: {
    title: 'FAQ',
    subtitle: 'FAQ entries are maintained by staff and filtered by student scope.',
    empty: 'No FAQ entries found for your scope.',
    fetch: academicService.getFaq,
    create: academicService.createFaq,
    update: academicService.updateFaq,
    initialForm: {
      question: '',
      answer: '',
      category: 'academic',
      branch: 'all',
      semester: 0,
      tags: '',
    },
  },
};

const unwrapList = (response) => response?.data?.data || [];

const toDateTimeInput = (value) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const toIsoDateTime = (value) => (value ? new Date(value).toISOString() : undefined);

const branchLabel = (value) => BRANCHES.find((branch) => branch.value === value)?.label || value || 'All';

const AcademicResourcePage = ({ type }) => {
  const config = resourceConfig[type];
  const { user } = useAuth();
  const isStaff = ['faculty', 'admin'].includes(user?.role);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(config.initialForm);

  const scopedSummary = useMemo(() => {
    if (user?.role !== 'student') {
      return 'Campus staff view';
    }
    return [branchLabel(user.branch), `Semester ${user.semester}`, `Division ${user.division}`]
      .filter(Boolean)
      .join(' / ');
  }, [user]);

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await config.fetch({ page: 1, limit: 100 });
      setRecords(unwrapList(response));
    } catch (err) {
      setError(err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm(config.initialForm);
    setEditing(null);
    setNotice('');
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    const numericFields = ['semester', 'maxParticipants'];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) && value !== '' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(config.initialForm);
    setEditing(null);
    setError('');
    setNotice('');
  };

  const editRecord = (record) => {
    setEditing(record);
    setError('');
    setNotice('');

    if (type === 'timetable') {
      setForm({
        branch: record.branch,
        semester: record.semester,
        division: record.division,
        academicYear: record.academicYear || '',
        effectiveFrom: record.effectiveFrom || '',
        effectiveTo: record.effectiveTo || '',
        scheduleText: JSON.stringify(record.schedule || sampleSchedule, null, 2),
      });
      return;
    }

    if (type === 'events') {
      setForm({
        title: record.title || '',
        description: record.description || '',
        eventDate: toDateTimeInput(record.eventDate),
        venue: record.venue || '',
        category: record.category || 'academic',
        branch: record.branch || 'all',
        semester: record.semester ?? 0,
        maxParticipants: record.maxParticipants || '',
        registrationUrl: record.registrationUrl || '',
      });
      return;
    }

    if (type === 'faq') {
      setForm({
        question: record.question || '',
        answer: record.answer || '',
        category: record.category || 'academic',
        branch: record.branch || 'all',
        semester: record.semester ?? 0,
        tags: Array.isArray(record.tags) ? record.tags.join(', ') : '',
      });
      return;
    }

    setForm({
      title: record.title || '',
      content: record.content || '',
      category: record.category || 'academic',
      branch: record.branch || 'all',
      semester: record.semester ?? 0,
      division: record.division || 'all',
      priority: record.priority || 'normal',
    });
  };

  const buildPayload = () => {
    if (type === 'timetable') {
      return {
        branch: form.branch,
        semester: Number(form.semester),
        division: form.division,
        academicYear: form.academicYear || undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
        schedule: JSON.parse(form.scheduleText || '{}'),
      };
    }

    if (type === 'events') {
      return {
        title: form.title,
        description: form.description,
        eventDate: toIsoDateTime(form.eventDate),
        venue: form.venue,
        category: form.category,
        branch: form.branch,
        semester: Number(form.semester),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        registrationUrl: form.registrationUrl || undefined,
      };
    }

    if (type === 'faq') {
      return {
        question: form.question,
        answer: form.answer,
        category: form.category,
        branch: form.branch,
        semester: Number(form.semester),
        tags: form.tags
          ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
      };
    }

    return {
      title: form.title,
      content: form.content,
      category: form.category,
      branch: form.branch,
      semester: Number(form.semester),
      division: form.division,
      priority: form.priority,
    };
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const payload = buildPayload();
      let successMessage;
      if (editing) {
        await config.update(editing.id, payload);
        successMessage = `${config.title} updated.`;
      } else {
        await config.create(payload);
        successMessage = `${config.title} created.`;
      }
      resetForm();
      setNotice(successMessage);
      await loadRecords();
    } catch (err) {
      setError(err.message || 'Unable to save record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="section-title">{config.title}</h1>
          <p className="section-subtitle">{config.subtitle}</p>
        </div>
        <Badge variant={isStaff ? 'primary' : 'success'}>{scopedSummary}</Badge>
      </div>

      {isStaff && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-surface-800">
                {editing ? `Edit ${config.title}` : `Create ${config.title}`}
              </h2>
              {editing && (
                <button type="button" className="btn-secondary text-xs" onClick={resetForm}>
                  New record
                </button>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={submitForm} className="space-y-4">
              <ResourceForm type={type} form={form} onChange={updateForm} />
              {(error || notice) && (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    error
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                  }`}
                >
                  {error || notice}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </form>
          </CardBody>
        </Card>
      )}

      <section className="grid gap-4">
        {loading && <Card><CardBody>Loading...</CardBody></Card>}
        {!loading && records.length === 0 && <Card><CardBody>{config.empty}</CardBody></Card>}
        {!loading &&
          records.map((record) => (
            <ResourceRecord key={record.id} type={type} record={record} onEdit={isStaff ? editRecord : null} />
          ))}
      </section>
    </div>
  );
};

const ResourceForm = ({ type, form, onChange }) => {
  if (type === 'timetable') {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <SelectField label="Branch" name="branch" value={form.branch} onChange={onChange} options={TIMETABLE_BRANCHES} />
        <InputField label="Semester" name="semester" type="number" min="1" max="8" value={form.semester} onChange={onChange} />
        <SelectField label="Division" name="division" value={form.division} onChange={onChange} options={DIVISIONS.map((value) => ({ value, label: value }))} />
        <InputField label="Academic year" name="academicYear" value={form.academicYear} onChange={onChange} />
        <InputField label="Effective from" name="effectiveFrom" value={form.effectiveFrom} onChange={onChange} />
        <InputField label="Effective to" name="effectiveTo" value={form.effectiveTo} onChange={onChange} />
        <div className="lg:col-span-3">
          <label htmlFor="scheduleText" className="label">Schedule JSON</label>
          <textarea
            id="scheduleText"
            name="scheduleText"
            className="input min-h-56 font-mono"
            value={form.scheduleText}
            onChange={onChange}
            spellCheck="false"
          />
        </div>
      </div>
    );
  }

  if (type === 'events') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <InputField label="Title" name="title" value={form.title} onChange={onChange} />
        <SelectField label="Category" name="category" value={form.category} onChange={onChange} options={EVENT_CATEGORIES.map((value) => ({ value, label: value }))} />
        <InputField label="Date and time" name="eventDate" type="datetime-local" value={form.eventDate} onChange={onChange} />
        <InputField label="Venue" name="venue" value={form.venue} onChange={onChange} />
        <SelectField label="Branch" name="branch" value={form.branch} onChange={onChange} options={BRANCHES} />
        <InputField label="Semester" name="semester" type="number" min="0" max="8" value={form.semester} onChange={onChange} />
        <InputField label="Max participants" name="maxParticipants" type="number" min="1" value={form.maxParticipants} onChange={onChange} />
        <InputField label="Registration URL" name="registrationUrl" value={form.registrationUrl} onChange={onChange} required={false} />
        <TextareaField label="Description" name="description" value={form.description} onChange={onChange} className="lg:col-span-2" />
      </div>
    );
  }

  if (type === 'faq') {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <InputField label="Question" name="question" value={form.question} onChange={onChange} className="lg:col-span-2" />
        <SelectField label="Category" name="category" value={form.category} onChange={onChange} options={FAQ_CATEGORIES.map((value) => ({ value, label: value }))} />
        <SelectField label="Branch" name="branch" value={form.branch} onChange={onChange} options={BRANCHES} />
        <InputField label="Semester" name="semester" type="number" min="0" max="8" value={form.semester} onChange={onChange} />
        <InputField label="Tags" name="tags" value={form.tags} onChange={onChange} required={false} />
        <TextareaField label="Answer" name="answer" value={form.answer} onChange={onChange} className="lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InputField label="Title" name="title" value={form.title} onChange={onChange} />
      <SelectField label="Category" name="category" value={form.category} onChange={onChange} options={NOTICE_CATEGORIES.map((value) => ({ value, label: value }))} />
      <SelectField label="Branch" name="branch" value={form.branch} onChange={onChange} options={BRANCHES} />
      <InputField label="Semester" name="semester" type="number" min="0" max="8" value={form.semester} onChange={onChange} />
      <SelectField label="Division" name="division" value={form.division} onChange={onChange} options={[{ value: 'all', label: 'All divisions' }, ...DIVISIONS.map((value) => ({ value, label: value }))]} />
      <SelectField label="Priority" name="priority" value={form.priority} onChange={onChange} options={PRIORITIES.map((value) => ({ value, label: value }))} />
      <TextareaField label="Content" name="content" value={form.content} onChange={onChange} className="lg:col-span-2" />
    </div>
  );
};

const ResourceRecord = ({ type, record, onEdit }) => (
  <Card hoverable>
    <CardBody>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-surface-900">{recordTitle(type, record)}</h2>
            <Badge variant="neutral">{record.category || record.type || record.division || record.role || 'active'}</Badge>
          </div>
          <p className="text-sm text-surface-500">{recordSubtitle(type, record)}</p>
          {type === 'timetable' ? (
            <TimetablePreview schedule={record.schedule} />
          ) : (
            <p className="text-sm leading-6 text-surface-700">{recordBody(type, record)}</p>
          )}
        </div>
        {onEdit && (
          <button type="button" className="btn-secondary shrink-0" onClick={() => onEdit(record)}>
            Edit
          </button>
        )}
      </div>
    </CardBody>
  </Card>
);

const TimetablePreview = ({ schedule }) => (
  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
    {Object.entries(schedule || {}).map(([day, slots]) => (
      <div key={day} className="rounded-lg border border-surface-200 bg-surface-50 p-3">
        <p className="text-xs font-semibold uppercase text-surface-500">{day}</p>
        <div className="mt-2 space-y-1">
          {slots.length === 0 ? (
            <p className="text-xs text-surface-400">No classes</p>
          ) : (
            slots.slice(0, 3).map((slot, index) => (
              <p key={`${day}-${slot.startTime}-${index}`} className="text-xs text-surface-700">
                {slot.startTime}-{slot.endTime} {slot.subject}
              </p>
            ))
          )}
        </div>
      </div>
    ))}
  </div>
);

const recordTitle = (type, record) => {
  if (type === 'timetable') return `${branchLabel(record.branch)} / Sem ${record.semester} / ${record.division}`;
  if (type === 'faq') return record.question;
  return record.title;
};

const recordSubtitle = (type, record) => {
  if (type === 'events') return `${record.venue} / ${new Date(record.eventDate).toLocaleString()}`;
  if (type === 'timetable') return `${record.academicYear || 'Academic year'} / ${record.effectiveFrom || 'effective now'}`;
  return `${branchLabel(record.branch)} / Semester ${record.semester || 'All'}${record.division ? ` / ${record.division}` : ''}`;
};

const recordBody = (type, record) => {
  if (type === 'events') return record.description;
  if (type === 'faq') return record.answer;
  return record.content;
};

const InputField = ({ label, className = '', required = true, ...props }) => (
  <div className={className}>
    <label htmlFor={props.name} className="label">{label}</label>
    <input id={props.name} className="input" required={required} {...props} />
  </div>
);

const TextareaField = ({ label, className = '', ...props }) => (
  <div className={className}>
    <label htmlFor={props.name} className="label">{label}</label>
    <textarea id={props.name} className="input min-h-28" required {...props} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="label">{label}</label>
    <select id={name} name={name} className="input" value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

AcademicResourcePage.propTypes = {
  type: PropTypes.oneOf(Object.keys(resourceConfig)).isRequired,
};

ResourceForm.propTypes = {
  type: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

ResourceRecord.propTypes = {
  type: PropTypes.string.isRequired,
  record: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};

TimetablePreview.propTypes = {
  schedule: PropTypes.object,
};

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
};

TextareaField.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
};

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default AcademicResourcePage;
