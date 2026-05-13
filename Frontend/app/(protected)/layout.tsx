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
            <main className="md:pl-64 pb-0 md:pb-0 min-h-screen mb-0">
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
