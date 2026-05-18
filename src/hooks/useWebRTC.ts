"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";
import { useStore, TrackingData } from "./useStore";

export function useWebRTC(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, any>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const { 
    userId, 
    userName, 
    selectedAvatar, 
    addParticipant, 
    removeParticipant, 
    updateParticipantTracking 
  } = useStore();

  useEffect(() => {
    if (!roomId || !userId) return;

    // Connect to Socket.io server
    const socket = io({
      path: "/api/socket",
    });
    socketRef.current = socket;

    // Get local audio stream
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        setLocalStream(stream);

        socket.emit("join-room", roomId, userId, userName, selectedAvatar);

        socket.on("current-room-users", (users: { socketId: string, userId: string, userName: string, avatar: string }[]) => {
          console.log("Current room users:", users);
          users.forEach((u) => {
            addParticipant(u.userId, { userId: u.userId, userName: u.userName, avatar: u.avatar });
          });
        });

        socket.on("user-connected", ({ socketId, userId: remoteUserId, userName: remoteUserName, avatar }) => {
          console.log("User connected:", remoteUserId, "Socket:", socketId);
          addParticipant(remoteUserId, { userId: remoteUserId, userName: remoteUserName, avatar });
          
          // Create initiator peer
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
          });

          peer.on("signal", (signal: any) => {
            socket.emit("signal", { roomId, targetId: socketId, signal, senderId: socket.id });
          });

          peer.on("stream", (remoteStream: any) => {
            console.log("Received remote stream for", remoteUserId);
            const audio = new Audio();
            audio.srcObject = remoteStream;
            audio.play();
          });

          peersRef.current[socketId] = peer;
        });

        socket.on("signal", (data) => {
          const { signal, senderId } = data; // senderId here is the socketId of the remote peer
          
          if (peersRef.current[senderId]) {
            peersRef.current[senderId].signal(signal);
          } else {
            // Create non-initiator peer
            const peer = new Peer({
              initiator: false,
              trickle: false,
              stream: stream,
            });

            peer.on("signal", (signal: any) => {
              socket.emit("signal", { roomId, targetId: senderId, signal, senderId: socket.id });
            });

            peer.on("stream", (remoteStream: any) => {
              console.log("Received remote stream for sender", senderId);
              const audio = new Audio();
              audio.srcObject = remoteStream;
              audio.play();
            });

            peer.signal(signal);
            peersRef.current[senderId] = peer;
          }
        });

        socket.on("user-disconnected", ({ socketId, userId: disconnectedUserId }) => {
          console.log("User disconnected:", disconnectedUserId);
          if (peersRef.current[socketId]) {
            peersRef.current[socketId].destroy();
            delete peersRef.current[socketId];
          }
          removeParticipant(disconnectedUserId);
        });

        socket.on("tracking-update", (data) => {
          updateParticipantTracking(data.userId, data.trackingData);
        });
      })
      .catch((err) => console.error("Failed to get local stream", err));

    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach((peer) => peer.destroy());
      peersRef.current = {};
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, userId, userName, selectedAvatar]);

  const sendTrackingUpdate = (trackingData: TrackingData) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("tracking-update", { roomId, userId, trackingData });
    }
  };

  return { localStream, sendTrackingUpdate };
}
