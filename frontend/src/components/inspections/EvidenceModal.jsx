import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, onSave, itemName }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [comment, setComment] = useState('');
    const [numericValue, setNumericValue] = useState('');

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSave = () => {
        onSave({
            file,
            comment,
            numeric_value: numericValue ? parseFloat(numericValue) : null,
        });
        resetAndClose();
    };

    const resetAndClose = () => {
        setFile(null);
        setPreview(null);
        setComment('');
        setNumericValue('');
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
