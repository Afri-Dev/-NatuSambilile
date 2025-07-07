import React, { createContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CoursePage from './pages/CoursePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLabPage from './pages/AdminLabPage';
import CoursesPage from './pages/CoursesPage';
import MyLearningPage from './pages/MyLearningPage';
import FileUploadPage from './pages/FileUploadPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { Course, Module, Lesson, User, UserRole, Quiz, Question, QuizAttempt, LessonProgress } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { USER_ROLES } from './constants';

export interface AppContextType {
  courses: Course[];
  addCourse: (course: Course) => void;
  updateCourse: (updatedCourse: Course) => void;
  deleteCourse: (courseId: string) => void;

  addModule: (courseId: string, module: Module) => void;
  updateModule: (courseId: string, updatedModule: Module) => void;
  deleteModule: (courseId: string, moduleId: string) => void;

  addLesson: (courseId: string, moduleId: string, lesson: Lesson) => void;
  updateLesson: (courseId: string, moduleId: string, updatedLesson: Lesson) => void;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;

  // Quiz Management
  addQuizToModule: (courseId: string, moduleId: string, quiz: Omit<Quiz, 'id' | 'moduleId' | 'questions'>) => Quiz | undefined;
  updateQuizInModule: (courseId: string, moduleId: string, updatedQuiz: Quiz) => void;
  deleteQuizFromModule: (courseId: string, moduleId: string, quizId: string) => void;

  addQuestionToQuiz: (courseId: string, moduleId: string, quizId: string, question: Omit<Question, 'id' | 'quizId'>) => Question | undefined;
  updateQuestionInQuiz: (courseId: string, moduleId: string, quizId: string, updatedQuestion: Question) => void;
  deleteQuestionFromQuiz: (courseId: string, moduleId: string, quizId: string, questionId: string) => void;

  // Quiz Attempts
  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;
  getQuizAttemptsForUser: (quizId: string, userId: string) => QuizAttempt[];
  getQuizById: (courseId: string, moduleId: string, quizId: string) => Quiz | undefined;

  // User Authentication
  currentUser: User | null;
  registeredUsers: User[];
  login: (identifier: string, password_provided: string) => { success: boolean; message?: string };
  register: (userData: Omit<User, 'id' | 'lastLogin' | 'createdAt'>) => { success: boolean; message?: string };
  logout: () => void;
  canEdit: (user: User | null) => boolean;

  // Admin User Management
  addUserByAdmin: (userData: Omit<User, 'id'>) => { success: boolean; message: string };
  updateUserRole: (targetUserId: string, newRole: UserRole) => { success: boolean; message: string };
  deleteUserByAdmin: (targetUserId: string) => { success: boolean; message: string };

  // Student Progress
  lessonProgress: LessonProgress[];
  markLessonAsComplete: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getModuleProgress: (moduleId: string, userId: string) => { completed: number; total: number; percentage: number };
  getCourseProgress: (courseId: string, userId: string) => { completed: number; total: number; percentage: number };
  
  // Course Enrollment
  enrollInCourse: (courseId: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [courses, setCourses] = useLocalStorage<Course[]>('lmsCourses', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('lmsCurrentUser', null);
  const [registeredUsers, setRegisteredUsers] = useLocalStorage<User[]>('lmsRegisteredUsers', []);
  const [quizAttempts, setQuizAttempts] = useLocalStorage<QuizAttempt[]>('lmsQuizAttempts', []);
  const [lessonProgress, setLessonProgress] = useLocalStorage<LessonProgress[]>('lmsLessonProgress', []);

  useEffect(() => {
    if (registeredUsers.length === 0) {
      const defaultAdmin: User = {
        id: crypto.randomUUID(),
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'NatuSambilileadmin@gmail.com',
        password: '12345qwert',
        role: USER_ROLES.ADMIN as UserRole,
      };
      setRegisteredUsers([defaultAdmin]);
    }
  }, []); // Run only once on mount if registeredUsers is initially empty.

  const login = (identifier: string, password_provided: string): { success: boolean; message?: string } => {
    const user = registeredUsers.find(
      u => (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) && u.password === password_provided
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, message: "Login successful!" };
    }
    return { success: false, message: "Invalid username/email or password." };
  };

  const register = (userData: Omit<User, 'id' | 'lastLogin' | 'createdAt'>): { success: boolean; message?: string } => {
    const { username, email, password, role, gender, ageRange, firstName, lastName, country } = userData;

    if (!username.trim() || !email.trim() || !password || !role || !firstName?.trim() || !lastName?.trim() || !country) {
      return { success: false, message: "All required fields (username, email, password, first name, last name, role, country) must be provided for registration." };
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return { success: false, message: 'Invalid email format.' };
    }

    const existingUser = registeredUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return { success: false, message: "Username or email already exists." };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password, // Storing plain text password for demo
      role,
      gender,
      ageRange,
      country, // Include country in the user object
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      courses: [],
      quizAttempts: []
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser); // Auto-login after registration
    return { success: true, message: "Registration successful! You are now logged in." };
  };


  const logout = () => {
    setCurrentUser(null);
  };

  const canEdit = (user: User | null): boolean => {
    return !!user && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.INSTRUCTOR);
  };

  // Course CRUD
  const addCourse = (course: Course) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => [...prev, { ...course, modules: course.modules.map(m => ({...m, quizzes: m.quizzes || []})) }]);
  };
  const updateCourse = (updatedCourse: Course) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };
  const deleteCourse = (courseId: string) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.filter(c => c.id !== courseId));
    const lessonsInCourse = courses.find(c => c.id === courseId)?.modules.flatMap(m => m.lessons.map(l => l.id)) || [];
    setLessonProgress(prev => prev.filter(lp => !lessonsInCourse.includes(lp.lessonId)));
     // Also remove quiz attempts related to quizzes in this course
    const quizzesInCourse = courses.find(c => c.id === courseId)?.modules.flatMap(m => m.quizzes?.map(q => q.id) || []) || [];
    setQuizAttempts(prev => prev.filter(qa => !quizzesInCourse.includes(qa.quizId)));
  };

  // Module CRUD
  const addModule = (courseId: string, module: Module) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, modules: [...c.modules, {...module, quizzes: module.quizzes || []}] } : c
    ));
  };
  const updateModule = (courseId: string, updatedModule: Module) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, modules: c.modules.map(m => m.id === updatedModule.id ? {...updatedModule, quizzes: updatedModule.quizzes || []} : m) }
        : c
    ));
  };
  const deleteModule = (courseId: string, moduleId: string) => {
    if (!canEdit(currentUser)) return;
     const lessonsInModule = courses.find(c => c.id === courseId)?.modules.find(m => m.id === moduleId)?.lessons.map(l => l.id) || [];
     const quizzesInModule = courses.find(c => c.id === courseId)?.modules.find(m => m.id === moduleId)?.quizzes?.map(q => q.id) || [];
    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, modules: c.modules.filter(m => m.id !== moduleId) }
        : c
    ));
    setLessonProgress(prev => prev.filter(lp => !lessonsInModule.includes(lp.lessonId)));
    setQuizAttempts(prev => prev.filter(qa => !quizzesInModule.includes(qa.quizId)));
  };

  // Lesson CRUD
  const addLesson = (courseId: string, moduleId: string, lesson: Lesson) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, modules: c.modules.map(m =>
            m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m
          )}
        : c
    ));
  };
  const updateLesson = (courseId: string, moduleId: string, updatedLesson: Lesson) => {
    if (!canEdit(currentUser)) return;
     setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, modules: c.modules.map(m =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.map(l => l.id === updatedLesson.id ? updatedLesson : l) }
              : m
          )}
        : c
    ));
  };
  const deleteLesson = (courseId: string, moduleId: string, lessonId: string) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c =>
      c.id === courseId
        ? { ...c, modules: c.modules.map(m =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
              : m
          )}
        : c
    ));
    setLessonProgress(prev => prev.filter(lp => lp.lessonId !== lessonId));
  };

  // Quiz Management
  const addQuizToModule = (courseId: string, moduleId: string, quizData: Omit<Quiz, 'id' | 'moduleId' | 'questions'>): Quiz | undefined => {
    if (!canEdit(currentUser)) return undefined;
    const newQuiz: Quiz = {
        ...quizData,
        id: crypto.randomUUID(),
        moduleId,
        questions: []
    };
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return { ...m, quizzes: [...(m.quizzes || []), newQuiz] };
            }
            return m;
          })
        };
      }
      return c;
    }));
    return newQuiz;
  };

  const updateQuizInModule = (courseId: string, moduleId: string, updatedQuiz: Quiz) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return { ...m, quizzes: (m.quizzes || []).map(q => q.id === updatedQuiz.id ? updatedQuiz : q) };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const deleteQuizFromModule = (courseId: string, moduleId: string, quizId: string) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return { ...m, quizzes: (m.quizzes || []).filter(q => q.id !== quizId) };
            }
            return m;
          })
        };
      }
      return c;
    }));
    setQuizAttempts(prevAttempts => prevAttempts.filter(att => att.quizId !== quizId));
  };

  const addQuestionToQuiz = (courseId: string, moduleId: string, quizId: string, questionData: Omit<Question, 'id' | 'quizId'>): Question | undefined => {
    if (!canEdit(currentUser)) return undefined;
    const newQuestion: Question = { ...questionData, id: crypto.randomUUID(), quizId };
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return {
                ...m,
                quizzes: (m.quizzes || []).map(q => {
                  if (q.id === quizId) {
                    return { ...q, questions: [...q.questions, newQuestion] };
                  }
                  return q;
                })
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
    return newQuestion;
  };

  const updateQuestionInQuiz = (courseId: string, moduleId: string, quizId: string, updatedQuestion: Question) => {
    if (!canEdit(currentUser)) return;
     setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return {
                ...m,
                quizzes: (m.quizzes || []).map(q => {
                  if (q.id === quizId) {
                    return { ...q, questions: q.questions.map(ques => ques.id === updatedQuestion.id ? updatedQuestion : ques) };
                  }
                  return q;
                })
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  const deleteQuestionFromQuiz = (courseId: string, moduleId: string, quizId: string, questionId: string) => {
    if (!canEdit(currentUser)) return;
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        return {
          ...c,
          modules: c.modules.map(m => {
            if (m.id === moduleId) {
              return {
                ...m,
                quizzes: (m.quizzes || []).map(q => {
                  if (q.id === quizId) {
                    return { ...q, questions: q.questions.filter(ques => ques.id !== questionId) };
                  }
                  return q;
                })
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  // Quiz Attempts
  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [...prev, attempt]);
  };

  const getQuizAttemptsForUser = (quizId: string, userId: string): QuizAttempt[] => {
    return quizAttempts.filter(att => att.quizId === quizId && att.userId === userId);
  };

  const getQuizById = (courseIdParam: string, moduleIdParam: string, quizIdParam: string): Quiz | undefined => {
    const course = courses.find(c => c.id === courseIdParam);
    if (!course) return undefined;
    const module = course.modules.find(m => m.id === moduleIdParam);
    if (!module || !module.quizzes) return undefined;
    return module.quizzes.find(q => q.id === quizIdParam);
  };

  // Admin User Management Functions
  const addUserByAdmin = (userData: Omit<User, 'id'>): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
      return { success: false, message: "Unauthorized action." };
    }
    if (!userData.username.trim() || !userData.email.trim() || !userData.password?.trim() || !userData.role || !userData.firstName.trim() || !userData.lastName.trim()) {
      return { success: false, message: "All fields (username, email, password, first name, last name, role) are required." };
    }
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      return { success: false, message: 'Invalid email format.' };
    }
    const existingUser = registeredUsers.find(
      u => u.username.toLowerCase() === userData.username.toLowerCase() || u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingUser) {
      return { success: false, message: "Username or email already exists." };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      gender: userData.gender,
      ageRange: userData.ageRange,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      courses: [],
      quizAttempts: []
    };
    setRegisteredUsers(prev => [...prev, newUser]);
    return { success: true, message: `${newUser.role} "${newUser.firstName} ${newUser.lastName}" (${newUser.username}) created successfully.` };
  };

  const updateUserRole = (targetUserId: string, newRole: UserRole): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
      return { success: false, message: "Unauthorized action." };
    }
    if (targetUserId === currentUser.id) {
      return { success: false, message: "Admins cannot change their own role." };
    }
    const userIndex = registeredUsers.findIndex(u => u.id === targetUserId);
    if (userIndex === -1) {
      return { success: false, message: "User not found." };
    }
    if (registeredUsers[userIndex].role === USER_ROLES.ADMIN) {
        return { success: false, message: "Cannot change the role of an Admin account." };
    }
    if (newRole === USER_ROLES.ADMIN) {
        return { success: false, message: `Cannot promote a user to Admin. Only ${USER_ROLES.STUDENT} or ${USER_ROLES.INSTRUCTOR} are allowed.`};
    }

    setRegisteredUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
    return { success: true, message: `User role updated to ${newRole}.` };
  };

  const deleteUserByAdmin = (targetUserId: string): { success: boolean; message: string } => {
    if (!currentUser || currentUser.role !== USER_ROLES.ADMIN) {
      return { success: false, message: "Unauthorized action." };
    }
    if (targetUserId === currentUser.id) {
      return { success: false, message: "Admins cannot delete their own account." };
    }
    const targetUser = registeredUsers.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: "User not found." };
    }
    if (targetUser.role === USER_ROLES.ADMIN) {
      return { success: false, message: "Cannot delete an Admin account." };
    }

    setRegisteredUsers(prev => prev.filter(u => u.id !== targetUserId));
    // Clean up associated data
    setLessonProgress(prev => prev.filter(lp => lp.userId !== targetUserId));
    setQuizAttempts(prev => prev.filter(qa => qa.userId !== targetUserId));
    return { success: true, message: `User "${targetUser.username}" and their data deleted successfully.` };
  };


  // Student Progress
  const markLessonAsComplete = (lessonId: string) => {
    if (!currentUser) return;
    const existingProgress = lessonProgress.find(lp => lp.lessonId === lessonId && lp.userId === currentUser.id);
    if (!existingProgress) {
      setLessonProgress(prev => [...prev, {
        lessonId,
        userId: currentUser!.id,
        completedAt: new Date().toISOString()
      }]);
    }
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!currentUser) return false;
    return lessonProgress.some(lp => lp.lessonId === lessonId && lp.userId === currentUser.id);
  };

  const getModuleProgress = (moduleId: string, userId: string): { completed: number; total: number; percentage: number } => {
    const module = courses.flatMap(c => c.modules).find(m => m.id === moduleId);
    if (!module || !currentUser || currentUser.id !== userId) return { completed: 0, total: 0, percentage: 0 };

    const totalLessons = module.lessons.length;
    if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

    const completedLessons = module.lessons.filter(l => isLessonCompleted(l.id)).length;
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  };

  const getCourseProgress = (courseId: string, userId: string): { completed: number; total: number; percentage: number } => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !currentUser || currentUser.id !== userId) return { completed: 0, total: 0, percentage: 0 };

    const allLessonsInCourse = course.modules.flatMap(m => m.lessons);
    const totalLessons = allLessonsInCourse.length;
    if (totalLessons === 0) return { completed: 0, total: 0, percentage: 0 };

    const completedLessons = allLessonsInCourse.filter(l => isLessonCompleted(l.id)).length;
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    };
  };

  const enrollInCourse = async (courseId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const updatedUser = {
        ...currentUser,
        enrolledCourses: [...(currentUser.enrolledCourses || []), courseId]
      };
      
      setCurrentUser(updatedUser);
      
      // Update the user in registeredUsers
      const updatedUsers = registeredUsers.map(user => 
        user.id === currentUser.id ? updatedUser : user
      );
      setRegisteredUsers(updatedUsers);
      
      return true;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }
  };


  const contextValue: AppContextType = {
    courses, addCourse, updateCourse, deleteCourse,
    addModule, updateModule, deleteModule,
    addLesson, updateLesson, deleteLesson,
    addQuizToModule, updateQuizInModule, deleteQuizFromModule,
    addQuestionToQuiz, updateQuestionInQuiz, deleteQuestionFromQuiz,
    quizAttempts, addQuizAttempt, getQuizAttemptsForUser, getQuizById,
    currentUser, registeredUsers, login, register, logout, canEdit,
    addUserByAdmin, updateUserRole, deleteUserByAdmin, // Added Admin functions
    lessonProgress, markLessonAsComplete, isLessonCompleted,
    getModuleProgress, getCourseProgress, enrollInCourse
  };

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/" element={currentUser ? <CoursesPage /> : <Navigate to="/login" />} />
              <Route path="/courses" element={currentUser ? <CoursesPage /> : <Navigate to="/login" />} />
              <Route path="/my-learning" element={currentUser ? <MyLearningPage /> : <Navigate to="/login" />} />
              <Route path="/upload" element={currentUser ? <FileUploadPage /> : <Navigate to="/login" />} />
              <Route path="/settings" element={currentUser ? <SettingsPage /> : <Navigate to="/login" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/course/:courseId" element={currentUser ? <CoursePage /> : <Navigate to="/login" />} />
              <Route
                path="/admin-dashboard"
                element={
                  currentUser && currentUser.role === USER_ROLES.ADMIN ? (
                    <AdminDashboardPage />
                  ) : currentUser ? (
                    <Navigate to="/" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/admin-lab"
                element={
                  currentUser && currentUser.role === USER_ROLES.ADMIN ? (
                    <AdminLabPage />
                  ) : currentUser ? (
                    <Navigate to="/" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
