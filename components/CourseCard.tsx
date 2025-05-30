
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { DEFAULT_COURSE_IMAGE, EditIcon, TrashIcon } from '../constants';
import { AppContext, AppContextType } from '../App';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  const { currentUser, canEdit, getCourseProgress, lessonProgress } = useContext(AppContext) as AppContextType;
  const userCanEdit = canEdit(currentUser);
  const [progress, setProgress] = useState({ percentage: 0, completed: 0, total: 0 });

  useEffect(() => {
    if (currentUser && !userCanEdit) { // Only calculate for students
      setProgress(getCourseProgress(course.id, currentUser.id));
    }
  }, [course.id, currentUser, userCanEdit, getCourseProgress, lessonProgress]); // Re-run if lessonProgress changes

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all flex flex-col">
      <img 
        src={course.imageUrl || DEFAULT_COURSE_IMAGE} 
        alt={course.title} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-semibold text-primary-dark mb-2">{course.title}</h3>
        <p className="text-neutral-dark text-sm mb-4 flex-grow line-clamp-3">{course.description}</p>
        
        {currentUser && !userCanEdit && progress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-neutral-dark mb-1">
              <span>Progress</span>
              <span>{progress.percentage}% ({progress.completed}/{progress.total} lessons)</span>
            </div>
            <div className="w-full bg-neutral rounded-full h-2.5">
              <div 
                className="bg-secondary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress.percentage}%` }}
                role="progressbar"
                aria-valuenow={progress.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Course progress ${progress.percentage}%`}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-auto">
          <Link
            to={`/course/${course.id}`}
            className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors"
          >
            {userCanEdit ? 'Manage Course' : 'View Course'}
          </Link>
          {userCanEdit && (
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => onEdit(course)}
                className="p-2 text-neutral-dark hover:text-primary transition-colors"
                title="Edit course"
                aria-label="Edit course"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => onDelete(course.id)}
                className="p-2 text-neutral-dark hover:text-error transition-colors"
                title="Delete course"
                aria-label="Delete course"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;