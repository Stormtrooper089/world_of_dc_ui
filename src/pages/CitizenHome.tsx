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
import image1 from "../assets/image-1.jpg";
import image2 from "../assets/image-2.jpg";
import image3 from "../assets/image-3.jpg";
import assamHeroImage from "../assets/image-4.jpg";
import image5 from "../assets/image-5.jpg";
import image6 from "../assets/image-6.jpg";
import image7 from "../assets/image-7.jpg";
import DialogBox from "../components/common/DialogBox";
import { useAuth } from "../contexts/AuthContext";
import { authService, CarouselSlide } from "../services/authService";
import { complaintService } from "../services/complaintService";
import {
  Citizen,
  CitizenUpdateData,
  Complaint,
  ComplaintDocument,
  ComplaintHistory,
} from "../types";
import GrievanceForm from "./GrievanceFile/GrievanceForm";

const heroImages = [image7, image5, image6, image1, image2, image3];

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
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [citizenComplaints, setCitizenComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [complaintDetails, setComplaintDetails] = useState<{
    complaint: Complaint;
    history: ComplaintHistory[];
    documents: ComplaintDocument[];
  } | null>(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isLoadingComplaintDetails, setIsLoadingComplaintDetails] =
    useState(false);
  const [trackError, setTrackError] = useState("");

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
    },
    {
      label: "Resolved",
      description: "Closed with citizen confirmation",
      icon: FileCheck,
      iconBg:
        "bg-gradient-to-br from-green-100 to-emerald-200 text-emerald-600",
      accent: "text-emerald-600",
    },
    {
      label: "Avg Resolution Time",
      description: "Working days per grievance",
      icon: Clock,
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-200 text-orange-600",
      accent: "text-orange-600",
    },
    {
      label: "Satisfaction Rate",
      description: "Feedback above 4★ rating",
      icon: TrendingUp,
      iconBg: "bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-600",
      accent: "text-indigo-600",
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
      name: "File Grievance",
      icon: Plus,
      description: "Submit new case in minutes",
      accentBg: "bg-[#f45d5d] text-white",
      iconColor: "text-white",
      action: "grievance",
    },
    {
      name: "Track Grievance",
      icon: Search,
      description: "Check live case status",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
      action: "track",
    },
    {
      name: "Web Services",
      icon: Globe,
      description: "Websites & online tools",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
      action: "services",
    },
    {
      name: "News",
      icon: FileText,
      description: "Latest updates & alerts",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
      action: "schemes",
    },
    {
      name: "Government",
      icon: BookOpen,
      description: "Ministers & departments",
      accentBg: "bg-[#fdecec] text-[#f45d5d]",
      iconColor: "text-[#f45d5d]",
      action: "government",
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
        if (!isAuthenticated) {
          openLoginModal();
        } else {
          openTrackModal();
        }
        break;
      case "services":
        if (!isAuthenticated) {
          openLoginModal();
        } else {
          window.open(
            "https://assam.gov.in/eservices",
            "_blank",
            "noopener,noreferrer"
          );
        }
        break;
      case "schemes":
        if (!isAuthenticated) {
          openLoginModal();
        } else {
          window.open(
            "https://cm.assam.gov.in/schemes",
            "_blank",
            "noopener,noreferrer"
          );
        }
        break;
      case "government":
        if (!isAuthenticated) {
          openLoginModal();
        } else {
          window.open(
            "https://assam.gov.in/",
            "_blank",
            "noopener,noreferrer"
          );
        }
        break;
      default:
        break;
    }
  };

  const openTrackModal = () => {
    setTrackError("");
    setIsTrackModalOpen(true);
    fetchCitizenComplaints();
  };

  const closeTrackModal = () => {
    setIsTrackModalOpen(false);
    setTrackError("");
    setCitizenComplaints([]);
    setSelectedComplaint(null);
    setComplaintDetails(null);
  };

  const fetchCitizenComplaints = async () => {
    if (!user?.mobileNumber) {
      setTrackError(
        "Mobile number not found. Please update your profile to track grievances."
      );
      setCitizenComplaints([]);
      setSelectedComplaint(null);
      setComplaintDetails(null);
      return;
    }

    try {
      setIsLoadingTrack(true);
      const complaints = await complaintService.getComplaintsByCitizen(
        user.mobileNumber
      );
      setCitizenComplaints(complaints);
      if (complaints.length > 0) {
        await fetchComplaintDetails(complaints[0]);
      } else {
        setSelectedComplaint(null);
        setComplaintDetails(null);
      }
    } catch (error: any) {
      console.error("Error fetching citizen complaints:", error);
      setTrackError(
        error?.response?.data?.message ||
          "Unable to load your grievances right now."
      );
    } finally {
      setIsLoadingTrack(false);
    }
  };

  const fetchComplaintDetails = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    try {
      setIsLoadingComplaintDetails(true);
      const response = await complaintService.trackComplaint(
        complaint.complaintNumber
      );
      if (response.success && response.data) {
        setComplaintDetails(response.data);
      } else {
        setTrackError(response.message || "Unable to load complaint details.");
        setComplaintDetails(null);
      }
    } catch (error: any) {
      console.error("Error fetching complaint detail:", error);
      setTrackError(
        error?.response?.data?.message ||
          "Unable to load complaint details right now."
      );
      setComplaintDetails(null);
    } finally {
      setIsLoadingComplaintDetails(false);
    }
  };

  const formatReadableDate = (value?: string) => {
    if (!value) return "Not available";
    try {
      return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  };

  const formatStatusLabel = (value?: string) =>
    value ? value.replace(/_/g, " ") : "Not available";

  const getStatusBadgeClasses = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-700";

    const statusUpper = status.toUpperCase();

    // Starting states - Blue
    if (statusUpper === "CREATED") {
      return "bg-blue-100 text-blue-700";
    }

    // Medium states - Yellow
    if (
      ["ASSIGNED", "IN_PROGRESS", "IN PROGRESS", "BLOCKED"].includes(
        statusUpper
      )
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    // Closed states - Green
    if (["RESOLVED", "CLOSED"].includes(statusUpper)) {
      return "bg-green-100 text-green-700";
    }

    // Rejected/Removed - Red
    if (["REJECTED", "DUPLICATE", "REMOVED"].includes(statusUpper)) {
      return "bg-red-100 text-red-700";
    }

    // Default fallback
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel - Background Layer */}
      <div
        className="relative h-[420px] sm:h-[520px] lg:h-[620px] overflow-hidden bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 pt-14 sm:pt-18"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        id="home"
        aria-roledescription="carousel"
        aria-label="Highlights"
      >
        {/* Decorative overlay pattern */}
        <div className="absolute inset-0 opacity-5 z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
            }}
          ></div>
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

                {/* Content spacing keeps quick services visible without extra scroll */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-start z-10 pl-16 sm:pl-20 md:pl-24 lg:pl-28 pr-16 sm:pr-20 md:pr-24 lg:pr-28">
                  <div className="text-white max-w-3xl w-full">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight drop-shadow-2xl">
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-base text-blue-100 leading-relaxed drop-shadow-lg max-w-2xl">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Header Overlay - Fully Transparent on top of carousel */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-blue-900/90 via-blue-900/60 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border-2 border-white/50">
                  <span className="text-blue-700 font-bold text-xl">AS</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white leading-tight drop-shadow-lg">
                    বলবে কাছাড়
                  </h1>
                  <p className="text-xs text-white/90 font-medium drop-shadow-md">
                    Government of Assam
                  </p>
                  <p className="text-xs text-white/80 font-medium drop-shadow-md mt-0.5">
                    Citizen Grievance Portal
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1" aria-label="Primary">
                <a
                  href="#home"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors"
                >
                  Home
                </a>
                <a
                  href="#services"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors"
                >
                  Services
                </a>
                <a
                  href="#schemes"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors"
                >
                  Schemes
                </a>
                <a
                  href="#about"
                  className="px-4 py-2 text-white/90 hover:text-white font-semibold transition-colors"
                >
                  About
                </a>
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <button className="hidden sm:flex items-center space-x-1 text-white/80 hover:text-white transition-colors rounded-full px-3 py-1 border border-white/30 backdrop-blur">
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
                      className="px-4 py-2 bg-white text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleOfficerLogin}
                      className="px-4 py-2 bg-white text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors shadow-lg"
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
              <div className="md:hidden py-4 border-t border-white/20 bg-white/95 backdrop-blur-md text-gray-900">
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors w-full"
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
          className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 sm:p-3 rounded-full transition-all z-40 shadow-lg hover:shadow-xl"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 sm:p-3 rounded-full transition-all z-40 shadow-lg hover:shadow-xl"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
        </button>
      </div>

      {/* Quick Services - Overlaying on Carousel */}
      <section className="relative -mt-28 sm:-mt-36 z-20 mb-12" id="services">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[28px] shadow-[0_20px_40px_rgba(16,24,40,0.08)] border border-gray-100 px-4 py-4 sm:px-6 sm:py-6">
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
                    className={`group flex flex-col items-center text-center px-4 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 transition-colors ${
                      isInteractive
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md ${service.accentBg}`}
                    >
                      <service.icon
                        className={`h-6 w-6 ${service.iconColor}`}
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-[0.15em]">
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">
                      {service.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Analytics Cards - Government Portal Style */}
        <section className="relative mb-10 overflow-hidden rounded-2xl bg-white p-6 text-gray-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] border border-gray-100">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' stroke=\\'%23ffffff\\' stroke-width=\\'0.5\\' opacity=\\'0.3\\'%3E%3Cpath d=\\'M0 100h200M100 0v200\\'/%3E%3C/g%3E%3C/svg%3E')",
            }}
          />
          <div className="relative mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Live Summary</h2>
          </div>
          {isLoadingStats ? (
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-gray-50 backdrop-blur-sm border border-gray-100 p-5 flex items-center justify-center shadow-md"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {analyticsData.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-2xl bg-white text-gray-900 p-5 shadow-lg border border-gray-100 hover:-translate-y-0.5 transition"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${item.iconBg}`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
                    {item.label}
                  </p>
                  <p className={`mt-2 text-3xl font-bold ${item.accent}`}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 leading-snug">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About Assam Section */}
        <section className="mb-10" id="about">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  About Assam
                </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed text-base">
                  Assam, the land of the mighty Brahmaputra, is one of the most
                  beautiful states in Northeast India. Known for its rich
                  cultural heritage, diverse wildlife, and tea plantations,
                  Assam is a state that beautifully blends tradition with
                  modernity.
                </p>
                <p className="text-gray-700 leading-relaxed text-base">
                  The state is home to the famous Kaziranga National Park, a
                  UNESCO World Heritage Site, which is home to the one-horned
                  rhinoceros. Assam's tea gardens produce some of the finest tea
                  in the world, and the state's vibrant festivals like Bihu
                  showcase its rich cultural traditions.
                </p>
                <p className="text-gray-700 leading-relaxed text-base">
                  With a commitment to digital transformation and
                  citizen-centric governance, the Government of Assam is working
                  towards making the state a model of development and progress
                  in the region.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-1">Capital</h4>
                    <p className="text-gray-700">Dispur</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <h4 className="font-bold text-green-900 mb-1">Area</h4>
                    <p className="text-gray-700">78,438 sq km</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-1">
                      Population
                    </h4>
                    <p className="text-gray-700">31.2 Million</p>
                  </div>
                </div>
              </div>
              <div className="relative h-full min-h-[280px]">
                <div className="rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden h-full">
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
                      From the Brahmaputra valley to the lush tea estates,
                      discover how digital services connect every district.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout - News & Schemes - Government Portal Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Latest News as timeline */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Latest Updates
                </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
              <div className="relative pl-8">
                {/* vertical line */}
                <div className="absolute left-3 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
                <div className="space-y-6">
                  {news.map((item, index) => (
                    <div key={index} className="relative">
                      <div className="absolute left-[-29px] top-1 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                      <div className="cursor-pointer rounded-lg p-3 -m-3 hover:bg-blue-50 transition-colors border-l-4 border-transparent hover:border-blue-600">
                        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                          {item.date}
                        </p>
                        <p className="text-gray-900 font-semibold text-[15px] leading-snug">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-4 text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
                View All Updates
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Featured Schemes */}
          <section id="schemes">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Featured Schemes
                </h2>
                <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
              <div className="space-y-3">
                {schemes.map((scheme, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 hover:border-blue-500 rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {scheme.name}
                      </h3>
                      <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full font-bold uppercase tracking-wide shadow-sm">
                        {scheme.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">
                      {scheme.desc}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors">
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
                    <span className="text-sm font-semibold block">
                      Toll Free
                    </span>
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
                Designed & Developed by Department of Information Technology,
                Government of Assam
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Track Grievance Modal */}
      {isTrackModalOpen && (
        <DialogBox
          isOpen={isTrackModalOpen}
          onClose={closeTrackModal}
          title="Track Grievances"
          size="lg"
          bodyClassName="bg-white"
        >
          {trackError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {trackError}
            </div>
          )}
          {isLoadingTrack ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-600"></div>
            </div>
          ) : citizenComplaints.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No grievances found for your account yet.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {citizenComplaints.map((complaint) => {
                  const isActive =
                    selectedComplaint?.complaintNumber ===
                    complaint.complaintNumber;
                  return (
                    <button
                      type="button"
                      key={complaint.id}
                      onClick={() => fetchComplaintDetails(complaint)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50/80 shadow-md"
                          : "border-gray-100 bg-white shadow-sm hover:border-blue-200"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
                        #{complaint.complaintNumber}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {complaint.subject}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{formatReadableDate(complaint.createdAt)}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wide ${getStatusBadgeClasses(
                            complaint.status
                          )}`}
                        >
                          {formatStatusLabel(complaint.status)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5">
                {isLoadingComplaintDetails ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-b-transparent border-blue-600"></div>
                  </div>
                ) : complaintDetails ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
                          Complaint No.
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {complaintDetails.complaint.complaintNumber}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadgeClasses(
                          complaintDetails.complaint.status
                        )}`}
                      >
                        {formatStatusLabel(complaintDetails.complaint.status)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-gray-700">
                      {complaintDetails.complaint.description}
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2">
                      <div className="rounded-xl border border-white bg-white/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                          Subject
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {complaintDetails.complaint.subject}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                          Priority
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatStatusLabel(
                            complaintDetails.complaint.priority
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                          Department
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {complaintDetails.complaint.assignedDepartment
                            ? formatStatusLabel(
                                complaintDetails.complaint.assignedDepartment
                              )
                            : "Not assigned"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white bg-white/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                          Filed On
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {formatReadableDate(
                            complaintDetails.complaint.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500">
                        History
                      </h4>
                      {complaintDetails.history?.length ? (
                        <div className="mt-3 space-y-3 max-h-52 overflow-y-auto pr-1">
                          {complaintDetails.history.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-xl border border-white bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">
                                  {formatStatusLabel(entry.status)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatReadableDate(entry.updatedAt)}
                                </span>
                              </div>
                              {entry.remarks && (
                                <p className="mt-1 text-xs text-gray-600">
                                  {entry.remarks}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">
                          No history available yet.
                        </p>
                      )}
                    </div>

                    {complaintDetails.documents?.length ? (
                      <p className="mt-4 text-xs text-gray-500">
                        {complaintDetails.documents.length} attachment
                        {complaintDetails.documents.length > 1 ? "s" : ""}{" "}
                        linked with this grievance.
                      </p>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Select a grievance to view its details.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogBox>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 max-w-md w-full overflow-hidden">
            <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/80">
                  Citizen Access
                </p>
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "inherit" }}
                >
                  {otpSent ? "Enter OTP" : "Citizen Login"}
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  {otpSent
                    ? `OTP sent to ${mobileNumber}`
                    : "Enter your mobile number to receive an OTP"}
                </p>
              </div>
              <button
                onClick={closeLoginModal}
                className="absolute top-5 right-6 text-white/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-semibold text-gray-700"
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 bg-white/80"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleSendOtp();
                        }
                      }}
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={closeLoginModal}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={isLoading || mobileNumber.trim().length < 10}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-semibold text-gray-700"
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
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-transparent focus:ring-2 focus:ring-blue-500 bg-white/80"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isLoading) {
                          handleVerifyOtp();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setError("");
                      }}
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.trim().length < 4}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 max-w-md w-full overflow-hidden">
            <div className="relative bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-5">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/80">
                    Citizen Profile
                  </p>
                  <h2
                    className="text-2xl font-bold"
                    style={{ fontFamily: "inherit" }}
                  >
                    {citizenProfile?.name || user.name || "Citizen"}
                  </h2>
                  <p className="text-sm text-white/80">
                    {citizenProfile?.mobileNumber ||
                      user.mobileNumber ||
                      user.email ||
                      "User"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeProfileModal}
                className="absolute top-5 right-6 text-white/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {profileError && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-sm text-green-700">
                    {profileSuccess}
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
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700"
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
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700"
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
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-semibold text-gray-700"
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
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="pincode"
                        className="block text-sm font-semibold text-gray-700"
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
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isLoading}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Updating..." : "Update Profile"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
                      {citizenProfile?.name && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Name</span>
                          <span className="font-semibold text-gray-900">
                            {citizenProfile.name}
                          </span>
                        </div>
                      )}
                      {citizenProfile?.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Email</span>
                          <span className="font-semibold text-gray-900">
                            {citizenProfile.email}
                          </span>
                        </div>
                      )}
                      {citizenProfile?.address && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Address</span>
                          <span className="font-semibold text-gray-900 text-right">
                            {citizenProfile.address}
                          </span>
                        </div>
                      )}
                      {citizenProfile?.pincode && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pincode</span>
                          <span className="font-semibold text-gray-900">
                            {citizenProfile.pincode}
                          </span>
                        </div>
                      )}
                      {citizenProfile?.mobileNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Mobile</span>
                          <span className="font-semibold text-gray-900">
                            {citizenProfile.mobileNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pt-1">
                      <button
                        onClick={handleEditProfile}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          closeProfileModal();
                          logout();
                        }}
                        className="w-full rounded-xl bg-red-600 px-4 py-3 text-white font-semibold hover:bg-red-700 transition-colors"
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
