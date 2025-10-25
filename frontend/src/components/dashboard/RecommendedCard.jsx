import { Box, Typography, Stack, Chip, Button } from "@mui/material";
import { TrendingUp, Business } from "@mui/icons-material";

export default function RecommendedCard({ opportunities }) {
  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "#e2e8f0", fontWeight: 600, mb: 3 }}
      >
        Recommended for You
      </Typography>

      <Stack spacing={2}>
        {opportunities.map((opp, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2.5,
              borderRadius: 1.5,
              border: "1px solid #334155",
              "&:hover": { borderColor: "#8b5cf6", bgcolor: "#0f172a" },
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack direction="row" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: "#334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Business sx={{ color: "#8b5cf6", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e2e8f0", fontWeight: 600, mb: 0.5 }}
                  >
                    {opp.company}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                    {opp.position}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={opp.type}
                      size="small"
                      sx={{
                        bgcolor:
                          opp.type === "Internship" ? "#06b6d4" : "#8b5cf6",
                        color: "#fff",
                        fontSize: "0.75rem",
                        height: 22,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", lineHeight: "22px" }}
                    >
                      {opp.deadline}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Stack alignItems="flex-end" spacing={0.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TrendingUp sx={{ fontSize: 16, color: "#f59e0b" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#f59e0b", fontWeight: 600 }}
                  >
                    {opp.match}%
                  </Typography>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ color: "#e2e8f0", fontWeight: 600 }}
                >
                  {opp.salary}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>


    </Box>
  );
}
