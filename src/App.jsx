import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import CarDetails from './pages/CarDetails';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import Dashboard from './pages/Dashboard';
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
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
