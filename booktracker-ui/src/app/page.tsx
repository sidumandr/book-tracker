"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import Logo from "@/app/assets/logo.png";

const previewBooks = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    status: "Okuyorum",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    status: "Okumak İstiyorum",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg",
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    status: "Bitirdim",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [isAuthenticated, router]);

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50/70 via-background to-background dark:from-violet-950/20 dark:via-background dark:to-background">
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-12">
        <div className="rounded-3xl border bg-background/90 backdrop-blur-sm shadow-sm p-6 md:p-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Image
                src={Logo}
                alt="BookTracker Logo"
                width={120}
                height={120}
                priority
                className="h-12 w-auto"
              />
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Yeni ziyaretçiler için ön izleme
              </Badge>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mt-6">
            BookTracker ile okuma hedeflerini daha kolay takip et
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            Hesap oluşturmadan önce uygulamanın nasıl göründüğünü ve neler
            yapabildiğini görebilirsin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 max-w-3xl">
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Takip durumu</p>
              <p className="font-semibold">Reading / Finished / Dropped</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Arama</p>
              <p className="font-semibold">Open Library entegrasyonu</p>
            </div>
            <div className="rounded-xl border bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Kütüphane</p>
              <p className="font-semibold">Kişisel kitap panosu</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Hemen Kayıt Ol
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4 text-violet-500" />
                Hızlı kitap arama
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Open Library ile kitapları hızlıca bul ve kütüphanene ekle.
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Library className="w-4 h-4 text-violet-500" />
                Okuma durum takibi
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Okuyorum, bitirdim veya okumak istiyorum olarak kitaplarını ayır.
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-500" />
                Güvenli hesap
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Hesabınla giriş yap, verilerini yalnızca sen yönet.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Kısmi içerik ön izlemesi</h2>
            <p className="text-muted-foreground mt-1">
              Kayıt olmadan örnek kartları görebilirsin.
            </p>
          </div>
          <Badge variant="secondary">Sadece görüntüleme</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {previewBooks.map((book) => (
            <Card key={book.title} className="bg-background/80">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 h-20 rounded-md object-cover border shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">{book.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {book.author}
                    </p>
                    <Badge variant="outline" className="mt-3">
                      {book.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <Card className="bg-background/90">
            <CardHeader>
              <CardTitle>Kitap düzenleme görünümü</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex gap-3">
                  <img
                    src="https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg"
                    alt="Atomic Habits kapak"
                    className="w-14 h-20 rounded object-cover border"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-medium">Atomic Habits</p>
                    <p className="text-sm text-muted-foreground">James Clear</p>
                    <Badge variant="outline" className="mt-2">
                      Okuyorum
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-9 rounded-md border px-3 flex items-center text-sm text-muted-foreground">
                    Sayfa: 132 / 320
                  </div>
                  <div className="h-9 rounded-md border px-3 flex items-center text-sm text-muted-foreground">
                    Puan: 4/5
                  </div>
                  <div className="h-20 rounded-md border p-3 text-sm text-muted-foreground">
                    Not: Bugun 2 bolum daha okundu.
                  </div>
                  <div className="h-9 rounded-md bg-violet-600 text-white flex items-center justify-center text-sm font-medium">
                    Guncellemeyi Kaydet
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Kitap duzenleme kismini onceden gor
            </h3>
            <p className="text-muted-foreground mt-3">
              Kayit olmadan da kitap duzenleme ekraninin nasil gorundugunu
              inceleyebilirsin. Giris yaptiktan sonra okuma durumu, sayfa
              ilerlemesi, puan ve notlarini kolayca guncelleyebilirsin.
            </p>
            <div className="flex gap-3 mt-6">
              <Button asChild>
                <Link href="/register">Ozellikleri kullanmak icin kayit ol</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
