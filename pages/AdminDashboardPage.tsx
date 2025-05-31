import { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { USER_ROLES } from '../constants';

// Type for the chart data items
interface ChartItem {
  label: string;
  value: number;
  percentage?: number;
}

import { ChartComponent } from '../components/dashboard/ChartComponent';

// Define types for user data
interface User {
  id: string;
  role: string;
  gender?: string;
  ageRange?: string;
  progress?: {
    percentage: number;
  };
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
  
  // Safely destructure with default values to prevent undefined errors
  const { 
    courses = [], 
    registeredUsers = [] as User[], 
    quizAttempts = [] as QuizAttempt[], 
    lessonProgress = [] as LessonProgress[] 
  } = appContext;

  const analytics = useMemo<AnalyticsData>(() => {
    // Filter out admin users for all analytics
    const nonAdminUsers = registeredUsers.filter(user => user.role !== USER_ROLES.ADMIN);
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
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <p className="text-gray-600 mb-6">
            Manage platform users and their roles. Currently showing {analytics.totalUsers} non-admin users.
          </p>
          
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-500">Excluding admins</p>
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
