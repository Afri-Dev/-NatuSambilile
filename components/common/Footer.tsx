import React from 'react';
import { 
  Heart, 
  Globe2, 
  GraduationCap, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter,
  ArrowUp,
  ExternalLink
} from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="relative">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">NatuSambilile</h3>
                  <p className="text-sm text-gray-300">Advancing SDG 4</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-md">
                Empowering learners worldwide through quality education and innovative technology. 
                Join us in building a more sustainable future through knowledge and skills.
              </p>
              <div className="flex items-center space-x-4">
                <a 
                  href="mailto:contact@natusambilile.com" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
                <a 
                  href="https://sdgs.un.org/goals/goal4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>SDG 4</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Courses
                  </a>
                </li>
                <li>
                  <a href="/my-learning" className="text-gray-300 hover:text-white transition-colors text-sm">
                    My Learning
                  </a>
                </li>
                <li>
                  <a href="/upload" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Upload Files
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/settings" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Settings
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>&copy; {new Date().getFullYear()} NatuSambilile. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline" style={{ fontFamily: 'Times New Roman, Times, serif' }}>Powered by : The Right Role Model</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                aria-label="Back to top"
              >
                <span>Back to top</span>
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;