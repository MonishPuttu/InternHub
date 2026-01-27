"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Schedule } from "@mui/icons-material";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/dateUtils";

/**
 * Animates timeline progress from first node → current node
 * Logic unchanged, only pacing tuned
 */
function TimelineAnimator({ events, onStep }) {
  useEffect(() => {
    if (!events || events.length === 0) return;

    const now = Date.now();
    let target = -1;

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      if (ev.event_date) {
        if (new Date(ev.event_date).getTime() <= now) {
          target = i;
        }
      } else {
        target = i;
      }
    }

    if (target < 0) target = 0;

    let cancelled = false;
    const timers = [];

    for (let i = 0; i <= target; i++) {
      timers.push(
        setTimeout(() => {
          if (!cancelled) onStep(i);
        }, i * 300) // ⏳ smoother pacing
      );
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [events, onStep]);

  return null;
}

export default function VerticalInlineTimeline({ postId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedIndex, setAnimatedIndex] = useState(-1);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setAnimatedIndex(-1);

    try {
      const res = await apiRequest(`/api/posts/applications/${postId}`);
      if (!res?.ok) return;

      const post = res.application;
      const evs = [];

      if (post.application_date) {
        evs.push({
          id: `created-${post.id}`,
          title: "Post Created",
          description: post.notes || null,
          event_date: post.application_date,
          event_type: "created",
        });
      }

      if (Array.isArray(post.stages)) {
        post.stages.forEach((s, idx) => {
          evs.push({
            id: `stage-${idx}`,
            title: s.name || `Stage ${idx + 1}`,
            description: s.notes || null,
            event_date: s.date || s.completed_at || null,
            event_type: s.status || "stage",
          });
        });
      }

      if (post.interview_date) {
        evs.push({
          id: `interview-${post.id}`,
          title: "Technical Interview",
          event_date: post.interview_date,
          event_type: "completed",
        });
      }

      if (post.application_deadline) {
        evs.push({
          id: `deadline-${post.id}`,
          title: "Application Deadline",
          event_date: post.application_deadline,
          event_type: "deadline",
        });
      }

      evs.sort((a, b) => {
        const da = a.event_date ? new Date(a.event_date).getTime() : 0;
        const db = b.event_date ? new Date(b.event_date).getTime() : 0;
        return da - db;
      });

      setEvents(evs);
    } catch (err) {
      console.error("Timeline fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  if (loading) {
    return (
      <Box sx={{ py: 3, textAlign: "center" }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  if (!events.length) return null;

  return (
    <Box sx={{ pl: 2 }}>
      {events.map((ev, i) => {
        const isCompleted = i < animatedIndex;
        const isCurrent = i === animatedIndex;
        const isLast = i === events.length - 1;

        return (
          <Box
            key={ev.id}
            sx={{ display: "flex", mb: isLast ? 0 : 3 }}
          >
            {/* Timeline rail */}
            <Box
              sx={{
                width: 36,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Node */}
              <Box
                sx={{
                  width: isCurrent ? 22 : 18,
                  height: isCurrent ? 22 : 18,
                  borderRadius: "50%",
                  bgcolor: isCompleted
                    ? "#22c55e"
                    : isCurrent
                    ? "#8b5cf6"
                    : "transparent",
                  border: "1.5px solid",
                  borderColor: isCompleted
                    ? "#22c55e"
                    : isCurrent
                    ? "#8b5cf6"
                    : "rgba(255,255,255,0.25)",
                  transition:
                    "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: isCurrent
                    ? "pulse 1.6s ease-out infinite"
                    : "none",
                  "@keyframes pulse": {
                    "0%": {
                      boxShadow:
                        "0 0 0 0 rgba(139,92,246,0.55)",
                    },
                    "70%": {
                      boxShadow:
                        "0 0 0 10px rgba(139,92,246,0)",
                    },
                    "100%": {
                      boxShadow:
                        "0 0 0 0 rgba(139,92,246,0)",
                    },
                  },
                }}
              />

              {/* Connector */}
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    height: 32, // ✅ fixed height (prevents disappearing)
                    mt: 0.75,
                    bgcolor: isCompleted
                      ? "#22c55e"
                      : isCurrent
                      ? "#8b5cf6"
                      : "rgba(255,255,255,0.18)",
                    transition:
                      "background-color 300ms ease",
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ pl: 2, flex: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {ev.title}
                </Typography>
                <Chip
                  label={ev.event_type}
                  size="small"
                  sx={{
                    bgcolor: "#8b5cf620",
                    fontSize: "0.65rem",
                  }}
                />
              </Box>

              {ev.event_date && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  <Schedule
                    sx={{ fontSize: 12, mr: 0.5 }}
                  />
                  {formatDate(ev.event_date)}
                </Typography>
              )}

              {ev.description && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: "text.secondary",
                  }}
                >
                  {ev.description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}

      {/* Animator */}
      <TimelineAnimator
        events={events}
        onStep={setAnimatedIndex}
      />
    </Box>
  );
}
