import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useInView } from "react-intersection-observer";
import { motion, useScroll, useTransform } from "framer-motion";

// Import Lucide icons
import {
  ChevronDown,
  User,
  CheckCircle,
  ArrowRight,
  Package,
  Users,
  Calendar,
  PoundSterling,
  BarChart,
  Bell,
  Quote,
} from "lucide-react";

const Home = () => {
  // Smooth scrolling state
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  // Scroll to section
  const scrollToFeatures = () => {
    document.getElementById("features").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/icons/BGIMAGE.png')",
          backgroundAttachment: "fixed",
          opacity: 0.15,
        }}
      />

      {/* Hero Section with motion animations */}
      <motion.div
        className="relative min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-700/60 to-black/70 z-10 pointer-events-none"></div>

        <motion.div
          className="container mx-auto px-6 relative z-20 py-20"
          style={{
            opacity: heroOpacity,
            y: heroY,
          }}
        >
          <div className="max-w-100% mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              CoreX Retail Management System
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-10"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              A comprehensive solution for modern retail businesses. Manage
              inventory, staff, sales, and more in one unified platform.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-5 justify-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-8 md:px-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </Link>
              <button
                onClick={scrollToFeatures}
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-4 px-8 md:px-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Scroll down indicator */}
          <motion.div
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
            }}
            onClick={scrollToFeatures}
          >
            <ChevronDown size={40} className="text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Section with animation on scroll */}
      <div id="features" className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            Core Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuresData.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section with animation */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 mx-auto">
              <Quote size={48} className="text-blue-300 mx-auto" />
            </div>

            <blockquote className="text-2xl md:text-3xl font-medium text-white mb-10 leading-relaxed">
              "CoreX Retail has completely transformed how we manage our store.
              The comprehensive features and user-friendly interface make daily
              operations smooth and efficient."
            </blockquote>

            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mr-4">
                <User size={26} className="text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-lg">Karan Modi</p>
                <p className="text-blue-200">
                  System Admin, Retail Excellence
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section with animation */}
      <div className="py-24 bg-gray-50 relative z-10">
        <motion.div
          className="container mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to improve your retail business?
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg">
            Join the growing number of retail businesses using CoreX Retail to
            streamline operations and boost sales.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl inline-flex items-center group"
          >
            <span>Get Started Today</span>
            <ArrowRight
              size={20}
              className="ml-2 transition-transform duration-500 transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ feature, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-50px 0px",
  });

  // Icon component based on feature
  const FeatureIcon = () => {
    switch (feature.icon) {
      case "Package":
        return <Package size={28} className={feature.iconColor} />;
      case "Users":
        return <Users size={28} className={feature.iconColor} />;
      case "Calendar":
        return <Calendar size={28} className={feature.iconColor} />;
      case "PoundSterling":
        return <PoundSterling size={28} className={feature.iconColor} />;
      case "BarChart":
        return <BarChart size={28} className={feature.iconColor} />;
      case "Bell":
        return <Bell size={28} className={feature.iconColor} />;
      default:
        return <Package size={28} className={feature.iconColor} />;
    }
  };

  return (
    <motion.div
      ref={ref}
      className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <div
        className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mb-8`}
      >
        <FeatureIcon />
      </div>
      <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
      <p className="text-gray-600 mb-6">{feature.description}</p>
      <ul className="text-gray-600 space-y-3 mb-4">
        {feature.features.map((item, i) => (
          <li key={i} className="flex items-center">
            <CheckCircle
              size={18}
              className="text-green-500 mr-3 flex-shrink-0"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
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
    icon: "Package",
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
    icon: "Users",
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
    icon: "Calendar",
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
    icon: "PoundSterling",
    features: ["Sales - Target Dashboard", "RealTime Sales Forecasting", "Performance analytics"],
  },
  {
    title: "Reporting & Analytics",
    description:
      "Generate comprehensive reports on sales, inventory, and staff performance.",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
    icon: "BarChart",
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
    icon: "Bell",
    features: [
      "Low stock alerts",
      "Schedule reminders",
      "Custom alert settings",
    ],
  },
];

export default Home;
