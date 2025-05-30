
import React, { useState, useEffect } from 'react';
import { Module } from '../../types';

interface ModuleFormProps {
  onSubmit: (module: Module) => void;
  initialData?: Module | null;
  onClose: () => void;
}

const ModuleForm: React.FC<ModuleFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
    } else {
      setTitle('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      title,
      lessons: initialData?.lessons || [],
      quizzes: initialData?.quizzes || [], 
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="moduleTitle" className="block text-sm font-medium text-neutral-dark mb-1">
          Module Title
        </label>
        <input
          type="text"
          id="moduleTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="e.g., Getting Started"
          required
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light hover:bg-neutral rounded-md border border-neutral-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm transition-colors"
        >
          {initialData ? 'Save Changes' : 'Add Module'}
        </button>
      </div>
    </form>
  );
};

export default ModuleForm;