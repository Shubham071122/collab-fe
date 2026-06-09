"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/common/Button";
import { logoutAction } from "../../../actions/auth.actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearSession } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await logoutAction();
      if (res.success) {
        clearSession();
        toast.success(res.message || "Logged out successfully");
        router.push("/");
      } else {
        toast.error(res.message || "Failed to log out");
      }
    } catch (err) {
      toast.error("An error occurred during logout");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full apple-glass border-b border-[#e5e5e7]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute top-0 left-0 w-[18px] h-[18px] rounded-full border-[1.5px] border-black bg-white transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            <div className="absolute bottom-0 right-0 w-[18px] h-[18px] rounded-full bg-black border border-black transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight leading-none">
            Collab
          </span>
        </Link>

        {/* Navigation */}
        {/* <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide">
          <Link
            href="/about"
            className={`transition-colors duration-200 hover:text-black ${
              pathname === "/about" ? "text-black font-medium" : "text-[#737373]"
            }`}
          >
            About
          </Link>
          {mounted && user && (
            <Link
              href="/dashboard"
              className={`transition-colors duration-200 hover:text-black ${
                pathname === "/dashboard" ? "text-black font-medium" : "text-[#737373]"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav> */}

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          {mounted && user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs text-[#737373] font-medium tracking-wide bg-[#f5f5f7] px-3.5 py-1.5 rounded-full border border-black/5">
                {user.name}
              </span>
              {pathname !== "/dashboard" && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="text" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="text" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Start Collaborating
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
