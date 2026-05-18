const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer, {
        path: "/api/socket",
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    class RoomManager {
        constructor() {
            this.rooms = new Map();
        }

        joinRoom(roomId, socketId, userData) {
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, new Map());
            }
            const room = this.rooms.get(roomId);
            room.set(socketId, userData);
            return Array.from(room.entries())
                .filter(([id]) => id !== socketId)
                .map(([id, data]) => ({ socketId: id, ...data }));
        }

        leaveRoom(roomId, socketId) {
            if (this.rooms.has(roomId)) {
                const room = this.rooms.get(roomId);
                room.delete(socketId);
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        }
    }

    const roomManager = new RoomManager();

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join-room", (roomId, userId, userName, avatar) => {
            socket.join(roomId);
            console.log(`User ${userId} (${userName}) joined room ${roomId}`);
            
            const userData = { userId, userName, avatar };
            const existingUsers = roomManager.joinRoom(roomId, socket.id, userData);
            
            // Send existing users to the new user
            socket.emit("current-room-users", existingUsers);
            
            // Notify others in the room
            socket.to(roomId).emit("user-connected", { socketId: socket.id, userId, userName, avatar });
            
            // Handle disconnect
            socket.on("disconnect", () => {
                console.log(`User ${userId} disconnected`);
                roomManager.leaveRoom(roomId, socket.id);
                socket.to(roomId).emit("user-disconnected", { socketId: socket.id, userId });
            });
        });

        // WebRTC Signaling
        socket.on("signal", (data) => {
            if (data.targetId) {
                io.to(data.targetId).emit("signal", {
                    signal: data.signal,
                    senderId: data.senderId
                });
            }
        });

        // Real-time tracking data
        socket.on("tracking-update", (data) => {
            socket.to(data.roomId).emit("tracking-update", {
                userId: data.userId,
                trackingData: data.trackingData
            });
        });

        // Screen share
        socket.on("stop-screen-share", (roomId) => {
            socket.to(roomId).emit("stop-screen-share");
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
