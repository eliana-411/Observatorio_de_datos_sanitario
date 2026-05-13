'use client';

import { useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { ChatPanel } from '@/components/AIAssistant/ChatPanel';
import { HistoryPanel } from '@/components/AIAssistant/HistoryPanel';
import { useAIChat } from '@/hooks/useAIChat';

export default function AIAssistantPage() {
    useProtectedRoute();

    const {
        conversations,
        currentConversation,
        currentConversationId,
        isLoading,
        sendMessage,
        createNewConversation,
        switchConversation,
        deleteConversation
    } = useAIChat();

    if (!currentConversation) {
        return null;
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* History Panel */}
            {/* <HistoryPanel
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={switchConversation}
                onNewConversation={createNewConversation}
                onDeleteConversation={deleteConversation}
            />
*/}
            {/* Chat Panel */}
            <ChatPanel
                messages={currentConversation.messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
            />
        </div>
    );
}
