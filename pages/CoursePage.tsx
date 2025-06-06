
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course, Module, Lesson, Quiz, Question, StudentAnswer, QuizAttempt } from '../types';
import { AppContext, AppContextType } from '../App';
import Modal from '../components/common/Modal';
import ModuleForm from '../components/forms/ModuleForm';
import LessonForm from '../components/forms/LessonForm';
import QuizForm from '../components/forms/QuizForm';
import QuestionForm from '../components/forms/QuestionForm';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, DEFAULT_COURSE_IMAGE, CheckCircleIcon, ListBulletIcon } from '../constants';
import ChatButton from '../components/dashboard/ChatButton';
import Chatbot from '../components/dashboard/Chatbot';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { generateModuleSuggestions } from '../services/geminiService';

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { 
    courses, 
    addModule, updateModule, deleteModule, 
    addLesson, updateLesson, deleteLesson,
    addQuizToModule, updateQuizInModule, deleteQuizFromModule,
    addQuestionToQuiz, updateQuestionInQuiz, deleteQuestionFromQuiz,
    addQuizAttempt, getQuizAttemptsForUser,
    currentUser, canEdit,
    markLessonAsComplete, isLessonCompleted, getModuleProgress, getCourseProgress, lessonProgress 
  } = useContext(AppContext) as AppContextType;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [parentModuleForLesson, setParentModuleForLesson] = useState<Module | null>(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [parentModuleForQuiz, setParentModuleForQuiz] = useState<Module | null>(null);
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [parentQuizForQuestion, setParentQuizForQuestion] = useState<Quiz | null>(null);
  
  const [isManageQuestionsModalOpen, setIsManageQuestionsModalOpen] = useState(false);
  const [managingQuestionsForQuiz, setManagingQuestionsForQuiz] = useState<Quiz | null>(null);

  const [isQuizTakingModalOpen, setIsQuizTakingModalOpen] = useState(false);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<StudentAnswer[]>([]);
  

  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);
  
  const courseContent = React.useMemo(() => {
    if (!course) return '';
    
    // Create a string representation of the course content for the chatbot
    const modulesContent = course.modules.map(module => {
      const lessonsContent = module.lessons
        .map(lesson => `- ${lesson.title}: ${lesson.content.substring(0, 200)}...`)
        .join('\n');
      
      const quizzesContent = module.quizzes
        .map(quiz => `- Quiz: ${quiz.title} (${quiz.questions?.length || 0} questions)`)
        .join('\n');
      
      return `## ${module.title}\n` +
             `### Lessons\n${lessonsContent}\n` +
             (quizzesContent ? `### Quizzes\n${quizzesContent}\n` : '');
    }).join('\n\n');
    
    return `# ${course.title}\n\n` +
           `${course.description}\n\n` +
           `## Course Content\n${modulesContent}`;
  }, [course]);

  const [isQuizResultsModalOpen, setIsQuizResultsModalOpen] = useState(false);
  const [latestQuizAttempt, setLatestQuizAttempt] = useState<QuizAttempt | null>(null);


  const [isLoadingAiModules, setIsLoadingAiModules] = useState(false);
  const [aiModuleSuggestions, setAiModuleSuggestions] = useState<string[]>([]);

  const userCanEdit = canEdit(currentUser);
  const [currentCourseProgress, setCurrentCourseProgress] = useState({ percentage: 0, completed: 0, total: 0 });

  useEffect(() => {
    const currentCourse = courses.find(c => c.id === courseId);
    if (currentCourse) {
      setCourse(currentCourse);
      if (currentCourse.modules.length > 0) {
        const firstModuleId = currentCourse.modules[0].id;
        setExpandedModules(prev => new Set(prev).add(firstModuleId));
      }
      if (currentUser && !userCanEdit && courseId) {
         setCurrentCourseProgress(getCourseProgress(courseId, currentUser.id));
      }
    }
  }, [courseId, courses, currentUser, userCanEdit, getCourseProgress, lessonProgress]);


  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => { const newSet = new Set(prev); newSet.has(moduleId) ? newSet.delete(moduleId) : newSet.add(moduleId); return newSet; });
  };
  const toggleLessonExpansion = (lessonId: string) => {
    setExpandedLessons(prev => { const newSet = new Set(prev); newSet.has(lessonId) ? newSet.delete(lessonId) : newSet.add(lessonId); return newSet; });
  };

  const handleOpenCreateModuleModal = () => { if (!userCanEdit) return; setEditingModule(null); setAiModuleSuggestions([]); setIsModuleModalOpen(true); };
  const handleOpenEditModuleModal = (module: Module) => { if (!userCanEdit) return; setEditingModule(module); setIsModuleModalOpen(true); };
  const handleModuleSubmit = (moduleData: Module) => { 
    if (!courseId || !userCanEdit) return; 
    if (editingModule) {
        updateModule(courseId, moduleData);
        alert('Module updated successfully!');
    } else {
        addModule(courseId, {...moduleData, quizzes: []});
        alert('Module added successfully!');
    }
    setIsModuleModalOpen(false); 
    setEditingModule(null); 
  };
  const handleDeleteModule = (moduleId: string) => { 
    if (!courseId || !userCanEdit) return; 
    if (window.confirm("Delete this module and ALL its content (lessons, quizzes)?")) {
        deleteModule(courseId, moduleId); 
        alert('Module deleted successfully!');
    }
  };

  const handleOpenCreateLessonModal = (module: Module) => { if (!userCanEdit) return; setEditingLesson(null); setParentModuleForLesson(module); setIsLessonModalOpen(true); };
  const handleOpenEditLessonModal = (module: Module, lesson: Lesson) => { if (!userCanEdit) return; setEditingLesson(lesson); setParentModuleForLesson(module); setIsLessonModalOpen(true); };
  const handleLessonSubmit = (lessonData: Lesson) => { 
    if (!courseId || !parentModuleForLesson || !userCanEdit) return; 
    if (editingLesson) {
        updateLesson(courseId, parentModuleForLesson.id, lessonData);
        alert('Lesson updated successfully!');
    } else {
        addLesson(courseId, parentModuleForLesson.id, lessonData);
        alert('Lesson added successfully!');
    }
    setIsLessonModalOpen(false); 
    setEditingLesson(null); 
    setParentModuleForLesson(null); 
  };
  const handleDeleteLesson = (moduleId: string, lessonId: string) => { 
    if (!courseId || !userCanEdit) return; 
    if (window.confirm("Delete this lesson?")) {
        deleteLesson(courseId, moduleId, lessonId); 
        alert('Lesson deleted successfully!');
    }
  };
  
  const handleMarkLessonComplete = (lessonId: string) => {
    if (!currentUser || userCanEdit) return;
    markLessonAsComplete(lessonId);
    alert('Lesson marked as complete!');
  };

  const handleGenerateAiModuleSuggestions = async () => { 
      if (!course || !userCanEdit) return; 
      setIsLoadingAiModules(true); 
      setAiModuleSuggestions([]); 
      const suggestions = await generateModuleSuggestions(course.title, course.description); 
      if (suggestions) {
        if (suggestions.length === 1 && (suggestions[0].startsWith("AI features disabled") || suggestions[0].startsWith("Failed to generate") || suggestions[0].startsWith("Could not parse") || suggestions[0].startsWith("Error parsing"))) {
            alert(suggestions[0]);
        } else {
            setAiModuleSuggestions(suggestions);
        }
      } else {
        alert('Failed to get AI module suggestions.');
      }
      setIsLoadingAiModules(false); 
  };
  const handleAddSuggestedModule = (title: string) => { 
    if (!courseId || !userCanEdit) return; 
    addModule(courseId, { id: crypto.randomUUID(), title, lessons: [], quizzes: [] }); 
    setAiModuleSuggestions(prev => prev.filter(s => s !== title)); 
    alert(`Module "${title}" added from AI suggestion!`);
  };

  const handleOpenCreateQuizModal = (module: Module) => { if (!userCanEdit) return; setEditingQuiz(null); setParentModuleForQuiz(module); setIsQuizModalOpen(true); };
  const handleOpenEditQuizModal = (quiz: Quiz, module: Module) => { if (!userCanEdit) return; setEditingQuiz(quiz); setParentModuleForQuiz(module); setIsQuizModalOpen(true); };
  const handleQuizSubmit = (quizData: Pick<Quiz, 'title' | 'description'>) => {
    if (!courseId || !parentModuleForQuiz || !userCanEdit) return;
    if (editingQuiz) {
      updateQuizInModule(courseId, parentModuleForQuiz.id, { ...editingQuiz, ...quizData });
      alert('Quiz updated successfully!');
    } else {
      addQuizToModule(courseId, parentModuleForQuiz.id, quizData);
      alert('Quiz added successfully!');
    }
    setIsQuizModalOpen(false); setEditingQuiz(null); setParentModuleForQuiz(null);
  };
  const handleDeleteQuiz = (quizId: string, moduleId: string) => { 
    if (!courseId || !userCanEdit) return; 
    if (window.confirm("Delete this quiz and ALL its questions and attempts?")) {
        deleteQuizFromModule(courseId, moduleId, quizId); 
        alert('Quiz deleted successfully!');
    }
  };

  const handleOpenManageQuestionsModal = (quiz: Quiz) => { if (!userCanEdit) return; setManagingQuestionsForQuiz(quiz); setIsManageQuestionsModalOpen(true); };
  const handleOpenCreateQuestionModal = (quiz: Quiz) => { if (!userCanEdit) return; setEditingQuestion(null); setParentQuizForQuestion(quiz); setIsQuestionModalOpen(true);};
  const handleOpenEditQuestionModal = (question: Question, quiz: Quiz) => { if (!userCanEdit) return; setEditingQuestion(question); setParentQuizForQuestion(quiz); setIsQuestionModalOpen(true);};
  const handleQuestionSubmit = (questionData: Omit<Question, 'id' | 'quizId'>) => {
    if (!courseId || !parentQuizForQuestion || !parentQuizForQuestion.moduleId || !userCanEdit) return;
    const { moduleId, id: quizId } = parentQuizForQuestion;
    if (editingQuestion) {
      updateQuestionInQuiz(courseId, moduleId, quizId, { ...editingQuestion, ...questionData, quizId });
      alert('Question updated successfully!');
    } else {
      addQuestionToQuiz(courseId, moduleId, quizId, questionData);
      alert('Question added successfully!');
    }
    if (managingQuestionsForQuiz) {
        const updatedCourse = courses.find(c => c.id === courseId); 
        const updatedModule = updatedCourse?.modules.find(m => m.id === moduleId);
        const updatedQuiz = updatedModule?.quizzes.find(q => q.id === quizId);
        if (updatedQuiz) setManagingQuestionsForQuiz(updatedQuiz);
    }
    setIsQuestionModalOpen(false); setEditingQuestion(null); setParentQuizForQuestion(null);
  };
  const handleDeleteQuestion = (questionId: string, quiz: Quiz) => {
    if (!courseId || !quiz.moduleId || !userCanEdit) return;
    if (window.confirm("Delete this question?")) {
        deleteQuestionFromQuiz(courseId, quiz.moduleId, quiz.id, questionId);
        alert('Question deleted successfully!');
        const updatedCourse = courses.find(c => c.id === courseId);
        const updatedModule = updatedCourse?.modules.find(m => m.id === quiz.moduleId);
        const updatedQuiz = updatedModule?.quizzes.find(q => q.id === quiz.id);
        if (updatedQuiz) setManagingQuestionsForQuiz(updatedQuiz);
    }
  };
  
  const handleStartQuiz = useCallback((quiz: Quiz) => {
    setTakingQuiz(quiz);
    setIsQuizTakingModalOpen(true);
    setIsChatOpen(false); // Close chat when starting a quiz
  }, []);

  const handleTakeQuiz = (quiz: Quiz) => {
    if (!currentUser) return;
    handleStartQuiz(quiz);
    const initialAnswers: StudentAnswer[] = quiz.questions.map(q => ({ questionId: q.id, selectedOptionId: null }));
    setCurrentQuizAnswers(initialAnswers);
  };

  const handleQuizAnswerChange = (questionId: string, selectedOptionId: string) => {
    setCurrentQuizAnswers(prevAnswers => 
        prevAnswers.map(ans => ans.questionId === questionId ? { ...ans, selectedOptionId } : ans)
    );
  };

  const handleSubmitQuizAttempt = () => {
    if (!takingQuiz || !currentUser || !courseId) return;
    let score = 0;
    let maxScore = 0;
    takingQuiz.questions.forEach(question => {
        maxScore += question.points;
        const studentAnswer = currentQuizAnswers.find(sa => sa.questionId === question.id);
        if (studentAnswer && studentAnswer.selectedOptionId === question.correctAnswerId) {
            score += question.points;
        }
    });
    const attempt: QuizAttempt = {
        id: crypto.randomUUID(),
        quizId: takingQuiz.id,
        userId: currentUser.id,
        answers: currentQuizAnswers,
        score,
        maxScore,
        submittedAt: new Date().toISOString(),
    };
    addQuizAttempt(attempt);
    setLatestQuizAttempt(attempt);
    setIsQuizTakingModalOpen(false);
    setTakingQuiz(null);
    setIsQuizResultsModalOpen(true); 
  };

  if (!course) return <div className="container mx-auto p-8 text-center"><LoadingSpinner /> <p className="mt-2 text-neutral-dark">Loading course...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="container mx-auto px-4 py-8">
      <Link to="/" className="text-primary hover:text-primary-dark mb-6 inline-block transition-colors">&larr; Back to Courses</Link>
      
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 mb-8">
        <img src={course.imageUrl || DEFAULT_COURSE_IMAGE} alt={course.title} className="w-full h-64 object-cover rounded-md mb-6" />
        <h1 className="text-4xl font-bold text-primary-dark mb-3">{course.title}</h1>
        <p className="text-neutral-dark text-lg leading-relaxed mb-4">{course.description}</p>
        
        {currentUser && !userCanEdit && currentCourseProgress.total > 0 && (
          <div>
            <div className="flex justify-between text-sm text-neutral-dark mb-1">
              <span className="font-medium">Overall Course Progress</span>
              <span className="font-semibold">{currentCourseProgress.percentage}% ({currentCourseProgress.completed}/{currentCourseProgress.total} lessons)</span>
            </div>
            <div className="w-full bg-neutral rounded-full h-3.5">
              <div 
                className="bg-secondary h-3.5 rounded-full transition-all duration-500" 
                style={{ width: `${currentCourseProgress.percentage}%` }}
                role="progressbar"
                aria-valuenow={currentCourseProgress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Overall course progress ${currentCourseProgress.percentage}%`}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold text-neutral-darker">Modules</h2>
            {userCanEdit && (
              <div className="flex space-x-2">
                  <button onClick={handleGenerateAiModuleSuggestions} disabled={isLoadingAiModules} className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-60"><SparklesIcon /><span>Suggest Modules</span></button>
                  <button onClick={handleOpenCreateModuleModal} className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 transition-colors"><PlusIcon /><span>Add Module</span></button>
              </div>
            )}
        </div>
        {userCanEdit && isLoadingAiModules && <div className="my-4 flex items-center"><LoadingSpinner /> <span className="ml-2 text-neutral-dark">Generating...</span></div>}
        {userCanEdit && aiModuleSuggestions.length > 0 && ( <div className="bg-accent-light/20 border border-accent-light p-4 rounded-md mb-6"><h4 className="font-semibold text-accent-dark mb-2">AI Suggested Modules:</h4><ul className="list-disc list-inside space-y-1">{aiModuleSuggestions.map((s, i) => (<li key={i} className="text-accent-dark flex justify-between items-center"><span>{s}</span><button onClick={() => handleAddSuggestedModule(s)} className="text-xs bg-accent-light hover:bg-accent text-accent-darker px-2 py-1 rounded">Add</button></li>))}</ul></div>)}

        {course.modules.length === 0 ? <p className="text-neutral-dark">No modules yet.</p> : (
          <div className="space-y-4">
            {course.modules.map((module) => {
              const moduleProgress = currentUser && !userCanEdit ? getModuleProgress(module.id, currentUser.id) : { completed: 0, total: 0, percentage: 0 };
              return (
              <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex justify-between items-center p-4 hover:bg-neutral-lightest transition-colors cursor-pointer" onClick={() => toggleModuleExpansion(module.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleModuleExpansion(module.id)} aria-expanded={expandedModules.has(module.id)}>
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{module.title}</h3>
                    {currentUser && !userCanEdit && moduleProgress.total > 0 && (
                        <p className="text-xs text-neutral-dark mt-1">
                            Progress: {moduleProgress.percentage}% ({moduleProgress.completed}/{moduleProgress.total} lessons)
                        </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {userCanEdit && (<><button onClick={(e) => { e.stopPropagation(); handleOpenEditModuleModal(module);}} className="text-neutral-dark hover:text-primary-dark transition-colors" title="Edit module"><EditIcon /></button><button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id);}} className="text-neutral-dark hover:text-error transition-colors" title="Delete module"><TrashIcon /></button></>)}
                    {expandedModules.has(module.id) ? <ChevronUpIcon className="text-neutral-dark" /> : <ChevronDownIcon className="text-neutral-dark" />}
                  </div>
                </div>
                {expandedModules.has(module.id) && (
                  <div className="p-4 border-t border-neutral space-y-4">
                    <div className="border border-neutral-light p-3 rounded-md bg-neutral-lightest">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold text-neutral-darker">Lessons</h4>
                            {userCanEdit && (<button onClick={() => handleOpenCreateLessonModal(module)} className="text-sm bg-primary hover:bg-primary-dark text-white py-1 px-3 rounded-md flex items-center space-x-1 transition-colors"><PlusIcon className="w-4 h-4" /><span>Add Lesson</span></button>)}
                        </div>
                        {module.lessons.length === 0 ? <p className="text-neutral-dark text-sm">No lessons yet.</p> : (
                            <ul className="space-y-2">{module.lessons.map(lesson => {
                                const completed = currentUser && !userCanEdit ? isLessonCompleted(lesson.id) : false;
                                return (
                                <li key={lesson.id} className={`border border-neutral rounded-md bg-white ${completed ? 'bg-success-light/30' : ''}`}>
                                    <div className="flex justify-between items-center p-3 hover:bg-neutral-lightest cursor-pointer" onClick={() => toggleLessonExpansion(lesson.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleLessonExpansion(lesson.id)} aria-expanded={expandedLessons.has(lesson.id)}>
                                        <div className="flex items-center">
                                            {completed && <CheckCircleIcon className="w-5 h-5 text-secondary mr-2 flex-shrink-0" />}
                                            <span className={`text-neutral-darker font-medium ${completed ? 'line-through text-neutral-dark' : ''}`}>{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {userCanEdit && (<><button onClick={(e) => { e.stopPropagation(); handleOpenEditLessonModal(module, lesson);}} className="text-xs text-neutral-dark hover:text-primary-dark"><EditIcon className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(module.id, lesson.id);}} className="text-xs text-neutral-dark hover:text-error"><TrashIcon className="w-4 h-4" /></button></>)}
                                            {expandedLessons.has(lesson.id) ? <ChevronUpIcon className="w-4 h-4 text-neutral-dark" /> : <ChevronDownIcon className="w-4 h-4 text-neutral-dark" />}
                                        </div>
                                    </div>
                                    {expandedLessons.has(lesson.id) && (
                                    <div className="p-3 border-t border-neutral bg-neutral-lightest">
                                        <p className="text-neutral-dark whitespace-pre-wrap text-sm mb-3">{lesson.content || "No content."}</p>
                                        {currentUser && !userCanEdit && !completed && (
                                            <button
                                                onClick={() => handleMarkLessonComplete(lesson.id)}
                                                className="bg-secondary hover:bg-secondary-dark text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center space-x-1 transition-colors"
                                            >
                                                <CheckCircleIcon className="w-4 h-4"/> <span>Mark as Complete</span>
                                            </button>
                                        )}
                                        {currentUser && !userCanEdit && completed && (
                                            <p className="text-sm text-secondary-dark font-medium flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1"/> Lesson Completed!</p>
                                        )}
                                    </div>)}
                                </li>);
                            })}
                            </ul>
                        )}
                    </div>
                    <div className="border border-neutral-light p-3 rounded-md bg-neutral-lightest">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-semibold text-neutral-darker">Quizzes</h4>
                            {userCanEdit && (<button onClick={() => handleOpenCreateQuizModal(module)} className="text-sm bg-primary hover:bg-primary-dark text-white py-1 px-3 rounded-md flex items-center space-x-1 transition-colors"><PlusIcon className="w-4 h-4" /><span>Add Quiz</span></button>)}
                        </div>
                        {(module.quizzes || []).length === 0 ? <p className="text-neutral-dark text-sm">No quizzes yet.</p> : (
                            <ul className="space-y-2">{(module.quizzes || []).map(quiz => {
                                const userAttempts = currentUser ? getQuizAttemptsForUser(quiz.id, currentUser.id) : [];
                                const lastAttempt = userAttempts.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
                                return (
                                <li key={quiz.id} className="bg-white border border-neutral rounded-md p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h5 className="font-semibold text-primary-dark">{quiz.title}</h5>
                                            <p className="text-xs text-neutral-dark">{quiz.questions.length} questions</p>
                                            {lastAttempt && !userCanEdit && (
                                                <p className="text-xs text-secondary-dark">Last Score: {lastAttempt.score}/{lastAttempt.maxScore}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {userCanEdit ? (
                                                <>
                                                <button onClick={() => handleOpenManageQuestionsModal(quiz)} className="text-xs text-neutral-dark hover:text-primary flex items-center transition-colors" title="Manage Questions"><ListBulletIcon className="w-4 h-4 mr-1"/> Manage</button>
                                                <button onClick={() => handleOpenEditQuizModal(quiz, module)} className="text-xs text-neutral-dark hover:text-primary-dark transition-colors" title="Edit Quiz"><EditIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteQuiz(quiz.id, module.id)} className="text-xs text-neutral-dark hover:text-error transition-colors" title="Delete Quiz"><TrashIcon className="w-4 h-4" /></button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleTakeQuiz(quiz)} className="bg-secondary hover:bg-secondary-dark text-white text-sm py-1.5 px-3 rounded-md transition-colors">Take Quiz</button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );})}</ul>
                        )}
                    </div>
                  </div>
                )}
              </div>
            );})}
          </div>
        )}
      </div>

      {userCanEdit && isModuleModalOpen && (<Modal isOpen={isModuleModalOpen} onClose={() => {setIsModuleModalOpen(false); setEditingModule(null);}} title={editingModule ? "Edit Module" : "Add New Module"}><ModuleForm onSubmit={handleModuleSubmit} initialData={editingModule} onClose={() => {setIsModuleModalOpen(false); setEditingModule(null);}} /></Modal>)}
      {userCanEdit && isLessonModalOpen && (<Modal isOpen={isLessonModalOpen} onClose={() => {setIsLessonModalOpen(false); setEditingLesson(null); setParentModuleForLesson(null);}} title={editingLesson ? "Edit Lesson" : "Add New Lesson"}><LessonForm onSubmit={handleLessonSubmit} initialData={editingLesson} onClose={() => {setIsLessonModalOpen(false); setEditingLesson(null); setParentModuleForLesson(null);}} courseTitle={course?.title} moduleTitle={parentModuleForLesson?.title} /></Modal>)}
      
      {userCanEdit && isQuizModalOpen && parentModuleForQuiz && (<Modal isOpen={isQuizModalOpen} onClose={() => {setIsQuizModalOpen(false); setEditingQuiz(null); setParentModuleForQuiz(null);}} title={editingQuiz ? "Edit Quiz" : `Add Quiz to ${parentModuleForQuiz.title}`}><QuizForm onSubmit={handleQuizSubmit} initialData={editingQuiz ? {title: editingQuiz.title, description: editingQuiz.description} : null} onClose={() => {setIsQuizModalOpen(false); setEditingQuiz(null); setParentModuleForQuiz(null);}} /></Modal>)}
      
      {userCanEdit && isManageQuestionsModalOpen && managingQuestionsForQuiz && (
        <Modal isOpen={isManageQuestionsModalOpen} onClose={() => setIsManageQuestionsModalOpen(false)} title={`Manage Questions for "${managingQuestionsForQuiz.title}"`}>
            <div className="space-y-3">
                <button onClick={() => handleOpenCreateQuestionModal(managingQuestionsForQuiz)} className="mb-4 bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 px-3 rounded-md flex items-center space-x-1 transition-colors">
                    <PlusIcon className="w-4 h-4"/> <span>Add New Question</span>
                </button>
                {managingQuestionsForQuiz.questions.length === 0 ? <p className="text-neutral-dark">No questions yet.</p> : (
                    <ul className="space-y-2">
                        {managingQuestionsForQuiz.questions.map(q => (
                            <li key={q.id} className="p-3 border border-neutral rounded-md flex justify-between items-start bg-neutral-lightest">
                                <div>
                                    <p className="font-medium text-neutral-darker">{q.text}</p>
                                    <p className="text-xs text-neutral-dark">{q.questionType} - {q.points} points</p>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0 ml-2">
                                    <button onClick={() => handleOpenEditQuestionModal(q, managingQuestionsForQuiz)} className="text-neutral-dark hover:text-primary-dark transition-colors"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteQuestion(q.id, managingQuestionsForQuiz)} className="text-neutral-dark hover:text-error transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
      )}
      {userCanEdit && isQuestionModalOpen && parentQuizForQuestion && (<Modal isOpen={isQuestionModalOpen} onClose={() => {setIsQuestionModalOpen(false); setEditingQuestion(null); setParentQuizForQuestion(null);}} title={editingQuestion ? "Edit Question" : `Add Question to "${parentQuizForQuestion.title}"`}><QuestionForm onSubmit={handleQuestionSubmit} initialData={editingQuestion} onClose={() => {setIsQuestionModalOpen(false); setEditingQuestion(null); setParentQuizForQuestion(null);}} /></Modal>)}
    
      {isQuizTakingModalOpen && takingQuiz && currentUser && (
        <Modal isOpen={isQuizTakingModalOpen} onClose={() => setIsQuizTakingModalOpen(false)} title={`Taking Quiz: ${takingQuiz.title}`}>
            <div className="space-y-6">
                {takingQuiz.questions.map((question, index) => (
                    <div key={question.id} className="p-4 border border-neutral rounded-md bg-neutral-lightest">
                        <p className="font-semibold mb-1 text-neutral-darker">Question {index + 1} <span className="text-xs text-neutral-dark">({question.points} points)</span></p>
                        <p className="mb-3 text-neutral-dark">{question.text}</p>
                        <div className="space-y-2">
                            {question.options.map(option => (
                                <label key={option.id} className="flex items-center space-x-2 p-2 border border-neutral rounded-md hover:bg-neutral-light cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={option.id}
                                        checked={currentQuizAnswers.find(a => a.questionId === question.id)?.selectedOptionId === option.id}
                                        onChange={() => handleQuizAnswerChange(question.id, option.id)}
                                        className="form-radio h-4 w-4 text-primary focus:ring-primary-light border-neutral-medium"
                                    />
                                    <span className="text-neutral-darker">{option.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <button 
                    onClick={handleSubmitQuizAttempt}
                    className="w-full bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                    Submit Quiz
                </button>
            </div>
        </Modal>
      )}

      {isQuizResultsModalOpen && latestQuizAttempt && (
        <Modal isOpen={isQuizResultsModalOpen} onClose={() => setIsQuizResultsModalOpen(false)} title="Quiz Results">
            <div className="text-center space-y-4">
                <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto" />
                <h3 className="text-2xl font-semibold text-neutral-darker">Quiz Completed!</h3>
                <p className="text-xl text-neutral-dark">Your Score: <span className="font-bold text-primary">{latestQuizAttempt.score}</span> / {latestQuizAttempt.maxScore}</p>
                <button 
                    onClick={() => setIsQuizResultsModalOpen(false)}
                    className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
      )}
      </div>
      
      {/* Chatbot Components - Hidden during quiz */}
      {!isQuizTakingModalOpen && (
        <>
          <ChatButton 
            onClick={toggleChat} 
            isOpen={isChatOpen} 
            disabled={isQuizTakingModalOpen}
          />
          <Chatbot 
            courseContent={courseContent} 
            isOpen={isChatOpen && !isQuizTakingModalOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </>
      )}
    </div>
  );
};

export default CoursePage;