"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Search, Add, Login } from "@mui/icons-material";

export default function ChatSidebar({
  rooms,
  selectedRoom,
  onSelectRoom,
  onCreateRoom,
  onJoinRoom,
  user,
}) {
  const theme = useTheme();
  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "background.default",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid #334155",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 2 }}
        >
          Chats
        </Typography>
        <TextField
          fullWidth
          placeholder="Search chats..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "text.primary",
              bgcolor: "background.default",
              "& fieldset": { borderColor: "#334155" },
              "&:hover fieldset": { borderColor: "#8b5cf6" },
            },
          }}
        />
      </Box>

      {/* Room List */}
      <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
        {rooms.map((room) => (
          <ListItem key={room.id} disablePadding>
            <ListItemButton
              onClick={() => onSelectRoom(room)}
              sx={{
                py: 2,
                px: 2,
                bgcolor:
                  selectedRoom?.id === room.id ? "#1e293b" : "transparent",
                borderLeft:
                  selectedRoom?.id === room.id
                    ? "4px solid #8b5cf6"
                    : "4px solid transparent",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#8b5cf6",
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                {initials(room.name)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {room.name || "Unnamed Room"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  Tap to open
                </Typography>
              </Box>
            </ListItemButton>
          </ListItem>
        ))}

        {rooms.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No rooms yet
            </Typography>
          </Box>
        )}
      </List>

      {/* Action Buttons */}
      <Box sx={{ p: 2, borderTop: "1px solid #1e293b" }}>
        <Stack spacing={1}>
          <Button
            onClick={onCreateRoom}
            startIcon={<Add />}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              width: "100%",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            New Room
          </Button>
          <Button
            onClick={onJoinRoom}
            startIcon={<Login />}
            sx={{
              bgcolor: "#334155",
              color: "text.primary",
              width: "100%",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": { bgcolor: "#475569" },
            }}
          >
            Join Room
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
