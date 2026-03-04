"use client";
import { useState } from "react";
import { useBookStore } from "@/store/bookStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddBookFormProps {
  onSuccess?: () => void;
}

export default function AddBookForm({ onSuccess }: AddBookFormProps) {
  const { addBook } = useBookStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    pageCount: "",
    coverImageUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.pageCount) return;

    setIsLoading(true);
    try {
      await addBook({
        title: form.title,
        author: form.author,
        isbn: form.isbn || undefined,
        pageCount: parseInt(form.pageCount),
        coverImageUrl: form.coverImageUrl || undefined,
      });
      setForm({
        title: "",
        author: "",
        isbn: "",
        pageCount: "",
        coverImageUrl: "",
      });
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📚 Yeni Kitap Ekle</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kitap Adı *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Suç ve Ceza"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Yazar *</Label>
              <Input
                id="author"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Dostoyevski"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pageCount">Sayfa Sayısı *</Label>
              <Input
                id="pageCount"
                name="pageCount"
                type="number"
                value={form.pageCount}
                onChange={handleChange}
                placeholder="687"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="978-3-16-148410-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Kapak Görseli URL</Label>
            <Input
              id="coverImageUrl"
              name="coverImageUrl"
              value={form.coverImageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Ekleniyor..." : "Kitap Ekle"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
