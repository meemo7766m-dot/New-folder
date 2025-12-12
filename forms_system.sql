-- Investigation Bookings Table
CREATE TABLE IF NOT EXISTS public.investigator_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investigator_id BIGINT REFERENCES public.investigators(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    case_description TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME,
    location TEXT,
    budget_range TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT
);

ALTER TABLE public.investigator_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bookings" ON public.investigator_bookings FOR SELECT USING (true);
CREATE POLICY "Users can create bookings" ON public.investigator_bookings FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON public.investigator_bookings FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_investigator_bookings_investigator_id ON public.investigator_bookings(investigator_id);
CREATE INDEX idx_investigator_bookings_status ON public.investigator_bookings(status);

-- Service Ratings Table
CREATE TABLE IF NOT EXISTS public.service_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    car_id BIGINT REFERENCES public.cars(id) ON DELETE CASCADE,
    investigator_id BIGINT REFERENCES public.investigators(id) ON DELETE SET NULL,
    rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 5),
    title TEXT,
    feedback TEXT NOT NULL,
    categories JSONB DEFAULT '{
        "communication": 0,
        "professionalism": 0,
        "results": 0,
        "value_for_money": 0
    }',
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0
);

ALTER TABLE public.service_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ratings" ON public.service_ratings FOR SELECT USING (true);
CREATE POLICY "Users can submit ratings" ON public.service_ratings FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE INDEX idx_service_ratings_investigator_id ON public.service_ratings(investigator_id);
CREATE INDEX idx_service_ratings_car_id ON public.service_ratings(car_id);

-- Complaints and Suggestions Table
CREATE TABLE IF NOT EXISTS public.complaints_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitter_name TEXT,
    submitter_email TEXT,
    submitter_phone TEXT,
    complaint_type TEXT NOT NULL CHECK (complaint_type IN ('complaint', 'suggestion', 'bug_report')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'closed')),
    attachment_urls TEXT[],
    response TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id)
);

ALTER TABLE public.complaints_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.complaints_suggestions FOR SELECT USING (
    submitter_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR auth.role() = 'authenticated'
);
CREATE POLICY "Anyone can submit complaints" ON public.complaints_suggestions FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Admins can manage complaints" ON public.complaints_suggestions FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_complaints_status ON public.complaints_suggestions(status);
CREATE INDEX idx_complaints_type ON public.complaints_suggestions(complaint_type);

-- Witness Documentation Table
CREATE TABLE IF NOT EXISTS public.witness_documentation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    car_id BIGINT REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    witness_name TEXT NOT NULL,
    witness_phone TEXT NOT NULL,
    witness_email TEXT,
    witness_address TEXT,
    statement TEXT NOT NULL,
    sighting_date DATE NOT NULL,
    sighting_time TIME,
    sighting_location TEXT,
    car_condition TEXT,
    witness_confidence INTEGER CHECK (witness_confidence >= 1 AND witness_confidence <= 10),
    media_ids BIGINT[] REFERENCES public.media(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'archived')),
    notes TEXT
);

ALTER TABLE public.witness_documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view verified witnesses" ON public.witness_documentation FOR SELECT USING (is_verified = true OR auth.role() = 'authenticated');
CREATE POLICY "Users can submit witness info" ON public.witness_documentation FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Admins can manage witnesses" ON public.witness_documentation FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_witness_car_id ON public.witness_documentation(car_id);
CREATE INDEX idx_witness_status ON public.witness_documentation(status);
CREATE INDEX idx_witness_verified ON public.witness_documentation(is_verified);

-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaints', 'complaints', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for complaints bucket
CREATE POLICY "Users can upload complaint attachments" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'complaints' );

CREATE POLICY "Admins can view complaint attachments" 
ON storage.objects FOR SELECT 
TO authenticated 
USING ( bucket_id = 'complaints' );
