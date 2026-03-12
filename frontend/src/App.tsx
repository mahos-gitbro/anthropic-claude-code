import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';
import VideoPage from './pages/VideoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/series/:id" element={<SeriesPage />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
