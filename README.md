# Make Their Day - Charity Day Web Platform ❤️🤝

A mobile-first, English-only web platform for the charity day **"Make Their Day"**. It empowers organizers to collect price donations from many participants, tracks items and lowest prices automatically, broadcasts real-time pop-up announcements, and provides an admin control dashboard.

---

## 🎨 Brand Identity

- **Logo**: A heart-shaped handshake representing warmth, caring, and trust. Displayed in:
  - Header
  - Survey pop-up
  - Admin login
  - Favicon (`/icon.svg`)
- **Theme**: Dark theme with `#000000` background.
- **Palette**:
  - Brand Red: `#B22026` (main buttons, progress indicators, lowest price highlights)
  - Brand Navy: `#123A66` (tiles, cards, secondary buttons)
  - Light Blue: `#A9C8EE` (accents, subtitle badges)
  - White text: `#FFFFFF`
- **Typography**: Poppins (weights 400 and 500 only).

---

## 📱 User Flow

1. **First Visit Survey Gate**:
   - A modal survey blocks the page upon first visit.
   - Requires: **Full Name**, **Phone Number** (with format validation), and **Class** (dropdown).
   - Saved once per device in `localStorage`.
   - **Strict Privacy & Gating**: No item is visible in the DOM or UI before the survey is completed.
2. **Main Item Catalogue**:
   - 16px rounded cards with 1px subtle borders, smooth 200ms micro-interactions.
   - Item photo, name, price field ($), and optional comment note.
   - "Send Price" button with instant **"Saved ✓"** feedback.
   - Users can edit or update their submitted price at any time (newer price replaces the old one).
   - Users never see other users' prices or phone numbers.
3. **Progress Bar & Finished Screen**:
   - Live progress indicator (e.g. "2 of 12 done") with Brand Red fill.
   - Celebratory **"Thank you for making their day"** screen with confetti animation when all items are priced.
4. **Realtime Admin Announcements**:
   - Broadcast messages from organizers pop up within seconds with a **"Got it"** dismiss button.

---

## 🛡️ Admin Portal (`/admin`)

- **Password Protected**: Default password: `MakeTheirDay2026!` (configurable via `ADMIN_PASSWORD`).
- **Dashboard & Lowest Price Tracking**:
  - Displays every item with its **LOWEST price**, the winner's name, class, phone number (with direct tap-to-call link), and comment.
  - Automatically updates when new or lower bids are received.
  - **Price Breakdown**: Tap any item to inspect all submitted bids sorted from low to high.
- **Manage Items**:
  - Add new items with photo URL, title, and description.
  - Edit existing items or toggle active status.
  - Delete items with confirmation dialog.
- **Realtime Pop-ups**:
  - Broadcast instant notifications to all active participants.
  - View broadcast history and delete past messages.
- **Search, Filter & Export to CSV**:
  - Search by item name, user name, or phone number.
  - Filter by class.
  - One-click CSV export with all items, prices, winner flags, and timestamps.

---

## 🚀 Setup & Deployment

### 1. Local Development

```bash
# Clone and navigate into directory
cd "charity day"

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the user view or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### 2. Supabase Database Configuration

The application includes an in-memory fallback store so it works immediately out of the box. To connect your Supabase project:

1. Copy `.env.example` to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_PASSWORD=MakeTheirDay2026!
   ```

2. Open your **Supabase Dashboard** -> **SQL Editor** and run the contents of [supabase/schema.sql](file:///d:/charity%20day/supabase/schema.sql).

### 3. Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Deploy! Next.js App Router and Serverless APIs are automatically optimized for Vercel.
