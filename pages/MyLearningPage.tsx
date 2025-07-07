import React, { useContext } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import { AppContext, AppContextType } from '../App';
import { 
  BookOpen, 
  Target, 
  Sparkles, 
  GraduationCap, 
  Rocket,
  ArrowRight,
  Play,
  Heart,
  TrendingUp
} from 'lucide-react';

const MyLearningPage: React.FC = () => {
  const { courses, currentUser, getCourseProgress } = useContext(AppContext) as AppContextType;
  
  // Get courses the current user is enrolled in
  const enrolledCourses = courses.filter(course => 
    currentUser?.enrolledCourses?.includes(course.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">My Learning</h1>
        <p className="text-lg text-neutral-600">Continue your learning journey</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-100">
          {/* Animated Background Elements */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-20 animate-pulse"></div>
            </div>
            <div className="relative flex items-center justify-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 delay-100">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 delay-200">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-green-500 animate-spin" />
              <h2 className="text-3xl font-bold text-gray-800">Ready to Begin Your Journey?</h2>
              <Sparkles className="w-6 h-6 text-green-500 animate-spin" />
            </div>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Start your learning adventure by enrolling in our amazing courses!
            </p>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-green-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore Courses</h3>
                  <p className="text-sm text-gray-600">Browse our catalog of engaging courses</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Enroll & Learn</h3>
                  <p className="text-sm text-gray-600">Join courses that interest you</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Track Progress</h3>
                  <p className="text-sm text-gray-600">Monitor your learning achievements</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3">
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Browse Courses</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 border-2 border-green-500 text-green-600 rounded-2xl font-semibold hover:bg-green-500 hover:text-white transition-all duration-300 flex items-center space-x-3">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Take a Tour</span>
              </button>
            </div>

            {/* Motivational Message */}
            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Your Learning Journey Awaits!</h4>
                  <p className="text-sm text-gray-600">Every expert was once a beginner. Start today!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-30 animate-ping"></div>
          <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-30 animate-bounce"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => {
            const progress = getCourseProgress(course.id, currentUser?.id || '');
            return (
              <CourseCard 
                key={course.id} 
                course={{
                  ...course,
                  progress: progress.percentage
                }} 
                showProgress={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
