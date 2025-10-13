import React from "react";
import { List, ListItem, Avatar, Typography, Box, Paper } from "@mui/material";

export default function MessageList({
  messages,
  user,
  typingUsers,
  initials,
  getUserName,
  scrollRef,
}) {
  return (
    <Paper
      sx={{
        flex: 1,
        overflow: "auto",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
      ref={scrollRef}
    >
      {messages.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 5, textAlign: "center" }}
        >
          No messages yet. Start the conversation!
        </Typography>
      )}
      <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {messages.map((msg, index) => {
          const isSender = msg.senderId === user?.id;
          const senderName = getUserName
            ? getUserName(msg.senderId)
            : user?.name ?? "Unknown";
          return (
            <ListItem
              key={msg.id || msg.timestamp || Math.random()}
              sx={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                  maxWidth: "75%",
                  flexDirection: isSender ? "row-reverse" : "row",
                }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {initials
                    ? initials(senderName)
                    : senderName[0]?.toUpperCase()}
                </Avatar>

                <Box
                  component={Paper}
                  elevation={1}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: isSender ? "primary.main" : "grey.200",
                    color: isSender ? "primary.contrastText" : "text.primary",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      minHeight: "20px",
                      color: isSender ? "white" : "black", // Force explicit colors
                    }}
                  >
                    {msg.message || "[Empty message]"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      opacity: 0.7,
                      color: isSender ? "white" : "black", // Force explicit colors
                    }}
                  >
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString()
                      : msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString()
                      : ""}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          );
        })}
      </List>

      {typingUsers && typingUsers.size > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {Array.from(typingUsers)
            .map((id) => (getUserName ? getUserName(id) : id))
            .join(", ")}
          {" typing..."}
        </Typography>
      )}
    </Paper>
  );
}
