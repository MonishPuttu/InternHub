"use client";
import React, { useEffect, useRef } from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { useTheme } from "@mui/material/styles";

const Hero = () => {
  const theme = useTheme();
  const canvasRef = useRef(null);

  const handleOnClick = () => {
    redirect("/signup");
  };

  const handleOnClickSignIn = () => {
    redirect("/signin");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots = [];
    let mouse = { x: 0, y: 0 };
    let animationFrameId;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    // Initialize dots in a grid pattern
    const initDots = () => {
      dots = [];
      const rows = 40;
      const cols = 50;
      const spacingX = canvas.width / (cols + 1);
      const spacingY = canvas.height / (rows + 1);

      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          const x = j * spacingX;
          const y = i * spacingY;
          
          dots.push({
            x: x,
            y: y,
            baseX: x,
            baseY: y,
          });
        }
      }
    };

    // Handle mouse move
    const handleMouseMove = (e) => {
      mouse = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const magnetStrength = 150; // Distance of magnetic effect

      dots.forEach((dot) => {
        // Calculate distance from mouse to dot center
        const dx = mouse.x - dot.baseX;
        const dy = mouse.y - dot.baseY;
        const dist = Math.hypot(dx, dy);

        // Apply magnetic effect
        if (dist < magnetStrength) {
          // Calculate angle pointing away from cursor
          const angleToMouse = Math.atan2(dy, dx);
          const force = (1 - dist / magnetStrength);
          
          // Move dot slightly away from cursor
          const moveDistance = force * 10;
          dot.x = dot.baseX - Math.cos(angleToMouse) * moveDistance;
          dot.y = dot.baseY - Math.sin(angleToMouse) * moveDistance;
        } else {
          // Return to base position
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
        }

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 0.8, 0, Math.PI * 2); // Circle with radius 0.8 (tiny)
        ctx.fillStyle = "rgba(130, 160, 200, 0.4)"; // Blue/cyan tinted dots
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0B0F26 0%, #141A3A 100%)",
        color: "#fff",
        pt: { xs: 12, md: 16 },
        pb: { xs: 12, md: 16 },
      }}
    >
      {/* Magnetic Dots Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={{ xs: 4, md: 6, lg: 8 }} alignItems="center">
          {/* LEFT CONTENT */}
          <Grid item xs={12} md={6}>
            

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                fontWeight: 800,
                mb: 2,
                lineHeight: 1.15,
              }}
            >
              Welcome to{" "}
              <Box component="span" sx={{ color: "#a883ff" }}>
                InternHub
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mb: 4,
                maxWidth: 600,
                fontSize: { xs: "1rem", md: "1.15rem" },
                lineHeight: 1.7,
              }}
            >
              Simplify and modernize internships and placements with AI-powered
              matching, automated workflows, and verified digital profiles. One
              platform for students, institutions, and recruiters.
            </Typography>

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleOnClick}
                endIcon={<ArrowRight />}
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.5,
                  background:
                    "linear-gradient(90deg, #9f6eff 0%, #8358ff 100%)",
                  boxShadow: "0 0 20px rgba(155,106,255,0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #8358ff 0%, #9f6eff 100%)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 0 30px rgba(155,106,255,0.6)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Sign Up Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleOnClickSignIn}
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  borderWidth: 2,
                  color: "#fff",
                  borderColor: "rgba(155,106,255,0.4)",
                  px: 3.5,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(155,106,255,0.1)",
                    borderColor: "#9f6eff",
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            {/* Stats */}
            <Grid
              container
              spacing={3}
              sx={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                pt: 4,
              }}
            >
              {[
                { value: "10K+", label: "Students" },
                { value: "500+", label: "Companies" },
                { value: "95%", label: "Success Rate" },
              ].map((stat) => (
                <Grid item xs={4} key={stat.label}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "#b394ff",
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                  >
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;