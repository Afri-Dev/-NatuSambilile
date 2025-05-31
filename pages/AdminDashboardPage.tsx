
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AppContext } from '../App';
import { UserRole } from '../types';
import { USER_ROLES, UsersIcon, AcademicCapIcon, ClipboardDocumentCheckIcon } from '../constants';

// Import components
import { MetricCard } from '../components/dashboard/MetricCard';
import { ContentOverview } from '../components/dashboard/ContentOverview';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import { UserManagement } from '../components/dashboard/UserManagement';
import { CreateInstructorModal } from '../components/dashboard/CreateInstructorModal';
import DemographicAnalytics from '../components/dashboard/DemographicAnalytics';

const AdminDashboardPage: React.FC = () => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("AppContext is null");
  const {
    courses, registeredUsers, quizAttempts, lessonProgress,
    currentUser, addUserByAdmin, updateUserRole, deleteUserByAdmin
  } = appContext;

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

    // Gender distribution
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
      'prefer-not-to-say': 0
    };

    // Age range distribution
    const ageRangeDistribution = {
      'under-18': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65-plus': 0,
      'not-specified': 0
    };

    registeredUsers.forEach(user => {
      // Progress distribution
      const progress = user.progress?.percentage || 0;
      if (progress <= 25) progressDistribution[0].value++;
      else if (progress <= 50) progressDistribution[1].value++;
      else if (progress <= 75) progressDistribution[2].value++;
      else progressDistribution[3].value++;

      // Gender distribution
      const gender = user.gender || 'not-specified';
      if (gender in genderDistribution) {
        genderDistribution[gender as keyof typeof genderDistribution]++;
      } else {
        genderDistribution.other++;
      }

      // Age range distribution
      const ageRange = user.ageRange || 'not-specified';
      if (ageRange in ageRangeDistribution) {
        ageRangeDistribution[ageRange as keyof typeof ageRangeDistribution]++;
      } else {
        ageRangeDistribution['not-specified']++;
      }
    });

    // Convert to array for charts
    const genderData = Object.entries(genderDistribution).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
      value,
      percentage: totalUsers > 0 ? Math.round((value / totalUsers) * 100) : 0
    }));

    const ageRangeData = Object.entries(ageRangeDistribution)
      .filter(([key]) => key !== 'not-specified' || ageRangeDistribution[key as keyof typeof ageRangeDistribution] > 0)
      .map(([key, value]) => ({
        label: key === '65-plus' ? '65+' : key === 'under-18' ? 'Under 18' : key.replace(/-/g, '-').replace('plus', '+'),
        value,
        percentage: totalUsers > 0 ? Math.round((value / totalUsers) * 100) : 0
      }));

    return {
      totalUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalQuizzes,
      totalQuizAttempts,
      averageQuizScore,
      totalLessonCompletions,
      progressDistribution,
      genderDistribution: genderData,
      ageRangeDistribution: ageRangeData
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your learning platform and users</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={analytics.totalUsers}
            icon={<UsersIcon className="w-6 h-6" />}
            iconBgClass="bg-blue-100 text-blue-600"
          />
          <MetricCard
            title="Total Courses"
            value={analytics.totalCourses}
            icon={<AcademicCapIcon className="w-6 h-6" />}
            iconBgClass="bg-indigo-100 text-indigo-600"
          />
          <MetricCard
            title="Lessons Completed"
            value={analytics.totalLessonCompletions}
            icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
            iconBgClass="bg-green-100 text-green-600"
          />
          <MetricCard
            title="Quiz Attempts"
            value={analytics.totalQuizAttempts}
            icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
            iconBgClass="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Content Overview */}
        <ContentOverview
          totalModules={analytics.totalModules}
          totalLessons={analytics.totalLessons}
          totalQuizzes={analytics.totalQuizzes || 0}
          totalUsers={analytics.totalUsers}
        />

        {/* Analytics Charts */}
        <AnalyticsCharts
          progressDistribution={analytics.progressDistribution}
          exportData={exportData}
          totalQuizAttempts={analytics.totalQuizAttempts}
          averageQuizScore={analytics.averageQuizScore}
        />

        {/* Demographic Analytics */}
        <DemographicAnalytics 
          genderData={analytics.genderDistribution}
          ageData={analytics.ageRangeDistribution}
        />

        {/* User Management */}
        <UserManagement
          users={registeredUsers}
          currentUser={currentUser}
          onUpdateUserRole={handleUpdateUserRole}
          onDeleteUser={handleDeleteUser}
          editingUserRole={editingUserRole}
          onRoleChange={handleRoleChange}
          onOpenCreateInstructor={() => {
            setIsCreateInstructorModalOpen(true);
            setFormMessage(null);
          }}
          isLoadingAction={isLoadingAction}
        />

        {/* Create Instructor Modal */}
        <CreateInstructorModal
          isOpen={isCreateInstructorModalOpen}
          onClose={() => setIsCreateInstructorModalOpen(false)}
          formData={newInstructorForm}
          onFormChange={handleCreateInstructorFormChange}
          onSubmit={handleCreateInstructorSubmit}
          formMessage={formMessage}
          isLoading={isLoadingAction}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
