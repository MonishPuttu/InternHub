import { Box, Typography, Stack, Chip, Button } from "@mui/material";
import { Business, WorkOutline, ArrowForward } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function RecentApplicationsCard({ applications }) {
  const router = useRouter();

  const getStatusColor = (status) => {
    const colors = {
      interview: "#f59e0b",
      shortlisted: "#06b6d4",
      pending: "#64748b",
      rejected: "#ef4444",
      offer: "#10b981",
    };
    return colors[status] || "#64748b";
  };

  const getTypeColor = (type) => {
    return type === "Internship" ? "#06b6d4" : "#8b5cf6";
  };

  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "#e2e8f0", fontWeight: 600 }}>
            Recent Applications
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            Track your application status and progress
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            onClick={() => router.push("/applications")}
            sx={{
              color: "#8b5cf6",
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            View All
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Company
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Position
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Type
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Stipend
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Applied
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, idx) => (
              <tr key={idx} style={{ borderTop: "1px solid #334155" }}>
                <td style={{ padding: "16px" }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: "#334155",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Business sx={{ color: "#8b5cf6", fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#e2e8f0", fontWeight: 600 }}
                      >
                        {app.company}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {app.location}
                      </Typography>
                    </Box>
                  </Stack>
                </td>
                <td style={{ padding: "16px" }}>
                  <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
                    {app.position}
                  </Typography>
                </td>
                <td style={{ padding: "16px" }}>
                  <Chip
                    label={app.type}
                    size="small"
                    sx={{
                      bgcolor: getTypeColor(app.type),
                      color: "#fff",
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />
                </td>
                <td style={{ padding: "16px" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#e2e8f0", fontWeight: 600 }}
                  >
                    {app.stipend}
                  </Typography>
                </td>
                <td style={{ padding: "16px" }}>
                  <Chip
                    label={app.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(app.status),
                      color: "#fff",
                      fontSize: "0.75rem",
                      height: 24,
                      textTransform: "capitalize",
                    }}
                  />
                </td>
                <td style={{ padding: "16px" }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {app.applied}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {applications.length === 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <WorkOutline sx={{ fontSize: 48, color: "#334155", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            No recent applications yet
          </Typography>
          <Button
            variant="outlined"
            sx={{
              color: "#8b5cf6",
              borderColor: "#334155",
              textTransform: "none",
              "&:hover": { borderColor: "#8b5cf6" },
            }}
          >
            Browse Opportunities
          </Button>
        </Box>
      )}
    </Box>
  );
}
