"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container, Card, Typography, Box, Chip, Avatar, Button, CircularProgress } from "@mui/material";
import { Business, ArrowBack } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";
import HorizontalTimeline from "@/components/Timeline/HorizontalTimeline";
import { formatDate } from "@/lib/dateUtils";

export default function PostTimelineDetail({ params }) {
  const routeParams = useParams();
  const postId = (params && params.postId) || routeParams?.postId;
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
    } else {
      setLoading(false);
      console.warn("postTimelineDetail: missing postId param");
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/applications/${postId}`);
      if (data && data.ok) {
        setPost(data.application);
      }
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Typography color="text.secondary">Post not found</Typography>
      </Container>
    );
  }

  // Build timeline events from post data (normalized to AnimatedTimeline props)
  const events = [];

  if (post.application_date) {
    events.push({
      id: `post-${post.id}`,
      title: "Post Created",
      description: post.notes || null,
      event_date: post.application_date,
      event_type: "created",
    });
  }

  if (Array.isArray(post.stages) && post.stages.length > 0) {
    post.stages.forEach((s, idx) => {
      events.push({
        id: `stage-${idx}`,
        title: s.name || `Stage ${idx + 1}`,
        description: s.notes || null,
        event_date: s.date || s.completed_at || null,
        event_type: s.status || "stage",
      });
    });
  }

  if (post.interview_date) {
    events.push({
      id: `interview-${post.id}`,
      title: "Interview Scheduled",
      description: null,
      event_date: post.interview_date,
      event_type: "interview_scheduled",
    });
  }

  if (post.application_deadline) {
    events.push({
      id: `deadline-${post.id}`,
      title: "Application Deadline",
      description: null,
      event_date: post.application_deadline,
      event_type: "deadline",
    });
  }

  // sort by date ascending; events without a date are pushed to the end
  const sorted = events.slice().sort((a, b) => {
    const da = a.event_date ? new Date(a.event_date).getTime() : Number.POSITIVE_INFINITY;
    const db = b.event_date ? new Date(b.event_date).getTime() : Number.POSITIVE_INFINITY;
    return da - db;
  });

  // map to HorizontalTimeline data shape and derive status for each event
  const now = Date.now();
  const items = sorted.map((ev) => {
    let status = "pending";
    if (ev.event_type === "deadline") status = "deadline";
    else if (ev.event_date && new Date(ev.event_date).getTime() <= now) status = "completed";
    else status = "pending";

    return {
      id: ev.id,
      title: ev.title,
      description: ev.description,
      date: ev.event_date,
      status,
    };
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ color: "#8b5cf6", mb: 3 }}>
        Back
      </Button>

      <Card sx={{ p: 4, mb: 3, border: "1px solid #334155" }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 56, height: 56 }}>
            <Business sx={{ fontSize: 32 }} />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {post.company_name}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {post.positions && post.positions[0]?.title ? post.positions[0].title : post.position || "Position"}
            </Typography>
          </Box>
          {post.package_offered && (
            <Chip label={`₹${post.package_offered} LPA`} sx={{ bgcolor: "#10b98120", color: "#10b981", fontWeight: 600 }} />
          )}
        </Box>
      </Card>

      <Card sx={{ p: 4, border: "1px solid #334155" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Post Timeline
        </Typography>

        <HorizontalTimeline items={items} />
      </Card>
    </Container>
  );
}

