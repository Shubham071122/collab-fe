"use client";

import "@/lib/mockLocation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Tldraw, 
  Editor, 
  getSnapshot, 
  loadSnapshot,
  useEditor, 
  useValue,
  DefaultColorStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  DefaultDashStyle,
  DefaultFontStyle,
  DefaultTextAlignStyle,
  GeoShapeGeoStyle,
  useMenuClipboardEvents
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { 
  MousePointer2, 
  Hand, 
  Pencil, 
  Eraser, 
  Type, 
  StickyNote, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Star, 
  ArrowUpRight, 
  Minus, 
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Menu,
  Undo2,
  Redo2,
  Grid,
  Image as ImageIcon,
  Download,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Plus,
  Minimize,
  Maximize,
  Minus as MinusIcon,
  Zap,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sliders,
  Eye,
  Link2,
  FolderOpen,
  Save,
  Lock,
  Moon,
  Sun,
  MousePointerClick,
  Clipboard
} from "lucide-react";

import { useWebSocket } from "@/hooks/useWebSocket";
import { addProjectToCookieAction } from "../../../actions/project.actions";
import { getProjectMembersAction } from "../../../actions/collaboration.actions";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSubscriptionAction } from "../../../actions/subscription.actions";
import { getProjectsAction } from "../../../actions/project.actions";
import { checkIsAccountLocked } from "@/lib/utils";
import { BillingModal } from "../dashboard/BillingModal";
import { Project } from "@/types";

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
	project: Project;
}

