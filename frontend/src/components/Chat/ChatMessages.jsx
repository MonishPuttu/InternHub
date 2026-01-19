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
import { Done, DoneAll } from "@mui/icons-material";
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
  usersInRoom,
}) {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readersDialogOpen, setReadersDialogOpen] = useState(false);
  const [selectedReaders, setSelectedReaders] = useState([]);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const observerRef = useRef(null);
  const menuOpen = Boolean(anchorEl);
  const emojiOpen = Boolean(emojiAnchor);

  useEffect(() => {
    // smooth scroll to bottom when messages change
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
        <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
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
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
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
              border: `1px solid ${theme.palette.divider}`,
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
          <Divider sx={{ borderColor: theme.palette.divider }} />
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
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <MenuItem onClick={handleCopyRoomId}>
            <ContentCopy sx={{ mr: 2, fontSize: 20, color: theme.palette.primary.main }} />
            <Typography variant="body2">
              {copySuccess ? "Copied!" : "Copy Room ID"}
            </Typography>
          </MenuItem>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
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
            `radial-gradient(circle at 1px 1px, ${theme.palette.divider} 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        className="chat-scroll"
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
                 ref={(el) => {
                   // attach data and observe
                   try {
                     if (el) {
                       el.dataset.msgid = String(msg.id || "");
                       messageNodes.current.set(String(msg.id || ""), el);
                       if (observerRef.current) observerRef.current.observe(el);
                     } else {
                       const prev = messageNodes.current.get(String(msg.id || ""));
                       if (prev && observerRef.current) observerRef.current.unobserve(prev);
                       messageNodes.current.delete(String(msg.id || ""));
                     }
                   } catch (e) {}
                 }}
                 onContextMenu={(e) => {
                   e.preventDefault();
                   setMessageMenuAnchor(e.currentTarget);
                   setMenuMessage(msg);
                 }}
                sx={{
                  maxWidth: "60%",
                  px: 2,
                  py: 1.5,
                  borderRadius: isSender
                    ? "12px 12px 0 12px"
                    : "12px 12px 12px 0",
                  bgcolor: isSender ? theme.palette.primary.main : theme.palette.action.hover,
                  color: "text.primary",
                }}
              >
                {!isSender && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.primary.light,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: "0.7rem",
                      color: 'inherit',
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
                  {isSender && (
                    <Box component="span" sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                      {(() => {
                        const receipts = msg.receipts || [];
                        // compute unique receipts, excluding the message sender and current user if present
                        const uniqueRecipients = [...new Map(
                          (receipts || [])
                            .filter(r => String(r.userId) !== String(msg.senderId) && String(r.userId) !== String(user?.id))
                            .map(r => [String(r.userId), r])
                        ).values()];
                        // recipients count: prefer unique receipts length, fallback to usersInRoom (excluding sender), min 1
                        const recipientsCount = Math.max(
                          uniqueRecipients.length || (usersInRoom ? usersInRoom.filter(u => String(u.id) !== String(user?.id)).length : 0) || 1,
                          1
                        );

                        // compute unique latest status per recipient (case-insensitive)
                        const byUser = new Map();
                        receipts.forEach(r => {
                          const uid = String(r.userId);
                          // skip sender or current user receipts if accidentally present
                          if (uid === String(msg.senderId) || uid === String(user?.id)) return;
                          const prev = byUser.get(uid) || {};
                          const s = (r.status || '').toString().toLowerCase();
                          const prevS = (prev.status || '').toString().toLowerCase();
                          const rank = (t) => (t === 'read' ? 3 : t === 'delivered' ? 2 : 1);
                          const pick = (!prev.status || rank(s) >= rank(prevS)) ? { ...r, status: s } : prev;
                          byUser.set(uid, pick);
                        });

                        const deliveredCount = Array.from(byUser.values()).filter(r => {
                          const s = (r.status || '').toString().toLowerCase();
                          return s === 'delivered' || s === 'read';
                        }).length;
                        const readCount = Array.from(byUser.values()).filter(r => (r.status || '').toString().toLowerCase() === 'read').length;

                        if (readCount > 0 && readCount >= recipientsCount) {
                          return <DoneAll sx={{ fontSize: 16, color: theme.palette.primary.main }} />;
                        }

                        if (deliveredCount > 0) {
                          return <DoneAll sx={{ fontSize: 16, color: theme.palette.text.secondary }} />;
                        }

                        return <Done sx={{ fontSize: 16, color: theme.palette.text.secondary }} />;
                      })()}
                    </Box>
                  )}
                </Box>
              </Paper>

              {isSender && (
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                  {initials(senderName)}
                </Avatar>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={() => { setMessageMenuAnchor(null); setMenuMessage(null); }}
        anchorOrigin={{ vertical: 'top', horizontal: (menuMessage && String(menuMessage.senderId) === String(user?.id)) ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: (menuMessage && String(menuMessage.senderId) === String(user?.id)) ? 'right' : 'left' }}
      >
        <Box sx={{ px: 1 }}>
          {/* Only allow viewing readers if current user is the sender of the message */}
          {menuMessage && String(menuMessage.senderId) === String(user?.id) ? (
            <MenuItem onClick={() => {
              const readers = (menuMessage?.receipts || []).filter(r => (r.status || '').toString().toLowerCase() === 'read' && String(r.userId) !== String(user?.id));
              setSelectedReaders(readers.map(r => ({ ...r })));
              setReadersDialogOpen(true);
              setMessageMenuAnchor(null);
            }}>View readers</MenuItem>
          ) : (
            <MenuItem disabled>
              <Typography variant="body2">View readers (senders only)</Typography>
            </MenuItem>
          )}
        </Box>
      </Menu>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          bgcolor: "background.paper",
          borderTop: `1px solid ${theme.palette.divider}`,
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
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
              },
            }}
          />

          {/* Send Button */}
          <IconButton
            onClick={onSendMessage}
            disabled={!socketConnected || !input.trim()}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              "&:disabled": {
                bgcolor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
              },
            }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Box>

      {/* Delete Confirmation Dialog */}
            {/* Readers Dialog */}
            <Dialog
              open={readersDialogOpen}
              onClose={() => setReadersDialogOpen(false)}
              PaperProps={{
                sx: {
                  bgcolor: "background.paper",
                  color: "text.primary",
                  border: `1px solid ${theme.palette.divider}`,
                  minWidth: 300,
                },
              }}
            >
              <DialogTitle>Readers</DialogTitle>
              <DialogContent>
                {selectedReaders.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    No readers yet.
                  </Typography>
                ) : (
                  selectedReaders.map((r) => {
                    const roomUser = usersInRoom?.find(u => String(u.id) === String(r.userId));
                    const displayName = roomUser?.name || r.userName || r.email || r.userId;
                    return (
                      <Box key={r.userId} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                          {initials(displayName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.primary' }}>{displayName}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{r.readAt ? new Date(r.readAt).toLocaleString() : '—'}</Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setReadersDialogOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
              </DialogActions>
            </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            border: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>Delete Room?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Are you sure you want to delete &quot;{selectedRoom.name}
            &quot;? This will permanently delete the room and all its messages. This
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
              bgcolor: theme.palette.error.main,
              textTransform: "none",
              "&:hover": { bgcolor: theme.palette.error.dark },
            }}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}