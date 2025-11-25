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
import {
  authService,
  CarouselSlide,
  PortalStatistics,
} from "../services/authService";
import DialogBox from "../components/common/DialogBox";
import { useAuth } from "../contexts/AuthContext";
import { Citizen, CitizenUpdateData } from "../types";
import GrievanceForm from "./GrievanceFile/GrievanceForm";
import webImage1 from "../assets/web-image-1.jpg";
import webImage2 from "../assets/web-image-2.jpg";
import webImage3 from "../assets/web-image-3.jpg";
import image5 from "../assets/image-5.jpg";
import image6 from "../assets/image-6.jpg";
import image7 from "../assets/iamge-7.jpg";
import assamHeroImage from "../assets/image-4.jpg";

const heroImages = [webImage1, webImage2, webImage3, image5, image6, image7];

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
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isGrievanceDialogOpen, setIsGrievanceDialogOpen] = useState(false);

  // Default slides to show when backend returns no data
  const defaultSlides: CarouselSlide[] = [
    {
      title: "Digital Assam Initiative",
      description:
        "Empowering citizens through digital governance and e-services",
      backgroundImage: heroImages[0],
      backgroundColor: "blue",
    },
    {
      title: "Quick Grievance Resolution",
      description: "File and track your complaints seamlessly online",
      backgroundImage: heroImages[1],
      backgroundColor: "green",
    },
    {
      title: "Citizen-Centric Services",
      description: "Access government schemes and programs with ease",
      backgroundImage: heroImages[2],
      backgroundColor: "purple",
    },
  ];
  const statsTemplate = [
    {
      label: "Grievances Filed",
      description: "Total submissions this year",
      icon: FileText,
      iconBg: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600",
      accent: "text-rose-600",
      cta: "View cases",
    },
    {
      label: "Resolved",
      description: "Closed with citizen confirmation",
      icon: FileCheck,
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-200 text-emerald-600",
      accent: "text-emerald-600",
      cta: "Resolution log",
    },
    {
      label: "Avg Resolution Time",
      description: "Working days per grievance",
      icon: Clock,
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-200 text-orange-600",
      accent: "text-orange-600",
      cta: "Improve SLA",
    },
    {
      label: "Satisfaction Rate",
      description: "Feedback above 4★ rating",
      icon: TrendingUp,
      iconBg: "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-600",
      accent: "text-indigo-600",
      cta: "View surveys",
    },
  ];

  const [analyticsData, setAnalyticsData] = useState(
    statsTemplate.map((item) => ({
      ...item,
      value: "0",
    }))
  );
  const [isLoadingCarousel, setIsLoadingCarousel] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const quickServices = [
    {
      name: "Government",
      icon: FileText,
      description: "Ministers, Advisors & Bureaucrats",
      accentBg: "bg-[#f45d5d] text-white",
      iconColor: "text-white",
    },
    {
      name: "Web Services",
      icon: Search,
      description: "Websites & Online Services",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
    },
    {
      name: "Business",
      icon: BookOpen,
      description: "Ease of doing business",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
    },
    {
      name: "News",
      icon: FileText,
      description: "Latest news & updates",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
    },
    {
      name: "Grievances",
      icon: Plus,
      description: "CPGRAMS",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
      action: "grievance",
    },
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

  // Map color names to Tailwind gradient classes
  // Supports simple color names (e.g., "blue", "yellow") and converts them to gradient classes
  const getGradientClass = (colorName: string | null | undefined): string => {
    if (!colorName) {
      return "bg-gradient-to-r from-blue-600 to-blue-800";
    }

    const color = colorName.toLowerCase().trim();

    // If it's already a Tailwind class (legacy support), use it directly
    if (color.startsWith("bg-gradient")) {
      return colorName;
    }

    // Map simple color names to gradient classes
    const gradientMap: Record<string, string> = {
      blue: "bg-gradient-to-r from-blue-600 to-blue-800",
      green: "bg-gradient-to-r from-green-600 to-green-800",
      yellow: "bg-gradient-to-r from-yellow-600 to-yellow-800",
      red: "bg-gradient-to-r from-red-600 to-red-800",
      purple: "bg-gradient-to-r from-purple-600 to-purple-800",
      orange: "bg-gradient-to-r from-orange-600 to-orange-800",
      pink: "bg-gradient-to-r from-pink-600 to-pink-800",
      indigo: "bg-gradient-to-r from-indigo-600 to-indigo-800",
      teal: "bg-gradient-to-r from-teal-600 to-teal-800",
      cyan: "bg-gradient-to-r from-cyan-600 to-cyan-800",
    };

    return gradientMap[color] || "bg-gradient-to-r from-blue-600 to-blue-800";
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // 2) Auto-rotate hero every 5s (pause on hover)
  useEffect(() => {
    if (isHeroHovered || slides.length === 0) return;
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
  // Fetch carousel slides on component mount
  useEffect(() => {
    fetchCarouselSlides();
  }, []);

  // Fetch portal statistics on component mount
  useEffect(() => {
    fetchPortalStatistics();
  }, []);

  // Fetch citizen profile when modal opens
  useEffect(() => {
    if (isProfileModalOpen && isAuthenticated && user) {
      fetchCitizenProfile();
    }
  }, [isProfileModalOpen, isAuthenticated]);

  const fetchCarouselSlides = async () => {
    try {
      setIsLoadingCarousel(true);
      const response = await authService.getCarouselSlides();
      if (response.success && response.data && response.data.length > 0) {
        setSlides(response.data);
      } else {
        // Use default slides when no data is available
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error("Error fetching carousel slides:", error);
      // Use default slides on error
      setSlides(defaultSlides);
    } finally {
      setIsLoadingCarousel(false);
    }
  };

  const fetchPortalStatistics = async () => {
    try {
      setIsLoadingStats(true);
      const response = await authService.getPortalStatistics();
      if (response.success && response.data) {
        const stats = response.data;
        const values = [
          stats.grievancesFiled.toLocaleString(),
          stats.resolved.toLocaleString(),
          stats.avgResolutionTime,
          stats.satisfactionRate,
        ];
        setAnalyticsData(
          statsTemplate.map((item, index) => ({
            ...item,
            value: values[index] ?? "0",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching portal statistics:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

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
  const handleNavigateToService = (action?: string) => {
    if (!action) return;
    switch (action) {
      case "grievance":
        if (!isAuthenticated) {
          openLoginModal();
        } else {
          setIsGrievanceDialogOpen(true);
        }
        break;
      case "track":
        console.log("Track Status");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel - Background Layer */}
      <div
        className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 pt-20 sm:pt-24"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        id="home"
        aria-roledescription="carousel"
        aria-label="Highlights"
      >
        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
          }}></div>
        </div>

        {isLoadingCarousel ? (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900 flex items-center justify-center z-0">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
          </div>
        ) : (
          slides.map((slide, index) => {
            // Determine background style: use image if available, otherwise use color/gradient
            const hasBackgroundImage =
              slide.backgroundImage &&
              typeof slide.backgroundImage === "string" &&
              slide.backgroundImage.trim() !== "";

            const fallbackImage = heroImages[index % heroImages.length];
            const imageToUse =
              hasBackgroundImage && slide.backgroundImage
                ? slide.backgroundImage
                : fallbackImage;

            const backgroundStyle = imageToUse
              ? {
                  backgroundImage: `url(${imageToUse})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {};

            // Convert color name to Tailwind gradient class
            const backgroundClass = hasBackgroundImage
              ? ""
              : getGradientClass(slide.backgroundColor);

            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-0 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } ${backgroundClass}`}
                style={backgroundStyle}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}`}
              >
                {/* Elegant gradient overlay for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
                
                {/* Content - positioned lower to make room for header */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-32 sm:pb-40 z-10">
                  <div className="text-white max-w-3xl mb-8">
                    <div className="inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-5 border border-white/30">
                      <span className="text-sm font-semibold uppercase tracking-wider text-white">Government Initiative</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h2>
                    <p className="text-lg sm:text-xl text-blue-100 mb-6 leading-relaxed drop-shadow-lg max-w-2xl">
                      {slide.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            openLoginModal();
                          } else {
                            setIsGrievanceDialogOpen(true);
                          }
                        }}
                        className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold text-base hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                      >
                        Get Started
                      </button>
                      <button
                        onClick={() => navigate("/customer")}
                        className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold text-base hover:bg-white/20 transition-all backdrop-blur-sm shadow-lg"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Header Overlay - Fully Transparent on top of carousel */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
            {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border-2 border-white/50">
                  <span className="text-blue-700 font-bold text-xl">AS</span>
              </div>
              <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white leading-tight drop-shadow-lg">
                  Government of Assam
                </h1>
                  <p className="text-xs text-white/90 font-medium drop-shadow-md">Citizen Grievance Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1" aria-label="Primary">
              <a
                href="#home"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Home
              </a>
              <a
                href="#services"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Services
              </a>
              <a
                href="#schemes"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                Schemes
              </a>
              <a
                href="#about"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors rounded-lg hover:bg-white/10 backdrop-blur-sm"
              >
                About
              </a>
            </nav>

            {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
              <button
                  className="hidden sm:flex items-center space-x-1 text-white/80 hover:text-white transition-colors rounded-full px-3 py-1 border border-white/30 backdrop-blur"
              >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">EN</span>
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                    className="px-4 py-2 bg-white/90 backdrop-blur-md text-blue-700 rounded-md text-sm font-semibold hover:bg-white transition-colors hidden sm:flex items-center space-x-2 shadow-lg"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={openLoginModal}
                      className="px-4 py-2 bg-white/90 backdrop-blur-md text-blue-700 rounded-md text-sm font-semibold hover:bg-white transition-colors shadow-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleOfficerLogin}
                      className="px-4 py-2 bg-white/80 backdrop-blur-md text-gray-800 rounded-md text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg"
                  >
                    Officer Login
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
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
              <div className="md:hidden py-4 border-t border-white/20 bg-white/95 backdrop-blur-md">
                <nav className="flex flex-col space-y-2" aria-label="Mobile">
                <a
                  href="#home"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors rounded"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#services"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors rounded"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a
                  href="#schemes"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors rounded"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  Schemes
                </a>
                <a
                  href="#about"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors rounded"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                {isAuthenticated ? (
                  <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors w-full flex items-center justify-center space-x-2 mt-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                ) : (
                    <div className="space-y-2 mt-2">
                    <button
                        onClick={() => {
                          openLoginModal();
                          setMobileMenuOpen(false);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors w-full"
                    >
                      Login
                    </button>
                    <button
                        onClick={() => {
                          handleOfficerLogin();
                          setMobileMenuOpen(false);
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors w-full"
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

        {/* Carousel Controls - Enhanced */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all z-40 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all z-40 shadow-lg hover:shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7 text-white" />
        </button>
      </div>

      {/* Quick Services - Overlaying on Carousel */}
      <section className="relative -mt-24 sm:-mt-32 z-20 mb-16" id="services">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[32px] shadow-[0_25px_60px_rgba(16,24,40,0.08)] border border-gray-100 px-4 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 tracking-[0.3em] uppercase">
            Quick Services
          </h2>
              <p className="text-sm text-gray-500">
                Access the most visited Assam Citizen Portal destinations in one place.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {quickServices.map((service, index) => {
                const isInteractive = Boolean(service.action);
                return (
              <button
                key={index}
                  type="button"
                onClick={() => {
                    if (!isInteractive) return;
                    handleNavigateToService(service.action);
                  }}
                  className={`group flex flex-col items-center text-center px-6 py-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 transition-colors ${
                    isInteractive ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${service.accentBg}`}
                  >
                    <service.icon className={`h-7 w-7 ${service.iconColor}`} />
                </div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-[0.2em]">
                  {service.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {service.description}
                  </p>
              </button>
              )})}
            </div>
          </div>
          </div>
        </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Analytics Cards - Government Portal Style */}
        <section className="relative mb-12 overflow-hidden rounded-3xl bg-white p-8 text-gray-900 shadow-[0_25px_60px_rgba(15,23,42,0.1)] border border-gray-100">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' stroke=\\'%23ffffff\\' stroke-width=\\'0.5\\' opacity=\\'0.3\\'%3E%3Cpath d=\\'M0 100h200M100 0v200\\'/%3E%3C/g%3E%3C/svg%3E')",
            }}
          />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-blue-500">
                Live Summary
              </p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">Portal Statistics</h2>
              <p className="text-gray-500 mt-2 max-w-2xl">
                Real-time overview of citizen engagement and grievance resolution across Assam.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition">
                View Analytics
                <ChevronRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 text-gray-700 px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition">
                Download Report
              </button>
            </div>
          </div>
          {isLoadingStats ? (
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-gray-50 backdrop-blur-sm border border-gray-100 p-6 flex items-center justify-center shadow-lg"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {analyticsData.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white text-gray-900 p-6 shadow-xl border border-gray-100 hover:-translate-y-1 transition"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${item.iconBg}`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">
                    {item.label}
                  </p>
                  <p className={`mt-3 text-4xl font-bold ${item.accent}`}>
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    {item.cta}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About Assam Section */}
        <section className="mb-12" id="about">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  About Assam
                </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg">
                  Assam, the land of the mighty Brahmaputra, is one of the most beautiful states in Northeast India. 
                  Known for its rich cultural heritage, diverse wildlife, and tea plantations, Assam is a state that 
                  beautifully blends tradition with modernity.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  The state is home to the famous Kaziranga National Park, a UNESCO World Heritage Site, which is 
                  home to the one-horned rhinoceros. Assam's tea gardens produce some of the finest tea in the world, 
                  and the state's vibrant festivals like Bihu showcase its rich cultural traditions.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  With a commitment to digital transformation and citizen-centric governance, the Government of Assam 
                  is working towards making the state a model of development and progress in the region.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-1">Capital</h4>
                    <p className="text-gray-700">Dispur</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-bold text-green-900 mb-1">Area</h4>
                    <p className="text-gray-700">78,438 sq km</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-1">Population</h4>
                    <p className="text-gray-700">31.2 Million</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden">
                  <img
                    src={assamHeroImage}
                    alt="Scenic view of Assam"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.35em] text-blue-200">
                      Assam
                    </p>
                    <h3 className="text-2xl font-bold mb-2">
                      Gateway to Northeast India
                    </h3>
                    <p className="text-sm text-blue-100">
                      From the Brahmaputra valley to the lush tea estates, discover how digital services connect every district.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout - News & Schemes - Government Portal Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Latest News as timeline */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Latest Updates
            </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="relative pl-8">
                {/* vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
                <div className="space-y-6">
                  {news.map((item, index) => (
                    <div key={index} className="relative">
                      <div className="absolute left-[-29px] top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                      <div className="cursor-pointer rounded-lg p-4 -m-4 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-600">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                          {item.date}
                        </p>
                        <p className="text-gray-900 font-bold text-base leading-relaxed">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-6 text-blue-600 font-bold hover:text-blue-700 text-sm inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                View All Updates
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Featured Schemes */}
          <section id="schemes">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Schemes
            </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-6">
              <div className="space-y-4">
                {schemes.map((scheme, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 hover:border-blue-500 rounded-lg p-5 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {scheme.name}
                      </h3>
                      <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-bold uppercase tracking-wide shadow-sm">
                        {scheme.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{scheme.desc}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-blue-600 font-bold hover:text-blue-700 text-sm inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                Browse All Schemes
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - Government Portal Style */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 mt-16 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Contact */}
            <div>
              <h3 className="font-bold text-white mb-5 text-lg border-b-2 border-blue-600 pb-2 inline-block">
                Contact Us
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 mt-1 flex-shrink-0 text-blue-400" />
                  <div>
                    <span className="text-sm font-semibold block">Toll Free</span>
                    <span className="text-sm">1800-XXX-XXXX</span>
                </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 mt-1 flex-shrink-0 text-blue-400" />
                  <div>
                    <span className="text-sm font-semibold block">Email</span>
                  <span className="text-sm">support@assam.gov.in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white mb-5 text-lg border-b-2 border-blue-600 pb-2 inline-block">
                Quick Links
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>About Us</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>Terms of Service</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>FAQs</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Accessibility */}
            <div>
              <h3 className="font-bold text-white mb-5 text-lg border-b-2 border-blue-600 pb-2 inline-block">
                Accessibility
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>Screen Reader</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>Text Size</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>High Contrast</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white hover:underline underline-offset-4 transition-colors flex items-center space-x-2"
                  >
                    <ChevronRight className="h-3 w-3 text-blue-400" />
                    <span>Site Map</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-bold text-white mb-5 text-lg border-b-2 border-blue-600 pb-2 inline-block">
                Follow Us
              </h3>
              <div className="flex space-x-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#1877F2] text-white hover:bg-[#1877F2]/80 transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter/X"
                  className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/80 transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#FF0000] text-white hover:bg-[#FF0000]/80 transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-700 mt-8 pt-8">
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-white">
                © 2025 Government of Assam. All rights reserved.
              </p>
              <p className="text-xs text-gray-400">
              Content owned, maintained and updated by Government of Assam
            </p>
              <p className="text-xs text-gray-500 mt-2">
                Designed & Developed by Department of Information Technology, Government of Assam
            </p>
            </div>
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
