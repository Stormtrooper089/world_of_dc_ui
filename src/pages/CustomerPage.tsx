import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronDown, 
  Search, 
  User, 
  Menu, 
  X,
  FileText,
  Database,
  BookOpen,
  Package,
  ArrowRight,
  PlusCircle,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  Smile,
  Clock
} from 'lucide-react';
import { Department } from '../types';
import { getDepartmentDisplayName } from '../utils/departmentUtils';
import CreateComplaint from '../components/complaints/CreateComplaint';

// Analytics data for each department - defined outside component
const getDepartmentAnalytics = (dept: Department | 'All') => {
  const analyticsMap: Record<string, { issuesReported: number; resolved: number; satisfactionPercent: number; processing: number }> = {
    'All': { issuesReported: 15420, resolved: 12480, satisfactionPercent: 87, processing: 2940 },
    [Department.PUBLIC_WORKS_DEPARTMENT]: { issuesReported: 3420, resolved: 2890, satisfactionPercent: 84, processing: 530 },
    [Department.WATER_RESOURCES]: { issuesReported: 2890, resolved: 2450, satisfactionPercent: 85, processing: 440 },
    [Department.ELECTRICITY_DEPARTMENT]: { issuesReported: 3210, resolved: 2780, satisfactionPercent: 87, processing: 430 },
    [Department.HEALTH_DEPARTMENT]: { issuesReported: 2150, resolved: 1890, satisfactionPercent: 88, processing: 260 },
    [Department.EDUCATION_DEPARTMENT]: { issuesReported: 1980, resolved: 1720, satisfactionPercent: 87, processing: 260 },
    [Department.SANITATION_DEPARTMENT]: { issuesReported: 1560, resolved: 1320, satisfactionPercent: 85, processing: 240 },
    [Department.POLICE_DEPARTMENT]: { issuesReported: 890, resolved: 780, satisfactionPercent: 88, processing: 110 },
    [Department.REVENUE_DEPARTMENT]: { issuesReported: 1240, resolved: 1080, satisfactionPercent: 87, processing: 160 },
    [Department.AGRICULTURE_DEPARTMENT]: { issuesReported: 980, resolved: 820, satisfactionPercent: 84, processing: 160 },
    [Department.ENVIRONMENT_DEPARTMENT]: { issuesReported: 690, resolved: 590, satisfactionPercent: 86, processing: 100 },
  };
  return analyticsMap[dept] || analyticsMap['All'];
};

const CustomerPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'All'>('All');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [complaintAnalytics, setComplaintAnalytics] = useState(getDepartmentAnalytics('All'));
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Cities data
  const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat'];

  // Departments for the circle diagram (main departments)
  const mainDepartments = [
    { dept: Department.PUBLIC_WORKS_DEPARTMENT, color: '#3B82F6', icon: '🏗️' },
    { dept: Department.WATER_RESOURCES, color: '#06B6D4', icon: '💧' },
    { dept: Department.ELECTRICITY_DEPARTMENT, color: '#F59E0B', icon: '⚡' },
    { dept: Department.HEALTH_DEPARTMENT, color: '#10B981', icon: '🏥' },
    { dept: Department.EDUCATION_DEPARTMENT, color: '#EF4444', icon: '📚' },
    { dept: Department.SANITATION_DEPARTMENT, color: '#8B5CF6', icon: '🧹' },
    { dept: Department.POLICE_DEPARTMENT, color: '#6366F1', icon: '👮' },
    { dept: Department.REVENUE_DEPARTMENT, color: '#EC4899', icon: '💰' },
    { dept: Department.AGRICULTURE_DEPARTMENT, color: '#84CC16', icon: '🌾' },
    { dept: Department.ENVIRONMENT_DEPARTMENT, color: '#14B8A6', icon: '🌳' },
  ];

  // Analytics data
  const analytics = [
    { id: 'discover', label: 'Best Practices', count: 941, icon: FileText, color: 'bg-gradient-to-br from-blue-600 to-blue-700' },
    { id: 'browse', label: 'Datasets', count: 42, icon: Database, color: 'bg-gradient-to-br from-indigo-600 to-indigo-700' },
    { id: 'explore', label: 'Policies', count: 522, icon: BookOpen, color: 'bg-gradient-to-br from-purple-600 to-purple-700' },
    { id: 'find', label: 'Starter Kits', count: 10, icon: Package, color: 'bg-gradient-to-br from-cyan-600 to-cyan-700' },
  ];

  // Carousel images - using placeholder gradients that look professional
  const carouselImages = [
    {
      id: 1,
      title: 'Community Engagement',
      description: 'Building stronger communities through active participation',
      gradient: 'from-blue-600 via-indigo-700 to-purple-800',
      image: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700'
    },
    {
      id: 2,
      title: 'Infrastructure Development',
      description: 'Transforming urban spaces for better living',
      gradient: 'from-green-600 via-emerald-700 to-teal-800',
      image: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700'
    },
    {
      id: 3,
      title: 'Digital Governance',
      description: 'Empowering citizens through technology',
      gradient: 'from-orange-600 via-red-700 to-pink-800',
      image: 'bg-gradient-to-br from-orange-500 via-red-600 to-pink-700'
    },
  ];

  // Handle scroll to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsCityDropdownOpen(false);
        setIsDepartmentDropdownOpen(false);
      }
    };

    if (isCityDropdownOpen || isDepartmentDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCityDropdownOpen, isDepartmentDropdownOpen]);

  const handlePrevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNextCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const handleCreateComplaint = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/customer' } });
      return;
    }
    setShowComplaintModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#0d47a1] shadow-lg' 
            : `bg-gradient-to-r ${carouselImages[currentCarouselIndex].gradient}`
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-white w-32 h-16 relative overflow-hidden">
                <div className="absolute top-2 left-3">
                  <div className="w-8 h-8 border-2 border-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 text-xs font-bold text-gray-900">
                  City Complaints
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            {/* <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/customer" className="px-4 py-2 text-white hover:bg-blue-700 rounded transition-colors">
                Home
              </Link>
            </nav> */}

            {/* Right Side Utilities */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className={`w-10 h-10 rounded-full hover:opacity-90 flex items-center justify-center transition-all ${
                isScrolled ? 'bg-blue-700' : 'bg-white/20 backdrop-blur-md hover:bg-white/30'
              }`}>
                <Search className="h-5 w-5 text-white" />
              </button>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full hover:opacity-90 transition-all flex items-center text-sm font-medium ${
                  isScrolled ? 'bg-blue-700 text-white hover:bg-blue-600' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 ${isScrolled ? 'text-white' : 'text-white'}`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`lg:hidden border-t ${
            isScrolled ? 'bg-blue-800 border-blue-700' : 'bg-blue-800/95 backdrop-blur-sm border-blue-700/50'
          }`}>
            <div className="px-4 py-4 space-y-2">
              <Link to="/customer" className="block px-4 py-2 text-white hover:bg-blue-700 rounded">
                Home
              </Link>
              <button
                onClick={handleCreateComplaint}
                className="w-full text-left block px-4 py-2 text-white hover:bg-blue-700 rounded"
              >
                Create Complaint
              </button>
              <Link to="/login" className="block px-4 py-2 text-white hover:bg-blue-700 rounded">
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Carousel Section */}
      <div className="relative mt-20 h-[600px] overflow-hidden">
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full w-full bg-gradient-to-r ${image.gradient} relative`}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent"></div>
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                      {image.title}
                    </h1>
                    <p className="text-xl text-blue-100 mb-8">
                      {image.description}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleCreateComplaint}
                        className="bg-white text-[#0d47a1] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                      >
                        Create Complaint
                        <PlusCircle className="ml-2 h-5 w-5" />
                      </button>
                      <Link
                        to="/login"
                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={handlePrevCarousel}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
          aria-label="Previous"
        >
          <ArrowRight className="h-6 w-6 rotate-180" />
        </button>
        <button
          onClick={handleNextCarousel}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
          aria-label="Next"
        >
          <ArrowRight className="h-6 w-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCarouselIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentCarouselIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Explore Complaints by Departments Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore Complaints by Departments</h2>
            <p className="text-lg text-gray-600">Select a department or city to view complaints and analytics</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <div className="relative">
                <button
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="w-64 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 transition-colors"
                >
                  <span className="text-gray-900">{selectedCity}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCityDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                          selectedCity === city ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <div className="relative">
                <button
                  onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  className="w-64 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 transition-colors"
                >
                  <span className="text-gray-900">
                    {selectedDepartment === 'All' ? 'All' : getDepartmentDisplayName(selectedDepartment)}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDepartmentDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedDepartment('All');
                        setComplaintAnalytics(getDepartmentAnalytics('All'));
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedDepartment === 'All' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      All
                    </button>
                    {Object.values(Department).map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setIsDepartmentDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                          selectedDepartment === dept ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {getDepartmentDisplayName(dept)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Analytics Cards */}
             <div className="lg:col-span-1 flex items-center justify-center px-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Issues Reported */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                      TOTAL
                    </div>
                    <div className="text-5xl font-bold mb-2">{complaintAnalytics.issuesReported.toLocaleString()}</div>
                    <div className="text-lg font-medium mb-4">Issues Reported</div>
                    <div className="flex items-center justify-between">
                      <AlertCircle className="h-6 w-6 opacity-80" />
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Resolved */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                      COMPLETED
                    </div>
                    <div className="text-5xl font-bold mb-2">{complaintAnalytics.resolved.toLocaleString()}</div>
                    <div className="text-lg font-medium mb-4">Resolved</div>
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="h-6 w-6 opacity-80" />
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Satisfaction % */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                      RATING
                    </div>
                    <div className="text-5xl font-bold mb-2">{complaintAnalytics.satisfactionPercent}%</div>
                    <div className="text-lg font-medium mb-4">Satisfaction</div>
                    <div className="flex items-center justify-between">
                      <Smile className="h-6 w-6 opacity-80" />
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Processing */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white relative overflow-hidden group cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                      ACTIVE
                    </div>
                    <div className="text-5xl font-bold mb-2">{complaintAnalytics.processing.toLocaleString()}</div>
                    <div className="text-lg font-medium mb-4">Processing</div>
                    <div className="flex items-center justify-between">
                      <Clock className="h-6 w-6 opacity-80" />
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Department Circle */}
            <div className="lg:col-span-2">
              <div className="relative w-full max-w-2xl aspect-square">
                <svg viewBox="0 0 600 600" className="w-full h-full">
                  {/* Draw departments as segments in a circle */}
                  {/* <circle cx="300" cy="300" r="270" fill="none" stroke="#e5e7eb" strokeWidth="2" /> */}
                  
                  {/* Center emblem circle */}
                  <circle cx="300" cy="300" r="90" fill="#0d47a1" opacity="0.1" />
                  <circle cx="300" cy="300" r="80" fill="white" />
                  <circle cx="300" cy="300" r="70" fill="#0d47a1" />
                  <text x="300" y="300" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="28" fontWeight="bold">DC</text>
                  
                  {/* Department segments */}
                  {mainDepartments.map((dept, index) => {
                    const angle = (360 / mainDepartments.length) * index;
                    const startAngle = (angle - 18) * (Math.PI / 180);
                    const endAngle = (angle + 18) * (Math.PI / 180);
                    
                    // Make selected segment larger
                    const isSelected = selectedDepartment === dept.dept;
                    const baseRadius = 220;
                    const baseInnerRadius = 100;
                    const radius = isSelected ? baseRadius + 30 : baseRadius; // Selected extends outward
                    const innerRadius = baseInnerRadius; // Keep inner radius same for padding
                    
                    const x1 = 300 + Math.cos(startAngle) * innerRadius;
                    const y1 = 300 + Math.sin(startAngle) * innerRadius;
                    const x2 = 300 + Math.cos(startAngle) * radius;
                    const y2 = 300 + Math.sin(startAngle) * radius;
                    const x3 = 300 + Math.cos(endAngle) * radius;
                    const y3 = 300 + Math.sin(endAngle) * radius;
                    const x4 = 300 + Math.cos(endAngle) * innerRadius;
                    const y4 = 300 + Math.sin(endAngle) * innerRadius;
                    
                    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
                    
                    const pathData = `
                      M ${x1} ${y1}
                      L ${x2} ${y2}
                      A ${radius} ${radius} 0 ${largeArc} 1 ${x3} ${y3}
                      L ${x4} ${y4}
                      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}
                      Z
                    `;
                    
                    // Position for text inside the segment (with padding)
                    const textRadius = (radius + innerRadius) / 2;
                    const textAngle = (startAngle + endAngle) / 2;
                    const textX = 300 + Math.cos(textAngle) * textRadius;
                    const textY = 300 + Math.sin(textAngle) * textRadius;
                    
                    // Get short name for display
                    const fullName = getDepartmentDisplayName(dept.dept);
                    const shortName = fullName.split(' ')[0]; // Use first word
                    
                    return (
                      <g key={dept.dept}>
                        <path
                          d={pathData}
                          fill={dept.color}
                          opacity={isSelected ? 1 : 0.75}
                          stroke={isSelected ? 'rgba(255,255,255,0.6)' : 'none'}
                          strokeWidth={isSelected ? '2' : '0'}
                          className="cursor-pointer hover:opacity-100 transition-all duration-300"
                          onClick={() => {
                            setSelectedDepartment(dept.dept);
                            setComplaintAnalytics(getDepartmentAnalytics(dept.dept));
                          }}
                          style={{ 
                            filter: isSelected ? 'drop-shadow(0 0 15px rgba(0,0,0,0.3))' : 'none',
                            transformOrigin: '300px 300px'
                          }}
                        />
                        {/* Department name inside segment */}
                        <text
                          x={textX}
                          y={textY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="bold"
                          className="pointer-events-none"
                          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
                        >
                          {shortName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              An integrated platform to report issues, track progress, and inspire action towards better governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              onClick={handleCreateComplaint}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="bg-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PlusCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Complaint</h3>
              <p className="text-gray-600 mb-4">
                Report issues in your community quickly and easily with our streamlined complaint system.
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="bg-green-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600 mb-4">
                Monitor the status of your complaints in real-time and get updates from departments.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                Learn More <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="bg-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Best Practices</h3>
              <p className="text-gray-600 mb-4">
                Explore successful case studies and initiatives from across different sectors.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="bg-orange-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Repository</h3>
              <p className="text-gray-600 mb-4">
                Access comprehensive policy documents, schemes, and regulations.
              </p>
              <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                Browse <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="bg-cyan-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Insights</h3>
              <p className="text-gray-600 mb-4">
                Visualize key trends and insights at various administrative levels.
              </p>
              <div className="flex items-center text-cyan-600 font-semibold group-hover:translate-x-2 transition-transform">
                View Data <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="bg-red-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Resolution Status</h3>
              <p className="text-gray-600 mb-4">
                Check resolved complaints and provide feedback on department performance.
              </p>
              <div className="flex items-center text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                Check Status <ArrowRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0d47a1] to-[#1565c0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Report an Issue?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who have successfully reported and resolved issues in their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateComplaint}
              className="bg-white text-[#0d47a1] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center mx-auto sm:mx-0"
            >
              Create Complaint
              <PlusCircle className="ml-2 h-5 w-5" />
            </button>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Track Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white w-10 h-10 rounded flex items-center justify-center mr-3">
                  <div className="w-6 h-6 border-2 border-gray-800 rounded-full"></div>
                </div>
                <span className="text-xl font-bold">NITI Aayog</span>
              </div>
              <p className="text-gray-400">
                An integrated platform to learn, share, and inspire action towards better governance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Report Issues</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Infrastructure</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Public Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Environment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety & Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Policies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Datasets</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Starter Kits</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NITI Aayog. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Create New Complaint</h2>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <CreateComplaint onSuccess={() => setShowComplaintModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;

