import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, AppContextType } from '../App';
import { UserRole, Gender, AgeRange } from '../types';
import { COUNTRIES } from '../constants/countries';
import { CheckCircleIcon, XCircleIcon } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  
  const { login, register } = useContext(AppContext) as AppContextType;
  const navigate = useNavigate();

  const handleInputChange = (field: string, setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getInputClasses = (field: string) => {
    const isError = formErrors[field as keyof typeof formErrors] && formTouched[field as keyof typeof formTouched];
    return `appearance-none rounded-lg relative block w-full px-4 py-3 border ${
      isError 
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10'
    } sm:text-sm bg-white`;
  };

  const handleBlur = (field: string) => {
    setFormTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateLoginForm = () => {
    const errors: Record<string, string> = {};
    if (!identifier.trim()) errors.identifier = 'Username or email is required';
    if (!password.trim()) errors.password = 'Password is required';
    return errors;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    
    const errors = validateLoginForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const result = login(identifier, password);
      if (result.success) {
        setAuthMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        setTimeout(() => navigate('/'), 1000);
      } else {
        setAuthMessage({ type: 'error', text: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setAuthMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateSignupForm = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!signupUsername.trim()) errors.signupUsername = 'Username is required';
    if (!signupEmail.trim()) {
      errors.signupEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupEmail)) {
      errors.signupEmail = 'Please enter a valid email address';
    }
    if (!password) errors.password = 'Password is required';
    if (password.length > 0 && password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== signupConfirmPassword) errors.signupConfirmPassword = 'Passwords do not match';
    if (!country) errors.country = 'Please select your country';
    return errors;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    
    const errors = validateSignupForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      // Create a user object with all the required fields
      const userData = {
        username: signupUsername,
        firstName: firstName.trim(),
        ...(middleName.trim() && { middleName: middleName.trim() }), // Only include if provided
        lastName: lastName.trim(),
        email: signupEmail,
        password,
        role: 'STUDENT' as UserRole,
        gender,
        ageRange,
        country,
        courses: [],
        quizAttempts: []
      };

      const result = register(userData);
      if (result.success) {
        setAuthMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
        setTimeout(() => navigate('/'), 1500);
      } else {
        setAuthMessage({ type: 'error', text: result.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      setAuthMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
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

  // Clean up function to prevent memory leaks
  useEffect(() => {
    return () => {
      setAuthMessage(null);
      setFormErrors({});
    };
  }, [isLoginView]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLoginView ? 'Sign in to continue to NatuSambilile' : 'Join us to start learning'}
          </p>
        </motion.div>

        <AnimatePresence>
          {authMessage && (
            <motion.div
              key={authMessage.text}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg flex items-start space-x-3 ${
                authMessage.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
              role="alert"
            >
              {authMessage.type === 'error' ? (
                <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">{authMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoginView ? (
            <motion.form 
              key="login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="mt-8 space-y-5" 
              onSubmit={handleLoginSubmit} 
              noValidate
            >
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username or Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className={getInputClasses('identifier')}
                  placeholder="Enter your username or email"
                  value={identifier}
                  onChange={handleInputChange('identifier', setIdentifier)}
                  onBlur={() => handleBlur('identifier')}
                />
                {formErrors.identifier && formTouched.identifier && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.identifier}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password-login"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={getInputClasses('password')}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handleInputChange('password', setPassword)}
                    onBlur={() => handleBlur('password')}
                  />
                </div>
                {formErrors.password && formTouched.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                    isLoading
                      ? 'bg-primary/80 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </motion.form>
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
                    className={getInputClasses('firstName')}
                    placeholder="First name"
                    value={firstName}
                    onChange={handleInputChange('firstName', setFirstName)}
                    onBlur={() => handleBlur('firstName')}
                  />
                  {formErrors.firstName && formTouched.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
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
                    className={getInputClasses('lastName')}
                    placeholder="Last name"
                    value={lastName}
                    onChange={handleInputChange('lastName', setLastName)}
                    onBlur={() => handleBlur('lastName')}
                  />
                  {formErrors.lastName && formTouched.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
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
                  className={getInputClasses('middleName')}
                  placeholder="Middle name (optional)"
                  value={middleName}
                  onChange={handleInputChange('middleName', setMiddleName)}
                  onBlur={() => handleBlur('middleName')}
                />
                {formErrors.middleName && formTouched.middleName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.middleName}</p>
                )}
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
                  className={getInputClasses('signupUsername')}
                  placeholder="Choose a username"
                  value={signupUsername}
                  onChange={handleInputChange('signupUsername', setSignupUsername)}
                  onBlur={() => handleBlur('signupUsername')}
                />
                {formErrors.signupUsername && formTouched.signupUsername && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.signupUsername}</p>
                )}
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
                  className={getInputClasses('signupEmail')}
                  placeholder="Email address"
                  value={signupEmail}
                  onChange={handleInputChange('signupEmail', setSignupEmail)}
                  onBlur={() => handleBlur('signupEmail')}
                />
                {formErrors.signupEmail && formTouched.signupEmail && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.signupEmail}</p>
                )}
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
                  className={getInputClasses('password')}
                  placeholder="Create a password"
                  value={password}
                  onChange={handleInputChange('password', setPassword)}
                  onBlur={() => handleBlur('password')}
                />
                {formErrors.password && formTouched.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
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
                  className={getInputClasses('signupConfirmPassword')}
                  placeholder="Confirm your password"
                  value={signupConfirmPassword}
                  onChange={handleInputChange('signupConfirmPassword', setSignupConfirmPassword)}
                  onBlur={() => handleBlur('signupConfirmPassword')}
                />
                {formErrors.signupConfirmPassword && formTouched.signupConfirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.signupConfirmPassword}</p>
                )}
              </div>

              {/* Gender Selection */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-neutral-dark mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={getInputClasses('gender')}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {formErrors.gender && formTouched.gender && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
                )}
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
                  className={getInputClasses('ageRange')}
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
                {formErrors.ageRange && formTouched.ageRange && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.ageRange}</p>
                )}
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
                  className={getInputClasses('country')}
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
                {formErrors.country && formTouched.country && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                )}
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
        </AnimatePresence>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setAuthMessage(null);
              setFormErrors({});
              setFormTouched({});
            }}
            className="font-medium text-primary hover:text-primary-dark transition-colors text-sm"
          >
            {isLoginView ? (
              <span>
                Don't have an account? <span className="font-semibold">Sign up</span>
              </span>
            ) : (
              <span>
                Already have an account? <span className="font-semibold">Sign in</span>
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
