import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Building,
  AlertTriangle,
  MessageSquare,
  Eye,
} from "lucide-react";

const Home: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: "Submit Complaints",
      description: "Report issues in your community quickly and easily.",
    },
    {
      icon: Eye,
      title: "Track Progress",
      description: "Monitor the status of your complaints in real-time.",
    },
    {
      icon: Building,
      title: "Department Assignment",
      description:
        "Complaints are automatically routed to the right department.",
    },
    {
      icon: MessageSquare,
      title: "Transparent Communication",
      description: "Stay updated with progress notifications and responses.",
    },
  ];

  const stats = [
    { number: "15K+", label: "Issues Reported" },
    { number: "12K+", label: "Resolved" },
    { number: "8", label: "Departments" },
    { number: "95%", label: "Satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  CityComplaints
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/officer-login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Officer Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Officer Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Report Issues in Your
            <span className="text-blue-600"> Community</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Submit complaints about infrastructure, services, or any issues in
            your area. Track progress and get updates from the relevant
            departments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
            >
              Report an Issue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Track Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works for Citizens
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to report issues and track their resolution in your
              community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Process
            </h2>
            <p className="text-xl text-gray-600">
              From reporting to resolution - see how your complaints are handled
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Report Issue
              </h3>
              <p className="text-gray-600">
                Submit your complaint with photos, location, and description.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Department Assignment
              </h3>
              <p className="text-gray-600">
                Your complaint is automatically assigned to the relevant
                department.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Resolution & Updates
              </h3>
              <p className="text-gray-600">
                Get notified when your issue is resolved and provide feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Report an Issue?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who have successfully reported and
            resolved issues in their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center"
            >
              Report an Issue
              <Zap className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/"
              className="border border-blue-300 hover:border-blue-200 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Track Complaint
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">CityComplaints</span>
              </div>
              <p className="text-gray-400">
                Your voice matters. Report issues and help improve your
                community.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Report Issues</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Infrastructure
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Public Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Environment
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Departments</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Public Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Health & Safety
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Environment
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CityComplaints. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
