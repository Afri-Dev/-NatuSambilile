
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext, AppContextType } from '../App';
import { Course, User, UserRole } from '../types';
import { USER_ROLES, UsersIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, ListBulletIcon, UserPlusIcon, TrashIcon, ShieldCheckIcon, KeyIcon, EditIcon, UserMinusIcon } from '../constants';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { saveAs } from 'file-saver';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  iconBgClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, className, iconBgClass = 'bg-primary' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 ${className}`}>
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${iconBgClass} text-white rounded-full`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-neutral-dark font-medium">{title}</p>
      <p className="text-2xl font-semibold text-primary-dark">{value}</p>
    </div>
  </div>
);


const AdminDashboardPage: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("AppContext is null");
  const {
    courses, registeredUsers, quizAttempts, lessonProgress,
    currentUser, addUserByAdmin, updateUserRole, deleteUserByAdmin
  } = appContext;

  // Initialize Chart.js
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  // Analytics data preparation
  const [exportData, setExportData] = useState<any[]>([]);

  useEffect(() => {
    // Prepare data for CSV export
    const data = registeredUsers.map(user => {
      // Safely format dates, providing a fallback for missing dates
      const registrationDate = user.createdAt ? 
        format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A';
      const lastLogin = user.lastLogin ? 
        format(new Date(user.lastLogin), 'yyyy-MM-dd HH:mm') : 'Never';
      
      return {
        Username: user.username,
        Email: user.email,
        Role: user.role,
        RegistrationDate: registrationDate,
        LastLogin: lastLogin,
        CoursesEnrolled: user.courses?.length || 0,
        QuizzesCompleted: user.quizAttempts?.length || 0,
        Progress: user.progress?.percentage || 0
      };
    });
    setExportData(data);
  }, [registeredUsers]);

  const [isCreateInstructorModalOpen, setIsCreateInstructorModalOpen] = useState(false);
  const [newInstructorForm, setNewInstructorForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [editingUserRole, setEditingUserRole] = useState<{ userId: string; role: UserRole } | null>(null);

  // Analytics data
  const analytics = useMemo(() => {
    const totalUsers = registeredUsers.length;
    const totalCourses = courses.length;
    const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
    const totalLessons = courses.reduce((sum, course) =>
      sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0), 0);
    const totalQuizzes = courses.reduce((sum, course) =>
      sum + course.modules.reduce((modSum, mod) => modSum + (mod.quizzes || []).length, 0), 0);

    const totalQuizAttempts = quizAttempts.length;
    const totalScoreSum = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalMaxScoreSum = quizAttempts.reduce((sum, attempt) => sum + attempt.maxScore, 0);
    const averageQuizScore = totalMaxScoreSum > 0 ? ((totalScoreSum / totalMaxScoreSum) * 100).toFixed(1) + '%' : 'N/A';

    const totalLessonCompletions = lessonProgress.length;

    // Get user progress distribution
    const progressDistribution = [
      { label: '0-25%', value: 0 },
      { label: '26-50%', value: 0 },
      { label: '51-75%', value: 0 },
      { label: '76-100%', value: 0 }
    ];

    registeredUsers.forEach(user => {
      const progress = user.progress?.percentage || 0;
      if (progress <= 25) progressDistribution[0].value++;
      else if (progress <= 50) progressDistribution[1].value++;
      else if (progress <= 75) progressDistribution[2].value++;
      else progressDistribution[3].value++;
    });

    return {
      totalUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalQuizzes,
      totalQuizAttempts,
      averageQuizScore,
      totalLessonCompletions,
      progressDistribution
    };
  }, [courses, registeredUsers, quizAttempts, lessonProgress]);

  const handleCreateInstructorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewInstructorForm({ ...newInstructorForm, [e.target.name]: e.target.value });
  };

  const handleCreateInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setIsLoadingAction(true);
    if (newInstructorForm.password !== newInstructorForm.confirmPassword) {
      setFormMessage({ type: 'error', text: "Passwords do not match." });
      setIsLoadingAction(false);
      return;
    }
    const result = addUserByAdmin({
      username: newInstructorForm.username,
      email: newInstructorForm.email,
      password: newInstructorForm.password,
      role: USER_ROLES.INSTRUCTOR as UserRole,
    });
    setFormMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setIsCreateInstructorModalOpen(false);
      setNewInstructorForm({ username: '', email: '', password: '', confirmPassword: '' });
      alert(result.message);
    }
    setIsLoadingAction(false);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setEditingUserRole({userId, role: newRole});
  };

  const handleUpdateUserRole = (userId: string) => {
    if (!editingUserRole || editingUserRole.userId !== userId) return;

    if (!window.confirm(`Are you sure you want to change this user's role to ${editingUserRole.role}?`)) {
        setEditingUserRole(null);
        return;
    }

    setIsLoadingAction(true);
    const result = updateUserRole(userId, editingUserRole.role);
    alert(result.message);
    if (result.success) {
        setEditingUserRole(null);
    }
    setIsLoadingAction(false);
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone and will remove all their progress and quiz attempts.`)) {
      setIsLoadingAction(true);
      const result = deleteUserByAdmin(userId);
      alert(result.message);
      setIsLoadingAction(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary-dark mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <MetricCard
            title="Total Registered Users"
            value={analytics.totalUsers}
            icon={<UsersIcon className="w-6 h-6" />}
            className="bg-neutral-lightest"
            iconBgClass="bg-primary"
        />
        <MetricCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={<AcademicCapIcon className="w-6 h-6" />}
            className="bg-neutral-lightest"
            iconBgClass="bg-accent"
        />
         <MetricCard
            title="Total Lesson Completions"
            value={analytics.totalLessonCompletions}
            icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
            className="bg-neutral-lightest"
            iconBgClass="bg-secondary"
        />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-semibold text-primary-dark mb-4">Content Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><p className="text-3xl font-bold text-accent-dark">{analytics.totalModules}</p><p className="text-neutral-dark">Modules</p></div>
          <div><p className="text-3xl font-bold text-accent-dark">{analytics.totalLessons}</p><p className="text-neutral-dark">Lessons</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary-dark">User Progress Distribution</h3>
            <CSVLink
              data={exportData}
              filename={`user-data-${format(new Date(), 'yyyy-MM-dd')}.csv`}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <button className="flex items-center space-x-1">
                <span>Export Data</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </CSVLink>
          </div>
          <Bar
            data={{
              labels: analytics.progressDistribution.map(item => item.label),
              datasets: [{
                label: 'Users',
                data: analytics.progressDistribution.map(item => item.value),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(107, 194, 255, 0.7)',
                  'rgba(165, 213, 255, 0.7)',
                  'rgba(214, 234, 255, 0.7)',
                ],
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-primary-dark mb-4">Quiz Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><p className="text-neutral-dark">Total Quiz Attempts:</p><p className="font-semibold text-lg text-primary">{analytics.totalQuizAttempts}</p></div>
            <div className="flex justify-between items-center"><p className="text-neutral-dark">Average Quiz Score:</p><p className="font-semibold text-lg text-primary">{analytics.averageQuizScore}</p></div>
          </div>
            <div className="space-y-2">
                {Object.values(USER_ROLES).map(role => (
                    <div key={role} className="flex justify-between items-center">
                        <p className="text-neutral-dark">{role}s:</p>
                        <p className="font-semibold text-primary">{registeredUsers.filter(u => u.role === role).length}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-semibold text-primary-dark mb-4">Course Details</h2>
        {courses.length === 0 ? (<p className="text-neutral-dark">No courses available.</p>) : (
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-neutral"><thead><tr className="bg-neutral-lightest"><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Course Title</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Modules</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Lessons</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Quizzes</th></tr></thead><tbody className="bg-white divide-y divide-neutral">{courses.map((course: Course) => (<tr key={course.id} className="hover:bg-neutral-lightest transition-colors"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker">{course.title}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{course.modules.length}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{course.modules.reduce((sum, mod) => sum + (mod.quizzes || []).length, 0)}</td></tr>))}</tbody></table></div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary-dark">User Management</h2>
          <button
            onClick={() => { setIsCreateInstructorModalOpen(true); setFormMessage(null); }}
            className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 transition-colors"
            aria-label="Create New Instructor"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Create New Instructor</span>
          </button>
        </div>

        {isLoadingAction && <div className="my-2 flex items-center"><LoadingSpinner /> <span className="ml-2 text-neutral-dark">Processing...</span></div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral">
            <thead className="bg-neutral-lightest">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral">
              {registeredUsers.map((user) => {
                const isCurrentUserAdmin = currentUser?.id === user.id;
                const isTargetAdmin = user.role === USER_ROLES.ADMIN;
                const canManageUser = !isCurrentUserAdmin && !isTargetAdmin;

                let isUpdateRoleDisabled = isLoadingAction;
                if (canManageUser) {
                    isUpdateRoleDisabled = isLoadingAction ||
                                          !editingUserRole ||
                                          editingUserRole.userId !== user.id ||
                                          editingUserRole.role === user.role;
                }


                return (
                  <tr key={user.id} className={`hover:bg-neutral-lightest transition-colors ${isTargetAdmin ? 'bg-primary-light/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker flex items-center">
                      {isTargetAdmin && <ShieldCheckIcon className="w-5 h-5 text-primary mr-2" title="Admin Account" />}
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                      {canManageUser ? (
                        <select
                          value={editingUserRole?.userId === user.id ? editingUserRole.role : user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="p-1 border border-neutral-medium rounded-md text-sm focus:ring-primary focus:border-primary bg-transparent"
                          disabled={isLoadingAction}
                        >
                          <option value={USER_ROLES.STUDENT}>{USER_ROLES.STUDENT}</option>
                          <option value={USER_ROLES.INSTRUCTOR}>{USER_ROLES.INSTRUCTOR}</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {canManageUser ? (
                        <>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateUserRole(user.id)}
                              className="p-1.5 rounded-full bg-neutral-light/50 hover:bg-neutral-light/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                              disabled={isUpdateRoleDisabled}
                              title="Update Role"
                            >
                              <EditIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform"/>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="p-1.5 rounded-full bg-neutral-light/50 hover:bg-neutral-light/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                              disabled={isLoadingAction}
                              title="Delete User"
                            >
                              <UserMinusIcon className="w-5 h-5 text-error group-hover:scale-110 transition-transform"/>
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-neutral-dark italic">
                          {isCurrentUserAdmin ? "Current Admin" : isTargetAdmin ? "Admin Account" : "N/A"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isCreateInstructorModalOpen}
        onClose={() => setIsCreateInstructorModalOpen(false)}
        title="Create New Instructor Account"
      >
        <form onSubmit={handleCreateInstructorSubmit} className="space-y-4">
          {formMessage && (
            <div className={`p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-success-light text-success-dark' : 'bg-error-light text-error-dark'}`}>
              {formMessage.text}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-neutral-dark mb-1">Username</label>
            <input type="text" name="username" id="username" required value={newInstructorForm.username} onChange={handleCreateInstructorFormChange} className="w-full p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">Email</label>
            <input type="email" name="email" id="email" required value={newInstructorForm.email} onChange={handleCreateInstructorFormChange} className="w-full p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent" />
          </div>
          <div className="relative">
            <label htmlFor="password-create" className="block text-sm font-medium text-neutral-dark mb-1">Password</label>
            <div className="flex items-center">
                <KeyIcon className="absolute left-3 w-5 h-5 text-neutral-dark pointer-events-none" />
                <input type="password" name="password" id="password-create" required value={newInstructorForm.password} onChange={handleCreateInstructorFormChange} className="w-full pl-10 p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent" />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="confirmPassword-create" className="block text-sm font-medium text-neutral-dark mb-1">Confirm Password</label>
             <div className="flex items-center">
                <KeyIcon className="absolute left-3 w-5 h-5 text-neutral-dark pointer-events-none" />
                <input type="password" name="confirmPassword" id="confirmPassword-create" required value={newInstructorForm.confirmPassword} onChange={handleCreateInstructorFormChange} className="w-full pl-10 p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsCreateInstructorModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light hover:bg-neutral rounded-md border border-neutral-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isLoadingAction} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm transition-colors flex items-center disabled:opacity-50">
              {isLoadingAction && <LoadingSpinner size="w-4 h-4 mr-2"/>}
              Create Instructor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
