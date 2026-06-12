"use client";

import "@/lib/mockLocation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Tldraw, Editor, getSnapshot, loadSnapshot } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

import { useWebSocket } from "@/hooks/useWebSocket";
import { addProjectToCookieAction } from "../../../actions/project.actions";
import { getProjectMembersAction } from "../../../actions/collaboration.actions";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const CURSOR_COLORS = [
  "#FF6B6B", // coral
  "#4D96FF", // soft blue
  "#6BCB77", // pastel green
  "#FFD93D", // soft yellow
  "#B983FF", // lavender
  "#FF8AAE", // pink
  "#6EC72D", // bright green
  "#FFA45B", // pastel orange
  "#00ADB5", // teal
  "#FF2E93", // dark pink
];

function getUserCursorColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}

interface CanvasWorkspaceProps {
  projectId: string;
  initialCanvas: string;
  ownerId: string;
}

export const CanvasWorkspace = ({ projectId, initialCanvas, ownerId }: CanvasWorkspaceProps) => {
  const router = useRouter();
  const { isConnected, lastMessage, sendMessage } = useWebSocket(projectId);
  const { user } = useAppStore();
  const [editor, setEditor] = useState<Editor | null>(null);
  const isOwner = !!user && user.id === ownerId;
  const [isReadOnly, setIsReadOnly] = useState(!isOwner);
  const [checkingPermissions, setCheckingPermissions] = useState(!isOwner);

  const localStorageDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Intercept and silence tldraw license console logs in production/development
    const originalConsoleError = window.console.error;
    const originalConsoleWarn = window.console.warn;

    window.console.error = (...args: any[]) => {
      const msg = args.join(" ");
      if (
        msg.includes("No tldraw license key provided") ||
        msg.includes("A license is required for production deployments") ||
        msg.includes("sales@tldraw.com")
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.console.warn = (...args: any[]) => {
      const msg = args.join(" ");
      if (
        msg.includes("No tldraw license key provided") ||
        msg.includes("A license is required for production deployments") ||
        msg.includes("sales@tldraw.com")
      ) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    useAppStore.getState().setSyncStatus("saved");

    return () => {
      window.console.error = originalConsoleError;
      window.console.warn = originalConsoleWarn;
    };
  }, []);

  useEffect(() => {
    const registerProject = async () => {
      await addProjectToCookieAction(projectId);
    };
    registerProject();
  }, [projectId]);

  useEffect(() => {
    if (isConnected) {
      sendMessage("presence", { status: "online" });
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (isOwner) {
      setIsReadOnly(false);
      setCheckingPermissions(false);
      return;
    }

    const checkPermissions = async () => {
      if (!user) return;
      try {
        const res = await getProjectMembersAction(projectId);
        if (res.success && res.data) {
          const { collaborators } = res.data;
          const currentCollab = collaborators.find((c) => c.id === user.id);
          
          if (currentCollab && currentCollab.permission === "edit") {
            setIsReadOnly(false);
          } else {
            setIsReadOnly(true);
          }
        }
      } catch (err) {
        console.error("Failed to check project permissions:", err);
        setIsReadOnly(true);
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkPermissions();
  }, [projectId, user, isOwner]);

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isReadonly: isReadOnly });
    }
    document.body.classList.toggle("tldraw-readonly-active", isReadOnly);
    return () => {
      document.body.classList.remove("tldraw-readonly-active");
    };
  }, [editor, isReadOnly]);

  const saveToLocalStorageDebounced = useCallback(
    (editorInstance: Editor) => {
      if (localStorageDebounceRef.current) {
        clearTimeout(localStorageDebounceRef.current);
      }
      localStorageDebounceRef.current = setTimeout(() => {
        try {
          const snapshot = getSnapshot(editorInstance.store);
          localStorage.setItem(`collab_canvas_${projectId}`, JSON.stringify(snapshot));
          useAppStore.getState().setSyncStatus("saved");
        } catch (err) {
          console.error("Failed to save canvas to localStorage:", err);
          useAppStore.getState().setSyncStatus("saved");
        }
      }, 250); 
    },
    [projectId]
  );
  
  useEffect(() => {
    return () => {
      if (localStorageDebounceRef.current) {
        clearTimeout(localStorageDebounceRef.current);
      }
    };
  }, []);

  const handleMount = useCallback(
    (editorInstance: Editor) => {
      setEditor(editorInstance);

      let loadedSnapshot: any = null;

      if (initialCanvas) {
        try {
          loadedSnapshot = JSON.parse(initialCanvas);
        } catch (e) {
          console.error("Failed to parse initial canvas snapshot:", e);
        }
      } else {
        const localData = localStorage.getItem(`collab_canvas_${projectId}`);
        if (localData) {
          try {
            loadedSnapshot = JSON.parse(localData);
          } catch (e) {
            console.error("Failed to parse canvas data from localStorage:", e);
          }
        }
      }

      if (loadedSnapshot && loadedSnapshot.store) {
        if (!loadedSnapshot.schema) {
          try {
            loadedSnapshot.schema = editorInstance.store.schema.serialize();
          } catch (e) {
            console.error("Failed to serialize editor schema:", e);
          }
        }

        try {
          loadSnapshot(editorInstance.store, loadedSnapshot);
        } catch (e) {
          console.error("Failed to load snapshot into editor:", e);
        }
      }

      if (user) {
        try {
          editorInstance.user.updateUserPreferences({
            name: user.name,
            color: getUserCursorColor(user.id),
          });
        } catch (e) {
          console.error("Failed to update user preferences:", e);
        }
      }
    },
    [initialCanvas, projectId, user]
  );

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.store.listen(
      (event) => {
        if (event.source !== "remote") {
          const addedDoc: Record<string, any> = {};
          const updatedDoc: Record<string, any> = {};
          const removedDoc: Record<string, any> = {};

          const addedPres: Record<string, any> = {};
          const updatedPres: Record<string, any> = {};
          const removedPres: Record<string, any> = {};

          for (const [id, record] of Object.entries(event.changes.added)) {
            if (id.startsWith("instance_presence")) {
              addedPres[id] = record;
            } else if (
              id.startsWith("shape:") ||
              id.startsWith("page:") ||
              id.startsWith("asset:") ||
              id.startsWith("binding:") ||
              id.startsWith("document:")
            ) {
              addedDoc[id] = record;
            }
          }

          for (const [id, change] of Object.entries(event.changes.updated)) {
            if (id.startsWith("instance_presence")) {
              updatedPres[id] = change;
            } else if (
              id.startsWith("shape:") ||
              id.startsWith("page:") ||
              id.startsWith("asset:") ||
              id.startsWith("binding:") ||
              id.startsWith("document:")
            ) {
              updatedDoc[id] = change;
            }
          }

          for (const [id, record] of Object.entries(event.changes.removed)) {
            if (id.startsWith("instance_presence")) {
              removedPres[id] = record;
            } else if (
              id.startsWith("shape:") ||
              id.startsWith("page:") ||
              id.startsWith("asset:") ||
              id.startsWith("binding:") ||
              id.startsWith("document:")
            ) {
              removedDoc[id] = record;
            }
          }

          if (!isReadOnly) {
            // Always save to localStorage for local state preservation (camera zoom/pan, selections, shape changes)
            saveToLocalStorageDebounced(editor);

            const hasDocChanges = 
              Object.keys(addedDoc).length > 0 || 
              Object.keys(updatedDoc).length > 0 || 
              Object.keys(removedDoc).length > 0;

            if (hasDocChanges) {
              useAppStore.getState().setSyncStatus("saving");
              sendMessage("canvas_change", {
                added: addedDoc,
                updated: updatedDoc,
                removed: removedDoc,
              });
            }
          }

          const hasPresChanges = 
            Object.keys(addedPres).length > 0 || 
            Object.keys(updatedPres).length > 0 || 
            Object.keys(removedPres).length > 0;

          if (hasPresChanges) {
            console.log("WebSocket sending presence_change", { addedPres, updatedPres, removedPres });
            sendMessage("presence_change", {
              added: addedPres,
              updated: updatedPres,
              removed: removedPres,
            });
          }
        }
      },
      { scope: "all", source: "all" }
    );

    return () => {
      unsubscribe();
    };
  }, [editor, isReadOnly, saveToLocalStorageDebounced, sendMessage]);

  useEffect(() => {
    if (!editor || !lastMessage || !user) return;

    if (lastMessage.userId !== user.id) {
      if (lastMessage.type === "canvas_change" || lastMessage.type === "presence_change") {
        // console.log("WebSocket received remote change:", lastMessage.type, lastMessage.payload);
        const { added, updated, removed } = lastMessage.payload;

        editor.store.mergeRemoteChanges(() => {
          if (added && Object.keys(added).length > 0) {
            editor.store.put(Object.values(added));
          }
          if (updated && Object.keys(updated).length > 0) {
            const updatedRecords = Object.values(updated).map((change: any) => change[1]);
            editor.store.put(updatedRecords);
          }
          if (removed && Object.keys(removed).length > 0) {
            editor.store.remove(Object.keys(removed) as any[]);
          }
        });
      }
    }
  }, [editor, lastMessage, user]);

  useEffect(() => {
    if (!lastMessage || !user) return;

    if (lastMessage.type === "permission_changed") {
      const { permission } = lastMessage.payload;
      console.log("Permission updated in real-time:", permission);
      if (permission === "read") {
        setIsReadOnly(true);
      } else if (permission === "edit") {
        setIsReadOnly(false);
      }
    } else if (lastMessage.type === "access_revoked") {
      console.log("Access revoked in real-time. Redirecting...");
      toast.error("Your access to this project has been revoked by the owner.");
      router.push("/dashboard");
    } else if (lastMessage.type === "canvas_saved") {
      console.log("Canvas successfully saved to database");
      useAppStore.getState().setSyncStatus("saved");
    }
  }, [lastMessage, user, router]);

  if (checkingPermissions) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh] bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-6 w-6 text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-xs text-[#737373] tracking-wide font-medium">
            Loading Canvas...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-[#fafafa]">
      <div className={`flex-grow w-full h-full relative ${isReadOnly ? "tldraw-readonly" : ""}`}>
        <Tldraw 
          onMount={handleMount}
          autoFocus
          options={{ maxPages: 1 }}
          licenseKey="tldraw-perpetual/WyJteS1kdW1teS1saWNlbnNlLWlkIixbIioiXSwyLCIyMDk5LTEyLTMxVDIzOjU5OjU5Ljk5OVoiXQ==.AAAA"
        />
      </div>
    </div>
  );
};

export default CanvasWorkspace;
