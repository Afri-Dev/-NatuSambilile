
import React, { useState, useContext } from 'react';
import { Course } from '../types';
import CourseCard from '../components/CourseCard';
import Modal from '../components/common/Modal';
import CourseForm from '../components/forms/CourseForm';
import { AppContext, AppContextType } from '../App';
import { PlusIcon } from '../constants';

const HomePage: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, currentUser, canEdit } = useContext(AppContext) as AppContextType;
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const userCanEdit = canEdit(currentUser);

  const handleOpenCreateCourseModal = () => {
    if (!userCanEdit) return;
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };
  
  const handleOpenEditCourseModal = (course: Course) => {
    if (!userCanEdit) return;
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = (courseData: Course) => {
    if (!userCanEdit) return;
    if (editingCourse) {
      updateCourse(courseData);
      alert('Course updated successfully!');
    } else {
      addCourse(courseData);
      alert('Course created successfully!');
    }
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  };
  
  const handleDeleteCourse = (courseId: string) => {
    if (!userCanEdit) return;
    if (window.confirm("Are you sure you want to delete this course and all its content?")) {
      deleteCourse(courseId);
      alert('Course deleted successfully!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary-dark">Available Courses</h1>
        {userCanEdit && (
          <button
            onClick={handleOpenCreateCourseModal}
            className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 flex items-center space-x-2"
            aria-label="Create New Course"
          >
            <PlusIcon />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <img src="https://picsum.photos/seed/empty/400/300" alt="No courses available" className="mx-auto mb-6 rounded-lg shadow-md" />
            <p className="text-xl text-neutral-dark">No courses available yet.</p>
            {userCanEdit && <p className="text-neutral-dark mt-2">Why not create one?</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onEdit={handleOpenEditCourseModal} 
              onDelete={handleDeleteCourse} 
            />
          ))}
        </div>
      )}

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

export default HomePage;