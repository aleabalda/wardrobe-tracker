import type { Server as HttpServer } from "http";
import type { Request } from "express";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { allowedOrigins } from "./app";
import { getUserIdFromToken } from "./middleware/auth";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  // parses the connection request's cookies the same way the REST api does
  io.engine.use(cookieParser());

  // same login cookie as the REST api, sent by the browser on connect
  io.use((socket, next) => {
    const { cookies } = socket.request as Request;
    const userId = getUserIdFromToken(cookies?.token);

    if (userId === null) {
      return next(new Error("Unauthorized"));
    }

    socket.data.userId = userId;
    next();
  });

  // one room per user so every tab they have open receives their events
  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });
}

export function emitToUsers(userIds: number[], event: string, payload: unknown) {
  if (!io) return;

  for (const userId of userIds) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}
