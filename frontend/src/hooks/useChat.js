import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function useChat() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket only once
  useEffect(() => {
    if (socketRef.current) return;
    const socket = io(BACKEND_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
  }, []);

  // Authentication and user load
  useEffect(() => {
    const token = localStorage.getItem("token");

    async function authUser() {
      if (!token) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.ok) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.clear();
      }
    }

    authUser();
  }, []);

  // Handle socket connection
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user) return;

    const connectSocket = () => {
      if (!socket.connected) {
        socket.connect();
      }
    };

    const onConnect = () => {
      setIsConnected(true);
      socket.emit("join", user.id);

      const savedRoom = localStorage.getItem("joinedRoom");
      if (savedRoom) {
        // send both roomId and userId to match backend expectation
        socket.emit("join_room", { roomId: savedRoom, userId: user.id });
        setJoinedRoom(savedRoom);
      }
    };

    const onDisconnect = (reason) => {
      console.warn("❌ Socket disconnected:", reason);
      setIsConnected(false);

      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
      } else {
        setTimeout(connectSocket, 3000);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    connectSocket();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [user]);

  // Receive messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleReceiveRoomMessage = (msg) => {
      const currentRoom = localStorage.getItem("joinedRoom");
      if (String(msg.roomId) === String(currentRoom)) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => {
            const id = String(m.id || "");
            return !id.startsWith("temp-");
          });
          return [...filtered, msg];
        });
      }
    };

    const handleMessageError = (error) => {
      console.error("❌ Message error:", error);
    };

    const handleMessageSent = (msg) => {
      // Replace temp message placeholder with server-sent message, or append if not found
      setMessages((prev) => {
        // If server message id already exists, avoid duplicating
        if (prev.some((m) => String(m.id) === String(msg.id))) {
          return prev;
        }

        const idx = prev.findIndex((m) =>
          String(m.id || "").startsWith("temp-") &&
          m.message === msg.message &&
          String(m.roomId) === String(msg.roomId)
        );

        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = msg;
          return copy;
        }

        return [...prev, msg];
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("receive_room_message", handleReceiveRoomMessage);
    socket.on("message_sent", handleMessageSent);
    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("receive_room_message", handleReceiveRoomMessage);
      socket.off("message_sent", handleMessageSent);
      socket.off("message_error", handleMessageError);
    };
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (token, roomId = null) => {
    try {
      if (!roomId) {
        setMessages([]);
        return;
      }

      const res = await axios.get(
        `${BACKEND_URL}/api/rooms/${roomId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.ok) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  // Fetch available rooms
  const fetchRooms = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.ok) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    }
  }, []);

  // Fetch users in room
  const fetchUsersInRoom = useCallback(async (roomId) => {
    const token = localStorage.getItem("token");
    if (!token || !roomId) return;

    try {
      const res = await axios.get(`${BACKEND_URL}/api/rooms/${roomId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.ok) {
        setUsersInRoom(res.data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch room users:", err);
    }
  }, []);

  // Load messages when user/room changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) {
      fetchMessages(token, joinedRoom);
    }
  }, [user, joinedRoom, fetchMessages]);

  // Fetch rooms when user loads
  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user, fetchRooms]);

  // Fetch users when room changes
  useEffect(() => {
    if (joinedRoom) {
      fetchUsersInRoom(joinedRoom);
    } else {
      setUsersInRoom([]);
    }
  }, [joinedRoom, fetchUsersInRoom]);

  // Join room
  const joinRoom = useCallback(
    async (roomId) => {
      const socket = socketRef.current;
      const token = localStorage.getItem("token");

      if (!socket?.connected) {
        setErrorMsg("Socket not connected");
        return;
      }

      // Determine userId robustly: prefer `user` state, fallback to localStorage
      let userId = user?.id;
      if (!userId) {
        try {
          const stored = JSON.parse(localStorage.getItem("user"));
          userId = stored?.id;
        } catch (e) {
          userId = null;
        }
      }

      if (!userId) {
        console.error("joinRoom called but no userId available");
        setErrorMsg("You must be logged in to join a room");
        return;
      }

      try {
        const res = await axios.post(
          `${BACKEND_URL}/api/rooms/${roomId}/join`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.ok) {
          // include userId so backend can validate and add socket to the room
          socket.emit("join_room", { roomId, userId });
          localStorage.setItem("joinedRoom", roomId);
          setJoinedRoom(roomId);
          await fetchMessages(token, roomId);
          console.log("Joined room:", roomId);
        }
      } catch (err) {
        console.error("Failed to join room:", err);
        setErrorMsg("Failed to join room");
      }
    },
    [fetchMessages, user]
  );

  // Create room
  const createRoom = useCallback(
    async (roomName) => {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("You must be logged in to create a room");
        return;
      }

      try {
        const res = await axios.post(
          `${BACKEND_URL}/api/rooms`,
          { name: roomName },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.ok) {
          console.log("✅ Room created:", res.data.room);
          await fetchRooms();
          // join the newly created room via the existing joinRoom helper
          await joinRoom(res.data.room.id);
        }
      } catch (err) {
        console.error("Failed to create room:", err);
        setErrorMsg("Failed to create room");
      }
    },
    [fetchRooms, joinRoom]
  );

  // Leave room
  const leaveRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !joinedRoom) return;

    socket.emit("leave_room", joinedRoom);
    localStorage.removeItem("joinedRoom");
    setJoinedRoom(null);
    setMessages([]);
    setUsersInRoom([]);
    console.log("Left room");
  }, [joinedRoom]);

  // Send message
  const sendMessage = useCallback(
    (text) => {
      if (!socketRef.current?.connected || !user) {
        console.error("Cannot send: socket not connected or no user");
        return;
      }

      if (!joinedRoom) {
        console.error("Cannot send message: not in a room");
        return;
      }

      const now = new Date().toISOString();
      const msg = {
        message: text,
        senderId: user.id,
        roomId: joinedRoom,
        createdAt: now,
        timestamp: now,
      };

      socketRef.current.emit("send_room_message", msg);
      setMessages((prev) => [...prev, { ...msg, id: `temp-${Date.now()}` }]);
    },
    [user, joinedRoom]
  );

  // Logout
  const logout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("joinedRoom");
    window.location.reload();
  }, []);

  const visibleMessages = messages.filter((m) => {
    if (!joinedRoom) return true;
    return String(m.roomId) === String(joinedRoom);
  });

  return {
    socket: socketRef.current,
    isConnected,
    socketConnected: isConnected,
    user,
    rooms,
    availableRooms: rooms,
    joinedRoom,
    messages: visibleMessages,
    typingUsers,
    usersInRoom,
    errorMsg,
    setErrorMsg,
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    fetchMessages,
    fetchRooms,
    logout,
  };
}
