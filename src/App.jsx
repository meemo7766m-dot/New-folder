import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import CarDetails from './pages/CarDetails';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import OwnershipVerification from './pages/OwnershipVerification';
import AlertPreferences from './pages/AlertPreferences';
import Investigators from './pages/Investigators';
import VisualSearch from './pages/VisualSearch';
import FaceVerification from './components/FaceVerification';
import VoiceSearch from './components/VoiceSearch';
import MediaUploadPage from './pages/MediaUploadPage';
import ImageSearchPage from './pages/ImageSearchPage';
import RateServicePage from './pages/RateServicePage';
import ComplaintsPage from './pages/ComplaintsPage';
import WitnessPage from './pages/WitnessPage';
import VerificationAdmin from './pages/VerificationAdmin';
import SmartSearchPage from './pages/SmartSearchPage';
import MapPage from './pages/MapPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {

  useEffect(() => {
    const trackVisit = async () => {
      const hasVisited = sessionStorage.getItem('hasVisited');
      if (!hasVisited) {
        try {
          await supabase.from('site_visits').insert({});
          sessionStorage.setItem('hasVisited', 'true');
        } catch (error) {
          console.error('Error tracking visit:', error);
        }
      }
    };
    trackVisit();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/verify/:carId" element={<OwnershipVerification />} />
          <Route path="/alerts" element={<AlertPreferences />} />
          <Route path="/investigators" element={<Investigators />} />
          <Route path="/visual-search" element={<VisualSearch />} />
          <Route path="/media-upload" element={<MediaUploadPage />} />
          <Route path="/image-search" element={<ImageSearchPage />} />
          <Route path="/rate-service" element={<RateServicePage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/witness" element={<WitnessPage />} />
          <Route path="/smart-search" element={<SmartSearchPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/advanced-search" element={<AdvancedSearchPage />} />
          <Route path="/verification-admin" element={<VerificationAdmin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
