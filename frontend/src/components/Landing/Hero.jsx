"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  IconButton,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  ArrowRight,
  Menu,
  X,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  BookOpen,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Building2,
  Target,
  Zap,
  Shield,
  Calendar,
  FileText,
  Send,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState('idle');
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'contact'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) return;

    setFormStatus('submitting');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormStatus('success');
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setFormStatus('idle'), 3000);
  };

  const isFormValid = formData.name && formData.email && formData.message;

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Navigation */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 80 } }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', px: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                flex: 1,
              }}
              onClick={() => scrollToSection('home')}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <Briefcase size={24} color="white" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  InternHub
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>
                  Meenakshi College of Engineering
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: activeSection === item.id ? '#6366f1' : '#64748b',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': { color: '#6366f1', bgcolor: 'transparent' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                onClick={() => router.push('/signin')}
                sx={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4f46e5 0%, #7e22ce 100%)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>

            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#1e293b' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer anchor="top" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} sx={{ display: { md: 'none' } }}>
        <Box sx={{ pt: 10, pb: 3 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton onClick={() => scrollToSection(item.id)} sx={{ py: 2 }}>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: activeSection === item.id ? 700 : 500,
                      color: activeSection === item.id ? '#6366f1' : '#64748b',
                      fontSize: '1.125rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push('/signin')}
                sx={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                Sign In
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        id="home"
        component="section"
        sx={{
          pt: { xs: 12, md: 16 },
          pb: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #ddd6fe 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 0.75,
                  bgcolor: '#eef2ff',
                  color: '#6366f1',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  mb: 3,
                }}
              >
                🎓 Empowering MCE Campus Placements
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  mb: 3,
                  color: '#1e293b',
                }}
              >
                <Box component="span" sx={{ color: '#6366f1' }}>
                  InternHub
                </Box>
                <br />
                Your Gateway to
                <br />
                Dream Careers
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.125rem', md: '1.25rem' },
                  color: '#64748b',
                  mb: 4,
                  lineHeight: 1.7,
                }}
              >
                The official placement platform for Meenakshi College of Engineering. Connect with top recruiters, track your
                applications, and accelerate your career journey—all in one seamless platform.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 6 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/signup')}
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    background: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    px: 4,
                    py: 2,
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #4f46e5 0%, #7e22ce 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => scrollToSection('about')}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    borderWidth: 2,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    px: 4,
                    py: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'rgba(99, 102, 241, 0.05)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>

              <Grid container spacing={3} sx={{ borderTop: '1px solid #e2e8f0', pt: 4 }}>
                {[
                  { icon: Users, value: '2000+', label: 'Active Students' },
                  { icon: Building2, value: '150+', label: 'Companies' },
                  { icon: Award, value: '92%', label: 'Placement Rate' },
                ].map((stat, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <stat.icon size={22} color="#6366f1" />
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#6366f1' }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                    borderRadius: 4,
                    transform: 'rotate(3deg)',
                    opacity: 0.2,
                  }}
                />
                <Card
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Briefcase size={24} color="white" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Latest Opportunity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Posted 2 hours ago
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Software Engineering Intern
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      TechCorp Solutions • Bangalore
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 3 }}>
                      <Box sx={{ px: 2, py: 0.5, bgcolor: '#dcfce7', color: '#16a34a', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600 }}>
                        Full-time
                      </Box>
                      <Box sx={{ px: 2, py: 0.5, bgcolor: '#dbeafe', color: '#2563eb', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600 }}>
                        Remote
                      </Box>
                      <Box sx={{ px: 2, py: 0.5, bgcolor: '#f3e8ff', color: '#9333ea', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600 }}>
                        6 LPA
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <Calendar size={18} color="#6366f1" />
                        <Typography variant="body2">Application Deadline: Dec 20, 2025</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                        <Users size={18} color="#6366f1" />
                        <Typography variant="body2">45 students applied</Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
                        fontWeight: 700,
                        py: 1.5,
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #4f46e5 0%, #7e22ce 100%)',
                        },
                      }}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, mb: 2 }}>
              Why Choose <Box component="span" sx={{ color: '#6366f1' }}>InternHub</Box>?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
              Streamline your placement journey with powerful tools designed specifically for MCE students
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: Target,
                title: 'Smart Job Matching',
                desc: 'Get personalized job recommendations based on your skills, interests, and academic performance.',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Tracking',
                desc: 'Monitor your application status from submission to offer letter with live updates and notifications.',
              },
              {
                icon: Shield,
                title: 'Verified Opportunities',
                desc: 'All companies are verified by the placement cell ensuring authentic and quality opportunities.',
              },
              {
                icon: BookOpen,
                title: 'Skill Assessments',
                desc: 'Take tests, build your profile, and showcase your abilities to potential employers.',
              },
              {
                icon: MessageSquare,
                title: 'Direct Communication',
                desc: 'Connect seamlessly with recruiters and placement coordinators through integrated messaging.',
              },
              {
                icon: Zap,
                title: 'Instant Notifications',
                desc: 'Never miss an opportunity with real-time alerts for new postings and application updates.',
              },
            ].map((feature, idx) => (
              <Grid item xs={12} md={6} lg={4} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                    border: '2px solid #e2e8f0',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: '#c7d2fe',
                      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <feature.icon size={32} color="white" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works */}
      <Box
        id="about"
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, mb: 2 }}>
              How It Works
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: 600, mx: 'auto' }}>
              Get placed in just three simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Sign up with your MCE credentials and build a comprehensive profile with your academic records, skills, and achievements.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Browse & Apply',
                desc: 'Explore verified opportunities from top companies, get smart recommendations, and apply with a single click.',
                icon: Briefcase,
              },
              {
                step: '03',
                title: 'Track & Succeed',
                desc: 'Monitor your applications in real-time, prepare with assessments, and land your dream job or internship.',
                icon: TrendingUp,
              },
            ].map((step, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Card
                  sx={{
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h2" sx={{ fontSize: '4rem', fontWeight: 900, opacity: 0.2, mb: 2 }}>
                      {step.step}
                    </Typography>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'white',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <step.icon size={32} color="#6366f1" />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {step.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7 }}>
                      {step.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {[
              { number: '2000+', label: 'Students Registered', icon: Users },
              { number: '150+', label: 'Partner Companies', icon: Building2 },
              { number: '500+', label: 'Jobs Posted', icon: Briefcase },
              { number: '92%', label: 'Placement Success', icon: Award },
            ].map((stat, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 24px rgba(99, 102, 241, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: '#6366f1' }}>
                    <stat.icon size={32} />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#6366f1', mb: 1 }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box
        id="contact"
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, mb: 2 }}>
              Get in <Box component="span" sx={{ color: '#6366f1' }}>Touch</Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Have questions about placements or need support? We're here to help!
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Send us a Message
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Message *"
                    name="message"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    variant="outlined"
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!isFormValid || formStatus === 'submitting'}
                    startIcon={
                      formStatus === 'submitting' ? (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            border: '2px solid white',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />
                      ) : formStatus === 'success' ? (
                        <Check size={20} />
                      ) : (
                        <Send size={20} />
                      )
                    }
                    sx={{
                      py: 2,
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      textTransform: 'none',
                      background:
                        formStatus === 'success'
                          ? '#16a34a'
                          : 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
                      '&:hover': {
                        background:
                          formStatus === 'success'
                            ? '#15803d'
                            : 'linear-gradient(90deg, #4f46e5 0%, #7e22ce 100%)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#cbd5e1',
                        color: '#94a3b8',
                      },
                    }}
                  >
                    {formStatus === 'submitting'
                      ? 'Sending...'
                      : formStatus === 'success'
                        ? 'Message Sent!'
                        : 'Send Message'}
                  </Button>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)' }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Contact Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                    {[
                      {
                        icon: MapPin,
                        title: 'Address',
                        content: 'Placement Cell, Meenakshi College of Engineering\nK.K. Nagar, Chennai, Tamil Nadu 600078',
                      },
                      {
                        icon: Phone,
                        title: 'Phone',
                        content: '+91 44 2374 2651',
                      },
                      {
                        icon: Mail,
                        title: 'Email',
                        content: 'placements@mce.ac.in',
                      },
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2.5 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: '#eef2ff',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <item.icon size={26} color="#6366f1" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                            {item.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      Office Hours
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monday - Friday: 9:00 AM - 5:00 PM
                      <br />
                      Saturday: 9:00 AM - 1:00 PM
                    </Typography>
                  </Box>
                </Card>

                <Card
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <MessageSquare size={40} color="#6366f1" />
                  </Box>
                  <Typography variant="h4" fontWeight={900} gutterBottom>
                    Ready to Start?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                    Join InternHub today and take the first step towards your dream career!
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/signup')}
                    sx={{
                      bgcolor: 'white',
                      color: '#6366f1',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Sign Up Now
                  </Button>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, bgcolor: '#1e293b' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Briefcase size={20} color="white" />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700} color="white">
                  InternHub
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  MCE Placement Portal
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: { xs: 'center', md: 'left' } }}>
              © 2025 InternHub - Meenakshi College of Engineering. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Hero;