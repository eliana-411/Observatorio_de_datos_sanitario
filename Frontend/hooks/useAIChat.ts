'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, Conversation } from '@/lib/types/ai';

// Mock AI responses for demonstration
const MOCK_RESPONSES = [
    {
        message: 'Basado en los lineamientos del Ministerio de Salud Pública (Ref: MSP-2024-DEN-01), el manejo del **Dengue con signos de alarma** requiere hospitalización inmediata.',
        sources: [
            {
                title: 'Ver sección 4.2: Clasificación de Gravedad',
                section: 'Protocolo Oficial MSP',
                reference: 'MSP-2024-DEN-01'
            }
        ]
    },
    {
        message: 'Los signos de alarma incluyen dolor abdominal intenso, vómitos persistentes y letargo. Se debe iniciar reposición de líquidos vía IV con cristaloides (Lactato de Ringer o solución salina al 0.9%).',
        sources: []
    },
    {
        message: 'Según los protocolos actuales de vigilancia epidemiológica, se recomienda notificación inmediata a las autoridades sanitarias competentes para todo caso confirmado de Dengue grave.',
        sources: [
            {
                title: 'Notificación de Casos',
                section: 'Procedimientos de Vigilancia',
                reference: 'MSP-2024-NOTIF-02'
            }
        ]
    }
];

export function useAIChat() {
    const [conversations, setConversations] = useState<Conversation[]>(() => {
        // Initialize with one default conversation
        return [
            {
                id: '1',
                title: 'Consulta sobre Dengue',
                createdAt: new Date(Date.now() - 3600000),
                updatedAt: new Date(Date.now() - 3600000),
                messages: [
                    {
                        id: '1',
                        role: 'user',
                        content: '¿Cuáles son los protocolos actuales para el manejo de Dengue con signos de alarma según la normativa nacional?',
                        timestamp: new Date(Date.now() - 3600000)
                    },
                    {
                        id: '2',
                        role: 'assistant',
                        content: MOCK_RESPONSES[0].message,
                        timestamp: new Date(Date.now() - 3595000)
                    }
                ]
            },
            {
                id: '2',
                title: 'Prevención de Infecciones',
                createdAt: new Date(Date.now() - 86400000),
                updatedAt: new Date(Date.now() - 86400000),
                messages: []
            },
            {
                id: '3',
                title: 'Guía de Vacunación 2024',
                createdAt: new Date(Date.now() - 172800000),
                updatedAt: new Date(Date.now() - 172800000),
                messages: []
            }
        ];
    });

    const [currentConversationId, setCurrentConversationId] = useState<string>('1');
    const [isLoading, setIsLoading] = useState(false);
    const responseIndex = useRef(0);

    const currentConversation = conversations.find(c => c.id === currentConversationId);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
            timestamp: new Date()
        };

        // Add user message to current conversation
        setConversations(prev => prev.map(conv => {
            if (conv.id === currentConversationId) {
                return {
                    ...conv,
                    messages: [...conv.messages, newUserMessage],
                    updatedAt: new Date()
                };
            }
            return conv;
        }));

        // Simulate AI thinking with loading state
        setIsLoading(true);

        // Simulate network delay (1-2 seconds)
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Get a mock response (cycle through responses)
        const mockResponse = MOCK_RESPONSES[responseIndex.current % MOCK_RESPONSES.length];
        responseIndex.current++;

        const newAssistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: mockResponse.message,
            timestamp: new Date()
        };

        // Add AI response to current conversation
        setConversations(prev => prev.map(conv => {
            if (conv.id === currentConversationId) {
                return {
                    ...conv,
                    messages: [...conv.messages, newAssistantMessage],
                    updatedAt: new Date()
                };
            }
            return conv;
        }));

        setIsLoading(false);
    }, [currentConversationId]);

    const createNewConversation = useCallback(() => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: 'Nueva Conversación',
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: []
        };

        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
    }, []);

    const switchConversation = useCallback((conversationId: string) => {
        setCurrentConversationId(conversationId);
    }, []);

    const deleteConversation = useCallback((conversationId: string) => {
        setConversations(prev => {
            const filtered = prev.filter(c => c.id !== conversationId);
            // If deleted conversation was active, switch to first available
            if (currentConversationId === conversationId && filtered.length > 0) {
                setCurrentConversationId(filtered[0].id);
            }
            return filtered;
        });
    }, [currentConversationId]);

    return {
        conversations,
        currentConversation,
        currentConversationId,
        isLoading,
        sendMessage,
        createNewConversation,
        switchConversation,
        deleteConversation
    };
}
