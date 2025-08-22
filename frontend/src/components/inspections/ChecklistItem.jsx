
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Paperclip, Bot, X } from 'lucide-react';
import EvidenceModal from './EvidenceModal';
import { Badge } from '@/components/ui/badge';

export default function ChecklistItem({ itemData, index, onUpdate, onRemove }) {
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);

    const handleStatusChange = (newStatus) => {
        onUpdate(index, { ...itemData, status: newStatus });
    };

    const handleAddEvidence = (newEvidence) => {
        const updatedEvidence = [...itemData.evidence, newEvidence];
        onUpdate(index, { ...itemData, evidence: updatedEvidence });
    };

    const handleRemoveEvidence = (evidenceIndex) => {
        const updatedEvidence = itemData.evidence.filter((_, i) => i !== evidenceIndex);
        onUpdate(index, { ...itemData, evidence: updatedEvidence });
    };
    
    const applyAISuggestion = (evidenceIndex) => {
        const evidence = itemData.evidence[evidenceIndex];
        if (evidence && evidence.ai_status) {
            handleStatusChange(evidence.ai_status);
        }
    };

    const statusColors = {
        ok: 'bg-green-100 text-green-800',
        observacion: 'bg-yellow-100 text-yellow-800',
        critico: 'bg-red-100 text-red-800',
        n_a: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-4">
                <div className="flex-grow">
                    <p className="font-semibold">{itemData.item}</p>
                    <p className="text-xs text-gray-500">{itemData.category}</p>
                </div>
                <Select value={itemData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className={`w-[150px] ${statusColors[itemData.status]}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ok">OK</SelectItem>
                        <SelectItem value="observacion">Observación</SelectItem>
                        <SelectItem value="critico">Crítico</SelectItem>
                        <SelectItem value="n_a">N/A</SelectItem>
                    </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEvidenceModalOpen(true)}>
                    <Paperclip className="w-4 h-4 mr-2"/>Evidencia
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(index)}>
                    <Trash2 className="w-4 h-4 text-red-500"/>
                </Button>
            </div>

            {itemData.evidence && itemData.evidence.length > 0 && (
                <div className="mt-3 space-y-2">
                    {itemData.evidence.map((ev, evIndex) => (
                        <div key={evIndex} className="p-2 bg-white rounded border flex items-start gap-3">
                            {ev.file_url && (
                                <img src={ev.file_url} alt="Evidencia" className="w-16 h-16 object-cover rounded"/>
                            )}
                            <div className="flex-grow">
                                {ev.comment && <p className="text-sm">"{ev.comment}"</p>}
                                {ev.numeric_value !== null && <Badge variant="secondary">Valor: {ev.numeric_value}</Badge>}
                                
                                {ev.ai_suggestion && (
                                    <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400">
                                        <div className="flex items-center gap-1">
                                            <Bot className="w-4 h-4 text-blue-600"/>
                                            <p className="text-xs font-semibold text-blue-700">AI Sugiere:</p>
                                        </div>
                                        <p className="text-xs text-blue-600 mb-1">{ev.ai_suggestion} (Estado: <span className="font-bold">{ev.ai_status}</span>)</p>
                                        <Button size="sm" className="h-6 text-xs" onClick={() => applyAISuggestion(evIndex)}>
                                            Aplicar Sugerencia
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveEvidence(evIndex)}>
                                <X className="w-3 h-3"/>
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <EvidenceModal
                isOpen={isEvidenceModalOpen}
                onClose={() => setIsEvidenceModalOpen(false)}
                onSave={handleAddEvidence}
                itemName={itemData.item}
            />
        </div>
    );
}
