export interface User {
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  username: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  pageCount: number;
  coverImageUrl?: string;
}

export interface UserBook {
  id: number;
  bookId: number;
  title: string;
  author: string;
  status: string;
  currentPage?: number;
  pageCount: number;
  rating?: number;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
  coverImageUrl?: string;
}

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
}

export interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
  numFound: number;
}

export type ReadingStatus = "WantToRead" | "Reading" | "Finished" | "Dropped";

export const ReadingStatusLabel: Record<ReadingStatus, string> = {
  WantToRead: "Okumak İstiyorum",
  Reading: "Okuyorum",
  Finished: "Okudum",
  Dropped: "Bıraktıms",
};
