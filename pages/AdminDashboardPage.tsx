import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { USER_ROLES } from '../constants';
import { UserManagement, User as UserManagementUser, UserRole } from '../components/admin/UserManagement';
import { toast } from 'react-toastify';
import { ChartComponent } from '../components/dashboard/ChartComponent';

// Single source of truth for User type
type User = UserManagementUser & {
  role: UserRole;
  gender?: string;
  ageRange?: string;
  progress?: {
    percentage: number;
  };
};

// Type for the chart data items
interface ChartItem {
  label: string;
  value: number;
  percentage?: number;
}

interface QuizAttempt {
  userId: string;
  score: number;
  maxScore: number;
}

interface LessonProgress {
  userId: string;
}



interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  averageQuizScore: string;
  totalLessonCompletions: number;
  progressDistribution: ChartItem[];
  genderDistribution: ChartItem[];
  ageRangeDistribution: ChartItem[];
}

const AdminDashboardPage = () => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("AppContext is null");
  
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // User Management Handlers
  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to update user
      console.log('Updating user:', userId, updates);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsLoading(true);
        // TODO: Implement API call to delete user
        console.log('Deleting user:', userId);
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateUser = async (userData: Omit<User, 'id' | 'status'>) => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to create user
      console.log('Creating user:', userData);
      setShowCreateUserModal(false);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Safely destructure with default values to prevent undefined errors
  const { 
    courses = [], 
    registeredUsers: allUsers = [], 
    currentUser 
  } = appContext;

  // Ensure users have the required status field
  const users = useMemo(() => allUsers.map(user => ({
    ...user,
    status: (user as any).status || 'active' // Default to active if status is missing
  })), [allUsers]);

  const analytics = useMemo<AnalyticsData>(() => {
    // Filter out admin users for all analytics
    const nonAdminUsers = users.filter(user => user.role !== USER_ROLES.ADMIN);
    const totalNonAdminUsers = nonAdminUsers.length;
    
    // Get non-admin user IDs for filtering other data
    const nonAdminUserIds = new Set(nonAdminUsers.map(user => user.id));
    
    // Course metrics
    const totalCourses = courses.length;
    const totalModules = courses.reduce((sum, course) => sum + course.modules.length, 0);
    const totalLessons = courses.reduce(
      (sum, course) => sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0),
      0
    );
    const totalQuizzes = courses.reduce(
      (sum, course) => sum + course.modules.reduce((modSum, mod) => modSum + (mod.quizzes?.length || 0), 0),
      0
    );

    // Quiz metrics for non-admin users
    const nonAdminQuizAttempts: Array<{ score: number; maxScore: number }> = [];
    const totalQuizAttempts = nonAdminQuizAttempts.length;
    const totalScoreSum = nonAdminQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalMaxScoreSum = nonAdminQuizAttempts.reduce((sum, attempt) => sum + attempt.maxScore, 0);
    const averageQuizScore = totalMaxScoreSum > 0 
      ? ((totalScoreSum / totalMaxScoreSum) * 100).toFixed(1) + '%' 
      : 'N/A';

    // Lesson completions for non-admin users
    const totalLessonCompletions = 0;

    // Initialize distributions
    const progressDistribution = [
      { label: '0-25%', value: 0 },
      { label: '26-50%', value: 0 },
      { label: '51-75%', value: 0 },
      { label: '76-100%', value: 0 }
    ];

    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
      'prefer-not-to-say': 0,
      'not-specified': 0
    };

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

    // Process each non-admin user
    nonAdminUsers.forEach(user => {
      // Track progress distribution
      const progress = user.progress?.percentage || 0;
      if (progress <= 25) progressDistribution[0].value++;
      else if (progress <= 50) progressDistribution[1].value++;
      else if (progress <= 75) progressDistribution[2].value++;
      else progressDistribution[3].value++;

      // Track gender distribution
      const gender = user.gender || 'not-specified';
      if (gender in genderDistribution) {
        genderDistribution[gender as keyof typeof genderDistribution]++;
      } else {
        genderDistribution.other++;
      }

      // Track age range distribution
      const ageRange = user.ageRange || 'not-specified';
      if (ageRange in ageRangeDistribution) {
        ageRangeDistribution[ageRange as keyof typeof ageRangeDistribution]++;
      } else {
        ageRangeDistribution['not-specified']++;
      }
    });

    // Format gender data for the chart with better labels and sorting
    const formatGenderData = () => {
      // Define the preferred order of gender labels
      const genderOrder = ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say', 'not-specified'];
      
      return Object.entries(genderDistribution)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => {
          // Format the label nicely
          const formatLabel = (str: string) => {
            if (str === 'not-specified') return 'Not Specified';
            if (str === 'prefer-not-to-say') return 'Prefer Not to Say';
            if (str === 'non-binary') return 'Non-binary';
            if (str === 'male') return 'Male';
            if (str === 'female') return 'Female';
            return str.charAt(0).toUpperCase() + str.slice(1);
          };
          
          return {
            label: formatLabel(key),
            key: key,
            value,
            percentage: totalNonAdminUsers > 0 ? (value / totalNonAdminUsers) * 100 : 0
          };
        })
        // Sort by our preferred order
        .sort((a, b) => {
          const aIndex = genderOrder.indexOf(a.key) ?? genderOrder.length;
          const bIndex = genderOrder.indexOf(b.key) ?? genderOrder.length;
          return aIndex - bIndex;
        });
    };

    // Format age range data for charts
    const formatAgeRangeData = () => {
      return Object.entries(ageRangeDistribution)
        .filter(([key]) => key !== 'not-specified' || ageRangeDistribution[key as keyof typeof ageRangeDistribution] > 0)
        .map(([key, value]) => ({
          label: key === '65-plus' ? '65+' : 
                 key === 'under-18' ? 'Under 18' : 
                 key.replace(/-/g, '-'),
          value,
          percentage: totalNonAdminUsers > 0 ? Math.round((value / totalNonAdminUsers) * 100) : 0
        }));
    };

    return {
      totalUsers: totalNonAdminUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalQuizzes,
      totalQuizAttempts,
      averageQuizScore,
      totalLessonCompletions,
      progressDistribution,
      genderDistribution: formatGenderData(),
      ageRangeDistribution: formatAgeRangeData()
    };
  }, [users, courses]);

  // Loading state for dynamic import
  if (typeof window === 'undefined') {
    return <div className="min-h-screen bg-gray-50 p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
              <p className="text-3xl font-bold">{analytics.totalCourses}</p>
            </div>
          </div>
          
          {/* User Management Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <UserManagement 
              users={users} 
              onUserUpdate={handleUpdateUser} 
              onUserDelete={handleDeleteUser}
              onCreateUser={handleCreateUser}
              showCreateUserModal={showCreateUserModal}
              setShowCreateUserModal={setShowCreateUserModal}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Lessons</h3>
            <p className="text-3xl font-bold">{analytics.totalLessons}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Quiz Attempts</h3>
            <p className="text-3xl font-bold">{analytics.totalQuizAttempts}</p>
            <p className="text-sm text-gray-500">Avg. Score: {analytics.averageQuizScore}</p>
          </div>
        </div>
        
        {/* User Management Section */}
        <div className="mt-8">
          <UserManagement 
            users={users}
            onUserUpdate={handleUpdateUser}
            onUserDelete={handleDeleteUser}
            onCreateUser={handleCreateUser}
            showCreateUserModal={showCreateUserModal}
            setShowCreateUserModal={setShowCreateUserModal}
          />
        </div>
        
        {/* Demographic Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartComponent 
            title="Gender Distribution" 
            data={analytics.genderDistribution} 
            type="pie" 
          />
          <ChartComponent 
            title="Age Range Distribution" 
            data={analytics.ageRangeDistribution} 
            type="bar" 
          />
        </div>
        
        {/* Progress Distribution */}
        <div className="mb-8">
          <ChartComponent 
            title="User Progress Distribution" 
            data={analytics.progressDistribution} 
            type="bar" 
          />
        </div>
      </div>
      
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-blue-700">
                Admin users are excluded from all analytics and user management views. Use the admin panel for admin user management.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
