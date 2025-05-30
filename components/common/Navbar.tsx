import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../../App';
import { UserIcon, USER_ROLES } from '../../constants'; 

const Navbar: React.FC = () => {
  const { currentUser, logout } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-dark shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white hover:text-primary-light transition-colors">
          NatuSambilile
        </Link>
        <div className="flex items-center space-x-4">
          {currentUser && currentUser.role === USER_ROLES.ADMIN && (
            <Link
              to="/admin-dashboard"
              className="text-neutral-light hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-neutral-light">
                <UserIcon className="w-5 h-5 mr-2" />
                <span>{currentUser.username} <span className="text-xs text-neutral-medium">({currentUser.role})</span></span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
              >
                Logout
              </button>
            </div>
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
    </nav>
  );
};

export default Navbar;