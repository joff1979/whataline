import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Nav from './components/layout/Nav';
import AdminLayout from './components/layout/AdminLayout';
import RequireAuth from './components/ui/RequireAuth';

import Home from './pages/Home';
import About from './pages/About';
import Writing from './pages/portfolio/Writing';
import Films from './pages/portfolio/Films';
import Services from './pages/portfolio/Services';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';

import AdminLogin from './pages/admin/Login';
import AdminWriting from './pages/admin/AdminWriting';
import AdminFilms from './pages/admin/AdminFilms';
import AdminServices from './pages/admin/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminSettings from './pages/admin/AdminSettings';

// AnimatePresence needs to read location inside the router
function AnimatedRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Nav />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio/writing" element={<Writing />} />
          <Route path="/portfolio/films" element={<Films />} />
          <Route path="/portfolio/services" element={<Services />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin (JWT required) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="writing"      element={<AdminWriting />} />
            <Route path="films"        element={<AdminFilms />} />
            <Route path="services"     element={<AdminServices />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="settings"     element={<AdminSettings />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
