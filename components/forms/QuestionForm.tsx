
import React, { useState, useEffect } from 'react';
import { Question, AnswerOption, QuestionType } from '../../types';
import { PlusIcon, TrashIcon } from '../../constants';

interface QuestionFormProps {
  onSubmit: (questionData: Omit<Question, 'id' | 'quizId'>) => void;
  initialData?: Omit<Question, 'id' | 'quizId'> | null;
  onClose: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [options, setOptions] = useState<AnswerOption[]>([{ id: crypto.randomUUID(), text: '' }]);
  const [correctAnswerId, setCorrectAnswerId] = useState<string>('');
  const [points, setPoints] = useState<number>(1);

  useEffect(() => {
    if (initialData) {
      setText(initialData.text);
      setQuestionType(initialData.questionType);
      setOptions(initialData.options.length > 0 ? initialData.options : [{ id: crypto.randomUUID(), text: '' }]);
      setCorrectAnswerId(initialData.correctAnswerId);
      setPoints(initialData.points);
    } else {
      setText('');
      setQuestionType('multiple-choice');
      setOptions([{ id: crypto.randomUUID(), text: '' }, {id: crypto.randomUUID(), text: ''}]);
      setCorrectAnswerId('');
      setPoints(1);
    }
  }, [initialData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) { 
        setOptions([...options, { id: crypto.randomUUID(), text: '' }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 1) { 
        setOptions(options.filter(opt => opt.id !== id));
        if (correctAnswerId === id) {
            setCorrectAnswerId(''); 
        }
    }
  };
  
  useEffect(() => { 
    if (questionType === 'multiple-choice' && options.length > 0 && !options.find(opt => opt.id === correctAnswerId)) {
        setCorrectAnswerId(options[0].id);
    }
  }, [options, questionType, correctAnswerId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Question text is required.");
      return;
    }
    if (points <= 0) {
        alert("Points must be a positive number.");
        return;
    }
    if (questionType === 'multiple-choice') {
        if (options.some(opt => !opt.text.trim())) {
            alert("All answer options must have text.");
            return;
        }
        if (!correctAnswerId || !options.find(opt => opt.id === correctAnswerId)) {
            alert("A correct answer must be selected for multiple-choice questions.");
            return;
        }
    } else if (questionType === 'true-false') {
        if (!correctAnswerId || (correctAnswerId !== 'true' && correctAnswerId !== 'false')){
             alert("A correct answer (True or False) must be selected.");
             return;
        }
    }

    onSubmit({
      text,
      questionType,
      options: questionType === 'multiple-choice' ? options : [{id: 'true', text: 'True'}, {id: 'false', text: 'False'}],
      correctAnswerId,
      points
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      <div>
        <label htmlFor="questionText" className="block font-medium text-neutral-dark mb-1">
          Question Text
        </label>
        <textarea
          id="questionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
          placeholder="Enter question text..."
          required
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
            <label htmlFor="questionType" className="block font-medium text-neutral-dark mb-1">
            Question Type
            </label>
            <select
            id="questionType"
            value={questionType}
            onChange={(e) => {
                const newType = e.target.value as QuestionType;
                setQuestionType(newType);
                if (newType === 'multiple-choice') {
                    setOptions(initialData?.questionType === 'multiple-choice' && initialData.options.length > 0 ? initialData.options : [{ id: crypto.randomUUID(), text: '' }, {id: crypto.randomUUID(), text: ''}]);
                    setCorrectAnswerId(options.length > 0 ? options[0].id : '');
                } else if (newType === 'true-false') {
                    setOptions([{id: 'true', text: 'True'}, {id: 'false', text: 'False'}]);
                    setCorrectAnswerId('true'); 
                }
            }}
            className="w-full p-2.5 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker bg-transparent"
            >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            </select>
        </div>
        <div className="flex-1">
            <label htmlFor="questionPoints" className="block font-medium text-neutral-dark mb-1">
            Points
            </label>
            <input
            type="number"
            id="questionPoints"
            value={points}
            onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value, 10) || 1))}
            min="1"
            className="w-full p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker bg-transparent"
            />
        </div>
      </div>


      {questionType === 'multiple-choice' && (
        <div>
          <label className="block font-medium text-neutral-dark mb-1">Answer Options</label>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                name="correctAnswer"
                id={`option-${option.id}`}
                value={option.id}
                checked={correctAnswerId === option.id}
                onChange={(e) => setCorrectAnswerId(e.target.value)}
                className="form-radio h-4 w-4 text-primary focus:ring-primary-light border-neutral-medium"
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-grow p-2 border border-neutral-medium rounded-md shadow-sm focus:ring-primary focus:border-primary text-neutral-darker placeholder-neutral-dark bg-transparent"
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="text-error hover:text-error-dark p-1 transition-colors"
                disabled={options.length <= 1}
                aria-label="Remove option"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-1 text-sm text-primary hover:text-primary-dark flex items-center transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> Add Option
            </button>
          )}
        </div>
      )}

    {questionType === 'true-false' && (
        <div>
            <label className="block font-medium text-neutral-dark mb-1">Correct Answer</label>
            <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-neutral-darker">
                    <input
                        type="radio"
                        name="correctAnswerTrueFalse"
                        value="true"
                        checked={correctAnswerId === 'true'}
                        onChange={() => setCorrectAnswerId('true')}
                        className="form-radio h-4 w-4 text-primary focus:ring-primary-light border-neutral-medium"
                    />
                    <span>True</span>
                </label>
                <label className="flex items-center space-x-2 text-neutral-darker">
                    <input
                        type="radio"
                        name="correctAnswerTrueFalse"
                        value="false"
                        checked={correctAnswerId === 'false'}
                        onChange={() => setCorrectAnswerId('false')}
                        className="form-radio h-4 w-4 text-primary focus:ring-primary-light border-neutral-medium"
                    />
                    <span>False</span>
                </label>
            </div>
        </div>
    )}


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
          {initialData ? 'Save Changes' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;