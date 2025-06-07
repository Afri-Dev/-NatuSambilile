
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { UserRole, Gender, AgeRange } from '../types';
import { COUNTRIES } from '../constants/countries';
import { USER_ROLES, XCircleIcon, CheckCircleIcon } from '../constants';

const LoginPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true); 

  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [gender, setGender] = useState<Gender>('prefer-not-to-say');
  const [ageRange, setAgeRange] = useState<AgeRange>('18-24');
  const [country, setCountry] = useState('South Africa'); // Default to South Africa
  
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  const { login, register } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (authMessage) setAuthMessage(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    if (!identifier.trim() || !password.trim()) {
      setAuthMessage({ type: 'error', text: 'Please enter username/email and password.' });
      return;
    }
    const result = login(identifier, password);
    if (result.success) {
      navigate('/');
    } else {
      setAuthMessage({ type: 'error', text: result.message || 'Login failed. Please try again.' });
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    
    if (!country) {
      setAuthMessage({ type: 'error', text: 'Please select your country.' });
      return;
    }

    if (!signupUsername.trim() || !firstName.trim() || !lastName.trim() || !signupEmail.trim() || !password.trim() || !signupConfirmPassword.trim()) {
      setAuthMessage({ type: 'error', text: 'Please fill in all required fields for signup.' });
      return;
    }
    if (password !== signupConfirmPassword) {
      setAuthMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    // Email validation is now primarily in App.tsx's register function, but a quick client check is fine
    if (!/\S+@\S+\.\S+/.test(signupEmail)) {
        setAuthMessage({ type: 'error', text: 'Please enter a valid email address.' });
        return;
    }

    // Create a user object with all the required fields
    const userData = {
      username: signupUsername,
      firstName: firstName.trim(),
      ...(middleName.trim() && { middleName: middleName.trim() }), // Only include if provided
      lastName: lastName.trim(),
      email: signupEmail,
      password,
      role: USER_ROLES.STUDENT as UserRole,
      gender,
      ageRange,
      courses: [],
      quizAttempts: []
    };

    const result = register(userData);
    if (result.success) {
      // Optionally show success message before navigating, or navigate directly
      // For now, direct navigation after App.tsx's register handles the user state.
      // If you want to show "Registration successful!" on this page:
      // setAuthMessage({ type: 'success', text: result.message || "Registration successful!"});
      // setTimeout(() => navigate('/'), 1500); // Delay navigation
      navigate('/');
    } else {
      setAuthMessage({ type: 'error', text: result.message || 'Signup failed. Please try again.'});
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setIdentifier('');
    const resetSignupForm = () => {
      setSignupUsername('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setSignupEmail('');
      setSignupConfirmPassword('');
      setGender('prefer-not-to-say');
      setAgeRange('18-24');
      setCountry('South Africa');
      setAuthMessage(null);
    };
    resetSignupForm();
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-dark">
            {isLoginView ? 'Sign in to NatuSambilile' : 'Create your Student Account'}
          </h2>
        </div>

        {authMessage && (
          <div 
            className={`p-4 rounded-md flex items-center space-x-3 ${
              authMessage.type === 'error' 
                ? 'bg-error-light text-error-dark border border-error-dark/50' 
                : 'bg-success-light text-success-dark border border-success-dark/50'
            }`}
            role="alert"
          >
            {authMessage.type === 'error' ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
            <span className="text-sm">{authMessage.text}</span>
          </div>
        )}

        {isLoginView ? (
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit} noValidate>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-neutral-dark mb-1">
                Username or Email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                placeholder="Enter username or email"
                value={identifier}
                onChange={handleInputChange(setIdentifier)}
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-neutral-dark mb-1">
                Password
              </label>
              <input
                id="password-login"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-transparent"
                placeholder="Password"
                value={password}
                onChange={handleInputChange(setPassword)}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary-light border-neutral-medium rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-neutral-darker"> Remember me </label>
              </div>
              {/* <a href="#" className="font-medium text-primary hover:text-primary-dark transition-colors"> Forgot your password? </a> */}
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignupSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-neutral-dark mb-1">
                  First Name *
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                  placeholder="First name"
                  value={firstName}
                  onChange={handleInputChange(setFirstName)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-neutral-dark mb-1">
                  Last Name *
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                  placeholder="Last name"
                  value={lastName}
                  onChange={handleInputChange(setLastName)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="middle-name" className="block text-sm font-medium text-neutral-dark mb-1">
                Middle Name (Optional)
              </label>
              <input
                id="middle-name"
                name="middleName"
                type="text"
                autoComplete="additional-name"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                placeholder="Middle name (optional)"
                value={middleName}
                onChange={handleInputChange(setMiddleName)}
              />
            </div>
            <div>
              <label htmlFor="username-signup" className="block text-sm font-medium text-neutral-dark mb-1">
                Username *
              </label>
              <input
                id="username-signup"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                placeholder="Choose a username"
                value={signupUsername}
                onChange={handleInputChange(setSignupUsername)}
              />
            </div>
            <div>
              <label htmlFor="email-signup" className="block text-sm font-medium text-neutral-dark mb-1">
                Email address
              </label>
              <input
                id="email-signup"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                placeholder="Email address"
                value={signupEmail}
                onChange={handleInputChange(setSignupEmail)}
              />
            </div>
             <div>
              <label htmlFor="password-signup" className="block text-sm font-medium text-neutral-dark mb-1">
                Password
              </label>
              <input
                id="password-signup"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                placeholder="Create a password"
                value={password}
                onChange={handleInputChange(setPassword)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-neutral-dark mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password-signup"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                placeholder="Confirm your password"
                value={signupConfirmPassword}
                onChange={handleInputChange(setSignupConfirmPassword)}
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-neutral-dark mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Age Range Selection */}
            <div>
              <label htmlFor="age-range" className="block text-sm font-medium text-neutral-dark mb-1">
                Age Range *
              </label>
              <select
                id="age-range"
                name="ageRange"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value as AgeRange)}
              >
                <option value="under-18">Under 18</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-64">55-64</option>
                <option value="65-plus">65+</option>
              </select>
            </div>

            {/* Country Selection */}
            <div className="col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-neutral-dark mb-1">
                Country *
              </label>
              <select
                id="country"
                name="country"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-neutral-medium placeholder-neutral-dark text-neutral-darker focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-transparent"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-neutral-dark">
              <p>You will be registered as a <span className="font-semibold text-primary">Student</span>.</p>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-dark transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        <div className="text-sm text-center">
          <button
            onClick={toggleView}
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
