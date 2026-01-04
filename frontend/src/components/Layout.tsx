import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export default function Layout() {
    return (
        <div className="min-h-screen bg-background flex w-full">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/50">
                    <div className="mx-auto max-w-7xl animate-in fade-in-0 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
