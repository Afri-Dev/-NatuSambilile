
import React, { useState, useEffect } from 'react';
import { Quiz } from '../../types';

interface QuizFormProps {
  onSubmit: (quizData: Pick<Quiz, 'title' | 'description'>) => void;
  initialData?: Pick<Quiz, 'title' | 'description'> | null;
  onClose: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Quiz title is required.");
      return;
    }
    onSubmit({ title, description });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="quizTitle" className="block text-sm font-medium text-neutral-dark mb-1">
          Quiz Title
        </label>
        <input
          type="text"
          id="quizTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="e.g., Chapter 1 Review"
          required
        />
      </div>
      <div>
        <label htmlFor="quizDescription" className="block text-sm font-medium text-neutral-dark mb-1">
          Description (Optional)
        </label>
        <textarea
          id="quizDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="A brief overview of the quiz"
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
          {initialData ? 'Save Changes' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
};

export default QuizForm;