import React from 'react';

interface ContentOverviewProps {
  totalModules: number;
  totalLessons: number;
  totalQuizzes: number;
  totalUsers: number;
}

export const ContentOverview: React.FC<ContentOverviewProps> = ({
  totalModules,
  totalLessons,
  totalQuizzes,
  totalUsers,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
    <h2 className="text-2xl font-semibold text-primary-dark mb-6">Content Overview</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-3xl font-bold text-accent-dark">{totalModules}</p>
        <p className="text-neutral-dark mt-1">Modules</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-3xl font-bold text-accent-dark">{totalLessons}</p>
        <p className="text-neutral-dark mt-1">Lessons</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-3xl font-bold text-accent-dark">{totalQuizzes}</p>
        <p className="text-neutral-dark mt-1">Quizzes</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-3xl font-bold text-accent-dark">{totalUsers}</p>
        <p className="text-neutral-dark mt-1">Users</p>
      </div>
    </div>
  </div>
);

export default ContentOverview;
