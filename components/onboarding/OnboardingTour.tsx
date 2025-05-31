import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../constants';
// Using simple text for icons to avoid dependency issues

interface TourStep {
  target: string;
  title: string;
  content: string | React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  action?: () => void;
  buttonText?: string;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, userRole }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const adminSteps: TourStep[] = [
    {
      target: '.dashboard-link',
      title: 'Admin Dashboard',
      content: 'Welcome to your admin dashboard! From here you can manage users, courses, and view system analytics.',
      position: 'bottom',
      action: () => navigate('/admin-dashboard'),
      buttonText: 'Go to Dashboard'
    },
    {
      target: '.user-management',
      title: 'User Management',
      content: 'Manage all user accounts, assign roles, and set permissions in one place.',
      position: 'right',
      buttonText: 'Next'
    },
    {
      target: '.analytics',
      title: 'Analytics',
      content: 'Track user engagement, course completion rates, and system usage statistics.',
      position: 'left',
      buttonText: 'Next'
    }
  ];

  const userSteps: TourStep[] = [
    {
      target: '.welcome-message',
      title: 'Welcome to NatuSambilile!',
      content: (
        <div className="space-y-2">
          <p>We're excited to have you on board! This quick tour will help you get started.</p>
          <p>You can always access this tour later from your profile menu.</p>
        </div>
      ),
      position: 'bottom',
      buttonText: 'Get Started'
    },
    {
      target: '.courses',
      title: 'Explore Courses',
      content: (
        <div className="space-y-2">
          <p>Browse our catalog of courses designed to help you learn and grow.</p>
          <p>Click on any course to see details and enroll.</p>
        </div>
      ),
      position: 'bottom',
      buttonText: 'Next'
    },
    {
      target: '.my-learning',
      title: 'My Learning',
      content: (
        <div className="space-y-2">
          <p>Track your progress, continue learning, and access your enrolled courses here.</p>
          <p>Your learning journey is saved automatically.</p>
        </div>
      ),
      position: 'bottom',
      buttonText: 'Next'
    },
    {
      target: '.profile-menu',
      title: 'Your Profile',
      content: (
        <div className="space-y-2">
          <p>Update your profile, change settings, and track your achievements.</p>
          <p>You can also find help and support here.</p>
        </div>
      ),
      position: 'left',
      buttonText: 'Finish Tour'
    },
    {
      target: '.progress',
      title: 'Track Your Progress',
      content: 'Track your learning progress and achievements.',
      position: 'left',
      buttonText: 'Next'
    }
  ];

  const steps = userRole === USER_ROLES.ADMIN ? adminSteps : userSteps;
  const current = steps[currentStep];

  useEffect(() => {
    if (isOpen && current?.action) {
      current.action();
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      localStorage.setItem('hasCompletedTour', 'true');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{current.title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close tour"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-6 text-gray-700">
          {typeof current.content === 'string' ? (
            <p>{current.content}</p>
          ) : (
            current.content
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Back
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  →
                  Finish
                </>
              ) : (
                <>
                  {current.buttonText || 'Next'}
                  →
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
