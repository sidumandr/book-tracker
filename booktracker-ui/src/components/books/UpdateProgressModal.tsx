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
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookMarked,
  BookOpen,
  BookCheck,
  BookX,
  Star,
  LucideIcon,
} from "lucide-react";

interface Props {
  userBook: UserBook;
  open: boolean;
  onClose: () => void;
}

const statusOptions: {
  value: ReadingStatus;
  label: string;
  icon: LucideIcon;
}[] = [
  {
    value: "WantToRead" as ReadingStatus,
    label: "Okumak İstiyorum",
    icon: BookMarked,
  },
  { value: "Reading" as ReadingStatus, label: "Okuyorum", icon: BookOpen },
  { value: "Finished" as ReadingStatus, label: "Bitirdim", icon: BookCheck },
  { value: "Dropped" as ReadingStatus, label: "Bıraktım", icon: BookX },
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

  const [shouldFinish, setShouldFinish] = useState(false);

  const isAtTheEnd =
    currentPage >= userBook.pageCount - 1 && status === "Reading";

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const finalStatus = shouldFinish ? "Finished" : status;

      await updateProgress(userBook.bookId, {
        status: finalStatus,
        currentPage:
          finalStatus === "Reading" ? currentPage : userBook.pageCount,
        rating: finalStatus === "Finished" ? rating : undefined,
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
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatus(opt.value);
                      if (opt.value !== "Reading") setShouldFinish(false);
                    }}
                    className={`p-2 flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                      status === opt.value
                        ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="leading-none mt-px">{opt.label}</span>
                  </button>
                );
              })}
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

              {isAtTheEnd && (
                <div className="flex items-center space-x-2 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg animate-in fade-in slide-in-from-top-1">
                  <Checkbox
                    id="finish-check"
                    checked={shouldFinish}
                    onCheckedChange={(checked) => setShouldFinish(!!checked)}
                  />
                  <label
                    htmlFor="finish-check"
                    className="text-sm font-medium leading-none cursor-pointer text-violet-900 dark:text-violet-300"
                  >
                    Kitap bitiyor, rafa kaldıralım mı?
                  </label>
                </div>
              )}

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
          {(status === "Finished" || shouldFinish) && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <Label>Puan Ver</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors duration-200 ${
                        star <= rating
                          ? "text-amber-300 fill-amber-200"
                          : "text-muted-foreground/40 hover:text-amber-200"
                      }`}
                    />
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
