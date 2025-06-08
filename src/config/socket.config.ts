import { io, Socket } from 'socket.io-client';

// Base URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Ekstrak base URL tanpa path /api untuk koneksi socket
const SOCKET_BASE_URL = API_URL.replace('/api', '');

// Socket.io namespace - harus konsisten dengan backend
export const SOCKET_NAMESPACE = {
  PREFIX: 'sportcenter',
  FIELDS: 'fields',
  NOTIFICATION: 'notification'
};

// Struktur yang sama dengan backend untuk memastikan konsistensi
export const SOCKET_KEYS = {
  ROOT: SOCKET_NAMESPACE.PREFIX,
  FIELDS: `${SOCKET_NAMESPACE.PREFIX}/${SOCKET_NAMESPACE.FIELDS}`,
  NOTIFICATION: `${SOCKET_NAMESPACE.PREFIX}/${SOCKET_NAMESPACE.NOTIFICATION}`
};

// Socket.io singleton instances dengan namespace berbeda
let rootSocket: Socket | null = null;
let fieldsSocket: Socket | null = null;
let notificationSocket: Socket | null = null;

/**
 * Inisialisasi socket connection ke namespace root
 * @returns Instance Socket.IO untuk namespace root
 */
export const initRootSocket = (): Socket => {
  if (!rootSocket) {
    rootSocket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'], // Support polling sebagai fallback
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(rootSocket);
  }

  return rootSocket;
};

/**
 * Inisialisasi socket connection ke namespace fields
 * @returns Instance Socket.IO untuk namespace fields
 */
export const initFieldsSocket = (): Socket => {
  if (!fieldsSocket) {
    // Gunakan SOCKET_KEYS untuk memastikan konsistensi dengan backend
    const fieldsNamespace = SOCKET_KEYS.FIELDS;
    fieldsSocket = io(`${SOCKET_BASE_URL}/${fieldsNamespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(fieldsSocket);
  }

  return fieldsSocket;
};

/**
 * Inisialisasi socket connection ke namespace notification
 * @returns Instance Socket.IO untuk namespace notification
 */
export const initNotificationSocket = (): Socket => {
  if (!notificationSocket) {
    const notificationNamespace = SOCKET_KEYS.NOTIFICATION;
    notificationSocket = io(`${SOCKET_BASE_URL}/${notificationNamespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(notificationSocket);
  }

  return notificationSocket;
};

/**
 * Setup event listeners for socket
 * @param socket Socket instance
 * @param namespace Namespace name for logging
 */
const setupSocketListeners = (socket: Socket) => {
  socket.on('connect', () => {
  });

  socket.on('disconnect', () => {
  });

  socket.on('error', () => {
  });

  socket.on('reconnect', () => {
  });

  socket.on('reconnect_attempt', () => {
  });

  socket.on('reconnect_error', () => {
  });

  socket.on('reconnect_failed', () => {
  });
};

/**
 * Dapatkan instance socket untuk namespace root
 * @returns Socket instance atau null jika belum diinisialisasi
 */
export const getRootSocket = (): Socket | null => {
  if (!rootSocket) {
    return null;
  }
  return rootSocket;
};

/**
 * Dapatkan instance socket untuk namespace fields
 * @returns Socket instance atau null jika belum diinisialisasi
 */
export const getFieldsSocket = (): Socket | null => {
  if (!fieldsSocket) {
    return initFieldsSocket(); // Auto-initialize if needed
  }
  return fieldsSocket;
};

/**
 * Dapatkan instance socket untuk namespace notification
 * @returns Socket instance atau null jika belum diinisialisasi
 */
export const getNotificationSocket = (): Socket | null => {
  if (!notificationSocket) {
    return initNotificationSocket(); // Auto-initialize if needed
  }
  return notificationSocket;
};

/**
 * Fungsi umum untuk bergabung ke room socket dalam namespace fields
 * @param roomId - ID room yang akan dimasuki
 * @param data - Data tambahan yang dikirim saat join room
 */
export const joinFieldsRoom = (roomId: string, data?: Record<string, unknown>) => {
  const socket = getFieldsSocket();
  if (!socket) return;

  socket.emit('join_room', { room: roomId, ...data });
};

/**
 * Fungsi umum untuk meninggalkan room socket dalam namespace fields
 * @param roomId - ID room yang akan ditinggalkan
 */
export const leaveFieldsRoom = (roomId: string) => {
  const socket = getFieldsSocket();
  if (!socket) return;

  socket.emit('leave_room', { room: roomId });
};

/**
 * Tutup semua koneksi socket
 */
export const disconnectAllSockets = () => {
  if (rootSocket) {
    rootSocket.disconnect();
    rootSocket = null;
  }
  
  if (fieldsSocket) {
    fieldsSocket.disconnect();
    fieldsSocket = null;
  }
  
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
  }
};

// Untuk backward compatibility
export const initSocket = initRootSocket;
export const getSocket = getRootSocket;
export const joinRoom = joinFieldsRoom;
export const leaveRoom = leaveFieldsRoom;
export const disconnectSocket = disconnectAllSockets;

const socketConfig = {
  initSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  disconnectSocket,
  // New exports
  initRootSocket,
  getRootSocket,
  initFieldsSocket,
  getFieldsSocket,
  initNotificationSocket,
  getNotificationSocket,
  joinFieldsRoom,
  leaveFieldsRoom,
  disconnectAllSockets,
  SOCKET_NAMESPACE,
  SOCKET_KEYS
}; 
export default socketConfig;