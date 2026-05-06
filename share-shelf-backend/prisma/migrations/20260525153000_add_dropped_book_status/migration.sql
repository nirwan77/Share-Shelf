-- Add dropped books to the user library status enum.
ALTER TYPE "BookStatus" ADD VALUE IF NOT EXISTS 'DROPPED';
