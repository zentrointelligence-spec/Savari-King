-- Migration: Add payment receipt columns to bookings table
-- Date: 2025-01-15
-- Description: Add columns to store payment receipt PDF path and sequential receipt number

-- Add payment_receipt_pdf column to store PDF file path
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_receipt_pdf VARCHAR(500) DEFAULT NULL;

-- Add receipt_number column for sequential receipt numbering
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) DEFAULT NULL;

-- Create unique index on receipt_number to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_receipt_number ON bookings(receipt_number) WHERE receipt_number IS NOT NULL;

-- Create index for faster queries on payment_receipt_pdf
CREATE INDEX IF NOT EXISTS idx_bookings_payment_receipt_pdf ON bookings(payment_receipt_pdf) WHERE payment_receipt_pdf IS NOT NULL;

SELECT 'Payment receipt columns added successfully to bookings table' AS status;
