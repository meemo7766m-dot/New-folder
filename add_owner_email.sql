-- Add owner_email column to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_cars_owner_email ON cars(owner_email);

-- Update the table comment
COMMENT ON COLUMN cars.owner_email IS 'Email address of the car owner for status update notifications';
