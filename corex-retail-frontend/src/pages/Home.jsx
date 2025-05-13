import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const backgroundPosition = `center ${scrollY * 0.5}px`;

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/icons/BGIMAGE.png')",
          backgroundAttachment: "fixed",
          opacity: 0.15,
        }}
      />

      {/* Hero Section with transparent overlay */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-700/60 to-black/70 z-10 pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-20 py-20">
          <div
            className="max-w-3xl mx-auto text-center"
            style={{
              transform: `translateY(${Math.min(scrollY * 0.2, 50)}px)`,
              opacity: Math.max(1 - scrollY * 0.002, 0),
            }}
          >
            <h1 className="text-6xl font-bold text-white mb-6 transition-all duration-500 ease-out">
              CoreX Retail Management System
            </h1>
            <p className="text-2xl text-white/90 mb-10 transition-all duration-500 ease-out">
              A comprehensive solution for modern retail businesses. Manage
              inventory, staff, sales, and more in one unified platform.
            </p>
            <div className="flex flex-wrap gap-5 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-10 rounded-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 animate-bounce cursor-pointer"
            onClick={() =>
              document
                .getElementById("features")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section with scroll reveal effects */}
      <div id="features" className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Core Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                scrollY={scrollY}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial/Quote Section with scroll-triggered animation */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 relative z-10">
        <div
          className="container mx-auto px-6"
          style={{
            transform: `translateY(${Math.max(0, (scrollY - 1200) * 0.1)}px)`,
            opacity: Math.min(1, Math.max(0, (scrollY - 1100) / 300)),
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-16 h-16 text-blue-300 mb-8 mx-auto"
            >
              <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.039 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
            </svg>
            <blockquote className="text-3xl font-medium text-white mb-10 leading-relaxed">
              "CoreX Retail has completely transformed how we manage our store.
              The comprehensive features and user-friendly interface make daily
              operations smooth and efficient."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">Karan Modi</p>
                <p className="text-blue-200">
                  Store Manager, Retail Excellence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with hover effect on button */}
      <div className="py-24 bg-gray-50 relative z-10">
        <div
          className="container mx-auto px-6 text-center"
          style={{
            transform: `scale(${Math.min(
              1,
              Math.max(0.8, 1 - (scrollY - 2000) * 0.0005)
            )})`,
            opacity: Math.min(1, Math.max(0.5, 1 - (scrollY - 2000) * 0.001)),
          }}
        >
          <h2 className="text-4xl font-bold mb-6">
            Ready to improve your retail business?
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
            Join the growing number of retail businesses using CoreX Retail to
            streamline operations and boost sales.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl inline-flex items-center group"
          >
            <span>Get Started Today</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 ml-2 transition-transform duration-500 transform group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Feature Card Component with scroll reveal
const FeatureCard = ({ feature, index, scrollY }) => {
  // Calculate animation based on scroll position and card index
  const cardVisibilityPoint = 400 + index * 50;
  const opacity = Math.min(
    1,
    Math.max(0, (scrollY - cardVisibilityPoint) / 300)
  );
  const translateY = Math.max(0, 50 - (scrollY - cardVisibilityPoint) / 5);

  return (
    <div
      className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
      style={{
        opacity: opacity,
        transform: `translateY(${translateY}px)`,
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-8`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-8 h-8 ${feature.iconColor}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
      <p className="text-gray-600 mb-6">{feature.description}</p>
      <ul className="text-gray-600 space-y-3 mb-4">
        {feature.features.map((item, i) => (
          <li key={i} className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-green-500 mr-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Feature data
const featuresData = [
  {
    title: "Inventory Management",
    description:
      "Track stock levels, manage product information, and get alerts for low inventory.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    features: [
      "Real-time stock tracking",
      "Low stock alerts",
      "Product categorization",
    ],
  },
  {
    title: "Staff Management",
    description:
      "Manage employees, track performance, and handle staff scheduling efficiently.",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
    features: [
      "Employee profiles",
      "Staff performance tracking",
      "Role management",
    ],
  },
  {
    title: "Rosters & Scheduling",
    description:
      "Create and manage staff schedules, track hours, and optimize workforce allocation.",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z",
    features: [
      "Visual schedule planning",
      "Shift approval workflow",
      "Automatic notifications",
    ],
  },
  {
    title: "Sales Management",
    description:
      "Track transactions, analyze sales performance, and set targets for growth.",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    features: ["Sales dashboard", "Target management", "Performance analytics"],
  },
  {
    title: "Reporting & Analytics",
    description:
      "Generate comprehensive reports on sales, inventory, and staff performance.",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    features: [
      "Customizable reports",
      "Data visualization",
      "Export functionality",
    ],
  },
  {
    title: "Smart Notifications",
    description:
      "Stay informed with automated alerts for important events and tasks.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
    features: [
      "Low stock alerts",
      "Schedule reminders",
      "Custom alert settings",
    ],
  },
];

export default Home;
