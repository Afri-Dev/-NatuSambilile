import React, { useContext, useState } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import Modal from '../components/common/Modal';
import CourseForm from '../components/forms/CourseForm';
import { AppContext, AppContextType } from '../App';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  GraduationCap, 
  Lightbulb,
  ArrowRight,
  Play
} from 'lucide-react';

const CoursesPage: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, currentUser, canEdit } = useContext(AppContext) as AppContextType;
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCreateAnother, setShowCreateAnother] = useState(false);
  
  const userCanEdit = canEdit(currentUser);

  const handleOpenCreateCourseModal = () => {
    if (!userCanEdit) return;
    setEditingCourse(null);
    setIsCourseModalOpen(true);
    setShowCreateAnother(false);
  };
  
  const handleOpenEditCourseModal = (course: Course) => {
    if (!userCanEdit) return;
    setEditingCourse(course);
    setIsCourseModalOpen(true);
    setShowCreateAnother(false);
  };

  const handleCourseSubmit = (courseData: Course) => {
    if (!userCanEdit) return;
    if (editingCourse) {
      updateCourse(courseData);
      alert('Course updated successfully!');
      setIsCourseModalOpen(false);
      setEditingCourse(null);
    } else {
      addCourse(courseData);
      setIsCourseModalOpen(false);
      setShowCreateAnother(true);
      // Auto-hide the create another option after 5 seconds
      setTimeout(() => setShowCreateAnother(false), 5000);
    }
  };
  
  const handleDeleteCourse = (courseId: string) => {
    if (!userCanEdit) return;
    if (window.confirm("Are you sure you want to delete this course and all its content?")) {
      deleteCourse(courseId);
      alert('Course deleted successfully!');
    }
  };

  const handleCreateAnother = () => {
    setShowCreateAnother(false);
    handleOpenCreateCourseModal();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-dark mb-2">All Courses</h1>
            <p className="text-lg text-neutral-600">Browse and enroll in our available courses</p>
          </div>
          {userCanEdit && courses.length > 0 && (
            <button
              onClick={handleOpenCreateCourseModal}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Course</span>
            </button>
          )}
        </div>

        {/* Success Message for Create Another */}
        {showCreateAnother && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Course Created Successfully! 🎉</h3>
                  <p className="text-gray-600">Your course is now live and ready for learners.</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateAnother}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Another</span>
                </button>
                <button
                  onClick={() => setShowCreateAnother(false)}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg border border-blue-100">
          {/* Animated Background Elements */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div className="relative flex items-center justify-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 delay-100">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 delay-200">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
              <h2 className="text-3xl font-bold text-gray-800">Ready to Start Learning?</h2>
              <Sparkles className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {userCanEdit 
                ? "Create your first course and start sharing knowledge with learners worldwide!"
                : "Our amazing courses are being prepared just for you. Check back soon!"
              }
            </p>

            {userCanEdit ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleOpenCreateCourseModal}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create Your First Course</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group px-8 py-4 border-2 border-blue-500 text-blue-600 rounded-2xl font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center space-x-3">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Learn More</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-800">Coming Soon!</h3>
                    <p className="text-sm text-gray-600">Exciting courses are in development</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2">Preparing amazing content for you</span>
                </div>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full opacity-30 animate-ping"></div>
          <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-green-300 to-blue-400 rounded-full opacity-30 animate-bounce"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEdit={handleOpenEditCourseModal}
              onDelete={handleDeleteCourse}
              showEnrollButton={!userCanEdit}
            />
          ))}
        </div>
      )}

      {/* Course Creation/Edit Modal */}
      {userCanEdit && isCourseModalOpen && (
        <Modal
          isOpen={isCourseModalOpen}
          onClose={() => {
            setIsCourseModalOpen(false);
            setEditingCourse(null);
          }}
          title={editingCourse ? "Edit Course" : "Create New Course"}
        >
          <CourseForm 
            onSubmit={handleCourseSubmit} 
            initialData={editingCourse} 
            onClose={() => {
              setIsCourseModalOpen(false);
              setEditingCourse(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default CoursesPage;
