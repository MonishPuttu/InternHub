"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  IconButton,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import RoomControls from "../components/Chat/RoomControls";
import MessageList from "../components/Chat/messageList";
import useChat from "../hooks/useChat";

export default function Chat({ receiverId = "some-recruiter-uuid" }) {
  const {
    user,
    messages,
    joinedRoom,
    typingUsers,
    availableRooms,
    usersInRoom,
    socketConnected,
    errorMsg,
    setErrorMsg,
    joinRoom,
    leaveRoom,
    createRoom,
    sendMessage,
  } = useChat(receiverId);

  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState(joinedRoom ?? "");
  const [roomName, setRoomName] = useState("");
  const scrollRef = useRef(null);
  const router = useRouter();

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getUserName = (id) => {
    if (id === user?.id) return user.name || "You";
    const found = usersInRoom.find((u) => u.id === id);
    return found?.name || (id === receiverId ? "Other" : "Unknown");
  };

  const onSendMessage = () => {
    if (!input.trim()) return;
    sendMessage(input, receiverId);
    setInput("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 720,
        mx: "auto",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
      }}
    >
      <RoomControls
        joinedRoom={joinedRoom}
        roomId={roomId}
        setRoomId={setRoomId}
        roomName={roomName}
        setRoomName={setRoomName}
        user={user}
        socketConnected={socketConnected}
        createRoom={createRoom}
        joinRoom={joinRoom}
        leaveRoom={leaveRoom}
        availableRooms={availableRooms}
        initials={initials}
        setErrorMsg={setErrorMsg}
      />

      <MessageList
        messages={messages}
        user={user}
        usersInRoom={usersInRoom}
        receiverId={receiverId}
        joinedRoom={joinedRoom}
        typingUsers={typingUsers}
        initials={initials}
        getUserName={getUserName}
        scrollRef={scrollRef}
      />

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
        sx={{ p: 1 }}
        elevation={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            placeholder={
              joinedRoom ? "Message room..." : "Type your message..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={onSendMessage}
            disabled={!socketConnected}
            type="submit"
          >
            <SendIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={onSendMessage}
            disabled={!socketConnected}
            type="submit"
          >
            Send
          </Button>
        </Stack>
      </Box>

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
    </Box>
  );
}
