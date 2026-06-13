"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";

interface WebSocketMessage {
  type: string;
  projectId: string;
  userId: string;
  payload: any;
}

export function useWebSocket(projectId: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { user } = useAppStore();

  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const reconnectDelayRef = useRef(1000);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
    return match ? match[2] : "";
  };

  useEffect(() => {
    if (!projectId || !user) return;

    let isClosed = false;
    const token = getCookie("auth_token");

    let url = "";
    if (process.env.NEXT_PUBLIC_WS_URL) {
      const wsBase = process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
      url = `${wsBase}/api/v1/collaboration/project/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ""
        }`;
    } else {
      const wsScheme = window.location.protocol === "https:" ? "wss:" : "ws:";
      const backendHost = "localhost:8080";
      url = `${wsScheme}//${backendHost}/api/v1/collaboration/project/${projectId}${token ? `?token=${encodeURIComponent(token)}` : ""
        }`;
    }

    const scheduleReconnect = () => {
      if (isClosed) return;

      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, 30000);

      console.log(`WebSocket disconnected. Will attempt reconnect in ${delay}ms`);
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectTrigger((prev) => prev + 1);
      }, delay);
    };

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
      socketRef.current = socket;
    } catch (err) {
      console.error("Failed to establish WebSocket:", err);
      scheduleReconnect();
      return () => {
        isClosed = true;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }

    const heartbeatInterval = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const pingMsg = JSON.stringify({
          type: "ping",
          projectId,
          userId: user.id,
          payload: {},
        });
        socket.send(pingMsg);
      }
    }, 30000); 

    socket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected to project:", projectId);
      reconnectDelayRef.current = 1000; 

      if (messageQueueRef.current.length > 0) {
        console.log(`Flushing ${messageQueueRef.current.length} queued messages...`);
        messageQueueRef.current.forEach((msg) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
          }
        });
        messageQueueRef.current = [];
      }
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected from project:", projectId);
      if (!isClosed) {
        isClosed = true;
        scheduleReconnect();
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      isClosed = true;
      clearInterval(heartbeatInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [projectId, user, reconnectTrigger]);

  useEffect(() => {
    if (!projectId || !user) return;

    const handleIntentionalReconnect = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        return;
      }
      console.log("Network online or window focused, attempting immediate reconnect...");
      reconnectDelayRef.current = 1000;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setReconnectTrigger((prev) => prev + 1);
    };

    window.addEventListener("online", handleIntentionalReconnect);
    window.addEventListener("focus", handleIntentionalReconnect);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleIntentionalReconnect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleIntentionalReconnect);
      window.removeEventListener("focus", handleIntentionalReconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projectId, user]);

  const sendMessage = useCallback(
    (type: string, payload: any) => {
      if (!user) return;

      const msg: WebSocketMessage = {
        type,
        projectId,
        userId: user.id,
        payload,
      };

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(msg));
      } else {
        console.log(`WebSocket offline. Queueing message of type: ${type}`);
        messageQueueRef.current.push(msg);
      }
    },
    [projectId, user]
  );

  return { isConnected, lastMessage, sendMessage };
}
export default useWebSocket;
