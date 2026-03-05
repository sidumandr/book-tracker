# Render + Vercel Dağıtım Kontrol Listesi

Kayıt 400 hatası alıyorsan önce **konsoldaki gerçek hata mesajına** bak (artık API’nin döndüğü `message` ekranda gösteriliyor). Aşağıdaki ayarlar bitti mi kontrol et.

---

## Render (Backend API)

### 1. Environment Variables

Render Dashboard → Servisini seç → **Environment** sekmesi → aşağıdaki değişkenleri ekle/güncelle.

| Key | Açıklama | Örnek |
|-----|----------|--------|
| `ConnectionStrings__DefaultConnection` | Supabase PostgreSQL connection string | Supabase → Project Settings → Database. Şifrede `&` veya `+` varsa **şifreyi tek tırnak içine al**: `Password='sifre'` |
| `Jwt__Key` veya `Jwt__Secret` | JWT imza anahtarı (en az ~32 karakter) | Rastgele güçlü string; ikisinden biri yeterli |
| `Jwt__Issuer` | (İsteğe bağlı) Token issuer | Örn. `BookTracker`; boşsa varsayılan kullanılır |
| `Jwt__Audience` | (İsteğe bağlı) Token audience | Örn. `BookTrackerUsers`; boşsa varsayılan kullanılır |

**.NET’te `__` = config’te `:`**  
- `Jwt__Key` → `Configuration["Jwt:Key"]`  
- `ConnectionStrings__DefaultConnection` → `GetConnectionString("DefaultConnection")`

### 2. Deploy’un güncel olduğundan emin ol

- **Environment** değişkenlerini ekleyip kaydettikten sonra **Manual Deploy → Deploy latest commit** yap.
- Kodda yaptığın son değişiklikler (CORS, AuthService, Controller) bu deploy’da çalışır.

### 3. Supabase connection string formatı

Supabase: **Project Settings → Database** → “Connection string” → **URI** veya **Session mode**:

- **URI** kullanıyorsan Npgsql formatına çevir:
  - Örnek URI: `postgresql://user:pass@host:5432/postgres`
  - Npgsql: `Host=host;Port=5432;Database=postgres;Username=user;Password=pass;SSL Mode=Require`
- Supabase genelde **SSL Mode=Require** ister; connection string’e ekle.

---

## Vercel (Frontend)

### 1. Environment Variables

Vercel Dashboard → Proje → **Settings → Environment Variables**.

| Key | Value | Kullanıldığı yer |
|-----|--------|-------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://book-tracker-api-wjm0.onrender.com/api` |

- **Önemli:** Sonunda `/api` olmalı; frontend istekleri `/auth/register` gibi path’leri buna ekler.
- Değişkeni ekledikten sonra **Redeploy** yap (Production / Preview).

### 2. CORS

CORS backend’de (Render’daki API) ayarlı. Vercel’de ekstra CORS ayarı yapmana gerek yok.

### 3. Frontend’te API URL

- `NEXT_PUBLIC_*` değişkenleri **build sırasında** gömülür; sadece env’i kaydetmek yetmez, **Redeploy** gerekir.
- Değer tam olarak: `https://book-tracker-api-wjm0.onrender.com/api` (sonunda `/api`, `https` ile).
- Yanlış veya eksikse istekler `localhost:5002`’e gider, 400/404 alırsın.

---

## Docker (Render’da backend Docker ile çalışıyorsa)

### 1. Port

- Render, container’a **PORT** env değişkeni verir (genelde 10000). `Dockerfile` artık bu portu kullanacak şekilde ayarlı.
- Render’da **Docker Command** boş bırakılırsa image’daki `CMD` kullanılır; ekstra bir şey yapmana gerek yok.

### 2. Env’ler container’a geçiyor mu?

- Render’da tanımladığın env’ler (ConnectionStrings, Jwt, vb.) container **runtime**’da otomatik verilir. Build’te değil, çalışırken okunur.
- Şifrede `&`, `+` varsa connection string’de şifreyi tek tırnak içine al: `Password='...'`.

---

## Auth (Register / Login) özeti

- **Register:** Başarılı → 200 + `{ token, email, username }`. Email kullanılıyor → 400 + `message`. Veritabanı/geçici hata → 500 + `message`.
- **Login:** Başarılı → 200 + `{ token, email, username }`. Hatalı giriş → 401 + `message`. Veritabanı hatası → 500 + `message`.
- Tüm hata yanıtları `{ message: "..." }` formatında; frontend bu alanı gösterebilir.

---

## Hâlâ 400/500 alıyorsan

1. **Ekrandaki hata metnini** oku: Artık API’nin döndüğü `message` gösteriliyor (örn. “Bu email zaten kullanılıyor.” veya “Jwt:Key …”).
2. **Render logs:** Render → Servis → **Logs**. Kayıt isteği sırasında exception veya stack trace var mı bak.
3. **Tarayıcı Network:** F12 → Network → register isteği → **Response** sekmesi. Body’deki `message` alanını kontrol et.

Bu adımlarla hem Render/Vercel tarafını hem de gerçek hata mesajını netleştirmiş olursun.