export const CanvasWorkspace = ({ project }: CanvasWorkspaceProps) => {
	const projectId = project.id;
	const initialCanvas = project.canvas;
	const ownerId = project.owner_id;

	const router = useRouter();
	const { isConnected, lastMessage, sendMessage } = useWebSocket(projectId);
	const { user, projects, subscription } = useAppStore();
	const [editor, setEditor] = useState<Editor | null>(null);
	const isOwner = !!user && user.id === ownerId;

	const [isBillingOpen, setIsBillingOpen] = useState(false);

	const [isReadOnly, setIsReadOnly] = useState(true);
	const [checkingPermissions, setCheckingPermissions] = useState(true);

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

  // Sync user subscription & project list on load
  useEffect(() => {
    const syncWorkspaceData = async () => {
      if (!user) return;
      try {
        if (!subscription) {
          const subRes = await getSubscriptionAction();
          if (subRes.success && subRes.data) {
            useAppStore.getState().setSubscription(subRes.data);
          }
        }
        if (projects.length === 0) {
          const projRes = await getProjectsAction();
          if (projRes.success && projRes.data) {
            useAppStore.getState().setProjects(projRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to sync workspace data:", err);
      }
    };
    syncWorkspaceData();
  }, [user, projects.length, subscription]);

  // Determine read-only mode based on ownership, lock status, and collaborator permissions
  useEffect(() => {
    const evalPermissions = async () => {
      if (!user) return;

      // 1. If project is locked due to owner's plan limits, force read-only for everyone
      if (project.is_locked) {
        setIsReadOnly(true);
        setCheckingPermissions(false);
        return;
      }

      // 2. If owner (and not locked): allow editing
      if (isOwner) {
        setIsReadOnly(false);
        setCheckingPermissions(false);
        return;
      }

      // 3. If collaborator: fetch member permissions from backend
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
        } else {
          setIsReadOnly(true);
        }
      } catch (err) {
        console.error("Failed to check project permissions:", err);
        setIsReadOnly(true);
      } finally {
        setCheckingPermissions(false);
      }
    };

    evalPermissions();
  }, [projectId, project.is_locked, user, isOwner]);

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

      // Customize theme colors programmatically
      try {
        const defaultTheme = editorInstance.getTheme("default");
        if (defaultTheme) {
          const theme = { ...defaultTheme };
          theme.colors = {
            ...theme.colors,
            light: {
              ...theme.colors.light,
              black: {
                ...theme.colors.light.black,
                solid: "#18181b",
                fill: "#18181b",
                semi: "rgba(24, 24, 27, 0.15)",
              },
              grey: {
                ...theme.colors.light.grey,
                solid: "#71717a",
                fill: "#a1a1aa",
                semi: "rgba(113, 113, 122, 0.15)",
              },
              "light-violet": {
                ...theme.colors.light["light-violet"],
                solid: "#a78bfa",
                fill: "#c084fc",
                semi: "rgba(167, 139, 250, 0.15)",
              },
              violet: {
                ...theme.colors.light.violet,
                solid: "#6d28d9",
                fill: "#7c3aed",
                semi: "rgba(109, 40, 217, 0.15)",
              },
              blue: {
                ...theme.colors.light.blue,
                solid: "#1d4ed8",
                fill: "#2563eb",
                semi: "rgba(29, 78, 216, 0.15)",
              },
              "light-blue": {
                ...theme.colors.light["light-blue"],
                solid: "#0284c7",
                fill: "#0ea5e9",
                semi: "rgba(2, 132, 199, 0.15)",
              },
              yellow: {
                ...theme.colors.light.yellow,
                solid: "#ca8a04",
                fill: "#eab308",
                semi: "rgba(202, 138, 4, 0.15)",
              },
              orange: {
                ...theme.colors.light.orange,
                solid: "#ea580c",
                fill: "#f97316",
                semi: "rgba(234, 88, 12, 0.15)",
              },
              green: {
                ...theme.colors.light.green,
                solid: "#15803d",
                fill: "#16a34a",
                semi: "rgba(21, 128, 61, 0.15)",
              },
              "light-green": {
                ...theme.colors.light["light-green"],
                solid: "#0d9488",
                fill: "#14b8a6",
                semi: "rgba(13, 148, 136, 0.15)",
              },
              "light-red": {
                ...theme.colors.light["light-red"],
                solid: "#db2777",
                fill: "#ec4899",
                semi: "rgba(219, 39, 119, 0.15)",
              },
              red: {
                ...theme.colors.light.red,
                solid: "#be123c",
                fill: "#e11d48",
                semi: "rgba(190, 18, 60, 0.15)",
              },
            },
          };
          editorInstance.updateTheme(theme);
        }
      } catch (err) {
        console.error("Failed to customize tldraw colors:", err);
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
      {project.is_locked && (
        <div className={`w-full border-b px-4 py-2.5 flex items-center justify-between gap-3 text-xs z-50 animate-fade-in select-none ${
          isOwner 
            ? "bg-[#fdf2f2] border-[#fbd5d5] text-[#9b1c1c]" 
            : "bg-[#fefaf0] border-[#fde8c3] text-[#b25e00]"
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Read-only mode:</span>
            <span>
              {isOwner 
                ? "Your account exceeds the project limit. Upgrade your plan to restore edit and share access." 
                : "This project is in read-only mode because the owner's plan limit has been exceeded. Please ask the owner to upgrade."
              }
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => setIsBillingOpen(true)}
              className="text-[#e02424] hover:text-[#c81e1e] font-semibold underline underline-offset-2 hover:no-underline transition-colors shrink-0 cursor-pointer"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      )}
      <div className={`flex-grow w-full h-full relative ${isReadOnly ? "tldraw-readonly" : ""}`}>
        <Tldraw 
          onMount={handleMount}
          autoFocus
          options={{ maxPages: 1 }}
          licenseKey="tldraw-perpetual/WyJteS1kdW1teS1saWNlbnNlLWlkIixbIioiXSwyLCIyMDk5LTEyLTMxVDIzOjU5OjU5Ljk5OVoiXQ==.AAAA"
          hideUi={true}
        >
          <CustomCanvasUI isReadOnly={isReadOnly} projectName={project.name} />
        </Tldraw>
      </div>

      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
      />
    </div>
  );
};

const CUSTOM_COLORS = [
  { name: "black", label: "Carbon Black", hex: "#18181b" },
  { name: "grey", label: "Slate Grey", hex: "#71717a" },
  { name: "light-violet", label: "Lavender Orchid", hex: "#a78bfa" },
  { name: "violet", label: "Amethyst Violet", hex: "#6d28d9" },
  { name: "blue", label: "Cobalt Blue", hex: "#1d4ed8" },
  { name: "light-blue", label: "Sky Blue", hex: "#0284c7" },
  { name: "yellow", label: "Mustard Yellow", hex: "#ca8a04" },
  { name: "orange", label: "Burnt Orange", hex: "#ea580c" },
  { name: "green", label: "Forest Green", hex: "#15803d" },
  { name: "light-green", label: "Mint Green", hex: "#0d9488" },
  { name: "light-red", label: "Blush Rose", hex: "#db2777" },
  { name: "red", label: "Terracotta Red", hex: "#be123c" }
];

interface CustomCanvasUIProps {
  isReadOnly: boolean;
  projectName: string;
}

const GEOMETRIC_SHAPES = [
  { value: "rectangle", label: "Rectangle", icon: <Square size={14} className="stroke-[1.75]" /> },
  { value: "ellipse", label: "Circle / Ellipse", icon: <Circle size={14} className="stroke-[1.75]" /> },
  { value: "triangle", label: "Triangle", icon: <Triangle size={14} className="stroke-[1.75]" /> },
  { value: "diamond", label: "Diamond", icon: <Diamond size={14} className="stroke-[1.75]" /> },
  
  { value: "hexagon", label: "Hexagon", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ) },
  { value: "oval", label: "Oval", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <ellipse cx="12" cy="12" rx="9" ry="5" />
    </svg>
  ) },
  { value: "rhombus", label: "Parallelogram", icon: <Minimize size={14} className="stroke-[1.75] rotate-45" /> },
  { value: "star", label: "Star", icon: <Star size={14} className="stroke-[1.75]" /> },

  { value: "cloud", label: "Cloud", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19A5.5 5.5 0 0 0 18 8.02a7.5 7.5 0 0 0-14.93 2.11A5 5 0 0 0 4.5 20h13a.5.5 0 0 0 .5-.5z" />
    </svg>
  ) },
  { value: "heart", label: "Heart", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ) },
  { value: "x-box", label: "X Box", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  ) },
  { value: "check-box", label: "Check Box", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <polyline points="9 11 12 14 22 4" />
    </svg>
  ) },

  { value: "arrow-left", label: "Arrow Left", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ) },
  { value: "arrow-up", label: "Arrow Up", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  ) },
  { value: "arrow-down", label: "Arrow Down", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ) },
  { value: "arrow-right", label: "Arrow Right", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ) }
];

const CustomCanvasUI = ({ isReadOnly, projectName }: CustomCanvasUIProps) => {
  const editor = useEditor();
  const clipboard = useMenuClipboardEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tldrFileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [submenuTopOffset, setSubmenuTopOffset] = useState(0);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track editor state for menu
  const isDarkMode = useValue("is dark mode", () => {
    try {
      return editor.user.getIsDarkMode();
    } catch {
      return false;
    }
  }, [editor]);

  const setIsDarkMode = useAppStore((state) => state.setIsDarkMode);
  useEffect(() => {
    setIsDarkMode(isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

  const isSnapMode = useValue("is snap mode", () => {
    try {
      return editor.user.getIsSnapMode();
    } catch {
      return false;
    }
  }, [editor]);

  const isToolLocked = useValue("is tool locked", () => {
    try {
      return editor.getInstanceState().isToolLocked;
    } catch {
      return false;
    }
  }, [editor]);

  useEffect(() => {
    if (!isMenuOpen) setHoveredMenu(null);
  }, [isMenuOpen]);

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // cat: which category; el: the button element so we can read its offsetTop for submenu alignment
  const handleCategoryHover = (cat: string, el: HTMLButtonElement) => {
    clearHoverTimer();
    setHoveredMenu(cat);
    setSubmenuTopOffset(el.offsetTop);
  };

  const handleMenuMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => setHoveredMenu(null), 200);
  };

  // Track editor state
  const currentToolId = useValue("current tool", () => editor.getCurrentToolId(), [editor]);
  const geoStyle = useValue("geo style", () => editor.getSharedStyles().getAsKnownValue(GeoShapeGeoStyle), [editor]);
  const selectedShapeIds = useValue("selected shape ids", () => editor.getSelectedShapeIds(), [editor]);

  const hasSelection = selectedShapeIds.length > 0;

  // Track undo, redo & grid
  const canUndo = useValue("can undo", () => editor.getCanUndo(), [editor]);
  const canRedo = useValue("can redo", () => editor.getCanRedo(), [editor]);
  const isGridMode = useValue("is grid mode", () => editor.getInstanceState().isGridMode, [editor]);
  
  // Zoom level tracking
  const zoomLevel = useValue("zoom level", () => editor.getZoomLevel(), [editor]);

  // Access shared styles reactively
  const sharedStyles = useValue("shared styles", () => editor.getSharedStyles(), [editor]);
  const currentColor = sharedStyles.getAsKnownValue(DefaultColorStyle) || "black";
  const currentFill = sharedStyles.getAsKnownValue(DefaultFillStyle) || "none";
  const currentSize = sharedStyles.getAsKnownValue(DefaultSizeStyle) || "m";
  const currentDash = sharedStyles.getAsKnownValue(DefaultDashStyle) || "draw";
  const currentFont = sharedStyles.getAsKnownValue(DefaultFontStyle) || "draw";
  const currentAlign = sharedStyles.getAsKnownValue(DefaultTextAlignStyle) || "start";

  const isTextSelectedOrActive = currentToolId === "text" || 
    (hasSelection && editor.getSelectedShapes().some(shape => shape.type === "text"));

  const isGeoSelectedOrActive = currentToolId === "geo" || 
    (hasSelection && editor.getSelectedShapes().some(shape => shape.type === "geo"));

  const updateStyle = (styleProp: any, value: any) => {
    editor.run(() => {
      editor.setStyleForNextShapes(styleProp, value);
      editor.setStyleForSelectedShapes(styleProp, value);
    });
  };

  const selectShapeType = (shapeName: string) => {
    editor.run(() => {
      editor.setStyleForNextShapes(GeoShapeGeoStyle, shapeName as any);
      editor.setStyleForSelectedShapes(GeoShapeGeoStyle, shapeName as any);
      editor.setCurrentTool("geo");
    });
  };

  const handleToolChange = (toolId: string) => {
    editor.run(() => {
      editor.setCurrentTool(toolId);
    });
  };

  const handleDelete = () => {
    editor.deleteShapes(editor.getSelectedShapeIds());
  };

  const handleDuplicate = () => {
    editor.duplicateShapes(editor.getSelectedShapeIds());
  };

  const handleBringToFront = () => {
    editor.bringToFront(editor.getSelectedShapeIds());
  };

  const handleSendToBack = () => {
    editor.sendToBack(editor.getSelectedShapeIds());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMenuOpen(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 600;
        const h = img.naturalHeight || 400;
        
        editor.run(() => {
          const assetId = ('asset:' + Math.random().toString(36).substring(2, 9)) as any;
          editor.createAssets([
            {
              id: assetId,
              type: 'image',
              typeName: 'asset',
              props: {
                name: file.name,
                src,
                w,
                h,
                mimeType: file.type,
                isAnimated: false,
              },
              meta: {},
            },
          ]);

          editor.createShape({
            type: 'image',
            x: editor.getViewportPageBounds().center.x - w / 2,
            y: editor.getViewportPageBounds().center.y - h / 2,
            props: {
              assetId,
              w,
              h,
            },
          });
        });
        toast.success("Image uploaded successfully!");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleExportPNG = async () => {
    setIsMenuOpen(false);
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) {
      toast.error("Nothing to export!");
      return;
    }
    try {
      const imageResult = await editor.toImage(shapeIds, { format: 'png', background: true });
      const url = URL.createObjectURL(imageResult.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName || 'canvas'}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Exported PNG successfully!");
    } catch (err) {
      console.error("Failed to export PNG:", err);
      toast.error("Failed to export PNG.");
    }
  };

  const handleExportSVG = async () => {
    setIsMenuOpen(false);
    const shapeIds = Array.from(editor.getCurrentPageShapeIds());
    if (shapeIds.length === 0) {
      toast.error("Nothing to export!");
      return;
    }
    try {
      const svgResult = await editor.getSvgString(shapeIds, { background: true });
      if (!svgResult || !svgResult.svg) {
        toast.error("Failed to generate SVG.");
        return;
      }
      const blob = new Blob([svgResult.svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName || 'canvas'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Exported SVG successfully!");
    } catch (err) {
      console.error("Failed to export SVG:", err);
      toast.error("Failed to export SVG.");
    }
  };

  const handleToggleGrid = () => {
    setIsMenuOpen(false);
    editor.updateInstanceState({ isGridMode: !isGridMode });
  };

  const handleUndo = () => {
    setIsMenuOpen(false);
    editor.undo();
  };

  const handleRedo = () => {
    setIsMenuOpen(false);
    editor.redo();
  };

  const handleZoomIn = () => {
    editor.zoomIn();
  };

  const handleZoomOut = () => {
    editor.zoomOut();
  };

  const handleZoomToFit = () => {
    editor.zoomToFit();
  };

  const handleResetZoom = () => {
    editor.resetZoom();
  };

  const handlePaste = async () => {
    setIsMenuOpen(false);
    try {
      const items = await navigator.clipboard.read();
      await clipboard.paste?.(items, 'menu');
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      toast.error("Clipboard access denied or empty. Try using Cmd+V / Ctrl+V.");
    }
  };

  const handleToggleDarkMode = () => {
    try {
      editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'light' : 'dark' });
    } catch (e) {
      console.error("Failed to update dark mode preference:", e);
    }
  };

  const handleToggleSnapMode = () => {
    try {
      editor.user.updateUserPreferences({ isSnapMode: !isSnapMode });
    } catch (e) {
      console.error("Failed to update snap mode preference:", e);
    }
  };

  const handleToggleToolLock = () => {
    try {
      editor.updateInstanceState({ isToolLocked: !isToolLocked });
    } catch (e) {
      console.error("Failed to update tool locked state:", e);
    }
  };

  const handleInsertEmbed = () => {
    setIsMenuOpen(false);
    const url = window.prompt("Enter embed URL (e.g. YouTube, Figma, Google Maps):");
    if (!url) return;

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid absolute URL (starting with http:// or https://)");
      return;
    }

    editor.run(() => {
      editor.createShape({
        type: 'embed',
        x: editor.getViewportPageBounds().center.x - 300,
        y: editor.getViewportPageBounds().center.y - 200,
        props: {
          url,
          w: 600,
          h: 400
        }
      });
    });
    toast.success("Embed inserted successfully!");
  };

  const handleExportTLDR = () => {
    setIsMenuOpen(false);
    try {
      const snapshot = getSnapshot(editor.store);
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName || 'canvas'}.tldr`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Saved project snapshot!");
    } catch (err) {
      console.error("Failed to export TLDR:", err);
      toast.error("Failed to export project.");
    }
  };

  const handleImportTLDR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMenuOpen(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        editor.run(() => {
          loadSnapshot(editor.store, json);
        });
        toast.success("Project loaded successfully!");
      } catch (err) {
        console.error("Failed to load project snapshot:", err);
        toast.error("Failed to load project file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (isReadOnly) return null;

  const activeColorObject = CUSTOM_COLORS.find(c => c.name === currentColor);

  const panelClass = isDarkMode 
    ? "bg-[#18181b]/95 border-[#27272a] text-neutral-200 shadow-[0_12px_36px_rgba(0,0,0,0.35)]" 
    : "bg-white/95 border-[#e5e5e7] text-neutral-800 shadow-[0_12px_36px_rgba(0,0,0,0.06)]";

  const itemClass = `w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer active:scale-[0.98] ${
    isDarkMode 
      ? "hover:bg-[#27272a] text-neutral-200 disabled:opacity-30" 
      : "hover:bg-[#f5f5f7] text-neutral-800 disabled:opacity-40"
  }`;

  const itemLinkClass = `w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer active:scale-[0.98] ${
    isDarkMode 
      ? "hover:bg-[#27272a] text-neutral-200" 
      : "hover:bg-[#f5f5f7] text-neutral-800"
  }`;

  const iconClass = "text-neutral-500 stroke-[2]";
  // Use isDarkMode conditional (not Tailwind dark: prefix) so these always work correctly
  const borderClass = isDarkMode ? "border-[#27272a]" : "border-[#ebebed]";
  const dividerClass = isDarkMode
    ? "h-[1px] bg-[#27272a] my-1"
    : "h-[1px] bg-[#ebebed] my-1";

  // Font preview: actual typeface shown, no forced bold so you see the real character
  const fontStyles: Record<string, React.CSSProperties> = {
    draw: { fontFamily: '"Comic Sans MS", cursive', fontWeight: '600', fontStyle: 'italic' },
    sans: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontWeight: '500' },
    serif: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: '500' },
    mono: { fontFamily: '"Courier New", Courier, monospace', fontWeight: '500' }
  };
  const fontLabels: Record<string, string> = {
    draw: 'Sketch',
    sans: 'Sans',
    serif: 'Serif',
    mono: 'Mono'
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[200] font-sans select-none">
      {/* HAMBURGER BUTTON — standalone top-left, explicit w-10 so left-full = 40px (not panel width) */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="relative w-10">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-10 h-10 border transition-all cursor-pointer select-none rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
              isDarkMode 
                ? "bg-[#18181b]/95 border-[#27272a] hover:bg-[#27272a] text-white hover:border-white/10" 
                : "bg-white/95 border-[#e5e5e7] hover:bg-[#f5f5f7] text-black hover:border-black/15"
            }`}
            title="Menu"
          >
            <Menu size={16} className="stroke-[2]" />
          </button>

          {isMenuOpen && (
            <>
              {/* Full-screen backdrop — outside click closes menu */}
              <div
                className="fixed inset-0 z-[45] bg-transparent"
                onClick={() => setIsMenuOpen(false)}
              />
              {/* Main menu panel — absolute from the relative hamburger wrapper.
                  Positioned right next to the button via left-full top-0 ml-2. */}
              <div
                className={`absolute left-full -top-10 ml-2 w-48 border rounded-xl p-1.5 flex flex-col gap-0.5 z-[50] animate-scale-in backdrop-blur-md relative ${panelClass}`}
                onMouseLeave={handleMenuMouseLeave}
              >
                {/* Edit */}
                <button
                  onMouseEnter={(e) => handleCategoryHover("edit", e.currentTarget)}
                  className={`${itemClass} ${hoveredMenu === "edit" ? (isDarkMode ? "bg-[#27272a]" : "bg-[#f5f5f7]") : ""}`}
                >
                  <div className="flex items-center gap-2.5"><Scissors size={13} className={iconClass} /><span>Edit</span></div>
                  <ChevronRight size={11} className="text-neutral-400" />
                </button>

                {/* View */}
                <button
                  onMouseEnter={(e) => handleCategoryHover("view", e.currentTarget)}
                  className={`${itemClass} ${hoveredMenu === "view" ? (isDarkMode ? "bg-[#27272a]" : "bg-[#f5f5f7]") : ""}`}
                >
                  <div className="flex items-center gap-2.5"><Eye size={13} className={iconClass} /><span>View</span></div>
                  <ChevronRight size={11} className="text-neutral-400" />
                </button>

                {/* Preferences */}
                <button
                  onMouseEnter={(e) => handleCategoryHover("preferences", e.currentTarget)}
                  className={`${itemClass} ${hoveredMenu === "preferences" ? (isDarkMode ? "bg-[#27272a]" : "bg-[#f5f5f7]") : ""}`}
                >
                  <div className="flex items-center gap-2.5"><Sliders size={13} className={iconClass} /><span>Preferences</span></div>
                  <ChevronRight size={11} className="text-neutral-400" />
                </button>

                {/* Insert & Media */}
                <button
                  onMouseEnter={(e) => handleCategoryHover("insert", e.currentTarget)}
                  className={`${itemClass} ${hoveredMenu === "insert" ? (isDarkMode ? "bg-[#27272a]" : "bg-[#f5f5f7]") : ""}`}
                >
                  <div className="flex items-center gap-2.5"><Link2 size={13} className={iconClass} /><span>Insert & Media</span></div>
                  <ChevronRight size={11} className="text-neutral-400" />
                </button>

                {/* Export & File */}
                <button
                  onMouseEnter={(e) => handleCategoryHover("export", e.currentTarget)}
                  className={`${itemClass} ${hoveredMenu === "export" ? (isDarkMode ? "bg-[#27272a]" : "bg-[#f5f5f7]") : ""}`}
                >
                  <div className="flex items-center gap-2.5"><Download size={13} className={iconClass} /><span>Export & File</span></div>
                  <ChevronRight size={11} className="text-neutral-400" />
                </button>

                {/* ─── Flyout Submenu — top aligned with the hovered item ─── */}
                {hoveredMenu && (
                  <div
                    className={`absolute left-full ml-2 w-52 border rounded-xl p-1.5 flex flex-col gap-0.5 z-50 animate-scale-in backdrop-blur-md ${panelClass}`}
                    style={{ top: submenuTopOffset }}
                    onMouseEnter={clearHoverTimer}
                    onMouseLeave={handleMenuMouseLeave}
                  >
                    {/* Edit submenu */}
                    {hoveredMenu === "edit" && (<>
                      <button onClick={handleUndo} disabled={!canUndo} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Undo2 size={13} className={iconClass} /><span>Undo</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘Z</span>
                      </button>
                      <button onClick={handleRedo} disabled={!canRedo} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Redo2 size={13} className={iconClass} /><span>Redo</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘Y</span>
                      </button>
                      <div className={dividerClass} />
                      <button onClick={() => { clipboard.cut?.('menu'); setIsMenuOpen(false); }} disabled={!hasSelection} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Scissors size={13} className={iconClass} /><span>Cut</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘X</span>
                      </button>
                      <button onClick={() => { clipboard.copy?.('menu'); setIsMenuOpen(false); }} disabled={!hasSelection} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Copy size={13} className={iconClass} /><span>Copy</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘C</span>
                      </button>
                      <button onClick={handlePaste} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Clipboard size={13} className={iconClass} /><span>Paste</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘V</span>
                      </button>
                      <button onClick={() => { editor.duplicateShapes(editor.getSelectedShapeIds()); setIsMenuOpen(false); }} disabled={!hasSelection} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Copy size={13} className={iconClass} /><span>Duplicate</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘D</span>
                      </button>
                      <button
                        onClick={() => { editor.deleteShapes(editor.getSelectedShapeIds()); setIsMenuOpen(false); }}
                        disabled={!hasSelection}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer active:scale-[0.98] ${
                          isDarkMode ? "text-red-400 hover:bg-red-950/20 disabled:opacity-30" : "text-red-600 hover:text-red-700 hover:bg-red-50/50 disabled:opacity-40"
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center gap-2.5"><Trash2 size={13} className="stroke-[2]" /><span>Delete</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">Del</span>
                      </button>
                      <div className={dividerClass} />
                      <button onClick={() => { editor.selectAll(); setIsMenuOpen(false); }} className={itemClass}>
                        <div className="flex items-center gap-2.5"><MousePointerClick size={13} className={iconClass} /><span>Select All</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘A</span>
                      </button>
                    </>)}

                    {/* View submenu */}
                    {hoveredMenu === "view" && (<>
                      <button onClick={handleZoomIn} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Plus size={13} className={iconClass} /><span>Zoom In</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘=</span>
                      </button>
                      <button onClick={handleZoomOut} className={itemClass}>
                        <div className="flex items-center gap-2.5"><MinusIcon size={13} className={iconClass} /><span>Zoom Out</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⌘-</span>
                      </button>
                      <button onClick={handleResetZoom} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Maximize size={13} className={iconClass} /><span>Zoom to 100%</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⇧0</span>
                      </button>
                      <button onClick={handleZoomToFit} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Minimize size={13} className={iconClass} /><span>Zoom to Fit</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⇧1</span>
                      </button>
                      <button onClick={() => { editor.zoomToSelection(); setIsMenuOpen(false); }} disabled={!hasSelection} className={itemClass}>
                        <div className="flex items-center gap-2.5"><MousePointer2 size={13} className={iconClass} /><span>Zoom to Selection</span></div>
                        <span className="text-[10px] text-neutral-400 font-normal">⇧2</span>
                      </button>
                      <div className={dividerClass} />
                      <button onClick={() => editor.updateInstanceState({ isGridMode: !isGridMode })} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Grid size={13} className={iconClass} /><span>Show Grid</span></div>
                        {isGridMode && <Check size={11} className="stroke-[2.5]" />}
                      </button>
                    </>)}

                    {/* Preferences submenu */}
                    {hoveredMenu === "preferences" && (<>
                      <button onClick={handleToggleDarkMode} className={itemClass}>
                        <div className="flex items-center gap-2.5">
                          {isDarkMode ? <Sun size={13} className={iconClass} /> : <Moon size={13} className={iconClass} />}
                          <span>Dark Mode</span>
                        </div>
                        {isDarkMode && <Check size={11} className="stroke-[2.5]" />}
                      </button>
                      <button onClick={handleToggleSnapMode} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Grid size={13} className={iconClass} /><span>Snap to Grid</span></div>
                        {isSnapMode && <Check size={11} className="stroke-[2.5]" />}
                      </button>
                      <button onClick={handleToggleToolLock} className={itemClass}>
                        <div className="flex items-center gap-2.5"><Lock size={13} className={iconClass} /><span>Tool Lock</span></div>
                        {isToolLocked && <Check size={11} className="stroke-[2.5]" />}
                      </button>
                    </>)}

                    {/* Insert submenu */}
                    {hoveredMenu === "insert" && (<>
                      <button onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }} className={itemLinkClass}>
                        <ImageIcon size={13} className={iconClass} /><span>Upload Image...</span>
                      </button>
                      <button onClick={handleInsertEmbed} className={itemLinkClass}>
                        <Link2 size={13} className={iconClass} /><span>Insert Embed Link...</span>
                      </button>
                    </>)}

                    {/* Export submenu */}
                    {hoveredMenu === "export" && (<>
                      <button onClick={handleExportPNG} className={itemLinkClass}>
                        <Download size={13} className={iconClass} /><span>Export as PNG</span>
                      </button>
                      <button onClick={handleExportSVG} className={itemLinkClass}>
                        <Download size={13} className={iconClass} /><span>Export as SVG</span>
                      </button>
                      <div className={dividerClass} />
                      <button onClick={handleExportTLDR} className={itemLinkClass}>
                        <Save size={13} className={iconClass} /><span>Save Project (.tldr)</span>
                      </button>
                      <button onClick={() => { setIsMenuOpen(false); tldrFileInputRef.current?.click(); }} className={itemLinkClass}>
                        <FolderOpen size={13} className={iconClass} /><span>Open Project (.tldr)...</span>
                      </button>
                    </>)}
                  </div>
                )}
              </div>
            </>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <input type="file" ref={tldrFileInputRef} onChange={handleImportTLDR} accept=".tldr,application/json" className="hidden" />
        </div>
      </div>

      {/* STYLE PANEL — starts just below the hamburger button, matches menu level */}
      <div className="absolute left-4 top-[150px] pointer-events-auto">
        <div className={`border rounded-2xl overflow-hidden backdrop-blur-md animate-scale-in ${panelClass}`}>
          <div className="flex flex-col gap-4 p-4 w-64 max-h-[72vh] overflow-y-auto custom-scrollbar">
          
          {/* Section: Actions (if shapes are selected) */}
          {hasSelection && (
            <div className={`flex flex-col gap-2 pb-3.5 border-b ${borderClass}`}>
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Arrange & Actions</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBringToFront}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border active:scale-95 ${
                    isDarkMode 
                      ? "bg-[#27272a] hover:bg-[#3f3f46] border-[#3f3f46] text-neutral-200" 
                      : "bg-[#f5f5f7] hover:bg-[#e5e5e7] border-[#e5e5e7]/40 text-neutral-700"
                  }`}
                  title="Bring to Front"
                >
                  <ChevronUp size={12} />
                  <span>Bring Front</span>
                </button>
                <button
                  onClick={handleSendToBack}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border active:scale-95 ${
                    isDarkMode 
                      ? "bg-[#27272a] hover:bg-[#3f3f46] border-[#3f3f46] text-neutral-200" 
                      : "bg-[#f5f5f7] hover:bg-[#e5e5e7] border-[#e5e5e7]/40 text-neutral-700"
                  }`}
                  title="Send to Back"
                >
                  <ChevronDown size={12} />
                  <span>Send Back</span>
                </button>
                <button
                  onClick={handleDuplicate}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border active:scale-95 ${
                    isDarkMode 
                      ? "bg-[#27272a] hover:bg-[#3f3f46] border-[#3f3f46] text-neutral-200" 
                      : "bg-[#f5f5f7] hover:bg-[#e5e5e7] border-[#e5e5e7]/40 text-neutral-700"
                  }`}
                  title="Duplicate Selection"
                >
                  <Copy size={11} />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={handleDelete}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border active:scale-95 ${
                    isDarkMode 
                      ? "bg-red-950/20 hover:bg-red-900/30 border-red-900/40 text-red-400" 
                      : "bg-red-50 hover:bg-red-100 border-red-200/40 text-red-600"
                  }`}
                  title="Delete Selection"
                >
                  <Trash2 size={11} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Section: Shapes / Geometry (Always Visible) */}
          <div className={`flex flex-col gap-2 pb-3.5 border-b ${borderClass}`}>
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Geometric Shapes</span>
            <div className={`grid grid-cols-4 gap-1.5 p-1.5 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
              {GEOMETRIC_SHAPES.map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => selectShapeType(shape.value)}
                  className={`py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                    currentToolId === "geo" && geoStyle === shape.value
                      ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                      : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50")
                  }`}
                  title={shape.label}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Stroke/Outline Color */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Color Palette</span>
              {activeColorObject && (
                <span className="text-[8px] font-mono text-neutral-500 dark:text-neutral-400 font-medium tracking-tight">
                  {activeColorObject.hex}
                </span>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {CUSTOM_COLORS.map((col) => (
                <button
                  key={col.name}
                  onClick={() => updateStyle(DefaultColorStyle, col.name)}
                  className="w-7 h-7 rounded-lg relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: col.hex }}
                  title={col.label}
                >
                  {currentColor === col.name && (
                    <span className={`absolute w-2 h-2 rounded-full shadow-sm border ${isDarkMode ? "bg-white border-white/10" : "bg-white border-black/10"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Fill/Background Style */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Fill Style</span>
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
              {[
                { value: "none", label: "None" },
                { value: "semi", label: "Semi" },
                { value: "solid", label: "Solid" },
                { value: "pattern", label: "Hatch" }
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateStyle(DefaultFillStyle, style.value)}
                  className={`py-1.5 text-[10px] font-medium rounded-lg transition-all cursor-pointer active:scale-95 ${
                    currentFill === style.value
                      ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                      : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50/50")
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Stroke Border Width (Size) */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Border Width</span>
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
              {[
                { value: "s", label: "Thin" },
                { value: "m", label: "Medium" },
                { value: "l", label: "Thick" },
                { value: "xl", label: "Extra" }
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => updateStyle(DefaultSizeStyle, size.value)}
                  className={`py-1.5 text-[10px] font-medium rounded-lg transition-all cursor-pointer active:scale-95 ${
                    currentSize === size.value
                      ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                      : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50/50")
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Stroke Style (Dash) */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Stroke Style</span>
            <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
              {[
                { value: "draw", label: "Sketch" },
                { value: "solid", label: "Solid" },
                { value: "dashed", label: "Dash" },
                { value: "dotted", label: "Dot" }
              ].map((dash) => (
                <button
                  key={dash.value}
                  onClick={() => updateStyle(DefaultDashStyle, dash.value)}
                  className={`py-1.5 text-[10px] font-medium rounded-lg transition-all cursor-pointer active:scale-95 ${
                    currentDash === dash.value
                      ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                      : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50/50")
                  }`}
                >
                  {dash.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Font Family (Conditional) */}
          {isTextSelectedOrActive && (
            <div className="flex flex-col gap-2">
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? "text-neutral-500" : "text-neutral-400"}`}>Font Family</span>
              <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
                {(["draw", "sans", "serif", "mono"] as const).map((fontKey) => (
                  <button
                    key={fontKey}
                    onClick={() => updateStyle(DefaultFontStyle, fontKey)}
                    className={`py-2 px-1 rounded-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      currentFont === fontKey
                        ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                        : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50/50")
                    }`}
                    title={fontLabels[fontKey]}
                  >
                    <span className="text-[15px] leading-none" style={fontStyles[fontKey]}>Ag</span>
                    <span className="text-[8px] font-medium opacity-70" style={{ fontFamily: 'inherit' }}>{fontLabels[fontKey]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Text Alignment (Conditional) */}
          {isTextSelectedOrActive && (
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Text Alignment</span>
              <div className={`grid grid-cols-4 gap-1 p-1 rounded-xl ${isDarkMode ? "bg-neutral-950/40" : "bg-[#f5f5f7]"}`}>
                {[
                  { value: "start", label: <AlignLeft size={12} className="mx-auto" /> },
                  { value: "middle", label: <AlignCenter size={12} className="mx-auto" /> },
                  { value: "end", label: <AlignRight size={12} className="mx-auto" /> }
                ].map((align) => (
                  <button
                    key={align.value}
                    onClick={() => updateStyle(DefaultTextAlignStyle, align.value)}
                    className={`py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                      currentAlign === align.value
                        ? (isDarkMode ? "bg-neutral-800 text-white shadow-sm" : "bg-white text-black shadow-sm")
                        : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-black hover:bg-neutral-50/50")
                    }`}
                    title={`Align ${align.value}`}
                  >
                    {align.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Row containing Toolbar (Center) & Zoom Controls (Right) */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
        
        {/* Placeholder Left for alignment */}
        <div className="w-[120px] invisible md:visible" />

        {/* Floating Bottom Toolbar (Excalidraw/Figma Style) */}
        <div className={`border px-3 py-1.5 rounded-2xl flex items-center gap-1.5 backdrop-blur-md ${panelClass}`}>
          {/* Select Tool */}
          <button
            onClick={() => handleToolChange("select")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "select" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Select"
          >
            <MousePointer2 size={15} className="stroke-[2.25]" />
          </button>

          {/* Hand Tool */}
          <button
            onClick={() => handleToolChange("hand")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "hand" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Hand (Pan)"
          >
            <Hand size={15} className="stroke-[2]" />
          </button>

          <div className={`w-[1px] h-4 mx-0.5 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

          {/* Draw (Pencil) Tool */}
          <button
            onClick={() => handleToolChange("draw")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "draw" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Draw (Pencil)"
          >
            <Pencil size={15} className="stroke-[2]" />
          </button>

          {/* Lightning Highlighter (Laser pointer) */}
          <button
            onClick={() => handleToolChange("laser")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "laser" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Lightning Highlighter"
          >
            <Zap size={15} className="stroke-[2]" />
          </button>

          <div className={`w-[1px] h-4 mx-0.5 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

          {/* Arrow Tool */}
          <button
            onClick={() => handleToolChange("arrow")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "arrow" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Arrow"
          >
            <ArrowUpRight size={15} className="stroke-[2.25]" />
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => handleToolChange("eraser")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "eraser" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Eraser"
          >
            <Eraser size={15} className="stroke-[2]" />
          </button>

          <div className={`w-[1px] h-4 mx-0.5 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

          {/* Text Tool */}
          <button
            onClick={() => handleToolChange("text")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "text" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Text"
          >
            <Type size={15} className="stroke-[2]" />
          </button>

          {/* Sticky Note Tool */}
          <button
            onClick={() => handleToolChange("note")}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              currentToolId === "note" 
                ? (isDarkMode ? "bg-white text-black" : "bg-black text-white") 
                : (isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a] cursor-pointer" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7] cursor-pointer")
            }`}
            title="Sticky Note"
          >
            <StickyNote size={15} className="stroke-[2]" />
          </button>

          <div className={`w-[1px] h-4 mx-0.5 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

          {/* Image Upload Tool */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
              isDarkMode ? "text-neutral-400 hover:text-white hover:bg-[#27272a]" : "text-neutral-500 hover:text-black hover:bg-[#f5f5f7]"
            }`}
            title="Upload Image"
          >
            <ImageIcon size={15} className="stroke-[2]" />
          </button>
        </div>

        {/* Zoom Controls (Bottom Right) */}
        <div className={`px-2 py-1.5 rounded-2xl flex items-center gap-1 backdrop-blur-md font-sans border ${panelClass}`}>
          <button
            onClick={handleZoomOut}
            className={`w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center transition-colors active:scale-90 ${
              isDarkMode ? "hover:bg-[#27272a] text-neutral-400 hover:text-white" : "hover:bg-[#f5f5f7] text-neutral-600 hover:text-black"
            }`}
            title="Zoom Out"
          >
            <MinusIcon size={12} className="stroke-[2.5]" />
          </button>
          
          <button
            onClick={handleResetZoom}
            className={`px-2 py-1 text-[10px] font-medium rounded-lg cursor-pointer transition-colors active:scale-95 ${
              isDarkMode ? "hover:bg-[#27272a] text-neutral-300 hover:text-white" : "hover:bg-[#f5f5f7] text-neutral-700 hover:text-black"
            }`}
            title="Reset Zoom to 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            className={`w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center transition-colors active:scale-90 ${
              isDarkMode ? "hover:bg-[#27272a] text-neutral-400 hover:text-white" : "hover:bg-[#f5f5f7] text-neutral-600 hover:text-black"
            }`}
            title="Zoom In"
          >
            <Plus size={12} className="stroke-[2.5]" />
          </button>
          
          <div className={`w-[1px] h-4 mx-0.5 ${isDarkMode ? "bg-[#27272a]" : "bg-[#e5e5e7]"}`} />

          <button
            onClick={handleZoomToFit}
            className={`w-7 h-7 rounded-lg cursor-pointer flex items-center justify-center transition-colors active:scale-90 ${
              isDarkMode ? "hover:bg-[#27272a] text-neutral-400 hover:text-white" : "hover:bg-[#f5f5f7] text-neutral-600 hover:text-black"
            }`}
            title="Zoom to Fit Selection/Content"
          >
            <Maximize size={12} className="stroke-[2]" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CanvasWorkspace;
