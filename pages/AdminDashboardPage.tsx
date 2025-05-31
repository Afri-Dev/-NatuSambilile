import { useState, useContext, useMemo, useEffect } from 'react';
import { AppContext } from '../App';
import { USER_ROLES } from '../constants';
import { ChartComponent } from '../components/dashboard/ChartComponent';
import type { User, UserRole, QuizAttempt as QuizAttemptType, LessonProgress as LessonProgressType } from '../types';

// Type for the chart data items
interface ChartItem {
  label: string;
  value: number;
  percentage?: number;
}

// Type for the user data we'll use in this component
type AppUser = User & {
  progress?: {
    percentage: number;
    completedLessons: string[];
    lastAccessed?: string;
  };
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
  
  // Safely destructure with default values to prevent undefined errors
  const { 
    courses = [], 
    registeredUsers = [] as User[], 
    quizAttempts = [] as QuizAttemptType[], 
    lessonProgress = [] as LessonProgressType[] 
  } = appContext;

  // State for instructor creation
  const [showCreateInstructorModal, setShowCreateInstructorModal] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // State for user role management
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.USER);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  
  // State for registered users with proper typing
  const [registeredUsersState, setRegisteredUsersState] = useState<AppUser[]>([]);
  
  // Update local state when context changes
  useEffect(() => {
    // Map registered users to AppUser type with proper progress property
    const usersWithProgress = registeredUsers.map(user => ({
      ...user,
      progress: user.progress || {
        percentage: 0,
        completedLessons: []
      }
    }));
    setRegisteredUsersState(usersWithProgress);
  }, [registeredUsers]);

  const handleRoleUpdate = async (user: AppUser, newRole: UserRole) => {
    if (!window.confirm(`Are you sure you want to update ${user.username}'s role to ${newRole}?`)) return;
    
    try {
      setIsUpdatingRole(true);
      setError('');
      
      // Here you would typically make an API call to update the user's role
      // For example: await updateUserRole(user.id, newRole);
      
      // Update local state
      const updatedUsers = registeredUsersState.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      );
      
      // Update local state with the updated users
      setRegisteredUsersState(updatedUsers);
      
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    } finally {
      setIsUpdatingRole(false);
      setEditingUser(null);
    }
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (newInstructor.password !== newInstructor.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Create new instructor
      const newUser: AppUser = {
        id: Date.now().toString(),
        username: newInstructor.username,
        email: newInstructor.email,
        role: USER_ROLES.INSTRUCTOR,
        password: newInstructor.password,
        createdAt: new Date().toISOString(),
        progress: {
          percentage: 0,
          completedLessons: []
        }
      };

      // Here you would typically make an API call to create the instructor
      // For example: await createInstructor(newUser);
      
      // In a real app, you would update the users list from the API response
      // For now, we'll just show an alert
      alert(`Instructor ${newUser.username} created successfully!`);
      
      // Reset form and close modal
      setNewInstructor({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateInstructorModal(false);
    } catch (err) {
      console.error('Error creating instructor:', err);
      setError('Failed to create instructor. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const analytics = useMemo<AnalyticsData>(() => {
    // Filter out admin users for all analytics
    const nonAdminUsers = registeredUsersState.filter(user => user.role !== USER_ROLES.ADMIN);
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
    const nonAdminQuizAttempts = quizAttempts.filter(attempt => nonAdminUserIds.has(attempt.userId));
    const totalQuizAttempts = nonAdminQuizAttempts.length;
    const totalScoreSum = nonAdminQuizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    const totalMaxScoreSum = nonAdminQuizAttempts.reduce((sum, attempt) => sum + attempt.maxScore, 0);
    const averageQuizScore = totalMaxScoreSum > 0 
      ? ((totalScoreSum / totalMaxScoreSum) * 100).toFixed(1) + '%' 
      : 'N/A';

    // Lesson completions for non-admin users
    const totalLessonCompletions = lessonProgress
      .filter(progress => nonAdminUserIds.has(progress.userId))
      .length;

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

    // Format gender data for charts
    const formatGenderData = () => {
      return Object.entries(genderDistribution)
        .filter(([key]) => key !== 'not-specified' || genderDistribution[key as keyof typeof genderDistribution] > 0)
        .map(([key, value]) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
          value,
          percentage: totalNonAdminUsers > 0 ? Math.round((value / totalNonAdminUsers) * 100) : 0
        }));
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
  }, [courses, registeredUsers, quizAttempts, lessonProgress]);

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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{analytics.totalUsers}</p>
            <p className="text-sm text-gray-500">Non-admin users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
            <p className="text-3xl font-bold">{analytics.totalCourses}</p>
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
        
        {/* Progress Distribution */}
        <div className="mb-8">
          <ChartComponent 
            title="User Progress Distribution" 
            data={analytics.progressDistribution} 
            type="bar" 
          />
        </div>
        
        {/* User Management Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-gray-600">
                Manage platform users and their roles. Currently showing {analytics.totalUsers} non-admin users.
              </p>
            </div>
            <button 
              onClick={() => setShowCreateInstructorModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Create Instructor
            </button>
          </div>
          
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-500">Excluding admins</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Instructors</h3>
              <p className="text-3xl font-bold">
                {registeredUsers.filter(user => user.role === USER_ROLES.INSTRUCTOR).length}
              </p>
              <p className="text-sm text-gray-500">Active instructors</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Quiz Attempts</h3>
              <p className="text-3xl font-bold">{analytics.totalQuizAttempts}</p>
              <p className="text-sm text-gray-500">Avg. Score: {analytics.averageQuizScore}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Lesson Completions</h3>
              <p className="text-3xl font-bold">{analytics.totalLessonCompletions}</p>
              <p className="text-sm text-gray-500">Across all courses</p>
            </div>
          </div>
          
          {/* Note about admin users */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Admin users are excluded from all analytics and user management views. Use the admin panel for admin user management.
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registeredUsers
                    .filter(user => user.role !== USER_ROLES.ADMIN)
                    .map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.username || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === USER_ROLES.INSTRUCTOR 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {editingUser?.id === user.id ? (
                            <div className="flex space-x-2">
                              <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="">Select Role</option>
                                <option value={USER_ROLES.USER}>User</option>
                                <option value={USER_ROLES.INSTRUCTOR}>Instructor</option>
                                <option value={USER_ROLES.ADMIN}>Admin</option>
                              </select>
                              <button
                                onClick={() => handleRoleUpdate(user, selectedRole)}
                                disabled={!selectedRole || isUpdatingRole}
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setSelectedRole(user.role);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit Role
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Instructor Modal */}
        {showCreateInstructorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Create New Instructor</h3>
                <button 
                  onClick={() => setShowCreateInstructorModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleCreateInstructor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={newInstructor.username}
                    onChange={(e) => setNewInstructor({...newInstructor, username: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newInstructor.password}
                    onChange={(e) => setNewInstructor({...newInstructor, password: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={newInstructor.confirmPassword}
                    onChange={(e) => setNewInstructor({...newInstructor, confirmPassword: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateInstructorModal(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : 'Create Instructor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
