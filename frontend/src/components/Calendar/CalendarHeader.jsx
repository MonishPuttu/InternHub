import { Box, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

export default function CalendarHeader({ onCreateClick }) {
    return (
        <Box sx={{ mb: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "start", sm: "center" },
                    mb: 2,
                    gap: { xs: 2, sm: 0 },
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ fontSize: { xs: "1.75rem", sm: "2.125rem" } }}
                    >
                        Event Calendar
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
                    >
                        View placement drives, opportunities & events
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={onCreateClick}
                    sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
                >
                    Create
                </Button>
            </Box>
        </Box>
    );
}
