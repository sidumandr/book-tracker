"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useBookStore } from "@/store/bookStore";
import BookCard from "@/components/books/BookCard";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  BookMarked,
  BookCheck,
  BookX,
  Library,
  LucideIcon,
} from "lucide-react";
import { ReadingStatus } from "@/types";

const statusGroups: {
  label: string;
  status: ReadingStatus;
  icon: LucideIcon;
  color: string;
}[] = [
  {
    label: "Okuyorum",
    status: "Reading",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    label: "Okumak İstiyorum",
    status: "WantToRead",
    icon: BookMarked,
    color: "text-amber-500",
  },
  {
    label: "Bitirdiklerim",
    status: "Finished",
    icon: BookCheck,
    color: "text-emerald-500",
  },
  { label: "Bıraktım", status: "Dropped", icon: BookX, color: "text-red-500" },
];

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { userBooks, fetchUserBooks, isLoading } = useBookStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setIsChecking(false);
    fetchUserBooks();
  }, []);

  if (isChecking) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kitaplığım</h1>
          <p className="text-muted-foreground mt-1">
            Toplam {userBooks.length} kitap
          </p>
        </div>
        <Button
          onClick={() => router.push("/books")}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Kitap Ekle
        </Button>
      </div>

      {/* empty */}
      {userBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 mt-8 border-2 border-dashed border-border rounded-xl bg-muted/10">
          <div className="w-16 h-16 bg-muted flex items-center justify-center rounded-full mb-4">
            <Library className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Kitaplığın şu an boş</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Okuma serüvenine başlamak veya kütüphaneni düzenlemek için hemen ilk
            kitabını ekle.
          </p>
          <Button onClick={() => router.push("/books")}>
            <Plus className="w-4 h-4 mr-2" />
            Kitap Ekle
          </Button>
        </div>
      )}

      {/* groups */}
      {statusGroups.map(({ label, status, icon: Icon, color }) => {
        const filtered = userBooks.filter((ub) => ub.status === status);
        if (filtered.length === 0) return null;

        return (
          <div key={status} className="mb-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <h2 className="text-xl font-semibold">{label}</h2>
              <span className="ml-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {filtered.length}
              </span>
            </div>

            {/* cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((userBook) => (
                <BookCard key={userBook.id} userBook={userBook} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
