import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Image as ImageIcon, StopCircle, Brain, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

// Basic Error Boundary to catch render crashes
class ChatErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ChatBot Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                    <p className="font-bold">Something went wrong in the chat.</p>
                    <p className="opacity-75 text-xs mt-1">{this.state.error?.toString()}</p>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2 bg-red-100 px-3 py-1 rounded text-red-900 text-xs hover:bg-red-200"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export const ChatBot: React.FC = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mode, setMode] = useState<'ask' | 'agent'>('ask');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Media State
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingMedia, setIsProcessingMedia] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch chat history on mount
    // Fetch chat history or refresh on mode change
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id || !getToken) return;
            
            setIsLoading(true);
            setMessages([]); // Clear previous mode's messages immediately
            try {
                const token = await getToken();
                // Pass current mode to fetch specific history
                const response = await fetch(`${API_URL}/chat/history?userId=${user.id}&mode=${mode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Always update messages - if empty array returned (new mode), it effectively clears
                    setMessages(data.history || []);
                    
                    if (data.sessionId) setSessionId(data.sessionId);
                    else setSessionId(null); // Clear session ID if none returned (new session)
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
                setMessages([]); // Fail safe
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && user?.id) {
            fetchHistory();
        }
    }, [isOpen, user?.id, mode]); // Add mode dependency

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Voice Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleVoiceUpload;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please allow permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleVoiceUpload = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome records webm/opus
        // Create a File object
        const audioFile = new File([audioBlob], 'voice_recording.webm', { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('audio', audioFile);

        setIsProcessingMedia(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/intelligence/analyze-voice`, {
                method: 'POST',
                // Content-Type header is set automatically by fetch for FormData
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success && data.data?.text) {
                setInput(prev => (prev + ' ' + data.data.text).trim());
            } else {
                console.error('Voice analysis failed:', data);
                // Optionally show error toast
            }
        } catch (error) {
            console.error('Error uploading voice:', error);
        } finally {
            setIsProcessingMedia(false);
        }
    };

    // --- Image Logic ---
    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);

            setIsProcessingMedia(true);
            try {
                const token = await getToken();
                const response = await fetch(`${API_URL}/intelligence/analyze-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });

                const data = await response.json();
                if (data.success && data.data?.items) {
                    // Format items into a friendly string
                    const items = data.data.items;
                    if (items.length > 0) {
                        const itemsString = items.map((i: any) => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
                        const text = `I have: ${itemsString}`;
                        setInput(prev => (prev + ' ' + text).trim());
                    } else {
                        // Fallback if no items extracted but maybe text?
                        // For now just say no items found or use raw text if available
                        setInput(prev => (prev + ' [No clear items found in image]').trim());
                    }
                } else {
                    console.error('Image analysis failed:', data);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setIsProcessingMedia(false);
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    mode: mode,
                    sessionId: sessionId,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Server Error Details:', data);
                throw new Error(data.details || data.error);
            }

            if (data.sessionId) setSessionId(data.sessionId);
            
            console.log('🤖 Received Chat Response:', data);
            
            if (typeof data.response !== 'string') {
                console.warn('⚠️ Unexpected response format:', data.response);
                // Safe string conversion
                setMessages((prev) => [...prev, { role: 'model', content: String(JSON.stringify(data.response)) }]);
            } else {
                setMessages((prev) => [...prev, { role: 'model', content: data.response }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'model', content: 'Sorry, I encountered an error. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <div
                className={`fixed bottom-8 right-8 w-auto min-w-[260px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border ${mode === 'ask' ? 'border-primary/20' : 'border-emerald-200'} overflow-hidden z-50 flex justify-between items-center p-3 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 group`}
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src="/chatbot.png" alt="Bot" className="w-10 h-10 rounded-xl bg-primary/5 p-1.5 object-contain" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${mode === 'ask' ? 'bg-primary' : 'bg-emerald-500'}`}></div>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 text-sm tracking-tight">NutriAI Copilot</h4>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-70 ${mode === 'ask' ? 'text-primary' : 'text-emerald-500'}`}>
                            {mode === 'ask' ? 'Nutritionist Mode' : 'Agent Mode'}
                        </p>
                    </div>
                </div>
                <div className={`ml-6 mr-1 p-2 rounded-lg transition-colors ${mode === 'ask' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-600'}`}>
                    <Send className="w-4 h-4 rotate-45" />
                </div>
            </div>
        );
    }

    return (
        <ChatErrorBoundary>
        <div
            className={`fixed bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden z-50 flex flex-col font-sans animate-slide-in transition-all duration-300 ease-in-out
                ${isExpanded 
                    ? 'inset-4 m-auto w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-w-5xl rounded-2xl' 
                    : 'bottom-8 right-8 w-[400px] h-[600px]'
                }`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-b border-white/10 flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${mode === 'ask' ? 'bg-primary' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                            {mode === 'ask' ? <Brain className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-bold text-sm tracking-tight">NutriAI Copilot</h2>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'ask' ? 'bg-primary' : 'bg-emerald-400'}`}></span>
                                <p className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">{mode === 'ask' ? 'Expert Nutritionist' : 'Task Agent'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)} 
                            className="hover:bg-white/10 p-2 rounded-xl transition-all text-slate-300 hover:text-white"
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="hover:bg-red-500/20 p-2 rounded-xl transition-all text-slate-300 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Mode Selector Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    <button
                        onClick={() => setMode('ask')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'ask' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Brain className="w-3.5 h-3.5" />
                        Ask (RAG)
                    </button>
                    <button
                        onClick={() => setMode('agent')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'agent' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Agent (MCP)
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center mt-24 px-10">
                        <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <img src="/chatbot.png" alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <h4 className="text-slate-900 font-bold text-lg mb-2 tracking-tight">How can I help you?</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            I can help with inventory, meal planning, and nutrition insights.
                        </p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    // Ensure content is a string to prevent crashes during parsing/rendering
                    const contentString = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
                    return (
                        <div
                            key={index}
                            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-base leading-relaxed shadow-sm prose prose-neutral max-w-none ${msg.role === 'user'
                                    ? 'bg-primary text-white prose-invert'
                                    : 'bg-white/80 backdrop-blur-md border border-slate-100 text-slate-800'
                                    }`}
                            >
                                <ReactMarkdown>
                                    {contentString}
                                </ReactMarkdown>
                            </div>
                        </div>
                    );
                })}
                {(isLoading || isProcessingMedia) && (
                    <div className="flex gap-1.5 items-center bg-slate-50 w-fit px-4 py-3 rounded-2xl">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-50 shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <button
                        type="button"
                        onClick={triggerImageUpload}
                        disabled={isLoading || isProcessingMedia || isRecording}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading || isProcessingMedia}
                        className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-primary'}`}
                    >
                        {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 text-sm py-1"
                        disabled={isLoading || isProcessingMedia || isRecording}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isProcessingMedia || isRecording}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-30 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
        </ChatErrorBoundary>
    );
};
