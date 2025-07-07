import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  Globe, 
  Heart,
  Star,
  CheckCircle,
  Lightbulb,
  Zap,
  Shield,
  Lock,
  GraduationCap,
  Globe2,
  Leaf,
  Droplets,
  Sun,
  Wifi,
  Building2,
  Scale,
  TreePine,
  Fish,
  Mountain,
  HeartHandshake,
  ArrowRight,
  Play,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  Users2,
  BookMarked,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setIsScrolling(true);
      
      // Clear scrolling state after animation
      setTimeout(() => setIsScrolling(false), 150);
      
      // Update active section based on scroll position
      Object.keys(sectionRefs.current).forEach(sectionId => {
        const element = sectionRefs.current[sectionId];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const primarySdg = {
    number: 4,
    title: "Quality Education",
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-100",
    textColor: "text-red-600"
  };

  const supportingSdgs = [
    {
      number: 1,
      title: "No Poverty",
      description: "End poverty in all its forms everywhere by providing accessible education that empowers individuals to improve their economic circumstances.",
      icon: <Heart className="w-6 h-6" />,
      color: "from-red-600 to-red-700",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      impact: "Empowering 10K+ learners to improve economic outcomes"
    },
    {
      number: 5,
      title: "Gender Equality",
      description: "Achieve gender equality and empower all women and girls through inclusive educational opportunities and equal access to learning resources.",
      icon: <HeartHandshake className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      impact: "50% of our learners are women and girls"
    },
    {
      number: 8,
      title: "Decent Work",
      description: "Promote sustained, inclusive and sustainable economic growth by equipping learners with skills needed for quality employment opportunities.",
      icon: <Building2 className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      impact: "85% of graduates find employment within 6 months"
    },
    {
      number: 10,
      title: "Reduced Inequalities",
      description: "Reduce inequality within and among countries by providing equal access to quality education regardless of background or location.",
      icon: <Scale className="w-6 h-6" />,
      color: "from-red-600 to-red-700",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      impact: "Education accessible in 150+ countries"
    },
    {
      number: 17,
      title: "Partnerships",
      description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development through collaborative learning.",
      icon: <Globe2 className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      impact: "200+ global partnerships established"
    }
  ];

  const sdg4Features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Inclusive Learning",
      description: "Accessible education for all, regardless of background, location, or economic status.",
      color: "from-blue-500 to-blue-600",
      stats: "100% Accessibility",
      details: "Free courses, multilingual support, and adaptive learning technologies"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Enhanced Education",
      description: "Personalized learning experiences powered by artificial intelligence for better outcomes.",
      color: "from-purple-500 to-purple-600",
      stats: "40% Better Retention",
      details: "Adaptive algorithms, personalized pathways, and intelligent tutoring"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Learning",
      description: "Collaborative learning environments that foster knowledge sharing and peer support.",
      color: "from-green-500 to-green-600",
      stats: "10K+ Active Learners",
      details: "Discussion forums, peer mentoring, and collaborative projects"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality Content",
      description: "Expert-curated courses and materials that meet international education standards.",
      color: "from-yellow-500 to-yellow-600",
      stats: "500+ Expert Instructors",
      details: "Industry professionals, academic experts, and certified educators"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Lifelong Learning",
      description: "Continuous learning opportunities for personal and professional development.",
      color: "from-indigo-500 to-indigo-600",
      stats: "24/7 Learning Access",
      details: "Self-paced courses, micro-learning modules, and skill assessments"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Access",
      description: "Worldwide availability ensuring education reaches every corner of the globe.",
      color: "from-teal-500 to-teal-600",
      stats: "150+ Countries",
      details: "Offline access, mobile optimization, and local language support"
    }
  ];

  const impactMetrics = [
    { 
      number: "100+", 
      label: "Quality Courses", 
      icon: <BookOpen className="w-5 h-5" />, 
      color: "from-blue-500 to-blue-600",
      trend: "+15% this year",
      description: "Expert-curated content across multiple disciplines"
    },
    { 
      number: "50K+", 
      label: "Learners Worldwide", 
      icon: <Users className="w-5 h-5" />, 
      color: "from-green-500 to-green-600",
      trend: "+25% growth",
      description: "Active learners from diverse backgrounds"
    },
    { 
      number: "95%", 
      label: "Accessibility Rate", 
      icon: <Globe className="w-5 h-5" />, 
      color: "from-purple-500 to-purple-600",
      trend: "99.9% uptime",
      description: "Platform available across all devices and regions"
    },
    { 
      number: "24/7", 
      label: "Learning Availability", 
      icon: <Wifi className="w-5 h-5" />, 
      color: "from-orange-500 to-orange-600",
      trend: "Always online",
      description: "Continuous access to learning resources"
    }
  ];

  const values = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Inclusivity",
      description: "Ensuring education is accessible to everyone, regardless of their circumstances",
      color: "from-green-500 to-green-600",
      examples: ["Free courses", "Multilingual support", "Accessibility features"]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Innovation",
      description: "Leveraging technology to create better learning experiences",
      color: "from-blue-500 to-blue-600",
      examples: ["AI-powered learning", "VR/AR experiences", "Adaptive algorithms"]
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Equity",
      description: "Providing equal opportunities for quality education worldwide",
      color: "from-red-500 to-red-600",
      examples: ["Equal access", "Fair assessment", "Diverse content"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sustainability",
      description: "Building lasting educational solutions for future generations",
      color: "from-teal-500 to-teal-600",
      examples: ["Green hosting", "Eco-friendly practices", "Long-term impact"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      location: "Kenya",
      content: "NatuSambilile gave me access to quality education I never thought possible. The AI-powered learning helped me understand complex topics easily.",
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Educator",
      location: "Canada",
      content: "As an instructor, I'm amazed by how the platform makes quality education accessible to learners worldwide. The impact is truly transformative.",
      avatar: "MC"
    },
    {
      name: "Aisha Patel",
      role: "Career Changer",
      location: "India",
      content: "The platform helped me transition into a new career. The community support and personalized learning made all the difference.",
      avatar: "AP"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Navigation */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-gray-200">
          <div className="flex flex-col space-y-1">
            {[
              { id: 'hero', label: 'Home', icon: <Star className="w-4 h-4" /> },
              { id: 'features', label: 'Features', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'impact', label: 'Impact', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'sdgs', label: 'SDGs', icon: <Globe2 className="w-4 h-4" /> },
              { id: 'values', label: 'Values', icon: <Heart className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`p-2 rounded-xl transition-all duration-300 group ${
                  activeSection === item.id 
                    ? 'bg-red-500 text-white shadow-lg scale-110' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-red-500'
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div 
          ref={(el) => sectionRefs.current['hero'] = el}
          className={`text-center mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>
          </div>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mb-8 shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="w-6 h-6 text-red-500 animate-spin" />
              <span className="text-red-600 font-semibold">Advancing Sustainable Development</span>
              <Sparkles className="w-6 h-6 text-red-500 animate-spin" />
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-red-800 to-red-600 bg-clip-text text-transparent leading-tight">
              Advancing SDG 4
              <br />
              <span className="text-5xl md:text-6xl">Quality Education</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              NatuSambilile is committed to the United Nations Sustainable Development Goals, 
              with SDG 4 as our primary mission - ensuring inclusive and equitable quality education 
              and promoting lifelong learning opportunities for all.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group px-10 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-3 text-lg">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Start Learning Today</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-10 py-5 border-2 border-red-500 text-red-600 rounded-2xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center space-x-3 text-lg">
                <span>Explore Our Mission</span>
                <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: <Users2 className="w-5 h-5" />, value: "50K+", label: "Learners" },
                { icon: <BookMarked className="w-5 h-5" />, value: "100+", label: "Courses" },
                { icon: <Globe2 className="w-5 h-5" />, value: "150+", label: "Countries" },
                { icon: <TrendingUp className="w-5 h-5" />, value: "95%", label: "Success Rate" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="text-red-500">{stat.icon}</div>
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <div className="text-sm text-gray-600 text-center">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SDG 4 Primary Focus Section */}
        <div className={`mb-24 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-16 text-white overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative text-center">
              <div className="flex items-center justify-center space-x-8 mb-12">
                <div className="text-9xl font-bold bg-white/20 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">4</div>
                <div className="text-left">
                  <h2 className="text-5xl font-bold mb-4">Quality Education</h2>
                  <p className="text-2xl opacity-90">Our Primary Mission</p>
                  <div className="flex items-center space-x-2 mt-4">
                    <Target className="w-5 h-5" />
                    <span className="text-lg">UN Sustainable Development Goal</span>
                  </div>
                </div>
              </div>
              <p className="text-2xl max-w-5xl mx-auto leading-relaxed opacity-95 mb-8">
                We are dedicated to ensuring inclusive and equitable quality education and promoting 
                lifelong learning opportunities for all. Through innovative technology and AI-powered 
                learning experiences, we're making quality education accessible to everyone, everywhere.
              </p>
              <div className="flex items-center justify-center space-x-6 text-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Inclusive Access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Quality Content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Global Reach</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SDG 4 Features Section */}
        <div 
          ref={(el) => sectionRefs.current['features'] = el}
          className={`mb-24 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How We Advance SDG 4</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach combines technology, innovation, and human-centered design 
              to create transformative learning experiences that advance quality education globally.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sdg4Features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-5 rounded-2xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{feature.stats}</div>
                    <div className="text-sm text-gray-600">{feature.details}</div>
                  </div>
                  
                  <div className="flex items-center text-red-500 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics Section */}
        <div 
          ref={(el) => sectionRefs.current['impact'] = el}
          className={`mb-24 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Impact on SDG 4</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real numbers that demonstrate our commitment to advancing quality education globally.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactMetrics.map((metric, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-6">
                  <div className={`p-5 rounded-2xl bg-gradient-to-br ${metric.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className="text-white">{metric.icon}</div>
                  </div>
                </div>
                <div className={`text-5xl font-bold mb-3 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.number}
                </div>
                <div className="text-gray-600 font-medium mb-2">{metric.label}</div>
                <div className="text-sm text-green-600 font-semibold mb-3">{metric.trend}</div>
                <div className="text-xs text-gray-500">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting SDGs Section */}
        <div 
          ref={(el) => sectionRefs.current['sdgs'] = el}
          className={`mb-24 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Supporting Additional SDGs</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              While SDG 4 is our primary focus, our educational platform also contributes to the achievement 
              of other Sustainable Development Goals through comprehensive learning opportunities and 
              community impact initiatives.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportingSdgs.map((goal, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-5 rounded-2xl ${goal.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {goal.icon}
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${goal.textColor}`}>SDG {goal.number}</div>
                    <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors mb-6">
                  {goal.description}
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Impact</div>
                  <div className="text-sm text-gray-600">{goal.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className={`mb-24 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">What Our Community Says</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from learners, educators, and partners about the impact of quality education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24 transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="group bg-white rounded-3xl p-12 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              To advance SDG 4 by providing accessible, high-quality education to learners worldwide. 
              We believe that quality education is a fundamental human right and the foundation for 
              sustainable development and social progress.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Established 2020</span>
              <Globe2 className="w-4 h-4" />
              <span>Global Impact</span>
            </div>
          </div>

          <div className="group bg-white rounded-3xl p-12 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg mb-6">
              A world where quality education is accessible to all, contributing to the achievement 
              of all 17 Sustainable Development Goals. We envision empowered communities through 
              knowledge, skills, and lifelong learning opportunities.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>2030 Goals</span>
              <Heart className="w-4 h-4" />
              <span>Inclusive Future</span>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div 
          ref={(el) => sectionRefs.current['values'] = el}
          className={`mb-24 transition-all duration-1000 delay-1400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our mission and shape our approach to advancing quality education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${value.color} rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <div className="text-white">{value.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{value.description}</p>
                <div className="space-y-2">
                  {value.examples.map((example, idx) => (
                    <div key={idx} className="text-sm text-gray-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-16 text-white text-center transition-all duration-1000 delay-1600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-8">Join Us in Advancing SDG 4</h2>
            <p className="text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Together, we can ensure quality education for all and build a more sustainable future. 
              Every learner, every course, every connection brings us closer to achieving our shared goals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-lg opacity-90">Active Learners</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">150+</div>
                <div className="text-lg opacity-90">Countries Reached</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-lg opacity-90">Success Rate</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group px-12 py-6 bg-white text-red-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-3 text-lg">
                <Play className="w-6 h-6" />
                <span>Start Learning Today</span>
              </button>
              <button className="group px-12 py-6 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-red-600 transition-all duration-300 flex items-center justify-center space-x-3 text-lg">
                <ExternalLink className="w-6 h-6" />
                <span>Learn More About SDGs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Powered By Section */}
        <div className={`text-center py-8 transition-all duration-1000 delay-1800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-3 bg-white rounded-2xl px-8 py-4 shadow-lg border border-gray-200">
            <span className="text-gray-600 font-medium">Powered by:</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400"></span>
              <img src="/assets/styles/LOGO.png" alt="LOGO" className="h-24 w-auto object-contain" style={{maxWidth: '320px'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 