
import React, { useState, useEffect } from 'react';
import { Lesson } from '../../types';
import { generateLessonContent } from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';
import { SparklesIcon } from '../../constants';

interface LessonFormProps {
  onSubmit: (lesson: Lesson) => void;
  initialData?: Lesson | null;
  onClose: () => void;
  courseTitle?: string; 
  moduleTitle?: string; 
}

const LessonForm: React.FC<LessonFormProps> = ({ onSubmit, initialData, onClose, courseTitle, moduleTitle }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setTitle('');
      setContent('');
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
      content,
    });
    onClose();
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) {
      alert("Please enter a lesson title first to generate content.");
      return;
    }
    if (!courseTitle || !moduleTitle) {
        alert("Course and Module context is needed for AI generation.");
        return;
    }
    setIsLoadingAi(true);
    const aiContent = await generateLessonContent(courseTitle, moduleTitle, title);
    if (aiContent) {
      if (aiContent === "AI features disabled. API Key not configured.") {
        alert("AI features disabled: API Key is not configured. Please contact an administrator.");
      } else if (aiContent === "Failed to generate lesson content. Please try again.") {
        alert("Failed to generate lesson content using AI. Please try again or enter manually.");
      } else {
        setContent(aiContent);
      }
    } else {
        alert("AI content generation returned no content.");
    }
    setIsLoadingAi(false);
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="lessonTitle" className="block text-sm font-medium text-neutral-dark mb-1">
          Lesson Title
        </label>
        <input
          type="text"
          id="lessonTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="e.g., Understanding HTML Basics"
          required
        />
      </div>

      <div>
        <label htmlFor="lessonContent" className="block text-sm font-medium text-neutral-dark mb-1">
          Content
        </label>
        <div className="relative">
          <textarea
            id="lessonContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
            placeholder="Detailed lesson content..."
          />
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={isLoadingAi || !title.trim()}
            className="absolute top-2 right-2 bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-50 transition-colors"
          >
            {isLoadingAi ? <LoadingSpinner size="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
            <span>AI Generate</span>
          </button>
        </div>
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
          {initialData ? 'Save Changes' : 'Add Lesson'}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;