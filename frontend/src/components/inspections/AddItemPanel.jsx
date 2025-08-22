import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AddItemPanel({ isOpen, onClose, categories, existingItems, onSelectItem }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredCategories = Object.keys(categories)
        .map(category => ({
            name: category,
            items: categories[category].filter(item => 
                item.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }))
        .filter(category => category.items.length > 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Añadir Ítem al Checklist</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Buscar ítem..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {filteredCategories.map(category => (
                        <Collapsible key={category.name} defaultOpen>
                            <CollapsibleTrigger className="w-full text-left font-semibold py-2 px-3 bg-gray-100 rounded">
                                {category.name}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="py-2 space-y-1">
                                {category.items.map(item => {
                                    const isAdded = existingItems.includes(item);
                                    return (
                                        <Button
                                            key={item}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            disabled={isAdded}
                                            onClick={() => {
                                                onSelectItem(category.name, item);
                                                onClose();
                                            }}
                                        >
                                            {item} {isAdded && <span className="text-xs text-gray-400 ml-auto">(Añadido)</span>}
                                        </Button>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>
        </div>
    );
}