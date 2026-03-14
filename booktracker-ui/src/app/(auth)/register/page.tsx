"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { AuthResponse } from "@/types";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post<AuthResponse>("/auth/register", form);
      const data = res.data;
      const token = data?.token ?? (data as { Token?: string })?.Token;
      const email = data?.email ?? (data as { Email?: string })?.Email;
      const username = data?.username ?? (data as { Username?: string })?.Username;
      if (!token || !email || !username) {
        setError("Sunucu yanıtı geçersiz. Giriş yapmayı deneyin.");
        return;
      }
      login(token, { email, username });
      router.push("/dashboard");
    } catch (err: unknown) {
      const ax = err && typeof err === "object"
        ? (err as { response?: { data?: { message?: string; Message?: string }; status?: number }; code?: string })
        : undefined;
      const data = ax?.response?.data;
      const msg = data?.message ?? data?.Message;
      const noResponse = !ax?.response;
      const isTimeout = ax?.code === "ECONNABORTED" || ax?.response?.status === 408;
      if (msg) setError(msg);
      else if (noResponse || isTimeout) setError("Bağlantı zaman aşımı veya sunucu yanıt vermiyor. API çalışıyor mu kontrol edin, tekrar deneyin.");
      else setError("Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">
        {/* logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-8 h-8 text-violet-500" />
          <span className="text-2xl font-bold">BookTracker</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kayıt Ol</CardTitle>
            <CardDescription>Kitap takibine başla</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Kullanıcı Adı"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Şifre"
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-violet-500 hover:underline">
                Giriş Yap
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
