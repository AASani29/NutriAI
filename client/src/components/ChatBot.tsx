import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, Mic, Image as ImageIcon, StopCircle } from 'lucide-react';
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
                className="fixed bottom-6 right-6 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all z-50 animate-bounce-subtle"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 flex justify-between items-center p-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="font-semibold text-gray-800">NutriAI Assistant</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-gray-100 p-1 rounded">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">NutriAI Assistant</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsMinimized(true)} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <Minimize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Ask me about your inventory, nutrition, or recipes!</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-green-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            <ReactMarkdown>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {(isLoading || isProcessingMedia) && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                            <span className="text-xs text-gray-400">
                                {isProcessingMedia ? 'Processing media...' : 'Thinking...'}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="relative flex items-center gap-2">
                    {/* Media Controls */}
                    <button
                        type="button"
                        onClick={triggerImageUpload}
                        disabled={isLoading || isProcessingMedia || isRecording}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
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
                        className={`p-2 rounded-full transition-colors disabled:opacity-50 ${isRecording
                            ? 'text-red-500 hover:bg-red-50 animate-pulse'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                        title={isRecording ? "Stop Recording" : "Record Voice"}
                    >
                        {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Type a message..."}
                        className="flex-1 pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 bg-gray-50 text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || isProcessingMedia || isRecording}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isProcessingMedia || isRecording}
                        className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400">AI can make mistakes. Verify important info.</p>
                </div>
            </form>
        </div>
    );
};
