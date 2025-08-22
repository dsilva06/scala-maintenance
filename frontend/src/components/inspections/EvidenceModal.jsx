import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Bot, Loader2 } from 'lucide-react';
import { UploadFile, InvokeLLM } from '@/api/integrations';

export default function EvidenceModal({ isOpen, onClose, onSave, itemName }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [comment, setComment] = useState('');
    const [numericValue, setNumericValue] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            await analyzeImage(selectedFile);
        }
    };

    const analyzeImage = async (imageFile) => {
        setIsLoadingAI(true);
        setAiResult(null);
        try {
            const { file_url } = await UploadFile({ file: imageFile });
            const result = await InvokeLLM({
                prompt: `Analiza la siguiente imagen de un componente vehicular (${itemName}). Detecta posibles desgastes, fugas, grietas o corrosión. Determina si el estado es 'ok', 'observacion' o 'critico' y proporciona una recomendación breve.`,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["ok", "observacion", "critico"] },
                        suggestion: { type: "string" }
                    },
                    required: ["status", "suggestion"]
                }
            });
            setAiResult(result);
        } catch (error) {
            console.error("Error en análisis de IA:", error);
            setAiResult({ status: 'error', suggestion: 'No se pudo analizar la imagen.' });
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleSave = async () => {
        let file_url = null;
        if (file) {
            try {
                const uploadResult = await UploadFile({ file });
                file_url = uploadResult.file_url;
            } catch (error) {
                console.error("Error al subir archivo:", error);
                // Opcional: mostrar error al usuario
                return;
            }
        }
        
        onSave({
            file_url,
            comment,
            numeric_value: numericValue ? parseFloat(numericValue) : null,
            ai_suggestion: aiResult?.suggestion || null,
            ai_status: aiResult?.status || null
        });
        resetAndClose();
    };

    const resetAndClose = () => {
        setFile(null);
        setPreview(null);
        setComment('');
        setNumericValue('');
        setIsLoadingAI(false);
        setAiResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Añadir Evidencia para: {itemName}</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">Adjuntar Imagen (máx. 5MB)</Label>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                {preview ? (
                                    <img src={preview} alt="Vista previa" className="w-full h-full object-contain p-2"/>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500">Haz clic para subir</p>
                                    </div>
                                )}
                                <Input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                    
                    {isLoadingAI && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="w-4 h-4 animate-spin"/>
                            <span>Analizando con IA...</span>
                        </div>
                    )}
                    
                    {aiResult && (
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-blue-700"/>
                                <p className="font-semibold text-blue-800">Sugerencia de IA</p>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">Estado sugerido: <span className="font-bold capitalize">{aiResult.status}</span></p>
                            <p className="text-sm text-blue-700">Recomendación: {aiResult.suggestion}</p>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comentario (Opcional)</Label>
                        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ej: Desgaste visible en el borde exterior..."/>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="numeric_value">Valor Numérico (Opcional)</Label>
                        <Input id="numeric_value" type="number" step="any" value={numericValue} onChange={(e) => setNumericValue(e.target.value)} placeholder="Ej: 35 (PSI), 4 (mm)"/>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={resetAndClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Evidencia</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}