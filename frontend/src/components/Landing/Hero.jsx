"use client";
import React from "react";
import { Box, Button, Container, Grid, Typography, Paper } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { useTheme } from "@mui/material/styles";

const Hero = () => {
  const theme = useTheme();
  const handleOnClick = () => {
    redirect("/signup");
  };

  const handleOnClickSignIn = () => {
    redirect("/signin");
  };

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
      {/* Gradient blobs */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            borderRadius: "50%",
            filter: "blur(160px)",
            opacity: 0.12,
          },
          "&::before": {
            top: 100,
            left: -120,
            width: 500,
            height: 500,
            background: "rgba(155, 106, 255, 0.6)",
          },
          "&::after": {
            bottom: 0,
            right: -150,
            width: 600,
            height: 600,
            background: "rgba(100, 100, 255, 0.5)",
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={{ xs: 4, md: 6, lg: 8 }} alignItems="center">
          {/* LEFT CONTENT */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle1"
              sx={{
                display: "inline-block",
                px: 2.5,
                py: 1,
                borderRadius: "30px",
                backgroundColor: "rgba(155, 106, 255, 0.1)",
                color: "#b394ff",
                fontWeight: 600,
                mb: 3,
              }}
            >
              🚀 AI-Powered Campus Placements
            </Typography>

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
          {/* RIGHT IMAGE
          <Grid item xs={12} md={6}>
            <Box sx={{ position: "relative", height: "100%", minHeight: 400 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  transition: "transform 0.5s ease",
                  "&:hover": { transform: "scale(1.03)" },
                  height: "100%",
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Ace Graders platform preview"
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    opacity: 0.9,
                  }}
                />
              </Box> */}

          {/* Floating AI card */}
          {/* <Paper
                elevation={8}
                sx={{
                  position: "absolute",
                  bottom: { xs: -40, md: -30 },
                  left: { xs: "50%", md: "auto" },
                  right: { xs: "auto", md: -30 },
                  transform: {
                    xs: "translateX(-50%)",
                    md: "none",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 3,
                  py: 2.5,
                  borderRadius: "14px",
                  backgroundColor: "rgba(30,35,70,0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(155,106,255,0.3)",
                  color: "#fff",
                  maxWidth: 280,
                }}
              > */}
          {/* <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #9f6eff, #7b4dff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    flexShrink: 0,
                  }}
                >
                  AI
                </Box> */}
          {/* <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ fontSize: "0.95rem" }}
            >
              AI-Powered Matching
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}
            >
              Smart recommendations
            </Typography>
          </Box> */}
          {/* </Paper> */}
          {/* </Box>
          </Grid> */}
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
