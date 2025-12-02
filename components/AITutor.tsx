
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { backend } from '../services/backend';
import { Icon } from './Icons';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string;
    isTyping?: boolean;
}

interface AttachedImage {
    data: string; // Base64 string without prefix for API
    preview: string; // Full Data URL for preview
    mimeType: string;
}

export const AITutor: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: "Hello! I am Momin AI. I can answer questions specifically about our courses and study materials as trained by the admin."
        }
    ]);
    const [input, setInput] = useState('');
    const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [chatSession, setChatSession] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize Gemini Chat with STRICT TRAINING DATA Context
    useEffect(() => {
        const initChat = async () => {
            if (!chatSession) {
                try {
                    // Fetch STRICT training data
                    const trainingData = await backend.getAITrainingData();
                    
                    const knowledgeBase = trainingData.map((item, index) => 
                        `[Entry ${index + 1}]\nQuestion/Topic: ${item.input}\nAnswer/Fact: ${item.output}`
                    ).join('\n\n');

                    const systemInstruction = `
You are Momin AI, a strict assistant for the Momin English platform.

CORE DIRECTIVE:
You must ONLY answer questions based on the "Knowledge Base" provided below. 
Do NOT use outside knowledge. 
Do NOT hallucinate information not present in the Knowledge Base.

KNOWLEDGE BASE:
${knowledgeBase || "No training data available yet."}

RULES:
1. If the user's question matches a topic in the Knowledge Base, answer it exactly as described in the "Answer/Fact" section.
2. If the user's question is NOT found in the Knowledge Base, you MUST reply: "I am sorry, but I don't have information on that topic in my training data."
3. Do not engage in general conversation outside the scope of this data.
4. If an image is uploaded, you may describe it briefly, but do not give educational advice unless it relates to the Knowledge Base.
`;

                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const chat = ai.chats.create({
                        model: 'gemini-2.5-flash',
                        config: {
                            systemInstruction: systemInstruction,
                            temperature: 0.3, // Low temperature for factual consistency
                        }
                    });
                    setChatSession(chat);
                } catch (error) {
                    console.error("Failed to initialize AI:", error);
                }
            }
        };
        initChat();
    }, [chatSession]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- Actions ---
    const handleReset = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                text: "Hello! I am Momin AI. I can answer questions specifically about our courses and study materials as trained by the admin."
            }
        ]);
        setInput('');
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setChatSession(null); // Triggers re-initialization of chat session
    };

    // --- Voice Input ---
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => (prev ? prev + " " + transcript : transcript));
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert("Microphone access denied. Please allow microphone permissions.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // --- Image Upload ---
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                // Extract base64 data without prefix for API
                const base64Data = result.split(',')[1];
                setAttachedImage({
                    data: base64Data,
                    preview: result,
                    mimeType: file.type
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !attachedImage) || !chatSession || isLoading) return;

        const userMsgText = input;
        const sentImage = attachedImage ? attachedImage.preview : undefined;
        
        // Reset Inputs
        setInput('');
        setAttachedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Add User Message
        const userMsg: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'user', 
            text: userMsgText,
            image: sentImage 
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Add Model Placeholder
            const modelMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isTyping: true }]);

            let resultStream;

            if (attachedImage) {
                 // Multi-modal message
                 const parts = [
                     { text: userMsgText || "Analyze this image." },
                     { 
                         inlineData: { 
                             mimeType: attachedImage.mimeType, 
                             data: attachedImage.data 
                         } 
                     }
                 ];
                 resultStream = await chatSession.sendMessageStream({ message: parts });
            } else {
                 // Text-only message
                 resultStream = await chatSession.sendMessageStream({ message: userMsgText });
            }
            
            let fullText = "";
            for await (const chunk of resultStream) {
                const text = (chunk as GenerateContentResponse).text;
                if (text) {
                    fullText += text;
                    setMessages(prev => 
                        prev.map(msg => 
                            msg.id === modelMsgId 
                            ? { ...msg, text: fullText, isTyping: false } 
                            : msg
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { 
                id: Date.now().toString(), 
                role: 'model', 
                text: "I'm having trouble connecting right now. Please check your internet connection or try again later." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <Icon name="sparkles" className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">English AI Tutor</h2>
                <p className="text-gray-500 max-w-md mb-8">
                    Login to access our specialized AI tutor. It is trained on exclusive course materials to answer your specific queries.
                </p>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
                    <span className="font-bold">✨ Feature:</span> Trained on Official Momin English Data
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-emerald-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                        <Icon name="sparkles" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Momin English AI</h3>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Restricted Mode (Training Data Only)
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleReset}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                        title="Clear Chat & Start New"
                    >
                        <Icon name="refresh" className="w-5 h-5" />
                    </button>
                    <div className="text-xs text-gray-400 font-medium px-2 py-1 bg-white rounded-md border border-gray-100 hidden sm:block">
                        Powered by Gemini
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                                msg.role === 'user' 
                                ? 'bg-indigo-100 border-indigo-200' 
                                : 'bg-emerald-100 border-emerald-200'
                            }`}>
                                {msg.role === 'user' ? (
                                    <img src={user.avatar} className="w-full h-full rounded-full" alt="User" />
                                ) : (
                                    <Icon name="sparkles" className="w-4 h-4 text-emerald-600" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.image && (
                                    <div className="rounded-xl overflow-hidden border border-gray-200 max-w-[200px]">
                                        <img src={msg.image} alt="Uploaded" className="w-full h-auto" />
                                    </div>
                                )}
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    {msg.text ? (
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    ) : (
                                        <div className="flex gap-1 h-5 items-center">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                {/* Image Preview */}
                {attachedImage && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg w-fit border border-gray-200">
                        <img src={attachedImage.preview} className="h-12 w-12 object-cover rounded-md" alt="Preview" />
                        <button onClick={removeImage} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    {/* File Input */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect} 
                        className="hidden" 
                    />
                    
                    {/* Tools */}
                    <div className="flex items-center gap-1 absolute left-2 top-1/2 -translate-y-1/2 z-10">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"
                            title="Upload Image"
                        >
                            <Icon name="image" className="w-5 h-5" />
                        </button>
                        <button 
                            type="button" 
                            onClick={startListening}
                            className={`p-1.5 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100'}`}
                            title="Voice Input"
                        >
                            <Icon name="microphone" className="w-5 h-5" />
                        </button>
                    </div>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or speak..."
                        className="w-full pl-24 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all shadow-sm"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={(!input.trim() && !attachedImage) || isLoading}
                        className="absolute right-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Icon name="send" className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    Restricted Mode: Answers based only on Admin Training Data.
                </p>
            </div>
        </div>
    );
};
