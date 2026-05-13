'use client';

import { useState } from 'react';
import { Conversation } from '@/lib/types/ai';

interface HistoryPanelProps {
    conversations: Conversation[];
    currentConversationId: string;
    onSelectConversation: (id: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: string) => void;
}

export function HistoryPanel({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation
}: HistoryPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    // No renderizar nada si está cerrado
    if (!isOpen) {
        return null;
    }

    return (
        <>
            {/* History Panel */}
            <div
                className={`fixed lg:hidden w-80 h-full flex flex-col border-r transition-all duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ backgroundColor: '#eef4ff', borderColor: '#e4efff' }}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: '#eef4ff', borderColor: '#e4efff' }}>
                    <h2 className="font-bold text-sm" style={{ color: '#0b1d2d' }}>Historial</h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 transition-colors rounded-lg"
                            style={{ color: '#414754' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(210, 228, 251, 0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title={isOpen ? 'Cerrar historial' : 'Abrir historial'}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {isOpen ? 'close' : 'menu_open'}
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                onNewConversation();
                                setIsOpen(false);
                            }}
                            className="p-2 transition-colors rounded-lg"
                            style={{ color: '#414754' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(210, 228, 251, 0.3)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title="Nueva conversación"
                        >
                            <span className="material-symbols-outlined text-lg">
                                add
                            </span>
                        </button>
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center">
                            <p className="text-xs opacity-60" style={{ color: '#414754' }}>
                                No hay conversaciones anteriores
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className={`group flex items-start justify-between p-3 rounded-lg cursor-pointer transition-all`}
                                    style={{
                                        backgroundColor: currentConversationId === conversation.id ? 'rgba(0, 89, 187, 0.1)' : 'transparent',
                                        border: currentConversationId === conversation.id ? '1px solid rgba(0, 89, 187, 0.3)' : 'none'
                                    }}
                                    onMouseEnter={(e) => { if (currentConversationId !== conversation.id) e.currentTarget.style.backgroundColor = 'rgba(210, 228, 251, 0.3)'; }}
                                    onMouseLeave={(e) => { if (currentConversationId !== conversation.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    onClick={() => {
                                        onSelectConversation(conversation.id);
                                        setIsOpen(false); // Cerrar en móvil
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm font-medium truncate`}
                                            style={{
                                                color: currentConversationId === conversation.id ? '#0059bb' : '#0b1d2d'
                                            }}
                                        >
                                            {conversation.title}
                                        </p>
                                        <p className="text-xs opacity-60 mt-1" style={{ color: '#414754' }}>
                                            {conversation.messages.length} mensaje{conversation.messages.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conversation.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ml-2 shrink-0 text-sm"
                                        style={{ color: '#ba1a1a' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(186, 26, 26, 0.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        title="Eliminar"
                                    >
                                        <span className="material-symbols-outlined">
                                            close
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: '#e4efff' }}>
                    <button
                        onClick={() => {
                            onNewConversation();
                            setIsOpen(false); // Cerrar en móvil
                        }}
                        className="w-full text-white py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all active:scale-95"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #0059bb, #0070ea)',
                            boxShadow: '0 4px 12px rgba(0, 89, 187, 0.2)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 89, 187, 0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 89, 187, 0.2)'; }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Nueva Conversación
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}
