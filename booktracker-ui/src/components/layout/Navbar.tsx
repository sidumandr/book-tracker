"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!isAuthenticated()) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <BookOpen className="w-6 h-6 text-violet-500" />
          BookTracker
        </Link>

        {/* links */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Kitaplığım
          </Link>
          <Link
            href="/books"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Kitaplar
          </Link>
        </div>

        {/* user */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {user?.username}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>
    </nav>
  );
}
