"use client";
import { useState } from "react";
import { UserBook, ReadingStatus } from "@/types";
import { useBookStore } from "@/store/bookStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  userBook: UserBook;
  open: boolean;
  onClose: () => void;
}

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: "WantToRead", label: "📚 Okumak İstiyorum" },
  { value: "Reading", label: "📖 Okuyorum" },
  { value: "Finished", label: "✅ Bitirdim" },
  { value: "Dropped", label: "❌ Bıraktım" },
];

export default function UpdateProgressModal({
  userBook,
  open,
  onClose,
}: Props) {
  const { updateProgress, fetchUserBooks } = useBookStore();
  const [status, setStatus] = useState<ReadingStatus>(
    userBook.status as ReadingStatus,
  );
  const [currentPage, setCurrentPage] = useState(userBook.currentPage ?? 0);
  const [rating, setRating] = useState(userBook.rating ?? 0);
  const [notes, setNotes] = useState(userBook.notes ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProgress(userBook.bookId, {
        status,
        currentPage: status === "Reading" ? currentPage : undefined,
        rating: status === "Finished" ? rating : undefined,
        notes: notes.trim() !== "" ? notes : undefined,
      });
      await fetchUserBooks();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="leading-tight">{userBook.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{userBook.author}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* status selection */}
          <div className="space-y-2">
            <Label>Okuma Durumu</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    status === opt.value
                      ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* page */}
          {status === "Reading" && (
            <div className="space-y-2">
              <Label htmlFor="currentPage">
                Kaçıncı Sayfadasın? ({userBook.pageCount} sayfa)
              </Label>
              <Input
                id="currentPage"
                type="number"
                min={0}
                max={userBook.pageCount}
                value={currentPage === 0 ? "" : currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value) || 0)}
              />
              {/* progress bar */}
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((currentPage / userBook.pageCount) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                %{Math.round((currentPage / userBook.pageCount) * 100)}
              </p>
            </div>
          )}

          {/* rate */}
          {status === "Finished" && (
            <div className="space-y-2">
              <Label>Puan Ver</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar (opsiyonel)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kitap hakkında düşünceleriniz..."
            />
          </div>

          {/* buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              İptal
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
