import React, { useContext } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import { AppContext, AppContextType } from '../App';

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
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-xl text-neutral-dark">You haven't enrolled in any courses yet.</p>
          <p className="text-neutral-600 mt-2">Browse our courses to get started!</p>
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
