"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Card,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Collapse,
} from "@mui/material";
import { Business, Schedule, CheckCircle, ArrowBack } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/dateUtils";

function TimelineAnimator({ events, onStep }) {
  useEffect(() => {
    if (!events || events.length === 0) return;

    const now = Date.now();
    let target = -1;
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (ev.event_date) {
        const t = new Date(ev.event_date).getTime();
        if (t <= now) target = i;
      } else {
        target = i;
      }
    }
    if (target === -1) target = Math.min(events.length - 1, 0);

    let cancelled = false;
    const timers = [];
    // animate from 0 -> target (inclusive)
    for (let i = 0; i <= target; i++) {
      timers.push(
        setTimeout(() => {
          if (!cancelled) onStep(i);
        }, 200 * i)
      );
    }

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, [events, onStep]);

  return null;
}

export default function PostTimelineDetail({ params }) {
  const routeParams = useParams();
  const postId = (params && params.postId) || routeParams?.postId;
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [animatedIndex, setAnimatedIndex] = useState(-1);

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

  // Build timeline events from post data
  const events = [];

  // Application / Post created
  if (post.application_date) {
    events.push({
      id: `post-${post.id}`,
      title: "Post Created",
      description: post.notes || null,
      event_date: post.application_date,
      event_type: "created",
    });
  }

  // Stages (if any)
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

  // Interview date
  if (post.interview_date) {
    events.push({
      id: `interview-${post.id}`,
      title: "Interview Scheduled",
      description: null,
      event_date: post.interview_date,
      event_type: "interview_scheduled",
    });
  }

  // Deadline
  if (post.application_deadline) {
    events.push({
      id: `deadline-${post.id}`,
      title: "Application Deadline",
      description: null,
      event_date: post.application_deadline,
      event_type: "deadline",
    });
  }

  // Sort events by date (fallback to created order)
  const sorted = events
    .slice()
    .sort((a, b) => {
      const da = a.event_date ? new Date(a.event_date).getTime() : 0;
      const db = b.event_date ? new Date(b.event_date).getTime() : 0;
      return da - db;
    });

  // Helper to compute current node index (last event in the past or with a date)
  const computeCurrentIndex = (list) => {
    if (!list || list.length === 0) return 0;
    const now = Date.now();
    let idx = -1;
    for (let i = 0; i < list.length; i++) {
      const ev = list[i];
      if (ev.event_date) {
        const t = new Date(ev.event_date).getTime();
        if (t <= now) idx = i; // last past or present
      } else {
        idx = i;
      }
    }
    return idx === -1 ? Math.min(list.length - 1, 0) : idx;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ color: "#8b5cf6", mb: 3 }}
      >
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
              {post.positions && post.positions[0]?.title
                ? post.positions[0].title
                : post.position || "Position"}
            </Typography>
          </Box>
          {post.package_offered && (
            <Chip
              label={`₹${post.package_offered} LPA`}
              sx={{ bgcolor: "#10b98120", color: "#10b981", fontWeight: 600 }}
            />
          )}
        </Box>
      </Card>

      <Card sx={{ p: 4, border: "1px solid #334155" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>Post Timeline</Box>
            <Button
              size="small"
              onClick={async () => {
                const willExpand = !expanded;
                setExpanded(willExpand);
                if (willExpand) {
                  // prepare timeline data if not ready
                  if (!timelineData) {
                    setTimelineLoading(true);
                    try {
                      const res = await apiRequest(`/api/posts/applications/${postId}`);
                      if (res && res.ok) {
                        const p = res.application;
                        const evs = [];
                        if (p.application_date) {
                          evs.push({
                            id: `post-${p.id}`,
                            title: "Post Created",
                            description: p.notes || null,
                            event_date: p.application_date,
                            event_type: "created",
                          });
                        }
                        if (Array.isArray(p.stages) && p.stages.length > 0) {
                          p.stages.forEach((s, idx) => {
                            evs.push({
                              id: `stage-${idx}`,
                              title: s.name || `Stage ${idx + 1}`,
                              description: s.notes || null,
                              event_date: s.date || s.completed_at || null,
                              event_type: s.status || "stage",
                            });
                          });
                        }
                        if (p.interview_date) {
                          evs.push({
                            id: `interview-${p.id}`,
                            title: "Interview Scheduled",
                            description: null,
                            event_date: p.interview_date,
                            event_type: "interview_scheduled",
                          });
                        }
                        if (p.application_deadline) {
                          evs.push({
                            id: `deadline-${p.id}`,
                            title: "Application Deadline",
                            description: null,
                            event_date: p.application_deadline,
                            event_type: "deadline",
                          });
                        }

                        const sortedE = evs
                          .slice()
                          .sort((a, b) => {
                            const da = a.event_date ? new Date(a.event_date).getTime() : 0;
                            const db = b.event_date ? new Date(b.event_date).getTime() : 0;
                            return da - db;
                          });

                        setTimelineData(sortedE);
                        // force remount key so animation runs every open
                        setExpandedTimelineId(Date.now());
                        setAnimatedIndex(-1);
                      }
                    } catch (e) {
                      console.error("Error fetching timeline:", e);
                    } finally {
                      setTimelineLoading(false);
                    }
                  } else {
                    // already have timelineData: still force remount to replay animation
                    setExpandedTimelineId(Date.now());
                    setAnimatedIndex(-1);
                  }
                }
              }}
            >
              {expanded ? "Hide" : "Show"}
            </Button>
          </Box>
        </Typography>

        <Collapse in={expanded}>
          <Box key={`timeline-${postId}-${expandedTimelineId}`} sx={{ pt: 1 }}>
            {timelineLoading && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            )}

            {timelineData && timelineData.length > 0 && (
              <Box sx={{ position: "relative", pl: 2 }}>
                {timelineData.map((ev, i) => {
                  const targetIndex = computeCurrentIndex(timelineData);
                  const isCompleted = i <= animatedIndex && animatedIndex >= 0;
                  const isCurrent = i === targetIndex && animatedIndex >= targetIndex;
                  const isFuture = i > animatedIndex || animatedIndex < 0;

                  return (
                    <Box key={ev.id} display="flex" sx={{ mb: i === timelineData.length - 1 ? 0 : 3 }}>
                      <Box sx={{ width: 56, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: isCompleted || isCurrent ? "#8b5cf6" : "transparent",
                            color: isCompleted || isCurrent ? "#fff" : "text.secondary",
                            border: "1px solid",
                            borderColor: isCurrent ? "#8b5cf6" : "divider",
                            width: isCurrent ? 44 : 36,
                            height: isCurrent ? 44 : 36,
                            transition: "all 240ms ease",
                          }}
                        >
                          {isCompleted || isCurrent ? <CheckCircle sx={{ fontSize: 18 }} /> : <></>}
                        </Avatar>

                        {i !== timelineData.length - 1 && (
                          <Box
                            sx={{
                              width: 2,
                              flex: 1,
                              bgcolor: i < animatedIndex ? "#8b5cf6" : "divider",
                              mt: 1,
                              transition: "background-color 240ms ease",
                            }}
                          />
                        )}
                      </Box>

                      <Box sx={{ pl: 2, flex: 1 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {ev.title}
                          </Typography>
                          <Chip
                            label={ev.event_type}
                            size="small"
                            sx={{ bgcolor: "#8b5cf620", color: "text.primary" }}
                          />
                        </Box>

                        <Box sx={{ mt: 0.5 }}>
                          {ev.event_date && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                              {formatDate(ev.event_date)}
                            </Typography>
                          )}

                          {ev.description && (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              {ev.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Kick off animation when timelineData mounts */}
            {timelineData && (
              <TimelineAnimator
                events={timelineData}
                onStep={(idx) => setAnimatedIndex(idx)}
              />
            )}
          </Box>
        </Collapse>
      </Card>
    </Container>
  );
}

