import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
    return (
        <>
            <Navbar />
            <main className="container pt-2 pb-4 flex-grow-1">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
