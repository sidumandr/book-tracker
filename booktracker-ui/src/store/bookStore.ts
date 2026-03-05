import { create } from "zustand";
import { Book, User, UserBook } from "@/types";
import api from "@/lib/api";

interface BookState {
  books: Book[];
  userBooks: UserBook[];
  isLoading: boolean;
  error: string | null;

  fetchBooks: () => Promise<void>;
  fetchUserBooks: () => Promise<void>;
  addBook: (book: Omit<Book, "id">) => Promise<Book>;
  addToLibrary: (bookId: number, status: string) => Promise<void>;
  updateProgress: (bookId: number, data: Partial<UserBook>) => Promise<void>;
  removeFromLibrary: (bookId: number) => Promise<void>;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  userBooks: [],
  isLoading: false,
  error: null,

  fetchBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Book[]>("/books");
      set({ books: data });
    } catch {
      set({ error: "Kitaplar yüklenmedi." });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<UserBook[]>("/UserBook");
      set({ userBooks: data ?? [] });
    } catch {
      set({ userBooks: [], error: "Kütüphane yüklenemedi. Tekrar giriş yapmayı deneyin." });
    } finally {
      set({ isLoading: false });
    }
  },

  addBook: async (book) => {
    const { data } = await api.post<Book>("/books", book);
    set((state) => ({ books: [...state.books, data] }));
    return data;
  },

  addToLibrary: async (bookId, status) => {
    await api.post("/UserBook", { bookId, status });
  },

  updateProgress: async (bookId, data) => {
    await api.put(`/UserBook/${bookId}`, data);
    const { data: updated } = await api.get<UserBook[]>("/UserBook");
    set({ userBooks: updated });
  },

  removeFromLibrary: async (bookId) => {
    await api.delete(`/UserBook/${bookId}`);
    set((state) => ({
      userBooks: state.userBooks.filter((ub) => ub.bookId !== bookId),
    }));
  },
}));
