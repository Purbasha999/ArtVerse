import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AlertBanner from './components/AlertBanner';
import Home from './pages/Home';
import ArtworksIndex from './pages/ArtworksIndex';
import ArtworkShow from './pages/ArtworkShow';
import ArtworkForm from './pages/ArtworkForm';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

export default function App() {
    return (
        <>
            <AlertBanner />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route element={<Layout />}>
                    <Route path="/artworks" element={<ArtworksIndex />} />
                    <Route path="/artworks/new" element={
                        <ProtectedRoute><ArtworkForm mode="create" /></ProtectedRoute>
                    } />
                    <Route path="/artworks/:id" element={<ArtworkShow />} />
                    <Route path="/artworks/:id/edit" element={
                        <ProtectedRoute><ArtworkForm mode="edit" /></ProtectedRoute>
                    } />
                    <Route path="/users/:id" element={<UserProfile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    );
}
