import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  FileCheck,
  FileText,
  Globe,
  Mail,
  Menu,
  Phone,
  Plus,
  Search,
  TrendingUp,
  Twitter,
  User,
  X,
  Youtube,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DialogBox from "../components/common/DialogBox";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { Citizen, CitizenUpdateData } from "../types";
import GrievanceForm from "./GrievanceFile/GrievanceForm";

const CitizenHome: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user, logout, updateUser } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false); // 2) pause on hover
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [citizenProfile, setCitizenProfile] = useState<Citizen | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [formData, setFormData] = useState<CitizenUpdateData>({
    name: "",
    email: "",
    address: "",
    pincode: "",
  });
  const [isGrievanceDialogOpen, setIsGrievanceDialogOpen] = useState(false);

  const slides = [
    {
      title: "Digital Assam Initiative",
      description:
        "Empowering citizens through digital governance and e-services",
      bg: "bg-gradient-to-r from-blue-600 to-blue-800",
    },
    {
      title: "Quick Grievance Resolution",
      description: "File and track your complaints seamlessly online",
      bg: "bg-gradient-to-r from-green-600 to-green-800",
    },
    {
      title: "Citizen-Centric Services",
      description: "Access government schemes and programs with ease",
      bg: "bg-gradient-to-r from-purple-600 to-purple-800",
    },
  ];

  const analyticsData = [
    {
      label: "Grievances Filed",
      value: "12,456",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Resolved",
      value: "10,234",
      icon: FileCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg Resolution Time",
      value: "5.2 Days",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Satisfaction Rate",
      value: "92%",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const quickServices = [
    { name: "File Grievance", icon: Plus },
    { name: "Track Status", icon: Search },
    { name: "View Schemes", icon: BookOpen },
    { name: "My Profile", icon: User },
  ];

  const news = [
    {
      date: "Nov 15, 2025",
      title: "New e-Governance portal launched for citizen services",
    },
    {
      date: "Nov 14, 2025",
      title: "Digital literacy program extended to rural areas",
    },
    {
      date: "Nov 13, 2025",
      title: "Online grievance redressal system upgraded",
    },
  ];

  const schemes = [
    {
      name: "Farmer Welfare Scheme",
      desc: "Financial assistance for agricultural development",
      status: "Active",
    },
    {
      name: "Student Scholarship Program",
      desc: "Merit-based scholarships for higher education",
      status: "Active",
    },
    {
      name: "Healthcare Initiative",
      desc: "Free medical services in rural health centers",
      status: "Active",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // 2) Auto-rotate hero every 5s (pause on hover)
  useEffect(() => {
    if (isHeroHovered) return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [isHeroHovered, slides.length]);

  const handleSendOtp = async () => {
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const response = await authService.sendOtp(mobileNumber.trim());

      // Only show OTP field if API call was successful
      if (response?.success) {
        setOtpSent(true);
        setOtp("");
      } else {
        setError(
          response?.message || "Failed to send login OTP. Please try again."
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to send login OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const res = await authService.verifyOtp(mobileNumber.trim(), otp.trim());

      if (res?.success && res.data?.token) {
        const token = res.data.token;

        // Decode minimal user info from JWT payload
        const decodePayload = (jwt: string) => {
          try {
            const parts = jwt.split(".");
            if (parts.length !== 3) return null;
            const payload = parts[1];
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64.padEnd(
              base64.length + ((4 - (base64.length % 4)) % 4),
              "="
            );
            const decoded = atob(padded);
            return JSON.parse(decoded);
          } catch (e) {
            return null;
          }
        };

        const payload = decodePayload(token) as any;
        const minimalUser = {
          id: payload?.sub || payload?.citizenId || "",
          email: payload?.email || "",
          name: payload?.name || "",
          role: payload?.role || "CUSTOMER",
          mobileNumber: mobileNumber.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store in localStorage first to ensure persistence
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(minimalUser));

        // Set auth in context
        setAuth({ token, user: minimalUser as any });

        // Close modal and stay on the same page (no navigation)
        setTimeout(() => {
          closeLoginModal();
        }, 100);
      } else {
        setError(res?.message || "OTP verification failed.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError("");
      setIsLoading(true);
      const response = await authService.sendOtp(mobileNumber.trim());

      if (response?.success) {
        setOtp("");
        // Show success message briefly
        setError("");
      } else {
        setError(
          response?.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setMobileMenuOpen(false); // Close mobile menu if open
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setMobileNumber("");
    setOtp("");
    setOtpSent(false);
    setError("");
  };

  const handleOfficerLogin = () => {
    navigate("/officer-login");
  };

  // Fetch citizen profile when modal opens
  useEffect(() => {
    if (isProfileModalOpen && isAuthenticated && user) {
      fetchCitizenProfile();
    }
  }, [isProfileModalOpen, isAuthenticated]);

  const fetchCitizenProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError("");
      const response = await authService.getCitizenProfile();
      if (response.success && response.data) {
        setCitizenProfile(response.data);
        setFormData({
          name: response.data.name || "",
          email: response.data.email || "",
          address: response.data.address || "",
          pincode: response.data.pincode || "",
        });
      } else {
        setProfileError("Failed to load profile data");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setProfileError(
        err.response?.data?.message || "Failed to load profile data"
      );
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileError("");
    setProfileSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileError("");
    setProfileSuccess("");
    // Reset form to original data
    if (citizenProfile) {
      setFormData({
        name: citizenProfile.name || "",
        email: citizenProfile.email || "",
        address: citizenProfile.address || "",
        pincode: citizenProfile.pincode || "",
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await authService.updateCitizenProfile(formData);
      if (response.success && response.data) {
        setCitizenProfile(response.data);
        setProfileSuccess("Profile updated successfully!");
        setIsEditingProfile(false);

        // Update user context with new data
        updateUser({
          name: response.data.name,
          email: response.data.email,
        });

        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(""), 3000);
      } else {
        setProfileError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setProfileError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsEditingProfile(false);
    setProfileError("");
    setProfileSuccess("");
    setCitizenProfile(null);
  };
  const handleNavigateToService = (serviceName: string) => {
    switch (serviceName) {
      case "File Grievance":
        if (!isAuthenticated) {
          console.log("isAuthenticated", isAuthenticated);
          openLoginModal();
        } else {
          console.log("setIsGrievanceDialogOpen", setIsGrievanceDialogOpen);
          setIsGrievanceDialogOpen(true); // Set state to open dialog
        }
        break;
      case "Track Status":
        console.log("Track Status");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">AS</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">
                  Government of Assam
                </h1>
                <p className="text-xs text-gray-600">Citizen Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6" aria-label="Primary">
              <a
                href="#home"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Services
              </a>
              <a
                href="#schemes"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Schemes
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                About
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors rounded-full px-2 py-1 border border-gray-200"
                aria-label="Language"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">EN</span>
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors hidden sm:flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={openLoginModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleOfficerLogin}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Officer Login
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-3" aria-label="Mobile">
                <a
                  href="#home"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Home
                </a>
                <a
                  href="#services"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Services
                </a>
                <a
                  href="#schemes"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Schemes
                </a>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  About
                </a>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full flex items-center justify-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={openLoginModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleOfficerLogin}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors w-full"
                    >
                      Officer Login
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Carousel with decorative shapes (2,4) */}
      <div
        className="relative h-64 sm:h-80 lg:h-96 overflow-hidden"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        id="home"
        aria-roledescription="carousel"
        aria-label="Highlights"
      >
        {/* Gradient blobs behind for depth (4) */}
        <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } ${slide.bg}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
          >
            {/* Radial overlay for better contrast */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),rgba(0,0,0,0.25))]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="text-white max-w-2xl">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-lg sm:text-xl/7 opacity-95">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 w-2 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Quick Services */}
        <section className="mb-12" id="services">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Services
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {quickServices.map((service, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAuthenticated) {
                    openLoginModal();
                  } else {
                    handleNavigateToService(service.name);
                  }
                }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center ring-1 ring-black/5">
                  <service.icon className="h-7 w-7 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900 text-center text-sm sm:text-base">
                  {service.name}
                </span>
              </button>
            ))}
          </div>
        </section>
        {/* Analytics Cards (5) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Portal Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {analyticsData.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mb-4 ring-1 ring-black/5`}
                >
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <p className="text-gray-600 text-sm mb-1">{item.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout - News & Schemes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Latest News as timeline (7) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Latest Updates
            </h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="relative pl-6">
                {/* vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-5">
                  {news.map((item, index) => (
                    <div key={index} className="relative">
                      <div className="cursor-pointer rounded-lg p-2 -m-2 hover:bg-gray-50 transition-colors">
                        <p className="text-xs text-gray-500 mb-1">
                          {item.date}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-6 text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center gap-1">
                View All Updates
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Featured Schemes */}
          <section id="schemes">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Schemes
            </h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {schemes.map((scheme, index) => (
                  <div
                    key={index}
                    className="border border-transparent hover:border-gray-200 rounded-lg p-4 hover:shadow-sm transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {scheme.name}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        {scheme.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{scheme.desc}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center gap-1">
                Browse All Schemes
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer (10) */}
      <footer className="bg-gray-950 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-sm">1800-XXX-XXXX (Toll Free)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-sm">support@assam.gov.in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="font-semibold text-white mb-4">Accessibility</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    Screen Reader
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    Text Size
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    High Contrast
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4"
                  >
                    Site Map
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter/X"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Government of Assam. All rights reserved.</p>
            <p className="mt-2">
              Content owned, maintained and updated by Government of Assam
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeLoginModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {otpSent ? "Enter OTP" : "Citizen Login"}
              </h2>
              <p className="text-sm text-gray-600">
                {otpSent
                  ? `We sent an OTP to ${mobileNumber}`
                  : "Enter your mobile number to receive an OTP for login"}
              </p>
            </div>

            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>
                    <input
                      id="mobile"
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        setError("");
                      }}
                      placeholder="9000000000"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleSendOtp();
                        }
                      }}
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={closeLoginModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={isLoading || mobileNumber.trim().length < 10}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setError("");
                      }}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleVerifyOtp();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setError("");
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.trim().length < 4}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {isLoading ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {citizenProfile?.name || user.name || "Citizen"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {citizenProfile?.mobileNumber ||
                      user.mobileNumber ||
                      user.email ||
                      "User"}
                  </p>
                </div>
              </div>
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {profileError && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-700">{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <p className="text-sm text-green-700">{profileSuccess}</p>
                  </div>
                )}

                {isEditingProfile ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateProfile();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Address
                      </label>
                      <textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                        maxLength={6}
                        placeholder="6 digits"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        {citizenProfile?.name && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Name:
                            </span>
                            <span className="text-sm text-gray-900">
                              {citizenProfile.name}
                            </span>
                          </div>
                        )}
                        {citizenProfile?.email && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Email:
                            </span>
                            <span className="text-sm text-gray-900">
                              {citizenProfile.email}
                            </span>
                          </div>
                        )}
                        {citizenProfile?.address && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Address:
                            </span>
                            <span className="text-sm text-gray-900">
                              {citizenProfile.address}
                            </span>
                          </div>
                        )}
                        {citizenProfile?.pincode && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Pincode:
                            </span>
                            <span className="text-sm text-gray-900">
                              {citizenProfile.pincode}
                            </span>
                          </div>
                        )}
                        {citizenProfile?.mobileNumber && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Mobile:
                            </span>
                            <span className="text-sm text-gray-900">
                              {citizenProfile.mobileNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t">
                      <button
                        onClick={handleEditProfile}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          closeProfileModal();
                          logout();
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grievance Form Dialog */}
      {isGrievanceDialogOpen && (
        <DialogBox
          isOpen={isGrievanceDialogOpen}
          onClose={() => setIsGrievanceDialogOpen(false)}
          title="Create Grievance"
          size="lg"
        >
          <GrievanceForm
            onSubmit={(data) => {
              console.log("Grievance submitted:", data);
              // TODO: Add API call here
              setIsGrievanceDialogOpen(false);
            }}
            onCancel={() => setIsGrievanceDialogOpen(false)}
          />
        </DialogBox>
      )}
    </div>
  );
};

export default CitizenHome;
