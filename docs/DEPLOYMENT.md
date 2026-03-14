# BookTracker – Sıfırdan Deployment (Supabase + Render + Vercel)

Mevcut Supabase, Render ve Vercel projelerini silebilirsin. Aşağıdaki adımlarla sıfırdan kur.

---

## 1. Supabase (Veritabanı)

### 1.1 Proje oluştur

1. [supabase.com](https://supabase.com) → **New project**
2. Organization seç, **Name** ve **Database Password** belirle (şifreyi sakla; içinde `&` veya `+` varsa connection string’de tek tırnak kullanacağız).
3. Region seç → **Create new project**

### 1.2 Connection string (Pooler)

1. Sol menü **Project Settings** → **Database**
2. **Connection string** bölümünde **URI** veya **Connection pooling** kullan.
3. **Transaction** (port **6543**) pooler’ı önerilir (Render/Vercel ile daha uyumlu).

Örnek bilgiler:

- **Host:** `aws-0-eu-central-1.pooler.supabase.com` (kendi projenizdeki satır)
- **Port:** 6543
- **Database:** postgres
- **User:** `postgres.PROJECT_REF` (ör. `postgres.abcdefghijk`)

Npgsql connection string formatı:

```
Host=HOST;Port=6543;Database=postgres;Username=USER;Password='SIFRE';SSL Mode=Require;Trust Server Certificate=true
```

- Şifrede **`&`** veya **`+`** varsa mutlaka **tek tırnak** içine al: `Password='sifre'`.
- `SSL Mode=Require` ve `Trust Server Certificate=true` ekle.

### 1.3 Migration çalıştır (tabloları oluştur)

Backend’deki EF Core migration ile tabloları oluştur.

**Seçenek A – Lokal:**

```bash
cd BookTracker/src/BookTracker.API
export ConnectionStrings__DefaultConnection='Host=...;Port=6543;Database=postgres;Username=...;Password=''...'';SSL Mode=Require;Trust Server Certificate=true'
dotnet ef database update --project ../BookTracker.Infrastructure --startup-project .
```

**Seçenek B – appsettings.Development.json:**

1. `BookTracker.API/appsettings.Development.example.json` dosyasını `appsettings.Development.json` olarak kopyala.
2. İçine Supabase connection string ve JWT bilgilerini yaz.
3. Aynı dizinden: `dotnet ef database update --project ../BookTracker.Infrastructure --startup-project .`

Migration sonrası Supabase **Table Editor**’da `Users`, `Books`, `UserBooks` tabloları görünmeli.

---

## 2. Render (Backend API)

### 2.1 Yeni Web Service

1. [render.com](https://render.com) → **Dashboard** → **New +** → **Web Service**
2. Repo’yu bağla (GitHub/GitLab).
3. **Repository:** BookTracker’ı seç.

### 2.2 Ayarlar

| Ayar | Değer |
|------|--------|
| **Name** | Örn. `booktracker-api` |
| **Region** | İstediğin bölge |
| **Root Directory** | `src` (Dockerfile burada) |
| **Runtime** | **Docker** |
| **Instance Type** | Free veya ücretli |

- **Dockerfile** otomatik bulunur (`src/Dockerfile`).
- Render **PORT** env’i verir; Dockerfile bunu kullanır.

### 2.3 Environment Variables

Render → Servis → **Environment**:

| Key | Value |
|-----|--------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | Supabase pooler connection string (yukarıdaki formatta, şifre tek tırnakta) |
| `Jwt__Key` | En az ~32 karakter rastgele güçlü string (JWT imza anahtarı) |

İsteğe bağlı:

- `Jwt__Issuer` (örn. `BookTrackerAPI`)
- `Jwt__Audience` (örn. `BookTrackerApp`)

**.NET’te `__` = config’te `:`** (örn. `Jwt__Key` → `Jwt:Key`).

### 2.4 Health Check

- **Health Check Path:** `/api/health`
- Bu endpoint DB’ye gitmez; servis ayağa kalkınca hemen 200 döner.

**Create Web Service** ile deploy başlar. İlk deploy biraz sürebilir. Logs’ta hata varsa connection string ve Jwt__Key’i kontrol et.

### 2.5 API base URL

Deploy bittikten sonra servis URL’i örn: `https://booktracker-api-xxxx.onrender.com`  
Frontend’te **base URL** olarak bunun sonuna `/api` ekleyeceksin: `https://booktracker-api-xxxx.onrender.com/api`

---

## 3. Vercel (Frontend)

### 3.1 Yeni proje

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. BookTracker repo’sunu seç.
3. **Root Directory:** `booktracker-ui` (veya frontend’in bulunduğu klasör).
4. **Framework Preset:** Next.js.

### 3.2 Environment Variable

**Settings → Environment Variables** (veya import sırasında):

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | Render API base URL: `https://booktracker-api-xxxx.onrender.com/api` |

- Sonunda **mutlaka** `/api` olsun.
- Değişkeni ekledikten sonra **Redeploy** yap (build’te gömülür).

### 3.3 Deploy

Deploy’u çalıştır. Production URL’den uygulamayı aç; giriş/kayıt Render’daki API’yi kullanacaktır.

---

## 4. Özet

1. **Supabase:** Yeni proje → connection string (pooler, 6543) → migration ile tabloları oluştur.
2. **Render:** Yeni Web Service, Docker, Root Directory `src`, env’ler (ConnectionStrings, Jwt__Key), health path `/api/health`.
3. **Vercel:** Yeni proje, root `booktracker-ui`, `NEXT_PUBLIC_API_URL` = `https://xxx.onrender.com/api`, redeploy.

---

## 5. API route’ları (referans)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/api/health` | Sağlık (auth yok) |
| POST | `/api/auth/register` | Kayıt |
| POST | `/api/auth/login` | Giriş |
| GET/POST | `/api/books` | Kitaplar |
| GET | `/api/books/search?query=` | Open Library arama |
| GET/POST/PUT/DELETE | `/api/UserBook` | Kullanıcı kütüphanesi |

Base URL: `https://your-render-app.onrender.com/api`

---

## 6. Sorun giderme

- **Kayıt/giriş çok yavaş:** İlk istekte DB bağlantısı açılıyor; backend startup’ta connection warmup yapıyor. 15 sn sonra timeout alırsan connection string ve Supabase’in açık olduğunu kontrol et.
- **CORS:** Backend `*.vercel.app` ve localhost’a izin veriyor; ekstra ayar gerekmez.
- **400 “email/kullanıcı adı kullanılıyor”:** Constraint’e göre mesaj değişir; farklı email/kullanıcı adı dene.
- **500:** Render **Logs** ve Supabase connection string (özellikle şifre ve SSL) kontrol et.
