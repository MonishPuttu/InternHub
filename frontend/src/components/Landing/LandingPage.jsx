"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, IconButton, Avatar } from "@mui/material";
import {
  GraduationCap,
  Calendar,
  BarChart3,
  MessageSquare,
  FileText,
  Building2,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  CheckCircle,
} from "lucide-react";

// Navbar Component
const Navbar = ({ onSignIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = ["Solutions", "Resources", "Features", "Testimonials", "Contact"];

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-30px)",
        opacity: visible ? 1 : 0,
        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1000,
        width: { xs: "calc(100% - 32px)", md: "auto" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 2, md: 4 },
          py: 1.25,
          px: { xs: 2.5, md: 3 },
          bgcolor: "#ffffff",
          borderRadius: "100px",
          boxShadow: "0 2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={17} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", letterSpacing: "-0.01em" }}>
            InternHub
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3.5, alignItems: "center" }}>
          {navLinks.map((item) => (
            <Typography
              key={item}
              component="a"
              href={`#${item.toLowerCase()}`}
              sx={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "color 0.2s ease",
                "&:hover": { color: "#0f172a" },
              }}
            >
              {item}
            </Typography>
          ))}
        </Box>

        {/* Login Button */}
        <Button
          variant="text"
          onClick={onSignIn}
          sx={{
            display: { xs: "none", md: "flex" },
            color: "#0f172a",
            fontSize: "0.875rem",
            fontWeight: 600,
            textTransform: "none",
            px: 2,
            py: 0.75,
            borderRadius: "8px",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Log in
        </Button>

        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          sx={{ display: { xs: "flex", md: "none" }, color: "#0f172a", p: 0.5 }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </IconButton>
      </Box>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 1,
            mt: 1.5,
            p: 2,
            bgcolor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {navLinks.map((item) => (
            <Typography
              key={item}
              component="a"
              href={`#${item.toLowerCase()}`}
              onClick={() => setMobileMenuOpen(false)}
              sx={{ color: "#64748b", textDecoration: "none", py: 1, fontSize: "0.9rem" }}
            >
              {item}
            </Typography>
          ))}
          <Button variant="text" onClick={onSignIn} sx={{ mt: 1, color: "#0f172a", fontWeight: 600 }}>
            Log in
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Student Profile Card (Left)
const StudentProfileCard = ({ visible }) => (
  <Box
    sx={{
      width: { xs: 260, sm: 280, md: 300 },
      bgcolor: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
      overflow: "hidden",
      transform: visible ? "rotate(-3deg) translateY(0)" : "rotate(-3deg) translateY(60px)",
      opacity: visible ? 1 : 0,
      transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.8s, box-shadow 0.3s ease",
      animation: visible ? "floatLeft 6s ease-in-out infinite 2s" : "none",
      "@keyframes floatLeft": {
        "0%, 100%": { transform: "rotate(-3deg) translateY(0)" },
        "50%": { transform: "rotate(-3deg) translateY(-12px)" },
      },
      "&:hover": { 
        transform: "rotate(-3deg) translateY(-8px) scale(1.02)",
        boxShadow: "0 20px 60px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)",
        animationPlayState: "paused",
      },
    }}
  >
    {/* Card Header */}
    <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GraduationCap size={14} color="#fff" strokeWidth={2.5} />
      </Box>
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>InternHub</Typography>
      <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#e2e8f0" }} />
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#e2e8f0" }} />
      </Box>
    </Box>

    {/* Card Content */}
    <Box sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", mb: 1.5 }}>
        Student Profile Overview
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.7, mb: 2.5 }}>
        The student dashboard provides comprehensive tools for managing applications, tracking interviews, and discovering opportunities within your campus placement ecosystem.
      </Typography>

      {/* Feature List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {[
          { icon: FileText, text: "My Applications", color: "#8b5cf6" },
          { icon: Calendar, text: "Interview Schedule", color: "#0ea5e9" },
          { icon: BarChart3, text: "Analytics Dashboard", color: "#10b981" },
        ].map((item, idx) => (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1,
              borderRadius: "10px",
              transition: "background 0.2s ease",
              "&:hover": { bgcolor: "#f8fafc" },
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: `${item.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon size={14} color={item.color} strokeWidth={2} />
            </Box>
            <Typography sx={{ fontSize: "0.78rem", color: "#334155", fontWeight: 500 }}>{item.text}</Typography>
            <ChevronRight size={14} color="#94a3b8" style={{ marginLeft: "auto" }} />
          </Box>
        ))}
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, pt: 2, borderTop: "1px solid #f1f5f9" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.75,
            bgcolor: "#f8fafc",
            borderRadius: "8px",
            transition: "background 0.2s ease",
            cursor: "pointer",
            "&:hover": { bgcolor: "#f1f5f9" },
          }}
        >
          <MessageSquare size={12} color="#64748b" />
          <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>Chat</Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.75,
            bgcolor: "#f8fafc",
            borderRadius: "8px",
            transition: "background 0.2s ease",
            cursor: "pointer",
            "&:hover": { bgcolor: "#f1f5f9" },
          }}
        >
          <Building2 size={12} color="#64748b" />
          <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>Companies</Typography>
        </Box>
      </Box>
    </Box>

    {/* Card Footer */}
    <Box sx={{ px: 2.5, py: 2, bgcolor: "#fafbfc", borderTop: "1px solid #f1f5f9" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ width: 24, height: 24, bgcolor: "#8b5cf6", fontSize: "0.6rem", fontWeight: 600 }}>SP</Avatar>
        <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Student Placement Portal for...</Typography>
      </Box>
    </Box>
  </Box>
);

// Recruiter Card (Right)
const RecruiterCard = ({ visible }) => (
  <Box
    sx={{
      width: { xs: 260, sm: 280, md: 300 },
      bgcolor: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
      overflow: "hidden",
      transform: visible ? "rotate(3deg) translateY(0)" : "rotate(3deg) translateY(60px)",
      opacity: visible ? 1 : 0,
      transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s, opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1s, box-shadow 0.3s ease",
      animation: visible ? "floatRight 6s ease-in-out infinite 2.3s" : "none",
      "@keyframes floatRight": {
        "0%, 100%": { transform: "rotate(3deg) translateY(0)" },
        "50%": { transform: "rotate(3deg) translateY(-12px)" },
      },
      "&:hover": { 
        transform: "rotate(3deg) translateY(-8px) scale(1.02)",
        boxShadow: "0 20px 60px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)",
        animationPlayState: "paused",
      },
    }}
  >
    {/* Card Header */}
    <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <GraduationCap size={14} color="#fff" strokeWidth={2.5} />
      </Box>
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>InternHub</Typography>
    </Box>

    {/* Card Content */}
    <Box sx={{ p: 2.5 }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          bgcolor: "#faf5ff",
          borderRadius: "20px",
          border: "1px solid #ede9fe",
          mb: 2,
        }}
      >
        <Briefcase size={12} color="#8b5cf6" />
        <Typography sx={{ fontSize: "0.68rem", color: "#8b5cf6", fontWeight: 600 }}>
          Recruiter Requirements for Campus
        </Typography>
      </Box>

      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", mb: 2 }}>Requirements :</Typography>

      {/* Requirements List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {[
          "Strong experience with placement platforms (InternHub, etc.)",
          "Proficiency in candidate screening, data analytics, and AI-based matching.",
          "In-depth knowledge of campus recruitment, APIs, and integration techniques.",
          "Familiarity with training modules and assessment tools.",
          "Experience with student data management, analytics, and reporting.",
        ].map((text, idx) => (
          <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <CheckCircle size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", lineHeight: 1.6 }}>{text}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </Box>
);

// Hero Section
const HeroSection = ({ onSignUp, onDemo }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      component="section"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        position: "relative",
        overflow: "hidden",
        pt: { xs: 8, md: 0 },
      }}
    >
      {/* Subtle Background Gradient */}
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "140%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.04) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, px: 3 }}>
        {/* Badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            bgcolor: "#faf5ff",
            borderRadius: "100px",
            border: "1px solid #ede9fe",
            mb: 4,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            opacity: visible ? 1 : 0,
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "6px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={11} color="#fff" strokeWidth={2.5} />
          </Box>
          <Typography sx={{ fontSize: "0.8rem", color: "#8b5cf6", fontWeight: 600 }}>
            Campus Placement Platform
          </Typography>
        </Box>

        {/* Main Heading */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
            fontWeight: 700,
            color: "#0f172a",
            lineHeight: 1.15,
            maxWidth: 800,
            mx: "auto",
            mb: 3,
            letterSpacing: "-0.025em",
            transform: visible ? "translateY(0)" : "translateY(30px)",
            opacity: visible ? 1 : 0,
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
          }}
        >
          Campus placement platform
          <br />
          <Box component="span" sx={{ color: "#0f172a" }}>
            for students, recruiters and
          </Box>
          <br />
          <Box component="span" sx={{ color: "#0f172a" }}>
            institutions.
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            color: "#64748b",
            maxWidth: 580,
            mx: "auto",
            lineHeight: 1.7,
            mb: 4,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            opacity: visible ? 1 : 0,
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s",
          }}
        >
          Empower your campus with intelligent placement solutions, driving efficiency, connecting talent with
          opportunities, and optimizing the entire recruitment process with advanced analytics.
        </Typography>

        {/* CTA Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mb: { xs: 6, md: 8 },
            transform: visible ? "translateY(0)" : "translateY(30px)",
            opacity: visible ? 1 : 0,
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s",
          }}
        >
          <Button
            variant="contained"
            onClick={onSignUp}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              px: { xs: 3.5, md: 4 },
              py: 1.5,
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "12px",
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#7c3aed",
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.45)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            onClick={onDemo}
            sx={{
              color: "#0f172a",
              borderColor: "#e2e8f0",
              borderWidth: 1.5,
              px: { xs: 3.5, md: 4 },
              py: 1.5,
              fontSize: "0.9rem",
              fontWeight: 600,
              borderRadius: "12px",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "#8b5cf6",
                bgcolor: "rgba(139, 92, 246, 0.04)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Get a Demo
          </Button>
        </Box>
      </Box>

      {/* Feature Cards */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: { xs: 2, md: 4 },
          flexWrap: { xs: "wrap", md: "nowrap" },
          position: "relative",
          zIndex: 1,
          px: 2,
        }}
      >
        <StudentProfileCard visible={visible} />
        <RecruiterCard visible={visible} />
      </Box>
    </Box>
  );
};

// Main Landing Page Component
export default function LandingPage() {
  const router = useRouter();

  const handleSignUp = () => router.push("/signup");
  const handleSignIn = () => router.push("/signin");
  const handleDemo = () => router.push("/signup");

  return (
    <Box sx={{ bgcolor: "#fff", height: "100vh", overflow: "hidden" }}>
      <Navbar onSignIn={handleSignIn} />
      <HeroSection onSignUp={handleSignUp} onDemo={handleDemo} />
    </Box>
  );
}
