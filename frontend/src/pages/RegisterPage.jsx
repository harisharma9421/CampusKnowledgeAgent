import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'admin', label: 'Admin' },
];

const BRANCHES = [
  { value: 'computer_engineering', label: 'Computer Engineering' },
  { value: 'electronics_engineering', label: 'Electronics Engineering' },
  { value: 'civil_engineering', label: 'Civil Engineering' },
  { value: 'mechanical_engineering', label: 'Mechanical Engineering' },
];

const DIVISIONS = ['D1', 'D2', 'D3', 'D4'];
const BATCHES = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'C1',
  'C2',
  'C3',
  'C4',
];

const initialForm = {
  email: '',
  password: '',
  displayName: '',
  role: 'student',
  branch: 'computer_engineering',
  semester: 5,
  division: 'D1',
  batch: 'A1',
  rollNumber: '',
  employeeId: '',
  department: '',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const isStudent = form.role === 'student';
  const isFaculty = form.role === 'faculty';

  const roleHint = useMemo(() => {
    if (isStudent) return 'Student accounts require branch, semester, division, batch, and roll number.';
    if (isFaculty) return 'Faculty accounts require employee ID and department.';
    return 'Admin accounts can optionally include a department.';
  }, [isStudent, isFaculty]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'semester' ? Number(value) : value,
    }));
  };

  const buildPayload = () => {
    const base = {
      email: form.email,
      password: form.password,
      displayName: form.displayName,
      role: form.role,
    };

    if (form.role === 'student') {
      return {
        ...base,
        branch: form.branch,
        semester: form.semester,
        division: form.division,
        batch: form.batch,
        rollNumber: form.rollNumber,
      };
    }

    if (form.role === 'faculty') {
      return {
        ...base,
        employeeId: form.employeeId,
        department: form.department,
        branch: form.branch,
      };
    }

    return {
      ...base,
      department: form.department || undefined,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    setSubmitting(true);

    try {
      await register(buildPayload());
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detailMessage = err.details?.[0]?.message;
      setLocalError(detailMessage || err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50 to-surface-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" linkTo="/" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900">Create your account</h1>
          <p className="text-sm text-surface-500 mt-1">{roleHint}</p>
        </div>

        <div className="card p-8 shadow-card-hover">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {localError && (
              <div
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
                role="alert"
              >
                {localError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="displayName" className="label">
                  Full name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  className="input"
                  required
                  value={form.displayName}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  className="input"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="role" className="label">
                  Role
                </label>
                <select id="role" name="role" className="input" value={form.role} onChange={handleChange}>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {(isStudent || isFaculty) && (
                <div>
                  <label htmlFor="branch" className="label">
                    Branch
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    className="input"
                    value={form.branch}
                    onChange={handleChange}
                  >
                    {BRANCHES.map((branch) => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isStudent && (
                <>
                  <div>
                    <label htmlFor="semester" className="label">
                      Semester
                    </label>
                    <input
                      id="semester"
                      name="semester"
                      type="number"
                      min={1}
                      max={8}
                      className="input"
                      value={form.semester}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="division" className="label">
                      Division
                    </label>
                    <select
                      id="division"
                      name="division"
                      className="input"
                      value={form.division}
                      onChange={handleChange}
                    >
                      {DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="batch" className="label">
                      Batch
                    </label>
                    <select id="batch" name="batch" className="input" value={form.batch} onChange={handleChange}>
                      {BATCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rollNumber" className="label">
                      Roll number
                    </label>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      className="input"
                      required
                      value={form.rollNumber}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {isFaculty && (
                <>
                  <div>
                    <label htmlFor="employeeId" className="label">
                      Employee ID
                    </label>
                    <input
                      id="employeeId"
                      name="employeeId"
                      className="input"
                      required
                      value={form.employeeId}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="label">
                      Department
                    </label>
                    <input
                      id="department"
                      name="department"
                      className="input"
                      required
                      value={form.department}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {form.role === 'admin' && (
                <div className="sm:col-span-2">
                  <label htmlFor="department" className="label">
                    Department (optional)
                  </label>
                  <input
                    id="department"
                    name="department"
                    className="input"
                    value={form.department}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
