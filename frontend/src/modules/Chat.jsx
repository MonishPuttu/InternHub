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
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatMessages from "@/components/Chat/ChatMessages";
import useChat from "@/hooks/useChat";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ChatPage() {
  const router = useRouter();
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
  const [newRoomName, setNewRoomName] = useState("");
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

  const handleCreateRoom = () => {
    setCreateDialogOpen(true);
  };

  const handleConfirmCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim());
      setNewRoomName("");
      setCreateDialogOpen(false);
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
        bgcolor: "#0a0f1a",
      }}
    >
      {/* Sidebar - 20% */}
      <Box sx={{ width: "20%", minWidth: "280px", height: "100%" }}>
        <ChatSidebar
          rooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onCreateRoom={handleCreateRoom}
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
          sx: { bgcolor: "#1e293b", color: "#e2e8f0" },
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
                color: "#e2e8f0",
                "& fieldset": { borderColor: "#334155" },
                "&:hover fieldset": { borderColor: "#8b5cf6" },
              },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: "#94a3b8" }}
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
