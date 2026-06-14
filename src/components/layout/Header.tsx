"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/common/Button";
import { logoutAction } from "../../../actions/auth.actions";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { BillingModal } from "@/components/dashboard/BillingModal";

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearSession, subscription } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
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

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          {mounted && user ? (
            <div className="flex items-center gap-4">
              {pathname !== "/dashboard" && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] hover:border-black/20 text-xs font-semibold text-black tracking-wide flex items-center justify-center transition-all cursor-pointer select-none shrink-0 outline-none focus:ring-2 focus:ring-black/5"
                  title="Open profile menu"
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white border border-[#e5e5e7] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3.5 z-[1000] animate-scale-in">
                    {/* User profile */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-black truncate capitalize leading-tight">
                        {user.name}
                      </span>
                      <span className="text-xs text-[#737373] truncate leading-normal mt-0.5">
                        {user.email}
                      </span>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-[1px] bg-[#f5f5f7]" />
                    
                    {/* Active Plan / Tier info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#737373] font-medium">Plan</span>
                        <span className="font-semibold text-black bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-black/5 capitalize">
                          {subscription?.tier || "free"}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsBillingOpen(true);
                        }}
                        className="w-full text-center py-2 px-3 border border-[#e5e5e7] hover:border-black/20 rounded-xl text-xs font-semibold text-black transition-all hover:bg-[#f5f5f7] flex items-center justify-center cursor-pointer select-none"
                      >
                        Plans & Billing
                      </button>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-[1px] bg-[#f5f5f7]" />
                    
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-center py-2 text-xs font-semibold text-[#737373] hover:text-red-600 rounded-xl hover:bg-red-50 transition-all cursor-pointer select-none border border-transparent"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </header>
  );
};
export default Header;
