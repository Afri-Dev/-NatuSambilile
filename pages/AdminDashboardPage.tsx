import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { toast } from 'react-toastify';
import { USER_ROLES } from '../constants';
import { ChartComponent } from '../components/dashboard/ChartComponent';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  gender?: string;
  ageRange?: string;
  password?: string;
  progress?: {
    percentage: number;
  };
}

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

  const [newUser, setNewUser] = useState<{
    username: string;
    email: string;
    password: string;
    role: 'Admin' | 'Instructor' | 'Student';
    gender: string;
    ageRange: string;
  }>({
    username: '',
    email: '',
    password: 'defaultPassword123',
    role: 'Instructor',
    gender: 'other',
    ageRange: '25-34'
  });

  // Handle creating a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Create a user object that matches the expected type for addUserByAdmin
      const userToCreate = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as 'Admin' | 'Instructor' | 'Student'
      };
      const result = appContext.addUserByAdmin(userToCreate);
      
      if (result.success) {
        toast.success('User created successfully!');
        setNewUser({
          username: '',
          email: '',
          password: 'defaultPassword123',
          role: 'Instructor' as const,  // Use 'as const' to ensure type safety
          gender: 'other',
          ageRange: '25-34'
        });
        setShowCreateUserModal(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setIsLoading(true);
        appContext.deleteUserByAdmin(userId);
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Get unique users (filter duplicates by email)
  const users = useMemo(() => {
    const seen = new Set();
    return appContext.registeredUsers
      .filter(user => user.role !== 'Admin') // Exclude admin users
      .filter(user => {
        const duplicate = seen.has(user.email);
        seen.add(user.email);
        return !duplicate;
      });
  }, [appContext.registeredUsers]);

  const { courses = [] } = appContext;

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Create New User'}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      </div>
      
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New User</h2>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({
                    ...newUser, 
                    role: e.target.value as 'Admin' | 'Instructor' | 'Student'
                  })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Instructor">Instructor</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 border rounded text-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
