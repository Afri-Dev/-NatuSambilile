
import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { generateCourseDescription } from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';
import { SparklesIcon } from '../../constants';

interface CourseFormProps {
  onSubmit: (course: Course) => void;
  initialData?: Course | null;
  onClose: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setImageUrl(initialData.imageUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
    }
    setImageError(false); // Reset image error state when initialData changes
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
      description,
      imageUrl,
      modules: initialData?.modules || [],
    });
    onClose(); 
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      alert("Please enter a course title first to generate a description.");
      return;
    }
    setIsLoadingAi(true);
    const aiDescription = await generateCourseDescription(title);
    if (aiDescription) {
      if (aiDescription === "AI features disabled. API Key not configured.") {
        alert("AI features disabled: API Key is not configured. Please contact an administrator.");
      } else if (aiDescription === "Failed to generate description. Please try again.") {
        alert("Failed to generate description using AI. Please try again or enter manually.");
      } else {
        setDescription(aiDescription);
      }
    } else {
        alert("AI description generation returned no content.");
    }
    setIsLoadingAi(false);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImageError(false); // Reset error when URL changes
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="courseTitle" className="block text-sm font-medium text-neutral-dark mb-1">
          Course Title
        </label>
        <input
          type="text"
          id="courseTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="e.g., Introduction to Web Development"
          required
        />
      </div>

      <div>
        <label htmlFor="courseDescription" className="block text-sm font-medium text-neutral-dark mb-1">
          Description
        </label>
        <div className="relative">
          <textarea
            id="courseDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
            placeholder="A brief summary of the course"
          />
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isLoadingAi || !title.trim()}
            className="absolute top-2 right-2 bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 disabled:opacity-50 transition-colors"
          >
            {isLoadingAi ? <LoadingSpinner size="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
            <span>AI Generate</span>
          </button>
        </div>
      </div>
      
      <div>
        <label htmlFor="courseImageUrl" className="block text-sm font-medium text-neutral-dark mb-1">
          Image URL (Optional)
        </label>
        <input
          type="url"
          id="courseImageUrl"
          value={imageUrl}
          onChange={handleImageUrlChange}
          className="w-full p-3 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="https://example.com/image.jpg"
        />
        {imageUrl && !imageError && (
          <div className="mt-3 rounded-md overflow-hidden border border-neutral-medium shadow-sm" style={{ maxWidth: '300px' }}>
            <img 
              src={imageUrl} 
              alt="Course preview" 
              className="w-full h-auto object-cover"
              onError={() => setImageError(true)} 
            />
          </div>
        )}
        {imageUrl && imageError && (
            <p className="mt-2 text-sm text-error">Could not load image preview. Please check the URL.</p>
        )}
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
          {initialData ? 'Save Changes' : 'Create Course'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
