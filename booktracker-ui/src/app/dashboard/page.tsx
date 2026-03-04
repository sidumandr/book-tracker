"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useBookStore } from "@/store/bookStore";
import BookCard from "@/components/books/BookCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReadingStatus } from "@/types";

const statusGroups: { label: string; status: ReadingStatus }[] = [
  { label: "📖 Okuyorum", status: "Reading" },
  { label: "📚 Okumak İstiyorum", status: "WantToRead" },
  { label: "✅ Bitirdim", status: "Finished" },
  { label: "❌ Bıraktım", status: "Dropped" },
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
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kitaplığım</h1>
          <p className="text-muted-foreground mt-1">{userBooks.length} kitap</p>
        </div>
        <Button onClick={() => router.push("/books")}>
          <Plus className="w-4 h-4 mr-2" />
          Kitap Ekle
        </Button>
      </div>

      {/* empty */}
      {userBooks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-xl font-medium mb-2">Kitaplığın boş</p>
          <p className="text-muted-foreground mb-6">Hemen ilk kitabını ekle!</p>
          <Button onClick={() => router.push("/books")}>Kitap Ekle</Button>
        </div>
      )}

      {/* book groups */}
      {statusGroups.map(({ label, status }) => {
        const filtered = userBooks.filter((ub) => ub.status === status);
        if (filtered.length === 0) return null;

        return (
          <div key={status} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              {label} ({filtered.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
