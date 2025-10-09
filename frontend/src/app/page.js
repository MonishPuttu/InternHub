"use client";
import React from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white relative">
      {/* Decorative background blur circles */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-400 rounded-full opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center max-w-lg w-[90%] border border-white/20"
      >
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
          Intern<span className="text-pink-300">Hub</span>
        </h1>
        <p className="text-white/80 text-lg mb-8">
          Empower your college’s placement process — connecting students,
          recruiters, and opportunities in one unified portal.
        </p>

        <div className="flex justify-center gap-6">
          <button
            className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-md hover:bg-indigo-100 transition-all"
            onClick={() => (window.location.href = "/signin")}
          >
            Sign In
          </button>
          <button
            className="px-6 py-3 bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-800 transition-all"
            onClick={() => (window.location.href = "/signup")}
          >
            Sign Up
          </button>
        </div>

        <p className="text-sm text-white/60 mt-10">
          Designed for Colleges • Built for Opportunities
        </p>
      </motion.div>
    </div>
  );
}
