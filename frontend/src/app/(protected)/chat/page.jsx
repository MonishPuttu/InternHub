"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:4000");

export default function Chat({ receiverId = "some-recruiter-uuid" }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("joinedRoom")
        : null;
    } catch {
      return null;
    }
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    axios
      .get("http://localhost:4000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.ok) {
          setUser(res.data.user);
          socket.emit("join", res.data.user.id);

          const saved = localStorage.getItem("joinedRoom");
          if (saved) {
            socket.emit("join_room", saved);
            setJoinedRoom(saved);
            setRoomId(saved);
          }
        } else {
          router.push("/signin");
        }
      })
      .catch(() => router.push("/signin"));
  }, []);

  // helper to load messages
  const fetchMessages = async (token, currentJoinedRoom) => {
    try {
      if (currentJoinedRoom) {
        const res = await axios.get(
          `http://localhost:4000/api/rooms/${currentJoinedRoom}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data?.messages ?? res.data ?? []);
      } else {
        const res = await axios.get(
          `http://localhost:4000/api/messages/${user.id}/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data?.messages ?? res.data ?? []);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");

    // fetch messages via helper
    fetchMessages(token, joinedRoom);

    // Private messages listener
    socket.on("receive_message", (msg) => {
      if (
        (msg.senderId === receiverId && msg.receiverId === user.id) ||
        (msg.senderId === user.id && msg.receiverId === receiverId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Room messages listener
    socket.on("receive_room_message", (msg) => {
      if (msg.receiverId === joinedRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("receive_room_message");
    };
  }, [user, receiverId, joinedRoom]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    if (joinedRoom) {
      socket.emit("send_room_message", {
        senderId: user.id,
        roomId: joinedRoom,
        message: input,
      });
    } else {
      socket.emit("send_message", {
        senderId: user.id,
        receiverId,
        message: input,
      });
      setMessages((prev) => [
        ...prev,
        { senderId: user.id, receiverId, message: input },
      ]);
    }

    setInput("");
  };

  const createRoom = async () => {
    const token = localStorage.getItem("token");
    if (!roomName.trim()) return;
    const res = await axios.post(
      "http://localhost:4000/api/rooms",
      { name: roomName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data?.ok) {
      const newRoomId = res.data.room.id;
      setRoomId(newRoomId);
      // persist joined room
      localStorage.setItem("joinedRoom", newRoomId);
      joinRoom(newRoomId);
      // fetch messages for the new room
      await fetchMessages(token, newRoomId);
      setRoomName("");
    }
  };

  const joinRoom = async (id) => {
    if (!id || !user) return;
    socket.emit("join_room", id);
    setJoinedRoom(id);
    setRoomId(id);
    localStorage.setItem("joinedRoom", id);

    // fetch messages after joining
    const token = localStorage.getItem("token");
    await fetchMessages(token, id);
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-md mx-auto border rounded-lg p-4">
      <div className="mb-2 flex gap-2">
        <input
          placeholder="Room name (to create)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={createRoom}
          className="bg-green-500 text-white px-3 rounded"
        >
          Create
        </button>
      </div>

      <div className="mb-2 flex gap-2">
        <input
          placeholder="Room ID to join"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={() => joinRoom(roomId)}
          className="bg-yellow-500 text-white px-3 rounded"
        >
          Join
        </button>
        <button
          onClick={() => {
            // leave room and clear persisted state
            setJoinedRoom(null);
            setRoomId("");
            setMessages([]);
            localStorage.removeItem("joinedRoom");
          }}
          className="bg-gray-300 px-3 rounded"
        >
          Leave
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 space-y-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[75%] ${
              msg.senderId === user?.id
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start mr-auto"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex mt-2">
        <input
          className="flex-1 border p-2 rounded-l-lg"
          placeholder={joinedRoom ? "Message room..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
