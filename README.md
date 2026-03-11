# 🏛️ Campus Vault — Student Marketplace

A full-stack Next.js 14 student marketplace with authentication, listings, rentals, chat, ratings, admin moderation, and more.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (free: [Supabase](https://supabase.com) or [Neon](https://neon.tech))

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/campus_vault"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up database
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to your DB
npm run db:seed        # (Optional) Load demo data
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Demo Accounts (after seeding)

| Role   | Email                      | Password       |
|--------|----------------------------|----------------|
| Admin  | admin@campusvault.edu      | admin123456    |
| Seller | arjun@college.edu          | seller123456   |
| Buyer  | priya@college.edu          | buyer123456    |

---

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14, React 18, Tailwind CSS  |
| Backend    | Next.js API Routes (serverless)     |
| Database   | PostgreSQL + Prisma ORM             |
| Auth       | NextAuth.js (JWT + Credentials)     |
| Validation | Zod                                 |
| Hosting    | Vercel (frontend + API)             |
| DB Hosting | Supabase / Neon (free tier)         |

---

## 📁 Project Structure

```
campus-vault/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Registration
│   ├── marketplace/
│   │   ├── page.tsx              # Browse listings
│   │   └── [id]/page.tsx         # Listing detail
│   ├── services/page.tsx         # Campus services
│   ├── dashboard/
│   │   ├── layout.tsx            # Sidebar layout
│   │   ├── page.tsx              # Overview
│   │   ├── listings/             # My listings
│   │   ├── rentals/page.tsx      # Rental history
│   │   ├── chat/                 # Messaging
│   │   ├── services/page.tsx     # My services
│   │   └── profile/page.tsx      # Settings
│   ├── admin/page.tsx            # Admin panel
│   └── api/
│       ├── auth/                 # NextAuth + Register
│       ├── listings/             # CRUD listings
│       ├── rentals/              # Rental management
│       ├── chat/                 # Chat rooms
│       ├── ratings/              # Reviews
│       ├── reports/              # Report system
│       ├── services/             # Campus services
│       ├── admin/                # Admin actions
│       └── user/profile/         # Profile updates
├── components/
│   ├── Navbar.tsx
│   ├── Providers.tsx
│   └── marketplace/ListingCard.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
└── prisma/
    ├── schema.prisma             # Full DB schema
    └── seed.ts                   # Demo data
```

---

## 🔑 Key Features

- ✅ **Student-only registration** with role selection (Buyer/Seller/Service Provider)
- 🛍️ **Marketplace** with search, category filters, price filters, sort
- 📋 **Listing management** — create, approve (admin), remove
- 🔄 **Rental system** — rent items by date, deposit, return confirmation
- ⚡ **Urgent tag** — 24h visibility for urgent requests
- 💰 **Price insights** — see market avg for every category
- 💬 **In-app chat** with polling for real-time messages + read receipts
- ⭐ **Rating system** — 1–5 stars + written reviews
- ⚑ **Report system** — auto-ban after 3 confirmed reports (admin override)
- ⚙️ **Admin panel** — approve listings, ban/unban users, resolve reports, stats
- 🔧 **Services marketplace** — tutoring, tech repair, notes sharing

---

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
gh repo create campus-vault --public --push

# 2. Deploy via Vercel CLI or vercel.com
npm i -g vercel
vercel

# 3. Add environment variables in Vercel dashboard:
#    DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL (your vercel URL)

# 4. Run migration on prod DB (one-time):
#    In Vercel dashboard → Functions → run: npx prisma db push
```

---

## 📈 Phase 2 Roadmap

- [ ] OTP email verification via Resend.com
- [ ] Image upload to Supabase Storage / Cloudinary  
- [ ] WebSocket real-time chat (Socket.io)
- [ ] Push notifications
- [ ] Multi-college expansion with college-specific feeds
- [ ] Analytics dashboard with charts
- [ ] Mobile app (React Native)

---

## 🔧 Customize College Email Domains

In `app/api/auth/register/route.ts`, update:
```typescript
const allowedDomains = ['.edu', 'ac.in', 'edu.in', 'yourcollege.edu']
```
Remove the comment to enforce college-only emails.
