import React from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function RoomControls({
  joinedRoom,
  roomId,
  setRoomId,
  roomName,
  setRoomName,
  user,
  socketConnected,
  createRoom,
  joinRoom,
  leaveRoom,
  availableRooms = [],
  initials,
  setErrorMsg,
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar>{initials ? initials(user?.name) : "?"}</Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">
            {joinedRoom ? `Room: ${roomId}` : "Direct chat"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user ? `You: ${user.name}` : "Not signed in"}
          </Typography>
          {!socketConnected && (
            <Typography variant="caption" color="error">
              Disconnected. Reconnecting...
            </Typography>
          )}
        </Box>

        {/* Room Name Input + Create */}
        <TextField
          size="small"
          placeholder="Room name"
          value={roomName ?? ""}
          onChange={(e) => setRoomName(e.target.value)}
          sx={{ width: 180 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (roomName?.trim()) createRoom(roomName.trim());
              else setErrorMsg("Room name cannot be empty");
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={() => {
            if (roomName?.trim()) createRoom(roomName.trim());
            else setErrorMsg("Room name cannot be empty");
          }}
          title="Create"
        >
          <AddIcon />
        </IconButton>

        {/* Room ID Input + Join */}
        <TextField
          size="small"
          placeholder="Room ID"
          value={roomId ?? ""}
          onChange={(e) => setRoomId(e.target.value)}
          sx={{ width: 140 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && roomId?.trim()) joinRoom(roomId.trim());
          }}
        />
        <IconButton
          color="secondary"
          onClick={() => {
            if (roomId?.trim()) joinRoom(roomId.trim());
            else setErrorMsg("Room ID cannot be empty");
          }}
          title="Join"
        >
          <MeetingRoomIcon />
        </IconButton>

        <IconButton onClick={leaveRoom} title="Leave">
          <ExitToAppIcon />
        </IconButton>
      </Stack>

      {Array.isArray(availableRooms) && availableRooms.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption">Available Rooms:</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {availableRooms.map((room) => (
              <Button
                key={room.id}
                variant={joinedRoom === room.id ? "contained" : "outlined"}
                size="small"
                onClick={() => joinRoom(room.id)}
              >
                {room.name ?? "Unnamed Room"}
              </Button>
            ))}
          </Stack>
        </Box>
      ) : (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1 }}
          color="text.secondary"
        >
          No available rooms
        </Typography>
      )}
    </Box>
  );
}
