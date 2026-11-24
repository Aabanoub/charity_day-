-- ==============================================================================
-- "Make Their Day" Charity Platform - Supabase Schema
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Items Table
CREATE TABLE IF NOT EXISTS mtd_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table (Survey profile saved per device)
CREATE TABLE IF NOT EXISTS mtd_users (
  id TEXT PRIMARY KEY, -- Device-generated unique ID
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Price Submissions Table (One price per user per item)
CREATE TABLE IF NOT EXISTS mtd_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES mtd_items(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_class TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_item UNIQUE (item_id, user_id)
);

-- 5. Admin Broadcast Messages (Realtime pop-ups)
CREATE TABLE IF NOT EXISTS mtd_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE mtd_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtd_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtd_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mtd_messages ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Items: Anyone can read active items
CREATE POLICY "Public items are viewable by everyone" 
  ON mtd_items FOR SELECT 
  USING (active = TRUE);

-- Users: Anyone can insert their profile; read is restricted
CREATE POLICY "Users can insert their own survey" 
  ON mtd_users FOR INSERT 
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own survey" 
  ON mtd_users FOR UPDATE 
  USING (TRUE) 
  WITH CHECK (TRUE);

CREATE POLICY "Users can read their own survey" 
  ON mtd_users FOR SELECT 
  USING (TRUE);

-- Submissions: Anyone can insert/upsert their own price
CREATE POLICY "Users can insert their own submissions" 
  ON mtd_submissions FOR INSERT 
  WITH CHECK (TRUE);

CREATE POLICY "Users can update their own submissions" 
  ON mtd_submissions FOR UPDATE 
  USING (TRUE) 
  WITH CHECK (TRUE);

-- Messages: Anyone can read active messages
CREATE POLICY "Public active messages viewable by everyone" 
  ON mtd_messages FOR SELECT 
  USING (active = TRUE);

-- 8. Add Realtime for mtd_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mtd_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE mtd_messages;
  END IF;
END $$;

-- 9. Storage Bucket for Item Photos
-- Run in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mtd-items', 'mtd-items', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for mtd-items bucket" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'mtd-items');

CREATE POLICY "Allow uploads to mtd-items bucket" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'mtd-items');

CREATE POLICY "Allow update on mtd-items bucket" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'mtd-items');


-- 10. Initial Seed Items (Optional Starter Catalogue)
INSERT INTO mtd_items (id, name, photo_url, description, active, order_index)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Handmade Knitted Wool Scarf', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80', 'Cozy warm winter scarf handmade with premium soft yarn.', TRUE, 1),
  ('c1000000-0000-0000-0000-000000000002', 'Artisanal Scented Candle Set', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80', 'Lavender & vanilla soy wax candles with wooden wicks.', TRUE, 2),
  ('c1000000-0000-0000-0000-000000000003', 'Ceramic Morning Mug with Saucer', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 'Hand-thrown speckled ceramic mug crafted with love.', TRUE, 3),
  ('c1000000-0000-0000-0000-000000000004', 'Gourmet Dark Chocolate Truffles Box', 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=600&auto=format&fit=crop&q=80', '12 handcrafted artisan truffles with raspberry and hazelnut.', TRUE, 4),
  ('c1000000-0000-0000-0000-000000000005', 'Vintage Hardcover Journal & Fountain Pen', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'Eco-friendly handmade paper journal with brass clip and pen.', TRUE, 5),
  ('c1000000-0000-0000-0000-000000000006', 'Succulent Terrarium in Geometric Glass', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80', 'Low-maintenance mini indoor garden in a copper geometric frame.', TRUE, 6),
  ('c1000000-0000-0000-0000-000000000007', 'Canvas Tote Bag with Heart Handshake', 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&auto=format&fit=crop&q=80', 'Heavyweight organic cotton tote with the Make Their Day emblem.', TRUE, 7),
  ('c1000000-0000-0000-0000-000000000008', 'Freshly Baked Honey Cinnamon Cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80', 'Box of 10 melt-in-your-mouth spiced cookies baked this morning.', TRUE, 8),
  ('c1000000-0000-0000-0000-000000000009', 'Stainless Steel Vacuum Insulated Flask', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', 'Keeps drinks piping hot for 12 hours or ice cold for 24 hours.', TRUE, 9),
  ('c1000000-0000-0000-0000-000000000010', 'Handcrafted Macramé Plant Hanger', 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=600&auto=format&fit=crop&q=80', 'Intricately knotted bohemian plant hanger with wooden beads.', TRUE, 10),
  ('c1000000-0000-0000-0000-000000000011', 'Organic Herbal Infusion Tea Selection', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', 'Chamomile, peppermint, hibiscus, and green tea loose blends.', TRUE, 11),
  ('c1000000-0000-0000-0000-000000000012', 'Framed Inspirational Calligraphy Art', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 'Original custom lettering piece framed in black natural oak.', TRUE, 12)
ON CONFLICT (id) DO NOTHING;


-- 11. System Settings Table (Site status, Event Closure)
CREATE TABLE IF NOT EXISTS mtd_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE mtd_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings"
  ON mtd_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can upsert settings"
  ON mtd_settings FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public can update settings"
  ON mtd_settings FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

INSERT INTO mtd_settings (key, value)
VALUES (
  'site_status',
  '{"isClosed": false, "title": "Charity Day Has Concluded", "message": "Thank you for your incredible support! Price submissions are currently closed while organizers review the results."}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mtd_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE mtd_settings;
  END IF;
END $$;


-- 12. Add mtd_items and mtd_submissions to Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mtd_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE mtd_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'mtd_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE mtd_submissions;
  END IF;
END $$;
