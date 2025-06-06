import React, { useContext, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext, AppContextType } from '../../App';
import { UserIcon, USER_ROLES } from '../../constants';
import OnboardingTour from '../onboarding/OnboardingTour';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useContext(AppContext) as AppContextType;
  const [showTour, setShowTour] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node) && 
          profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation for profile menu
  const handleProfileKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsProfileOpen(!isProfileOpen);
        break;
      case 'Escape':
        setIsProfileOpen(false);
        profileButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        if (isProfileOpen) {
          e.preventDefault();
          const firstMenuItem = profileMenuRef.current?.querySelector('a, button');
          (firstMenuItem as HTMLElement)?.focus();
        }
        break;
    }
  };

  // Handle menu item keyboard navigation
  const handleMenuItemKeyDown = (e: KeyboardEvent, index: number, itemCount: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextItem = profileMenuRef.current?.children[index + 1] as HTMLElement;
        nextItem?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index === 0) {
          profileButtonRef.current?.focus();
        } else {
          const prevItem = profileMenuRef.current?.children[index - 1] as HTMLElement;
          prevItem?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        const firstItem = profileMenuRef.current?.firstChild as HTMLElement;
        firstItem?.focus();
        break;
      case 'End':
        e.preventDefault();
        const lastItem = profileMenuRef.current?.lastChild as HTMLElement;
        lastItem?.focus();
        break;
    }
  };

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
    setIsProfileOpen(false);
    navigate('/login');
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasCompletedTour', 'true');
  };

  const startTour = () => {
    setShowTour(true);
    setIsProfileOpen(false);
  };

  return (
    <>
      <nav className="bg-primary-dark shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="welcome-message text-2xl font-bold text-white hover:text-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
              aria-label="NatuSambilile - Home"
            >
              NatuSambilile
            </Link>
            
            <div className="flex items-center space-x-6">
              {currentUser ? (
                <>
                  {currentUser.role === USER_ROLES.ADMIN ? (
                    <>
                      <nav aria-label="Admin navigation">
                        <ul className="flex space-x-6">
                          <li>
                            <Link
                              to="/admin-dashboard"
                              className="dashboard-link text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                              aria-current={location.pathname === '/admin-dashboard' ? 'page' : undefined}
                            >
                              Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/users"
                              className="user-management text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                              aria-current={location.pathname === '/users' ? 'page' : undefined}
                            >
                              Users
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/analytics"
                              className="analytics text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                              aria-current={location.pathname === '/analytics' ? 'page' : undefined}
                            >
                              Analytics
                            </Link>
                          </li>
                        </ul>
                      </nav>
                    </>
                  ) : (
                    <>
                      <nav aria-label="Main navigation">
                        <ul className="flex space-x-6">
                          <li>
                            <Link
                              to="/courses"
                              className="courses text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                              aria-current={location.pathname === '/courses' ? 'page' : undefined}
                            >
                              Courses
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/my-learning"
                              className="my-learning text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                              aria-current={location.pathname === '/my-learning' ? 'page' : undefined}
                            >
                              My Learning
                            </Link>
                          </li>
                        </ul>
                      </nav>
                    </>
                  )}

                  <div className="relative">
                    <button 
                      ref={profileButtonRef}
                      id="profile-menu-button"
                      aria-expanded={isProfileOpen}
                      aria-haspopup="true"
                      aria-controls="profile-menu"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      onKeyDown={handleProfileKeyDown}
                      className="profile-menu flex items-center text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                    >
                      <UserIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                      <span>{currentUser.username}</span>
                      <span className="sr-only">User menu</span>
                      <span className="ml-1 text-xs text-neutral-medium">
                        ({currentUser.role})
                      </span>
                      <span className="ml-1" aria-hidden="true">
                        {isProfileOpen ? '▲' : '▼'}
                      </span>
                    </button>
                    
                    {isProfileOpen && (
                      <div 
                        id="profile-menu"
                        ref={profileMenuRef}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="profile-menu-button"
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 focus:outline-none"
                      >
                        <Link
                          to="/profile"
                          role="menuitem"
                          tabIndex={-1}
                          onKeyDown={(e) => handleMenuItemKeyDown(e, 0, currentUser.role === USER_ROLES.ADMIN ? 2 : 3)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          Profile
                        </Link>
                        {currentUser.role !== USER_ROLES.ADMIN && (
                          <button
                            onClick={startTour}
                            role="menuitem"
                            tabIndex={-1}
                            onKeyDown={(e) => handleMenuItemKeyDown(e, 1, 3)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            Take a Tour
                          </button>
                        )}
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          tabIndex={-1}
                          onKeyDown={(e) => handleMenuItemKeyDown(e, currentUser.role === USER_ROLES.ADMIN ? 1 : 2, currentUser.role === USER_ROLES.ADMIN ? 2 : 3)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:rounded"
                  aria-label="Login to your account"
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