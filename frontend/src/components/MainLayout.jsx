import Navbar from "./a2_NavBar/NavBar";
import { Outlet } from 'react-router-dom';

export default function MainLayout({children}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
        {children}
      </main>
    </div>
  );
}