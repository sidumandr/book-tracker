"use client";
import { useState } from "react";
import { UserBook, ReadingStatusLabel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, BookOpen, Quote, Star } from "lucide-react";
import { useBookStore } from "@/store/bookStore";
import UpdateProgressModal from "@/components/books/UpdateProgressModal";

interface BookCardProps {
  userBook: UserBook;
}

export default function BookCard({ userBook }: BookCardProps) {
  const { removeFromLibrary, fetchUserBooks } = useBookStore();
  const [modalOpen, setModalOpen] = useState(false);

  const progress =
    userBook.currentPage && userBook.pageCount
      ? Math.round((userBook.currentPage / userBook.pageCount) * 100)
      : 0;

  const handleRemove = async () => {
    await removeFromLibrary(userBook.bookId);
    await fetchUserBooks();
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex gap-3">
            {/* cover img */}
            {userBook.coverImageUrl ? (
              <img
                src={userBook.coverImageUrl}
                alt={userBook.title}
                className="w-16 h-24 object-cover rounded shrink-0"
              />
            ) : (
              <div className="w-16 h-24 bg-muted rounded shrink-0 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}

            {/* title and author */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">
                  {userBook.title}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {
                    ReadingStatusLabel[
                      userBook.status as keyof typeof ReadingStatusLabel
                    ]
                  }
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {userBook.author}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* progress bar */}
          {userBook.status === "Reading" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {userBook.currentPage ?? 0} / {userBook.pageCount} sayfa
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* rating */}
          {userBook.status === "Finished" && userBook.rating && (
            <div className="flex items-center gap-1 text-sm">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= userBook.rating!
                        ? "text-amber-300 fill-amber-200"
                        : "text-muted-foreground opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground ml-1">
                ({userBook.rating}/5)
              </span>
            </div>
          )}
          {/* actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="w-3 h-3 mr-1" />
              Güncelle
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* notes */}
          {userBook.notes && (
            <div className="mt-2 p-2 rounded-md bg-muted/50 border-l-2 border-violet-400">
              <div className="flex items-start gap-2">
                <Quote className="w-3 h-3 text-violet-500 mt-1 shrink-0" />
                <p className="text-xs italic text-muted-foreground line-clamp-2">
                  {userBook.notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UpdateProgressModal
        userBook={userBook}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
