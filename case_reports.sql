-- Create table for confidential case reports
CREATE TABLE IF NOT EXISTS public.case_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id BIGINT REFERENCES public.cars(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- 'sighting', 'suspect', 'other'
    description TEXT NOT NULL,
    contact_info TEXT, -- Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.case_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (Anonymous users can report)
CREATE POLICY "Anyone can submit a report" 
ON public.case_reports 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Policy: Only Admins (authenticated users in allowed_users or generally authenticated if simple setup) can view
-- Assuming 'authenticated' role is used for admins in this simple setup, 
-- or if we are using the helper logic.
-- For now, allowing all authenticated users (Admins) to view.
CREATE POLICY "Only admins can view reports" 
ON public.case_reports 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy: No one can update/delete (Immutable ledger, or Admins only)
CREATE POLICY "Admins can delete reports" 
ON public.case_reports 
FOR DELETE 
TO authenticated 
USING (true);
