import { io } from 'socket.io-client';

export const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export function connectSocket() {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }
  // Auth is cookie-based: the same httpOnly `accessToken` cookie used by the
  // REST API authenticates the socket (withCredentials sends it). No token
  // needs to live in localStorage for realtime to work.
  socket = io(SOCKET_URL, {
    withCredentials: true,
    reconnectionAttempts: 3,
    timeout: 10000
  });
  socket.on('connect_error', () => {
    // Keep the UI quiet on transient auth/network errors; the next login reconnects.
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
