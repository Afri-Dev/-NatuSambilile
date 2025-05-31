import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext, AppContextType } from '../../App';
import { UserIcon, USER_ROLES } from '../../constants';
import OnboardingTour from '../onboarding/OnboardingTour';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useContext(AppContext) as AppContextType;
  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if it's the user's first visit
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('hasCompletedTour');
    if (currentUser && !hasCompletedTour && currentUser.role !== USER_ROLES.ADMIN) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasCompletedTour', 'true');
  };

  const startTour = () => {
    setShowTour(true);
  };

  return (
    <>
      <nav className="bg-primary-dark shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="welcome-message text-2xl font-bold text-white hover:text-primary-light transition-colors"
            >
              NatuSambilile
            </Link>
            
            <div className="flex items-center space-x-6">
              {currentUser ? (
                <>
                  {currentUser.role === USER_ROLES.ADMIN ? (
                    <>
                      <Link
                        to="/admin-dashboard"
                        className="dashboard-link text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/users"
                        className="user-management text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Users
                      </Link>
                      <Link
                        to="/analytics"
                        className="analytics text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Analytics
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/courses"
                        className="courses text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Courses
                      </Link>
                      <Link
                        to="/my-learning"
                        className="my-learning text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        My Learning
                      </Link>
                    </>
                  )}

                  <div className="relative group">
                    <button className="profile-menu flex items-center text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <UserIcon className="w-5 h-5 mr-2" />
                      <span>{currentUser.username}</span>
                      <span className="ml-1 text-xs text-neutral-medium">
                        ({currentUser.role})
                      </span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      {currentUser.role !== USER_ROLES.ADMIN && (
                        <button
                          onClick={startTour}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Take a Tour
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {currentUser && showTour && (
        <OnboardingTour
          isOpen={showTour}
          onClose={handleTourComplete}
          userRole={currentUser.role}
        />
      )}
    </>
  );
};

export default Navbar;