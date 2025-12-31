import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Mic, Image as ImageIcon, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUser, useAuth } from '@clerk/clerk-react';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export const ChatBot: React.FC = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
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
            const response = await fetch('http://localhost:3000/api/intelligence/analyze-voice', {
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
                const response = await fetch('http://localhost:3000/api/intelligence/analyze-image', {
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
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages,
                    userId: user?.id,
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Server Error Details:', data);
                throw new Error(data.details || data.error);
            }

            setMessages((prev) => [...prev, { role: 'model', content: data.response }]);
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
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-0 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all z-50 overflow-hidden border-4 border-white ring-2 ring-green-100"
            >
                <img src="/gajor2.png" alt="Chat" className="w-full h-full object-cover" />
            </button>
        );
    }

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-6 right-6 w-auto min-w-[200px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50 flex justify-between items-center p-3 cursor-pointer hover:bg-white transition-all transform hover:-translate-y-1"
                onClick={() => setIsMinimized(false)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src="/gajor2.png" alt="Bot" className="w-10 h-10 rounded-full bg-green-50 p-1" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm">Gajor Assistant</h4>
                        <p className="text-xs text-green-600 font-medium">Click to expand</p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="ml-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden z-50 flex flex-col font-sans animate-slide-in">
            {/* Header */}
            <div className="bg-white/50 backdrop-blur-sm p-4 border-b border-gray-100 flex justify-between items-center shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src="/gajor2.png" alt="Bot" className="w-10 h-10 rounded-full bg-green-50 p-1 object-contain" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">Gajor AI</h3>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online & Ready
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => setIsMinimized(true)} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-red-50 p-2 rounded-full transition-colors text-gray-400 hover:text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center mt-20 px-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <img src="/gajor2.png" alt="Logo" className="w-12 h-12 object-contain opacity-80" />
                            <div className="absolute inset-0 rounded-full border border-green-100 animate-[spin_10s_linear_infinite]"></div>
                        </div>
                        <h4 className="text-gray-900 font-semibold mb-2">Welcome to Gajor!</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            I'm here to help you track inventory, plan meals, and manage nutrition. What's on your mind?
                        </p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className="shrink-0 mt-auto">
                            {msg.role === 'model' ? (
                                <img src="/gajor2.png" className="w-8 h-8 rounded-full bg-green-50 p-1 object-contain" alt="AI" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                            )}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-gray-900 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                                }`}
                        >
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {(isLoading || isProcessingMedia) && (
                    <div className="flex gap-3">
                        <img src="/gajor2.png" className="w-8 h-8 rounded-full bg-green-50 p-1 object-contain mt-auto" alt="AI" />
                        <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-100 flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shrink-0">
                <div className="relative flex items-center gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                    {/* Media Controls */}
                    <button
                        type="button"
                        onClick={triggerImageUpload}
                        disabled={isLoading || isProcessingMedia || isRecording}
                        className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-white rounded-full transition-all shadow-sm"
                        title="Upload Image"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                    />

                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading || isProcessingMedia}
                        className={`p-2.5 rounded-full transition-all shadow-sm ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'text-gray-400 hover:text-green-600 hover:bg-white'
                            }`}
                        title={isRecording ? "Stop Recording" : "Record Voice"}
                    >
                        {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Ask Gajor..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 font-medium px-2"
                        disabled={isLoading || isProcessingMedia || isRecording}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isProcessingMedia || isRecording}
                        className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-black disabled:opacity-50 disabled:hover:bg-gray-900 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
