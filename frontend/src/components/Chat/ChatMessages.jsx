"use client";

import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Stack,
  Paper,
  Menu,
  MenuItem,
  Divider,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  ContentCopy,
  DeleteSweep,
} from "@mui/icons-material";
import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function ChatMessages({
  selectedRoom,
  messages,
  user,
  input,
  setInput,
  onSendMessage,
  socketConnected,
  getUserName,
  onDeleteRoom,
}) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);
  const emojiOpen = Boolean(emojiAnchor);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (event) => {
    setEmojiAnchor(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchor(null);
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      // File upload logic will go here later
    }
  };

  const handleCopyRoomId = () => {
    if (selectedRoom?.id) {
      navigator.clipboard.writeText(selectedRoom.id);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteRoom && selectedRoom) {
      onDeleteRoom(selectedRoom.id);
    }
    setDeleteDialogOpen(false);
  };

  if (!selectedRoom) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h5" sx={{ color: "text.secondary", mb: 1 }}>
          Select a chat to start messaging
        </Typography>
        <Typography variant="body2" sx={{ color: "#475569" }}>
          Choose a room from the sidebar
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid #334155",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 40, height: 40 }}>
            {initials(selectedRoom.name)}
          </Avatar>
          <Box>
            <Typography
              variant="body1"
              sx={{ color: "text.primary", fontWeight: 600 }}
            >
              {selectedRoom.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {socketConnected ? "Online" : "Connecting..."}
            </Typography>
          </Box>
        </Stack>
        <IconButton sx={{ color: "text.secondary" }} onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>

        {/* Menu for Room Info */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: "background.paper",
              color: "text.primary",
              minWidth: 280,
              border: "1px solid #334155",
            },
          }}
        >
          <MenuItem
            disabled
            sx={{ opacity: 1, "&.Mui-disabled": { opacity: 1 } }}
          >
            <Stack spacing={0.5} sx={{ width: "100%" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Room Information
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {selectedRoom.name}
              </Typography>
            </Stack>
          </MenuItem>
          <Divider sx={{ borderColor: "#334155" }} />
          <MenuItem
            disabled
            sx={{ opacity: 1, "&.Mui-disabled": { opacity: 1 } }}
          >
            <Stack spacing={0.5} sx={{ width: "100%" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Room ID
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                }}
              >
                {selectedRoom.id}
              </Typography>
            </Stack>
          </MenuItem>
          <Divider sx={{ borderColor: "#334155" }} />
          <MenuItem onClick={handleCopyRoomId}>
            <ContentCopy sx={{ mr: 2, fontSize: 20, color: "#8b5cf6" }} />
            <Typography variant="body2">
              {copySuccess ? "Copied!" : "Copy Room ID"}
            </Typography>
          </MenuItem>
          <Divider sx={{ borderColor: "#334155" }} />
          <MenuItem onClick={handleDeleteClick} sx={{ color: "#ef4444" }}>
            <DeleteSweep sx={{ mr: 2, fontSize: 20 }} />
            <Typography variant="body2">Delete Room</Typography>
          </MenuItem>
        </Menu>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      >
        {messages.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center", mt: 4 }}
          >
            No messages yet. Start the conversation!
          </Typography>
        )}

        {messages.map((msg, index) => {
          const isSender = msg.senderId === user?.id;
          const senderName =
            msg.senderName ||
            (getUserName ? getUserName(msg.senderId) : "Unknown");

          return (
            <Box
              key={msg.id || msg.timestamp || index}
              sx={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              {!isSender && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#8b5cf6" }}>
                  {initials(senderName)}
                </Avatar>
              )}

              <Paper
                elevation={0}
                sx={{
                  maxWidth: "60%",
                  px: 2,
                  py: 1.5,
                  borderRadius: isSender
                    ? "12px 12px 0 12px"
                    : "12px 12px 12px 0",
                  bgcolor: isSender ? "#8b5cf6" : "#1e293b",
                  color: "text.primary",
                }}
              >
                {!isSender && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#a78bfa",
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {senderName}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {msg.message || "[Empty message]"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: "0.7rem",
                  }}
                >
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Typography>
              </Paper>

              {isSender && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#8b5cf6" }}>
                  {initials(senderName)}
                </Avatar>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderTop: "1px solid #334155",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Emoji Button */}
          <IconButton
            sx={{ color: "text.secondary" }}
            onClick={handleEmojiClick}
          >
            <EmojiEmotions />
          </IconButton>

          {/* Emoji Picker Popover */}
          <Popover
            open={emojiOpen}
            anchorEl={emojiAnchor}
            onClose={handleEmojiClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box sx={{ bgcolor: "background.paper" }}>
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="dark"
                width={350}
                height={400}
              />
            </Box>
          </Popover>

          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept="*/*"
          />
          <IconButton
            sx={{ color: "text.secondary" }}
            onClick={handleFileClick}
          >
            <AttachFile />
          </IconButton>

          {/* Message Input */}
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                bgcolor: "background.default",
                borderRadius: 3,
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
                "&.Mui-focused fieldset": { borderColor: "#8b5cf6" },
              },
            }}
          />

          {/* Send Button */}
          <IconButton
            onClick={onSendMessage}
            disabled={!socketConnected || !input.trim()}
            sx={{
              bgcolor: "#8b5cf6",
              color: "#fff",
              "&:hover": { bgcolor: "#7c3aed" },
              "&:disabled": { bgcolor: "#334155", color: "text.secondary" },
            }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid #334155",
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>Delete Room?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Are you sure you want to delete "{selectedRoom.name}
            "? This will permanently delete the room and all its messages. This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              bgcolor: "#ef4444",
              textTransform: "none",
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
