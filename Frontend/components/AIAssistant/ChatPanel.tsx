'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/lib/types/ai';

interface ChatPanelProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, isLoading, onSendMessage }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full w-full" style={{backgroundColor: '#ebf3fe'}}>
            {/* Chat Header */}
            <div className="px-8 py-3 backdrop-blur-xl border-b flex items-center gap-4 sticky top-0 z-10 overflow-hidden bg-[#ebf3fe]" style={{backgroundColor: '#f7f9ff', borderColor: '#e4efff' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#0059bb]" style={{ backgroundColor: '#0059bb' }}>
                    <span
                        className="material-symbols-outlined text-xl"
                        style={{ fontVariationSettings: "'FILL' 1", color: '#ffffff' }}
                    >
                        psychiatry
                    </span>
                </div>
                <div>
                    <h3 className="font-bold" style={{ color: '#0b1d2d' }}>Motor de Razonamiento Médico</h3>
                    <p className="text-xs flex items-center gap-1" style={{ color: '#414754' }}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Conectado a Base de Conocimientos MSP
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 min-h-0">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(0, 89, 187, 0.1)' }}>
                            <span
                                className="material-symbols-outlined text-4xl"
                                style={{ fontVariationSettings: "'FILL' 1", color: '#0059bb' }}
                            >
                                psychiatry
                            </span>
                        </div>
                        <p className="text-center max-w-md" style={{ color: '#414754' }}>
                            Bienvenido al Asistente IA. Realiza consultas sobre protocolos médicos, normativas sanitarias y guías de atención.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: '#d2e4fb' }}>
                                        <span
                                            className="material-symbols-outlined text-sm"
                                            style={{ fontVariationSettings: "'FILL' 1", color: '#0059bb' }}
                                        >
                                            smart_toy
                                        </span>
                                    </div>
                                )}

                                <div className={`${message.role === 'user' ? 'max-w-[80%]' : 'max-w-[85%]'}`}>
                                    {message.role === 'user' ? (
                                        <div className="text-white p-4 rounded-2xl rounded-tr-none shadow-md" style={{ backgroundColor: '#003f7a' }}>
                                            <p className="text-sm font-medium">{message.content}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-8 rounded-2xl rounded-tl-none shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e4efff' }}>
                                                <p className="text-sm leading-relaxed" style={{ color: '#414754' }}>
                                                    {message.content}
                                                </p>

                                                {/* Reference Card Example */}
                                                <div className="mt-4 p-3 rounded-xl flex items-center justify-between group cursor-pointer transition-colors border" style={{ backgroundColor: '#f7f9ff', borderColor: 'rgba(0, 89, 187, 0.1)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined" style={{ color: '#0059bb' }}>
                                                            description
                                                        </span>
                                                        <div className="text-xs">
                                                            <p className="font-bold" style={{ color: '#0b1d2d' }}>Ver sección 4.2: Clasificación de Gravedad</p>
                                                            <p style={{ color: '#414754' }}>Protocolo Oficial MSP</p>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#0059bb' }}>
                                                        arrow_forward
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 mt-4">
                                                    <button className="px-3 py-1 rounded-full text-[10px] font-bold transition-colors uppercase tracking-wider" style={{ backgroundColor: '#d2e4fb', color: '#0059bb' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#0059bb'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d2e4fb'; e.currentTarget.style.color = '#0059bb'; }}>
                                                        Expandir Citación
                                                    </button>
                                                    <button className="px-3 py-1 rounded-full text-[10px] font-bold transition-colors uppercase tracking-wider" style={{ backgroundColor: '#d2e4fb', color: '#414754' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e4efff'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d2e4fb'; }}>
                                                        Copiar Protocolo
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 animate-pulse" style={{ backgroundColor: '#d2e4fb' }}>
                                    <span
                                        className="material-symbols-outlined text-sm"
                                        style={{ fontVariationSettings: "'FILL' 1", color: '#0059bb' }}
                                    >
                                        smart_toy
                                    </span>
                                </div>
                                <div className="p-8 rounded-2xl rounded-tl-none shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e4efff' }}>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#0059bb' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#0059bb', animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#0059bb', animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="mb-0 p-2 backdrop-blur-md border-t sticky bottom-0" style={{ backgroundColor: 'transparent', borderColor: '#e4efff' }}>
                <div className="relative w-full max-w-3xl mx-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pregunta lo que necesites"
                        className="w-full rounded-3xl border-transparent outline-none transition-all py-4 px-6 text-sm resize-none h-15 bg-[#d2e4fb] text-[#0b1d2d] shadow-md shadow-gray-400"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: '#003f7a', color: '#ffffff' }}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 89, 187, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            send
                        </span>
                    </button>
                </div>
                <p className="text-[10px] text-center mt-3 opacity-60 bg-[#ebf3fe]" style={{ color: '#414754' }}>
                    La IA proporciona orientación basada en fuentes oficiales RAG. Verifique dosis críticas en la práctica clínica.
                </p>
            </div>
        </div>
    );
}
