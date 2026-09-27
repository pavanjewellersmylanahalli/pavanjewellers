-- Supabase Database Schema for Pavan Jewellers Girvi Management Tool
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Shops Table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_name TEXT NOT NULL,
    login_mobile VARCHAR(15) UNIQUE NOT NULL,
    reg_mobile VARCHAR(15) NOT NULL,
    pin_hash TEXT NOT NULL,
    address TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on login_mobile for lightning fast login lookup
CREATE INDEX IF NOT EXISTS idx_shops_login_mobile ON public.shops(login_mobile);

-- Create OTP Verifications Table (For standard SMS/Dev fallbacks)
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    mobile VARCHAR(15) PRIMARY KEY,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) Policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for auth endpoints via service/anon key
CREATE POLICY "Allow public select on shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Allow public insert on shops" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on shops" ON public.shops FOR UPDATE USING (true);

CREATE POLICY "Allow public manage on otp_verifications" ON public.otp_verifications FOR ALL USING (true);

-- Sample Test Shop Data (PIN is '1234', hashed with bcrypt)
-- Login Mobile: 9876543210, PIN: 1234
INSERT INTO public.shops (shop_name, login_mobile, reg_mobile, pin_hash, address)
VALUES (
    'Pavan Jewellers Main Branch',
    '9876543210',
    '9876543210',
    '$2a$10$wJtK119yB5w.3wP8/ZkL.eEaH0xJvV0V3xR0F7gA5N.wS9tF1pU6O',
    'Main Bazaar, Jewelers Market, Mylanahalli'
)
ON CONFLICT (login_mobile) DO NOTHING;
