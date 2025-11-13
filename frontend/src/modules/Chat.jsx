"use client";

import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import axios from "axios";

import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatMessages from "@/components/Chat/ChatMessages";
import useChat from "@/hooks/useChat";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ChatPage() {
  const {
    user,
    messages,
    joinedRoom,
    availableRooms,
    socketConnected,
    errorMsg,
    setErrorMsg,
    joinRoom,
    createRoom,
    sendMessage,
    fetchRooms,
  } = useChat();

  const [input, setInput] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const theme = useTheme();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getUserName = (id) => {
    if (id === user?.id) return user.name || "You";
    return "User";
  };

  const onSendMessage = () => {
    if (!input.trim() || !selectedRoom) return;
    sendMessage(input);
    setInput("");
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    joinRoom(room.id);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleOpenJoinDialog = () => {
    setJoinDialogOpen(true);
  };

  const handleConfirmCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim());
      setNewRoomName("");
      setCreateDialogOpen(false);
    }
  };

  const handleConfirmJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      setErrorMsg("Please enter a room ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Try to join the room
      const response = await axios.post(
        `${BACKEND_URL}/api/rooms/${joinRoomId.trim()}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setSuccessMsg("Successfully joined room!");
        setJoinRoomId("");
        setJoinDialogOpen(false);

        // Refresh rooms and select the newly joined room
        await fetchRooms();

        // Join the room via socket
        joinRoom(joinRoomId.trim());
      }
    } catch (error) {
      console.error("Error joining room:", error);
      if (error.response?.status === 404) {
        setErrorMsg("Room not found. Please check the Room ID.");
      } else if (error.response?.status === 403) {
        setErrorMsg("You don't have permission to join this room.");
      } else {
        setErrorMsg("Failed to join room. Please try again.");
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${BACKEND_URL}/api/rooms/${roomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.ok) {
        setSuccessMsg("Room deleted successfully");

        // Clear selected room
        setSelectedRoom(null);

        // Refresh rooms list
        await fetchRooms();

        // Clear local storage
        localStorage.removeItem("joinedRoom");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setErrorMsg("Failed to delete room");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 64px)",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Sidebar - 20% */}
      <Box sx={{ width: "20%", minWidth: "280px", height: "100%" }}>
        <ChatSidebar
          rooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleOpenCreateDialog}
          onJoinRoom={handleOpenJoinDialog}
          user={user}
        />
      </Box>

      {/* Messages Area - 80% */}
      <Box sx={{ flex: 1, height: "100%" }}>
        <ChatMessages
          selectedRoom={selectedRoom}
          messages={messages}
          user={user}
          input={input}
          setInput={setInput}
          onSendMessage={onSendMessage}
          socketConnected={socketConnected}
          getUserName={getUserName}
          onDeleteRoom={handleDeleteRoom}
        />
      </Box>

      {/* Create Room Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleConfirmCreateRoom();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": { color: "text.secondary" },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCreateRoom}
            variant="contained"
            sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Join Existing Room</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Enter the Room ID to join an existing room
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Room ID"
            fullWidth
            placeholder="Enter room ID..."
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleConfirmJoinRoom();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                fontFamily: "monospace",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": { color: "text.secondary" },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setJoinDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmJoinRoom}
            variant="contained"
            sx={{ bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
          >
            Join Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
