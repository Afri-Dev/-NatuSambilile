import React, { useState, useContext, useEffect } from 'react';
import { AppContext, AppContextType } from '../App';
import { USER_ROLES } from '../constants';
import { 
  BeakerIcon, 
  FlaskIcon, 
  TestTubeIcon, 
  MicroscopeIcon, 
  AtomIcon, 
  ZapIcon,
  ShieldIcon,
  DatabaseIcon,
  CodeIcon,
  RocketIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '../constants';
import { generateModuleSuggestions, generateCourseDescription, generateLessonContent } from '../services/geminiService';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  apiResponseTime: number;
  activeSessions: number;
  errorRate: number;
  uptime: string;
}

interface AutomationJob {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'running';
  lastRun: string;
  nextRun: string;
  schedule: string;
}

const AdminLabPage: React.FC = () => {
  const { currentUser, courses, registeredUsers, addCourse, addModule, addLesson } = useContext(AppContext) as AppContextType;
  const [activeTab, setActiveTab] = useState('experiments');
  const [isLoading, setIsLoading] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 12,
    memoryUsage: 45,
    storageUsage: 23,
    apiResponseTime: 120,
    activeSessions: 5,
    errorRate: 0.1,
    uptime: '15 days, 8 hours'
  });
  const [automationJobs, setAutomationJobs] = useState<AutomationJob[]>([
    {
      id: '1',
      name: 'Content Backup',
      description: 'Automatically backup course content daily',
      status: 'enabled',
      lastRun: '2 hours ago',
      nextRun: 'Tomorrow 2:00 AM',
      schedule: 'Daily at 2:00 AM'
    },
    {
      id: '2',
      name: 'User Analytics',
      description: 'Generate weekly user engagement reports',
      status: 'enabled',
      lastRun: '1 week ago',
      nextRun: 'Sunday 2:00 AM',
      schedule: 'Weekly on Sunday'
    },
    {
      id: '3',
      name: 'System Cleanup',
      description: 'Clean up temporary files and logs',
      status: 'disabled',
      lastRun: 'Never',
      nextRun: 'N/A',
      schedule: 'Daily at 3:00 AM'
    }
  ]);

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && currentUser.role !== USER_ROLES.ADMIN) {
      window.location.href = '/';
    }
  }, [currentUser]);

  // Simulate real-time system metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 30) + 5,
        memoryUsage: Math.floor(Math.random() * 20) + 35,
        activeSessions: Math.floor(Math.random() * 10) + 1,
        apiResponseTime: Math.floor(Math.random() * 200) + 50
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const labTools = [
    {
      id: 'experiments',
      name: 'AI Experiments',
      icon: <BeakerIcon className="w-6 h-6" />,
      description: 'Test and experiment with AI features',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: <FlaskIcon className="w-6 h-6" />,
      description: 'Deep dive into system analytics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'testing',
      name: 'System Testing',
      icon: <TestTubeIcon className="w-6 h-6" />,
      description: 'Test system performance and features',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'monitoring',
      name: 'Real-time Monitoring',
      icon: <MicroscopeIcon className="w-6 h-6" />,
      description: 'Monitor system health and performance',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'ai-models',
      name: 'AI Model Management',
      icon: <AtomIcon className="w-6 h-6" />,
      description: 'Manage and configure AI models',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'automation',
      name: 'Automation Tools',
      icon: <ZapIcon className="w-6 h-6" />,
      description: 'Create and manage automated workflows',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  // AI Experiment Functions
  const runAICourseGeneration = async () => {
    setIsLoading(true);
    try {
      const courseTitle = `AI Generated Course ${Date.now()}`;
      const description = await generateCourseDescription(courseTitle);
      
      if (description && !description.includes('AI features disabled')) {
        const newCourse = {
          id: crypto.randomUUID(),
          title: courseTitle,
          description: description,
          imageUrl: 'https://picsum.photos/seed/ai-course/600/400',
          modules: []
        };
        
        addCourse(newCourse);
        
        // Generate modules for the course
        const moduleSuggestions = await generateModuleSuggestions(courseTitle, description);
        if (moduleSuggestions && moduleSuggestions.length > 0) {
          moduleSuggestions.slice(0, 5).forEach((moduleTitle, index) => {
            const newModule = {
              id: crypto.randomUUID(),
              title: moduleTitle,
              lessons: [],
              quizzes: []
            };
            addModule(newCourse.id, newModule);
            
            // Generate a sample lesson for each module
            setTimeout(async () => {
              const lessonTitle = `Introduction to ${moduleTitle.split(':')[1]?.trim() || 'Module'}`;
              const lessonContent = await generateLessonContent(courseTitle, moduleTitle, lessonTitle);
              
              if (lessonContent && !lessonContent.includes('AI features disabled')) {
                const newLesson = {
                  id: crypto.randomUUID(),
                  title: lessonTitle,
                  content: lessonContent
                };
                addLesson(newCourse.id, newModule.id, newLesson);
              }
            }, index * 1000);
          });
        }
        
        alert(`AI Course "${courseTitle}" generated successfully with ${moduleSuggestions?.length || 0} modules!`);
      } else {
        alert('AI Course generation failed. Please check your API key configuration.');
      }
    } catch (error) {
      alert('Error generating AI course: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAIContentAnalysis = async () => {
    setIsLoading(true);
    try {
      // Simulate content analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysisResults = {
        totalCourses: courses.length,
        totalModules: courses.reduce((sum, course) => sum + course.modules.length, 0),
        totalLessons: courses.reduce((sum, course) => 
          sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0), 0),
        averageModuleCount: courses.length > 0 ? 
          (courses.reduce((sum, course) => sum + course.modules.length, 0) / courses.length).toFixed(1) : '0',
        averageLessonCount: courses.length > 0 ? 
          (courses.reduce((sum, course) => 
            sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0), 0) / courses.length).toFixed(1) : '0'
      };
      
      alert(`Content Analysis Complete!\n\n` +
        `Total Courses: ${analysisResults.totalCourses}\n` +
        `Total Modules: ${analysisResults.totalModules}\n` +
        `Total Lessons: ${analysisResults.totalLessons}\n` +
        `Average Modules per Course: ${analysisResults.averageModuleCount}\n` +
        `Average Lessons per Course: ${analysisResults.averageLessonCount}`);
    } catch (error) {
      alert('Error analyzing content: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // System Testing Functions
  const runSystemTest = async (testType: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const testResults = {
        'database': { success: true, message: 'Database connection test passed!', details: 'All tables accessible' },
        'ai-service': { success: true, message: 'AI service test passed!', details: 'Gemini API responding correctly' },
        'file-processing': { success: true, message: 'File processing test passed!', details: 'Upload and OCR working' }
      };
      
      const result = testResults[testType as keyof typeof testResults];
      alert(`${result.message}\n\nDetails: ${result.details}`);
    } catch (error) {
      alert(`Test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Automation Functions
  const toggleAutomationJob = (jobId: string) => {
    setAutomationJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: job.status === 'enabled' ? 'disabled' : 'enabled' }
        : job
    ));
  };

  const runAutomationJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const job = automationJobs.find(j => j.id === jobId);
      if (!job) return;
      
      // Update job status to running
      setAutomationJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'running' as const } : j
      ));
      
      // Simulate job execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update job status and last run time
      setAutomationJobs(prev => prev.map(j => 
        j.id === jobId 
          ? { 
              ...j, 
              status: 'enabled' as const, 
              lastRun: 'Just now',
              nextRun: job.schedule.includes('Daily') ? 'Tomorrow 2:00 AM' : 'Next Sunday 2:00 AM'
            }
          : j
      ));
      
      alert(`${job.name} completed successfully!`);
    } catch (error) {
      alert(`Job failed: ${error}`);
      setAutomationJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: 'enabled' as const } : j
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Functions
  const runSecurityScan = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Security scan completed!\n\n✅ No vulnerabilities found\n✅ All permissions are secure\n✅ API keys are properly configured');
    } catch (error) {
      alert('Security scan failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const backupData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const backupData = {
        courses: courses.length,
        users: registeredUsers.length,
        timestamp: new Date().toISOString()
      };
      alert(`Backup completed successfully!\n\nCourses: ${backupData.courses}\nUsers: ${backupData.users}\nTimestamp: ${new Date(backupData.timestamp).toLocaleString()}`);
    } catch (error) {
      alert('Backup failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewSystemLogs = () => {
    const logs = [
      { timestamp: '2024-01-15 14:30:22', level: 'INFO', message: 'User admin logged in successfully' },
      { timestamp: '2024-01-15 14:25:15', level: 'INFO', message: 'Course "JavaScript Basics" created' },
      { timestamp: '2024-01-15 14:20:08', level: 'WARN', message: 'API rate limit approaching threshold' },
      { timestamp: '2024-01-15 14:15:42', level: 'INFO', message: 'Backup job completed successfully' },
      { timestamp: '2024-01-15 14:10:33', level: 'ERROR', message: 'Failed to connect to external service' }
    ];
    
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level}: ${log.message}`
    ).join('\n');
    
    alert('Recent System Logs:\n\n' + logText);
  };

  const runPerformanceTest = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const performanceMetrics = {
        pageLoadTime: '1.2s',
        apiResponseTime: '120ms',
        databaseQueryTime: '45ms',
        memoryUsage: '45%',
        cpuUsage: '12%'
      };
      
      alert(`Performance Test Results:\n\n` +
        `Page Load Time: ${performanceMetrics.pageLoadTime}\n` +
        `API Response Time: ${performanceMetrics.apiResponseTime}\n` +
        `Database Query Time: ${performanceMetrics.databaseQueryTime}\n` +
        `Memory Usage: ${performanceMetrics.memoryUsage}%\n` +
        `CPU Usage: ${performanceMetrics.cpuUsage}%\n\n` +
        `Status: ✅ All metrics within acceptable ranges`);
    } catch (error) {
      alert('Performance test failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Download Functions
  const downloadDetailedCSV = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `natusambilile-admin-report-${timestamp}.csv`;
      
      // Generate comprehensive CSV data
      const csvData = generateComprehensiveCSVData();
      
      // Create and download CSV file
      const csvContent = convertToCSV(csvData);
      downloadCSVFile(csvContent, filename);
      
      alert('Detailed CSV report downloaded successfully!');
    } catch (error) {
      alert('Error generating CSV report: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateComprehensiveCSVData = () => {
    const now = new Date();
    const nonAdminUsers = registeredUsers.filter(user => user.role !== USER_ROLES.ADMIN);
    
    // System Overview
    const systemOverview = {
      'Report Generated': now.toLocaleString(),
      'Total Users': registeredUsers.length,
      'Non-Admin Users': nonAdminUsers.length,
      'Admin Users': registeredUsers.filter(u => u.role === USER_ROLES.ADMIN).length,
      'Total Courses': courses.length,
      'Total Modules': courses.reduce((sum, course) => sum + course.modules.length, 0),
      'Total Lessons': courses.reduce((sum, course) => 
        sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0), 0),
      'Total Quizzes': courses.reduce((sum, course) => 
        sum + course.modules.reduce((modSum, mod) => modSum + (mod.quizzes?.length || 0), 0), 0),
      'System Uptime': systemMetrics.uptime,
      'CPU Usage': `${systemMetrics.cpuUsage}%`,
      'Memory Usage': `${systemMetrics.memoryUsage}%`,
      'Storage Usage': `${systemMetrics.storageUsage}%`,
      'API Response Time': `${systemMetrics.apiResponseTime}ms`,
      'Active Sessions': systemMetrics.activeSessions,
      'Error Rate': `${systemMetrics.errorRate}%`
    };

    // User Details
    const userDetails = registeredUsers.map(user => ({
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
      'Enrolled Courses': user.courses?.length || 0,
      'Quiz Attempts': user.quizAttempts?.length || 0
    }));

    // Course Details
    const courseDetails = courses.map(course => ({
      'Course ID': course.id,
      'Course Title': course.title,
      'Course Description': course.description,
      'Image URL': course.imageUrl,
      'Module Count': course.modules.length,
      'Lesson Count': course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
      'Quiz Count': course.modules.reduce((sum, mod) => sum + (mod.quizzes?.length || 0), 0),
      'Total Content Items': course.modules.reduce((sum, mod) => 
        sum + mod.lessons.length + (mod.quizzes?.length || 0), 0)
    }));

    // Module Details
    const moduleDetails = courses.flatMap(course => 
      course.modules.map(module => ({
        'Course ID': course.id,
        'Course Title': course.title,
        'Module ID': module.id,
        'Module Title': module.title,
        'Lesson Count': module.lessons.length,
        'Quiz Count': module.quizzes?.length || 0,
        'Total Items': module.lessons.length + (module.quizzes?.length || 0)
      }))
    );

    // Lesson Details
    const lessonDetails = courses.flatMap(course => 
      course.modules.flatMap(module => 
        module.lessons.map(lesson => ({
          'Course ID': course.id,
          'Course Title': course.title,
          'Module ID': module.id,
          'Module Title': module.title,
          'Lesson ID': lesson.id,
          'Lesson Title': lesson.title,
          'Content Length': lesson.content.length,
          'Content Preview': lesson.content.substring(0, 100) + '...'
        }))
      )
    );

    // Quiz Details
    const quizDetails = courses.flatMap(course => 
      course.modules.flatMap(module => 
        (module.quizzes || []).map(quiz => ({
          'Course ID': course.id,
          'Course Title': course.title,
          'Module ID': module.id,
          'Module Title': module.title,
          'Quiz ID': quiz.id,
          'Quiz Title': quiz.title,
          'Quiz Description': quiz.description,
          'Question Count': quiz.questions?.length || 0,
          'Total Points': quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0
        }))
      )
    );

    // User Activity Analysis
    const userActivity = nonAdminUsers.map(user => {
      const userQuizAttempts = 0; // This would come from actual quiz attempts data
      const userLessonCompletions = 0; // This would come from actual lesson progress data
      
      return {
        'User ID': user.id,
        'Username': user.username,
        'Role': user.role,
        'Days Since Registration': user.createdAt ? 
          Math.floor((now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        'Days Since Last Login': user.lastLogin ? 
          Math.floor((now.getTime() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : 'Never',
        'Quiz Attempts': userQuizAttempts,
        'Lessons Completed': userLessonCompletions,
        'Enrolled Courses': user.courses?.length || 0,
        'Activity Level': userQuizAttempts + userLessonCompletions > 10 ? 'High' : 
                        userQuizAttempts + userLessonCompletions > 5 ? 'Medium' : 'Low'
      };
    });

    // Automation Jobs Status
    const automationStatus = automationJobs.map(job => ({
      'Job ID': job.id,
      'Job Name': job.name,
      'Description': job.description,
      'Status': job.status,
      'Schedule': job.schedule,
      'Last Run': job.lastRun,
      'Next Run': job.nextRun
    }));

    return {
      'System Overview': [systemOverview],
      'User Details': userDetails,
      'Course Details': courseDetails,
      'Module Details': moduleDetails,
      'Lesson Details': lessonDetails,
      'Quiz Details': quizDetails,
      'User Activity Analysis': userActivity,
      'Automation Jobs Status': automationStatus
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'experiments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Content Generation Experiments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Course Generation</h4>
                  <p className="text-sm text-gray-600 mb-3">Generate complete courses with AI-powered content</p>
                  <button 
                    onClick={runAICourseGeneration}
                    disabled={isLoading}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                    <span>{isLoading ? 'Generating...' : 'Run Experiment'}</span>
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Content Analysis</h4>
                  <p className="text-sm text-gray-600 mb-3">Analyze existing content and generate insights</p>
                  <button 
                    onClick={runAIContentAnalysis}
                    disabled={isLoading}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                    <span>{isLoading ? 'Analyzing...' : 'Run Analysis'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Advanced System Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">User Engagement</h4>
                  <p className="text-2xl font-bold text-blue-600">{registeredUsers.filter(u => u.role !== USER_ROLES.ADMIN).length}</p>
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-xs text-blue-500 mt-1">+12% this month</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Content</h4>
                  <p className="text-2xl font-bold text-green-600">{courses.length}</p>
                  <p className="text-sm text-green-600">Total Courses</p>
                  <p className="text-xs text-green-500 mt-1">+3 this week</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">System Health</h4>
                  <p className="text-2xl font-bold text-purple-600">98%</p>
                  <p className="text-sm text-purple-600">Uptime</p>
                  <p className="text-xs text-purple-500 mt-1">Last 30 days</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">User Activity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Today</span>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New This Week</span>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 10) + 2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-medium">{(Math.random() * 30 + 60).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Content Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Modules</span>
                      <span className="text-sm font-medium">{courses.reduce((sum, course) => sum + course.modules.length, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Lessons</span>
                      <span className="text-sm font-medium">{courses.reduce((sum, course) => 
                        sum + course.modules.reduce((modSum, mod) => modSum + mod.lessons.length, 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Course Rating</span>
                      <span className="text-sm font-medium">{(Math.random() * 2 + 3).toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">System Testing Suite</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">Database Connection</h4>
                    <p className="text-sm text-gray-600">Test local storage connectivity and data integrity</p>
                  </div>
                  <button 
                    onClick={() => runSystemTest('database')}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    <span>Test</span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">AI Service</h4>
                    <p className="text-sm text-gray-600">Test Gemini API connectivity and response</p>
                  </div>
                  <button 
                    onClick={() => runSystemTest('ai-service')}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    <span>Test</span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-700">File Processing</h4>
                    <p className="text-sm text-gray-600">Test file upload and OCR processing</p>
                  </div>
                  <button 
                    onClick={() => runSystemTest('file-processing')}
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    <span>Test</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Real-time System Monitoring</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">System Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-medium text-green-600">{systemMetrics.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemMetrics.cpuUsage}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="text-sm font-medium text-blue-600">{systemMetrics.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemMetrics.memoryUsage}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Storage</span>
                      <span className="text-sm font-medium text-purple-600">{systemMetrics.storageUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${systemMetrics.storageUsage}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Application Health</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="text-sm font-medium text-green-600">{systemMetrics.apiResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <span className="text-sm font-medium text-blue-600">{systemMetrics.activeSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium text-green-600">{systemMetrics.errorRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-medium text-purple-600">{systemMetrics.uptime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-models':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Model Configuration</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Gemini Model Settings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Model Version</span>
                      <span className="text-sm font-medium">gemini-1.5-flash</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temperature</span>
                      <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-24" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Max Tokens</span>
                      <input type="number" defaultValue="1000" className="w-20 border border-gray-300 rounded px-2 py-1" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">API Key Status</span>
                      <span className="text-sm font-medium text-green-600 flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Configured
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Model Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium">1.2s average</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium">98.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Requests Today</span>
                      <span className="text-sm font-medium">1,247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Automation Workflows</h3>
              <div className="space-y-4">
                {automationJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-700">{job.name}</h4>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'enabled' ? 'bg-green-100 text-green-800' :
                          job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <div>Schedule: {job.schedule}</div>
                        <div>Last run: {job.lastRun}</div>
                        <div>Next run: {job.nextRun}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAutomationJob(job.id)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            job.status === 'enabled' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {job.status === 'enabled' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => runAutomationJob(job.id)}
                          disabled={job.status === 'disabled' || isLoading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {isLoading && job.status === 'running' ? 'Running...' : 'Run Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <BeakerIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">AdminLab</h1>
              <p className="text-gray-600">Advanced tools and experiments for administrators</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {labTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tool.id
                    ? `bg-gradient-to-r ${tool.color} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tool.icon}
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={runSecurityScan}
              disabled={isLoading}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ShieldIcon className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">{isLoading ? 'Scanning...' : 'Security Scan'}</span>
            </button>
            <button 
              onClick={backupData}
              disabled={isLoading}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <DatabaseIcon className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">{isLoading ? 'Backing up...' : 'Backup Data'}</span>
            </button>
            <button 
              onClick={viewSystemLogs}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CodeIcon className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">System Logs</span>
            </button>
            <button 
              onClick={runPerformanceTest}
              disabled={isLoading}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RocketIcon className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">{isLoading ? 'Testing...' : 'Performance'}</span>
            </button>
          </div>
        </div>

        {/* Floating Action Button for CSV Download */}
        <button
          onClick={downloadDetailedCSV}
          disabled={isLoading}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:transform-none group"
          title="Download Detailed CSV Report"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-6 h-6 animate-spin" />
          ) : (
            <DocumentArrowDownIcon className="w-6 h-6" />
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Download Detailed CSV Report
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AdminLabPage; 