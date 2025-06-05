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
    console.log('Initializing root socket connection to:', SOCKET_BASE_URL);
    rootSocket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'], // Support polling sebagai fallback
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(rootSocket, 'ROOT');
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
    console.log('Initializing fields socket connection to:', `${SOCKET_BASE_URL}/${fieldsNamespace}`);
    fieldsSocket = io(`${SOCKET_BASE_URL}/${fieldsNamespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(fieldsSocket, 'FIELDS');
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
    console.log('Initializing notification socket connection to:', `${SOCKET_BASE_URL}/${notificationNamespace}`);
    notificationSocket = io(`${SOCKET_BASE_URL}/${notificationNamespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io', // Pastikan path sesuai dengan konfigurasi backend
    });

    setupSocketListeners(notificationSocket, 'NOTIFICATION');
  }

  return notificationSocket;
};

/**
 * Setup event listeners for socket
 * @param socket Socket instance
 * @param namespace Namespace name for logging
 */
const setupSocketListeners = (socket: Socket, namespace: string) => {
  socket.on('connect', () => {
    console.log(`Socket [${namespace}] connected with ID:`, socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket [${namespace}] disconnected:`, reason);
  });

  socket.on('error', (error) => {
    console.error(`Socket [${namespace}] error:`, error);
  });

  socket.on('reconnect', (attempt) => {
    console.log(`Socket [${namespace}] reconnected after`, attempt, 'attempts');
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Socket [${namespace}] reconnection attempt:`, attempt);
  });

  socket.on('reconnect_error', (error) => {
    console.error(`Socket [${namespace}] reconnection error:`, error);
  });

  socket.on('reconnect_failed', () => {
    console.error(`Socket [${namespace}] reconnection failed`);
  });
};

/**
 * Dapatkan instance socket untuk namespace root
 * @returns Socket instance atau null jika belum diinisialisasi
 */
export const getRootSocket = (): Socket | null => {
  if (!rootSocket) {
    console.warn('Root socket not initialized yet');
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
    console.warn('Fields socket not initialized yet');
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
    console.warn('Notification socket not initialized yet');
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
  console.log('Joined fields room:', roomId);
};

/**
 * Fungsi umum untuk meninggalkan room socket dalam namespace fields
 * @param roomId - ID room yang akan ditinggalkan
 */
export const leaveFieldsRoom = (roomId: string) => {
  const socket = getFieldsSocket();
  if (!socket) return;

  socket.emit('leave_room', { room: roomId });
  console.log('Left fields room:', roomId);
};

/**
 * Tutup semua koneksi socket
 */
export const disconnectAllSockets = () => {
  if (rootSocket) {
    rootSocket.disconnect();
    rootSocket = null;
    console.log('Root socket disconnected');
  }
  
  if (fieldsSocket) {
    fieldsSocket.disconnect();
    fieldsSocket = null;
    console.log('Fields socket disconnected');
  }
  
  if (notificationSocket) {
    notificationSocket.disconnect();
    notificationSocket = null;
    console.log('Notification socket disconnected');
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