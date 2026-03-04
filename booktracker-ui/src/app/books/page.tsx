"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useBookStore } from "@/store/bookStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search, Loader2 } from "lucide-react";
import { OpenLibraryBook, OpenLibraryResponse } from "@/types";
import api from "@/lib/api";

export default function BooksPage() {
  const { isAuthenticated } = useAuthStore();
  const { userBooks, fetchUserBooks, addToLibrary, addBook } = useBookStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<OpenLibraryBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [addedBooks, setAddedBooks] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    setIsChecking(false);
    fetchUserBooks();
  }, []);

  if (isChecking) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    try {
      const { data } = await api.get<OpenLibraryResponse>("/books/search", {
        params: { query: search },
      });
      setResults(data.docs);
    } finally {
      setIsSearching(false);
    }
  };

  const getCoverUrl = (cover_i?: number) =>
    cover_i ? `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg` : null;

  const handleAddToLibrary = async (book: OpenLibraryBook) => {
    const created = await addBook({
      title: book.title,
      author: book.author_name?.[0] ?? "Bilinmiyor",
      isbn: book.isbn?.[0],
      pageCount: book.number_of_pages_median ?? 0,
      coverImageUrl: getCoverUrl(book.cover_i) ?? undefined,
    });

    await addToLibrary(created.id, "WantToRead");
    await fetchUserBooks();
    setAddedBooks((prev) => [...prev, book.key]);
  };

  const isAdded = (key: string) => addedBooks.includes(key);

  const isInLibrary = (book: OpenLibraryBook) => {
    const title = book.title.toLowerCase();
    const author = book.author_name?.[0]?.toLowerCase() ?? "";

    return userBooks.some(
      (ub) =>
        ub.author.toLowerCase() === author && ub.title.toLowerCase() === title,
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kitap Ara</h1>
        <p className="text-muted-foreground mt-1">
          Open Library'den milyonlarca kitap arasında ara
        </p>
      </div>

      {/* search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Kitap adı veya yazar ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ara"}
        </Button>
      </form>

      {/* reusults */}
      {results.length === 0 && !isSearching && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl font-medium mb-2">Kitap aramaya başla</p>
          <p className="text-muted-foreground">
            Yazar adı veya kitap adıyla arama yapabilirsin
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((book) => (
          <Card key={book.key} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                {/* cover */}
                {getCoverUrl(book.cover_i) ? (
                  <img
                    src={getCoverUrl(book.cover_i)!}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-muted rounded shrink-0 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}

                {/* info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {book.author_name?.[0] ?? "Bilinmiyor"}
                  </p>
                  {book.number_of_pages_median && (
                    <Badge variant="outline" className="text-xs mt-2">
                      {book.number_of_pages_median} sayfa
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-4"
                variant={
                  isAdded(book.key) || isInLibrary(book)
                    ? "secondary"
                    : "default"
                }
                disabled={isAdded(book.key) || isInLibrary(book)}
                onClick={() => handleAddToLibrary(book)}
              >
                <BookOpen className="w-3 h-3 mr-2" />
                {isAdded(book.key) || isInLibrary(book)
                  ? "✅ Kütüphanede"
                  : "Kütüphaneye Ekle"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
