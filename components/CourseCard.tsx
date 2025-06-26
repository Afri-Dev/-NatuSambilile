
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { DEFAULT_COURSE_IMAGE, EditIcon, TrashIcon } from '../constants';
import { AppContext, AppContextType } from '../App';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  showEnrollButton?: boolean;
  showProgress?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEdit, 
  onDelete, 
  showEnrollButton = false, 
  showProgress = false 
}) => {
  const { currentUser, canEdit, getCourseProgress, lessonProgress, enrollInCourse } = useContext(AppContext) as AppContextType;
  const userCanEdit = canEdit && canEdit(currentUser);
  const [progress, setProgress] = useState({ percentage: course.progress || 0, completed: 0, total: 0 });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const isNew = course.createdAt ? new Date(course.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false; // Within last 7 days
  
  const showEnroll = showEnrollButton && currentUser && !userCanEdit && 
    !currentUser.enrolledCourses?.includes(course.id);
  const showProgressBar = (showProgress && progress.percentage > 0) || 
    (currentUser?.enrolledCourses?.includes(course.id) && progress.percentage > 0);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser || !enrollInCourse) return;
    
    setIsEnrolling(true);
    try {
      await enrollInCourse(course.id);
      // Progress will be updated via context
    } catch (error) {
      console.error('Failed to enroll in course:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    if (currentUser && !userCanEdit) { // Only calculate for students
      setProgress(getCourseProgress(course.id, currentUser.id));
    }
  }, [course.id, currentUser, userCanEdit, getCourseProgress, lessonProgress]); // Re-run if lessonProgress changes

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 flex flex-col transform hover:-translate-y-1 hover:scale-[1.02]">
      <div className="relative overflow-hidden">
        <img 
          src={course.imageUrl || DEFAULT_COURSE_IMAGE} 
          alt={course.title} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" 
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isNew && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            New
          </span>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
            <Link to={`/courses/${course.id}`} className="hover:underline">
              {course.title}
            </Link>
          </h3>
          {userCanEdit && onEdit && onDelete && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(course);
                }}
                className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
                title="Edit course"
                aria-label="Edit course"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(course.id);
                }}
                className="p-1.5 text-gray-500 hover:text-error hover:bg-red-50 rounded-full transition-colors"
                title="Delete course"
                aria-label="Delete course"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{course.description}</p>
        
        {showEnroll ? (
          <div className="mt-auto pt-4">
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </div>
        ) : showProgressBar ? (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span className="font-medium">Your Progress</span>
              <span className="font-semibold">{progress.percentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progress.percentage}%` }}
                role="progressbar"
                aria-valuenow={progress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progress.percentage}% of course completed`}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {progress.completed} of {progress.total} lessons
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4">
            <Link
              to={`/course/${course.id}`}
              className="block w-full text-center bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              aria-label={`${userCanEdit ? 'Manage' : 'View'} course: ${course.title}`}
            >
              {userCanEdit ? 'Manage Course' : 'View Course'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;