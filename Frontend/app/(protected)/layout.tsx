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
        <div className="min-h-screen flex flex-col bg-white">
            <TopAppBar />

            <div className="flex flex-1">
                <Sidebar />

                {/* Main content */}
                <main className="flex-1 pb-0 md:pb-0 mb-0 ml-16 overflow-x-hidden">
                    {children}
                </main>
            </div>

            <BottomNav />
        </div>
    );
}
