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

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
    return match ? match[2] : "";
  };

  useEffect(() => {
    if (!projectId || !user) return;

    const token = getCookie("auth_token");
    const wsScheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost = "localhost:8080";
    
    const url = `${wsScheme}//${backendHost}/api/v1/collaboration/project/${projectId}${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
    
    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
      socketRef.current = socket;
    } catch (err) {
      console.error("Failed to establish WebSocket:", err);
      return;
    }

    socket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected to project:", projectId);
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
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [projectId, user]);

  const sendMessage = useCallback(
    (type: string, payload: any) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && user) {
        const msg: WebSocketMessage = {
          type,
          projectId,
          userId: user.id,
          payload,
        };
        socketRef.current.send(JSON.stringify(msg));
      }
    },
    [projectId, user]
  );

  return { isConnected, lastMessage, sendMessage };
}
export default useWebSocket;
