import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Plus, MessageSquare, Loader2, Mic, Paperclip } from 'lucide-react';
import { ChatMessage, Vehicle, MaintenanceOrder, Trip, SparePart, Inspection, Document } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';
import { groupBy, orderBy } from 'lodash';

export default function AIAssistant() {
    const [sessions, setSessions] = useState({});
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const messagesEndRef = useRef(null);
  
    useEffect(() => {
        loadAllCompanyData();
        loadSessions();
    }, []);
  
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadAllCompanyData = async () => {
        setIsDataLoading(true);
        try {
            const [
                vehicles,
                maintenanceOrders,
                trips,
                spareParts,
                inspections,
                documents
            ] = await Promise.all([
                Vehicle.list('-created_date', 100),
                MaintenanceOrder.list('-created_date', 100),
                Trip.list('-start_date', 100),
                SparePart.list('-created_date', 200),
                Inspection.list('-inspection_date', 100),
                Document.list('-expiration_date', 100)
            ]);
            setCompanyData({ vehicles, maintenanceOrders, trips, spareParts, inspections, documents });
        } catch (error) {
            console.error("Error loading company-wide data:", error);
            toast.error("Error al cargar los datos de la empresa para el asistente.");
        } finally {
            setIsDataLoading(false);
        }
    };
  
    const loadSessions = async () => {
        try {
            const allMessages = await ChatMessage.list('-created_date');
            const groupedSessions = groupBy(allMessages, 'session_id');
            setSessions(groupedSessions);
            if (Object.keys(groupedSessions).length > 0) {
              const latestSessionId = Object.keys(groupedSessions).sort((a,b) => new Date(groupedSessions[b][0].created_date) - new Date(groupedSessions[a][0].created_date))[0];
              handleSelectSession(latestSessionId);
            } else {
              handleNewChat();
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            handleNewChat();
        }
    };
  
    const handleSelectSession = (sessionId) => {
        setActiveSessionId(sessionId);
        const sessionMessages = sessions[sessionId] || [];
        setMessages(orderBy(sessionMessages, ['created_date'], ['asc']));
    };
  
    const handleNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
    };
  
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isDataLoading) return;
        setIsLoading(true);
        
        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            currentSessionId = `session-${Date.now()}`;
            setActiveSessionId(currentSessionId);
        }

        const userMessage = {
            session_id: currentSessionId,
            sender: 'user',
            message: inputMessage,
            created_date: new Date().toISOString(),
            user_id: 'current_user'
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');

        try {
            await ChatMessage.create(userMessage);

            const dataContext = JSON.stringify(companyData);
            const prompt = `Eres ScalaFleet AI, un consultor experto en gestión de flotas vehiculares. 
            Tu conocimiento se basa exclusivamente en los datos en tiempo real de la empresa que se proporcionan.
            Sé profesional, preciso y basa tus respuestas únicamente en la información proporcionada.
            Si no tienes información suficiente, indícalo claramente.

            DATOS DE LA EMPRESA:
            ${dataContext}

            Pregunta del usuario: "${inputMessage}"`;
            
            const aiResponseText = await InvokeLLM({ prompt });

            const aiMessage = {
                session_id: currentSessionId,
                sender: 'ai',
                message: aiResponseText,
                created_date: new Date().toISOString(),
                user_id: 'current_user'
            };
            await ChatMessage.create(aiMessage);
            setMessages(prev => [...prev, aiMessage]);

            setSessions(prev => {
                const updatedSessions = { ...prev };
                if (!updatedSessions[currentSessionId]) {
                    updatedSessions[currentSessionId] = [];
                }
                updatedSessions[currentSessionId].push(userMessage, aiMessage);
                return updatedSessions;
            });

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error al comunicarse con el asistente.");
            const errorMessage = {
                session_id: currentSessionId,
                sender: 'ai',
                message: 'Lo siento, he tenido un problema técnico. Inténtalo de nuevo.',
                created_date: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getSessionTitle = (sessionId) => {
        const sessionMessages = sessions[sessionId];
        if (sessionMessages && sessionMessages.length > 0) {
            const firstUserMessage = sessionMessages.find(msg => msg.sender === 'user');
            return firstUserMessage ? firstUserMessage.message.substring(0, 30) + '...' : 'Nueva conversación';
        }
        return 'Nueva conversación';
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar con historial */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <Button onClick={handleNewChat} className="w-full bg-black hover:bg-gray-800 text-white rounded-lg">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva conversación
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {Object.keys(sessions).sort((a,b) => new Date(sessions[b][0]?.created_date) - new Date(sessions[a][0]?.created_date)).map(sessionId => (
                            <div
                                key={sessionId}
                                onClick={() => handleSelectSession(sessionId)}
                                className={`p-3 rounded-lg cursor-pointer text-sm hover:bg-gray-100 transition-colors duration-200 ${
                                    activeSessionId === sessionId ? 'bg-gray-100' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                    <span className="truncate text-gray-700">{getSessionTitle(sessionId)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        ScalaFleet AI v2.0
                    </div>
                </div>
            </div>

            {/* Chat principal */}
            <div className="flex-1 flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="text-center max-w-3xl mx-auto">
                             <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-semibold mb-4 text-gray-900">
                                ¿Cómo puedo ayudarte con tu flota hoy?
                            </h1>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                                <div 
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                    onClick={() => setInputMessage("¿Qué vehículos tienen documentos por vencer este mes?")}
                                >
                                    <p className="font-medium text-sm text-gray-900">Analizar vencimientos</p>
                                    <p className="text-xs text-gray-600">¿Qué vehículos tienen documentos por vencer este mes?</p>
                                </div>
                                <div 
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                    onClick={() => setInputMessage("Resume el estado del vehículo con placa...")}
                                >
                                    <p className="font-medium text-sm text-gray-900">Obtener resumen de vehículo</p>
                                    <p className="text-xs text-gray-600">Resume el estado del vehículo con placa...</p>
                                </div>
                                <div 
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                    onClick={() => setInputMessage("¿Hay repuestos con stock bajo necesarios para mantenimientos programados?")}
                                >
                                    <p className="font-medium text-sm text-gray-900">Verificar inventario crítico</p>
                                    <p className="text-xs text-gray-600">¿Hay repuestos con stock bajo necesarios para mantenimientos programados?</p>
                                </div>
                                <div 
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                    onClick={() => setInputMessage("¿Cuál es el costo promedio de mantenimiento para los camiones Volvo?")}
                                >
                                    <p className="font-medium text-sm text-gray-900">Calcular costos</p>
                                    <p className="text-xs text-gray-600">¿Cuál es el costo promedio de mantenimiento para los camiones Volvo?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-4 py-8">
                            {messages.map((msg, index) => (
                                <div key={index} className="mb-8">
                                    <div className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender === 'ai' && (
                                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-3xl ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                        </div>
                                        {msg.sender === 'user' && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="mb-8">
                                    <div className="flex gap-4 justify-start">
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Analizando...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-200 p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <div className="flex items-center bg-gray-100 rounded-2xl border border-gray-300 focus-within:border-blue-500 transition-colors duration-200">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                
                                <Input
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isDataLoading ? "Cargando datos de la empresa..." : "Envía un mensaje..."}
                                    className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-500 focus:ring-0 px-4 py-3"
                                    disabled={isLoading || isDataLoading}
                                />
                                
                                <div className="flex items-center mr-2 space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl"
                                    >
                                        <Mic className="w-4 h-4" />
                                    </Button>
                                    
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || isDataLoading || !inputMessage.trim()}
                                        className="bg-black text-white hover:bg-gray-800 rounded-xl w-8 h-8 p-0 disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 text-center mt-2">
                            ScalaFleet AI puede cometer errores. Considera verificar información importante.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}