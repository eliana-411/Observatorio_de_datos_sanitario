'use client';

import { Sidebar } from '@/components/Layout/Sidebar';
import { TopAppBar } from '@/components/Layout/TopAppBar';
import { BottomNav } from '@/components/Layout/BottomNav';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuthenticated = useProtectedRoute();

    if (!isAuthenticated) {
        return <div className="text-center py-8">Redirigiendo...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <TopAppBar />

            {/* Main content */}
            <main className="md:pl-64 pt-6 pb-24 md:pb-12 px-6 min-h-screen">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
