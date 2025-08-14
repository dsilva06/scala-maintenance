
import { useState, useEffect } from "react";
import { Document, Vehicle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DocumentsTable from "../components/documents/DocumentsTable";
import DocumentForm from "../components/documents/DocumentForm";
import { toast } from "sonner";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsData, vehiclesData] = await Promise.all([
        Document.list('-expiration_date'),
        Vehicle.list()
      ]);
      setDocuments(docsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error loading documents data:", error);
      toast.error("Error al cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (docData) => {
    try {
      if (editingDoc) {
        await Document.update(editingDoc.id, docData);
        toast.success("Documento actualizado correctamente.");
      } else {
        await Document.create(docData);
        toast.success("Documento creado correctamente.");
      }
      setShowForm(false);
      setEditingDoc(null);
      loadData();
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Error al guardar el documento.");
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setShowForm(true);
  };

  const handleDelete = async (docId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción es irreversible.")) {
      try {
        await Document.delete(docId);
        toast.success("Documento eliminado correctamente.");
        loadData();
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Error al eliminar el documento.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h1>
            <p className="text-gray-600">Control de vencimientos y permisos.</p>
          </div>
          <Button onClick={() => { setEditingDoc(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>

        <DocumentsTable 
          documents={documents} 
          vehicles={vehicles} 
          isLoading={isLoading} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {showForm && (
          <DocumentForm
            doc={editingDoc}
            vehicles={vehicles}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingDoc(null); }}
            existingDocs={documents}
          />
        )}
      </div>
    </div>
  );
}
