import React, { useContext } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import { AppContext, AppContextType } from '../App';

const CoursesPage: React.FC = () => {
  const { courses, currentUser, canEdit } = useContext(AppContext) as AppContextType;
  const userCanEdit = canEdit(currentUser);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">All Courses</h1>
        <p className="text-lg text-neutral-600">Browse and enroll in our available courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-xl text-neutral-dark">No courses available yet.</p>
          {userCanEdit && <p className="text-neutral-dark mt-2">Why not create one?</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              showEnrollButton={!userCanEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
