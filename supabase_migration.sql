---------------------------------------------------
-- FULL DATABASE SCHEMA & MIGRATION (LATEST)
-- Run this in your Supabase SQL Editor
-- Safe to re-run: uses IF NOT EXISTS & ADD COLUMN IF NOT EXISTS
---------------------------------------------------

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------
-- 1. PROFILES (one row per auth user)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT,
  full_name      TEXT,
  avatar_url     TEXT,
  -- Business details
  company_name   TEXT,
  company_address TEXT,
  trn_number     TEXT,
  business_email TEXT,
  business_phone TEXT,
  -- Bank details
  bank_name      TEXT,
  account_name   TEXT,
  account_number TEXT,
  iban           TEXT,
  swift_code     TEXT,
  branch         TEXT,
  branch_address TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trn_number      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_email  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_phone  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_name       TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_name    TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_number  TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS iban            TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS swift_code      TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch          TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_address  TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

---------------------------------------------------
-- 2. COMPANIES (seller businesses / saved clients)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  address        TEXT,
  trn_number     TEXT,
  email          TEXT,
  mobile         TEXT,
  -- Bank details
  bank_name      TEXT,
  account_name   TEXT,
  account_number TEXT,
  iban           TEXT,
  swift_code     TEXT,
  branch         TEXT,
  branch_address TEXT,
  customer_name  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS branch         TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS branch_address TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS customer_name  TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS bank_name      TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_name   TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS iban           TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS swift_code     TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS mobile         TEXT;

CREATE INDEX IF NOT EXISTS companies_user_id_idx ON public.companies(user_id);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own companies." ON public.companies;
CREATE POLICY "Users can view own companies." ON public.companies FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own companies." ON public.companies;
CREATE POLICY "Users can insert own companies." ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own companies." ON public.companies;
CREATE POLICY "Users can update own companies." ON public.companies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own companies." ON public.companies;
CREATE POLICY "Users can delete own companies." ON public.companies FOR DELETE USING (auth.uid() = user_id);

---------------------------------------------------
-- 3. CLIENTS (buyer snapshot stored per invoice)
---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own clients." ON public.clients;
CREATE POLICY "Users can view own clients." ON public.clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients." ON public.clients;
CREATE POLICY "Users can insert own clients." ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients." ON public.clients;
CREATE POLICY "Users can update own clients." ON public.clients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients." ON public.clients;
CREATE POLICY "Users can delete own clients." ON public.clients FOR DELETE USING (auth.uid() = user_id);

---------------------------------------------------
-- 4. INVOICES
---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id            UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  seller_id            UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  consignee_id         UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  invoice_number       TEXT NOT NULL,
  issue_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date             DATE,
  reference_number     TEXT,
  buyers_order_number  TEXT,
  mode_of_payment      TEXT,
  sales_person         TEXT,
  delivery_note        TEXT,
  destination          TEXT,
  currency             TEXT NOT NULL DEFAULT 'QAR',
  tax_rate             NUMERIC(5,2) NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'draft',
  notes                TEXT,
  show_bank_details    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT invoices_unique_per_user UNIQUE (user_id, invoice_number)
);

-- Safe column additions for invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_id           UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS seller_id           UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS consignee_id        UUID REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date            DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reference_number    TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS buyers_order_number TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS mode_of_payment     TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sales_person        TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS delivery_note       TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS destination         TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate            NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS show_bank_details   BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices(user_id);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own invoices." ON public.invoices;
CREATE POLICY "Users can view own invoices." ON public.invoices FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices." ON public.invoices;
CREATE POLICY "Users can insert own invoices." ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices." ON public.invoices;
CREATE POLICY "Users can update own invoices." ON public.invoices FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices." ON public.invoices;
CREATE POLICY "Users can delete own invoices." ON public.invoices FOR DELETE USING (auth.uid() = user_id);

---------------------------------------------------
-- 5. INVOICE ITEMS
---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  unit        TEXT NOT NULL DEFAULT 'Pcs',
  quantity    NUMERIC(12,2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  barcode     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS unit    TEXT NOT NULL DEFAULT 'Pcs';

CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON public.invoice_items(invoice_id);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items of own invoices." ON public.invoice_items;
CREATE POLICY "Users can view items of own invoices." ON public.invoice_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert items to own invoices." ON public.invoice_items;
CREATE POLICY "Users can insert items to own invoices." ON public.invoice_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update items of own invoices." ON public.invoice_items;
CREATE POLICY "Users can update items of own invoices." ON public.invoice_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete items of own invoices." ON public.invoice_items;
CREATE POLICY "Users can delete items of own invoices." ON public.invoice_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

---------------------------------------------------
-- 6. TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
---------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

---------------------------------------------------
-- 7. BACKFILL: CREATE PROFILES FOR EXISTING USERS
---------------------------------------------------
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

---------------------------------------------------
-- 8. RELOAD SCHEMA CACHE
-- Tells PostgREST to immediately see all new columns
---------------------------------------------------
NOTIFY pgrst, 'reload schema';
