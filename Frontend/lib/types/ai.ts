export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
}

export interface AIResponse {
    message: string;
    sources?: {
        title: string;
        section: string;
        reference: string;
    }[];
    confidence?: number;
}
