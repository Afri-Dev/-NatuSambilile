import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App';
import { toast } from 'react-toastify';
import { USER_ROLES, DocumentArrowDownIcon, ArrowPathIcon } from '../constants';
import { ChartComponent } from '../components/dashboard/ChartComponent';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  gender?: string;
  ageRange?: string;
  password?: string;
  createdAt: string; // ISO date string
  lastLogin?: string; // ISO date string
  progress?: {
    percentage: number;
    lastUpdated?: string;
  };
  activity?: {
    totalLogins: number;
    lastSessionDuration?: number; // in minutes
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
  // Basic metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  
  // User engagement
  totalQuizAttempts: number;
  averageQuizScore: string;
  totalLessonCompletions: number;
  averageSessionDuration: string;
  
  // User acquisition
  signupsByDate: Array<{ date: string; count: number }>;
  signupsByMonth: Array<{ month: string; count: number }>;
  
  // User activity
  activeUsersByDay: Array<{ day: string; count: number }>;
  userRetention: number;
  
  // Distributions
  progressDistribution: ChartItem[];
  genderDistribution: ChartItem[];
  ageRangeDistribution: ChartItem[];
  userSignupTimeline: Array<{ date: string; count: number }>;
}

const AdminDashboardPage = () => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("AppContext is null");
  
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [newUser, setNewUser] = useState<{
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'Admin' | 'Instructor' | 'Student';
    gender: string;
    ageRange: string;
  }>({
    username: '',
    firstName: '',
    lastName: '',
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
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as 'Admin' | 'Instructor' | 'Student',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        activity: {
          totalLogins: 1,
          lastSessionDuration: 0
        }
      };
      const result = appContext.addUserByAdmin(userToCreate);
      
      if (result.success) {
        toast.success('User created successfully!');
        setNewUser({
          username: '',
          firstName: '',
          lastName: '',
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
  
  // Get unique users (filter duplicates by email) and ensure country is properly set
  const users = useMemo(() => {
    const seen = new Set();
    return appContext.registeredUsers
      .filter(user => user.role !== 'Admin') // Exclude admin users
      .filter(user => {
        const duplicate = seen.has(user.email);
        seen.add(user.email);
        return !duplicate;
      })
      .map(user => ({
        ...user,
        country: user.country || 'Not Specified' // Ensure country has a default value
      }));
  }, [appContext.registeredUsers]);

  const { courses = [] } = appContext;

  // Calculate country distribution
  const countryDistribution = useMemo(() => {
    const countryMap = new Map<string, number>();
    
    // Count users per country
    users.forEach(user => {
      const country = user.country || 'Not Specified';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    // Convert to array and sort by count (descending)
    return Array.from(countryMap.entries())
      .map(([country, count]) => ({
        label: country,
        value: count,
        percentage: (count / users.length) * 100
      }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  // Calculate analytics data
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

    // Calculate signups by date (last 30 days)
    const signupsByDateMap = new Map<string, number>();
    const signupsByMonthMap = new Map<string, number>();
    
    nonAdminUsers.forEach(user => {
      // Use current date as fallback if createdAt is missing or invalid
      const date = user.createdAt ? new Date(user.createdAt) : new Date();
      // Check if date is valid
      const isValidDate = !isNaN(date.getTime());
      const dateToUse = isValidDate ? date : new Date();
      
      const dateStr = dateToUse.toISOString().split('T')[0];
      const monthStr = dateToUse.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      signupsByDateMap.set(dateStr, (signupsByDateMap.get(dateStr) || 0) + 1);
      signupsByMonthMap.set(monthStr, (signupsByMonthMap.get(monthStr) || 0) + 1);
    });
    
    // Convert maps to arrays for charts
    const signupsByDate = Array.from(signupsByDateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    const signupsByMonth = Array.from(signupsByMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime());
    
    // Calculate date range for new and active users (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Calculate active users (logged in within last 30 days)
    const activeUsers = nonAdminUsers.filter(user => 
      user.lastLogin && new Date(user.lastLogin) > thirtyDaysAgo
    ).length;
    
    // Calculate new users (signed up in the last 30 days)
    const newUsers = nonAdminUsers.filter(user => 
      user.createdAt && new Date(user.createdAt) > thirtyDaysAgo
    ).length;
    
    // Calculate user retention (simplified)
    const userRetention = totalNonAdminUsers > 0 
      ? Math.round((activeUsers / totalNonAdminUsers) * 100) 
      : 0;
    
    return {
      // Basic metrics
      totalUsers: totalNonAdminUsers,
      activeUsers,
      newUsers,
      totalCourses,
      totalModules,
      totalLessons,
      totalQuizzes,
      
      // Engagement metrics
      totalQuizAttempts,
      averageQuizScore,
      totalLessonCompletions,
      averageSessionDuration: '15 min', // This would come from actual session data
      
      // User acquisition
      signupsByDate,
      signupsByMonth,
      
      // User activity
      activeUsersByDay: [], // This would be populated with actual data
      userRetention,
      
      // Distributions
      progressDistribution,
      genderDistribution: formatGenderData(),
      ageRangeDistribution: formatAgeRangeData(),
      userSignupTimeline: signupsByDate
    };
  }, [users, courses]);

  // CSV Download Functions
  const downloadDashboardCSV = async () => {
    setIsGeneratingReport(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `natusambilile-dashboard-report-${timestamp}.csv`;
      
      // Generate comprehensive CSV data
      const csvData = generateDashboardCSVData();
      
      // Create and download CSV file
      const csvContent = convertToCSV(csvData);
      downloadCSVFile(csvContent, filename);
      
      toast.success('Dashboard CSV report downloaded successfully!');
    } catch (error) {
      console.error('Error generating CSV report:', error);
      toast.error('Error generating CSV report: ' + error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateDashboardCSVData = () => {
    const now = new Date();
    const nonAdminUsers = users.filter(user => user.role !== USER_ROLES.ADMIN);
    
    // Dashboard Overview
    const dashboardOverview = {
      'Report Generated': now.toLocaleString(),
      'Total Users': analytics.totalUsers,
      'Active Users': analytics.activeUsers,
      'New Users (30 days)': analytics.newUsers,
      'Total Courses': analytics.totalCourses,
      'Total Modules': analytics.totalModules,
      'Total Lessons': analytics.totalLessons,
      'Total Quizzes': analytics.totalQuizzes,
      'User Retention Rate': `${analytics.userRetention}%`,
      'Average Quiz Score': analytics.averageQuizScore,
      'Average Session Duration': analytics.averageSessionDuration,
      'Total Quiz Attempts': analytics.totalQuizAttempts,
      'Total Lesson Completions': analytics.totalLessonCompletions
    };

    // User Demographics
    const userDemographics = users.map(user => ({
      'User ID': user.id,
      'Username': user.username,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Role': user.role,
      'Gender': user.gender || 'Not specified',
      'Age Range': user.ageRange || 'Not specified',
      'Country': user.country || 'Not specified',
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown',
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      'Days Since Registration': user.createdAt ? 
        Math.floor((now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      'Days Since Last Login': user.lastLogin ? 
        Math.floor((now.getTime() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 'Never'
    }));

    // Course Analytics
    const courseAnalytics = courses.map(course => ({
      'Course ID': course.id,
      'Course Title': course.title,
      'Course Description': course.description,
      'Module Count': course.modules.length,
      'Lesson Count': course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
      'Quiz Count': course.modules.reduce((sum, mod) => sum + (mod.quizzes?.length || 0), 0),
      'Total Content Items': course.modules.reduce((sum, mod) => 
        sum + mod.lessons.length + (mod.quizzes?.length || 0), 0),
      'Average Lessons per Module': course.modules.length > 0 ? 
        (course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0) / course.modules.length).toFixed(1) : '0'
    }));

    // User Signup Timeline
    const signupTimeline = analytics.signupsByDate.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'New Signups': item.count,
      'Cumulative Users': item.count // This would be calculated in a real implementation
    }));

    // Gender Distribution
    const genderData = analytics.genderDistribution.map(item => ({
      'Gender': item.label,
      'Count': item.value,
      'Percentage': `${item.percentage?.toFixed(1)}%`
    }));

    // Age Range Distribution
    const ageRangeData = analytics.ageRangeDistribution.map(item => ({
      'Age Range': item.label,
      'Count': item.value,
      'Percentage': `${item.percentage?.toFixed(1)}%`
    }));

    // Country Distribution
    const countryData = countryDistribution.map(item => ({
      'Country': item.label,
      'Count': item.value,
      'Percentage': `${item.percentage?.toFixed(1)}%`
    }));

    // User Activity Summary
    const userActivitySummary = {
      'Total Active Users': analytics.activeUsers,
      'User Retention Rate': `${analytics.userRetention}%`,
      'Average Session Duration': analytics.averageSessionDuration,
      'Total Quiz Attempts': analytics.totalQuizAttempts,
      'Average Quiz Score': analytics.averageQuizScore,
      'Total Lesson Completions': analytics.totalLessonCompletions,
      'New Users This Month': analytics.newUsers,
      'Total Users': analytics.totalUsers
    };

    return {
      'Dashboard Overview': [dashboardOverview],
      'User Demographics': userDemographics,
      'Course Analytics': courseAnalytics,
      'User Signup Timeline': signupTimeline,
      'Gender Distribution': genderData,
      'Age Range Distribution': ageRangeData,
      'Country Distribution': countryData,
      'User Activity Summary': [userActivitySummary]
    };
  };

  const convertToCSV = (data: any) => {
    let csvContent = '';
    
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      csvContent += `\n\n=== ${sheetName.toUpperCase()} ===\n\n`;
      
      if (Array.isArray(sheetData) && sheetData.length > 0) {
        // Get headers from first object
        const headers = Object.keys(sheetData[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        sheetData.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    });
    
    return csvContent;
  };

  const downloadCSVFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full px-4 py-8">
        <div className="w-full space-y-12">
          <div className="px-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          
          {/* Main Chart Section */}
          <div className="bg-white p-6 rounded-lg shadow mx-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">User Signups (Last 30 Days)</h3>
            </div>
            <div className="h-[400px] w-full">
              <ChartComponent 
                title="" 
                data={analytics.signupsByDate.map(item => ({
                  label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  value: item.count
                }))} 
                type="bar"
              />
            </div>
          </div>
          
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 mt-8">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
              <p className="text-sm text-gray-500">{analytics.newUsers} new this month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Users</h3>
              <p className="text-3xl font-bold">{analytics.activeUsers}</p>
              <p className="text-sm text-gray-500">{analytics.userRetention}% retention</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
              <p className="text-3xl font-bold">{analytics.totalCourses}</p>
              <p className="text-sm text-gray-500">{analytics.totalModules} modules</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Engagement</h3>
              <p className="text-xl font-bold">{analytics.averageSessionDuration} avg. session</p>
              <p className="text-sm text-gray-500">{analytics.totalQuizAttempts} quiz attempts</p>
            </div>
          </div>
          
          {/* Country Distribution Section */}
          <div className="px-6 space-y-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Distribution by Country</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96">
                  <ChartComponent 
                    data={countryDistribution.slice(0, 10)} 
                    type="pie" 
                    title="Top 10 Countries"
                  />
                </div>
                <div className="h-96">
                  <ChartComponent 
                    data={countryDistribution}
                    type="bar" 
                    title="All Countries"
                  />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Total Countries</p>
                  <p className="text-2xl font-bold text-blue-600">{countryDistribution.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Top Country</p>
                  <p className="text-lg font-semibold text-green-700">
                    {countryDistribution[0]?.label || 'N/A'}
                  </p>
                  <p className="text-sm text-green-600">
                    {countryDistribution[0]?.value} users ({countryDistribution[0]?.percentage.toFixed(1)}%)
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Users with Country</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.country).length}
                  </p>
                  <p className="text-sm text-purple-600">
                    {((users.filter(u => u.country).length / users.length) * 100 || 0).toFixed(1)}% of total
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">Unique Regions</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {new Set(countryDistribution.map(c => c.label.split(',').pop()?.trim())).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Section */}
          <div className="px-6 space-y-8 mt-12">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.country || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold mb-2">Total Lessons</h3>
              <p className="text-3xl font-bold">{analytics.totalLessons}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Quiz Attempts</h3>
              <p className="text-3xl font-bold">{analytics.totalQuizAttempts}</p>
              <p className="text-sm text-gray-500">Avg. Score: {analytics.averageQuizScore}</p>
            </div>
          </div>
        </div>
        

        
        {/* User Growth & Analytics */}
          <div className="grid grid-cols-1 gap-12 px-6 mt-12">
            {/* Demographics and Activity */}
            {/* Full width demographics card */}
            <div className="bg-white p-6 rounded-lg shadow space-y-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Demographics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                  <ChartComponent 
                    title="" 
                    data={analytics.genderDistribution} 
                    type="pie"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Age Range</h4>
                  <ChartComponent 
                    title="" 
                    data={analytics.ageRangeDistribution}
                    type="pie"
                  />
                </div>
              </div>
            </div>
            
            {/* User Activity Card */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">User Activity</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{analytics.totalQuizAttempts}</div>
                  <div className="text-sm text-gray-500">Quiz Attempts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.totalLessonCompletions}</div>
                  <div className="text-sm text-gray-500">Lessons Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{analytics.averageSessionDuration}</div>
                  <div className="text-sm text-gray-500">Avg. Session</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Signup Timeline */}
          <div className="bg-white p-6 rounded-lg shadow mx-6 hover:shadow-md transition-shadow duration-200 mt-12">
            <h3 className="text-lg font-semibold mb-4">User Signup Timeline</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signup Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All Users
                </button>
              </div>
            )}
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
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({
                      ...newUser, 
                      role: e.target.value as 'Admin' | 'Instructor' | 'Student'
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="Instructor">Instructor</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
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

      {/* Floating Action Button for CSV Download */}
      <button
        onClick={downloadDashboardCSV}
        disabled={isGeneratingReport}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:transform-none group"
        title="Download Dashboard CSV Report"
      >
        {isGeneratingReport ? (
          <ArrowPathIcon className="w-6 h-6 animate-spin" />
        ) : (
          <DocumentArrowDownIcon className="w-6 h-6" />
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Download Dashboard CSV Report
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
    </div>
  );
};

export default AdminDashboardPage;
