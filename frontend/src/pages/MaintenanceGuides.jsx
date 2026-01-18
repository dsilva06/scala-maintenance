
import { useState, useEffect } from 'react';
import { RepairGuide, Vehicle } from "@/api/entities";
import { listSpareParts } from "@/api/spareParts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, CheckCircle, AlertTriangle, ArrowRight, Package, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "@/lib/errors";

import RequiredMaterialsPanel from "../components/maintenance-guides/RequiredMaterialsPanel";
import GuideChecklist from "../components/maintenance-guides/GuideChecklist";
import RepairGuideForm from "../components/maintenance/RepairGuideForm";

export default function MaintenanceGuides() {
  const [guides, setGuides] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [materialsReady, setMaterialsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuideForm, setShowGuideForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guidesData, partsData, vehiclesData] = await Promise.all([
        RepairGuide.list(),
        listSpareParts({ sort: 'name', limit: 500 }),
        Vehicle.list()
      ]);
      setGuides(guidesData);
      setSpareParts(partsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos", {
        description: getErrorMessage(error, "No se pudieron cargar las guias.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuideFormSubmit = async (guideData) => {
    try {
      await RepairGuide.create(guideData);
      toast.success("Guía de mantenimiento creada correctamente.");
      setShowGuideForm(false);
      loadData(); // Recargar las guías para mostrar la nueva
    } catch (error) {
      console.error("Error saving repair guide:", error);
      toast.error("Error al guardar la guía de mantenimiento.", {
        description: getErrorMessage(error, "No se pudo guardar la guia.")
      });
    }
  };

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    setChecklistState({});
    setMaterialsReady(false);
    setSelectedVehicle(null);
  };

  const handleContinueToMaintenance = async () => {
    if (!selectedGuide || !selectedVehicle || !materialsReady) {
      toast.error("Complete la verificación antes de continuar");
      return;
    }

      try {
        // Navegar a Mantenimiento con el contexto de preparación verificada
        const navigationUrl = createPageUrl('Maintenance') + `?preparation_verified=true&guide_id=${selectedGuide.id}&vehicle_id=${selectedVehicle.id}`;
      window.location.href = navigationUrl;

      toast.success("Preparación completada. Redirigiendo a Mantenimiento...");
    } catch (error) {
      console.error("Error en preparación:", error);
      toast.error("Error al preparar la guía", {
        description: getErrorMessage(error, "No se pudo continuar con la preparacion.")
      });
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2, scale: 1.01 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando guías de mantenimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Guías de Mantenimiento
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Verificación y preparación de procedimientos estandarizados
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar procedimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 h-11 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button onClick={() => setShowGuideForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Nueva Guía
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {showGuideForm ? (
            <motion.div
              key="guide-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RepairGuideForm
                onSubmit={handleGuideFormSubmit}
                onCancel={() => setShowGuideForm(false)}
              />
            </motion.div>
          ) : (
            <motion.div key="guide-content">
              {!selectedGuide ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {filteredGuides.map((guide) => (
                    <motion.div
                      key={guide.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="cursor-pointer"
                      onClick={() => handleGuideSelect(guide)}
                    >
                      <Card className="h-full bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 rounded-2xl">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                                  {guide.name}
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1 capitalize">{guide.category}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Badge 
                              variant="secondary" 
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              {guide.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`border transition-colors ${
                                guide.priority === 'critica' ? 'border-red-300 text-red-700' :
                                guide.priority === 'alta' ? 'border-orange-300 text-orange-700' :
                                guide.priority === 'media' ? 'border-yellow-300 text-yellow-700' :
                                'border-green-300 text-green-700'
                              }`}
                            >
                              {guide.priority}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-600">
                              <Clock className="w-3 h-3 mr-1" />
                              {guide.estimated_time_hours}h
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {guide.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-500">
                              <Package className="w-4 h-4 mr-1" />
                              {guide.required_parts?.length || 0} materiales
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    {/* Guide Header */}
                    <Card className="bg-white border-gray-200 rounded-2xl shadow-sm">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedGuide(null)}
                              className="mb-4 -ml-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
                            >
                              ← Volver a guías
                            </Button>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                              {selectedGuide.name}
                            </h2>
                            <p className="text-gray-600">{selectedGuide.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Tiempo estimado</div>
                            <div className="text-2xl font-semibold text-gray-900">
                              {selectedGuide.estimated_time_hours}h
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Checklist */}
                      <GuideChecklist
                        guide={selectedGuide}
                        vehicles={vehicles}
                        selectedVehicle={selectedVehicle}
                        onVehicleSelect={setSelectedVehicle}
                        checklistState={checklistState}
                        onChecklistChange={setChecklistState}
                      />

                      {/* Materials Panel */}
                      <RequiredMaterialsPanel
                        guide={selectedGuide}
                        spareParts={spareParts}
                        selectedVehicle={selectedVehicle}
                        onMaterialsReady={setMaterialsReady}
                      />
                    </div>

                    {/* Continue Button */}
                    <motion.div
                      className="flex justify-center pt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        onClick={handleContinueToMaintenance}
                        disabled={!materialsReady || !selectedVehicle || Object.keys(checklistState).length === 0}
                        size="lg"
                        className={`px-12 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 ${
                          materialsReady && selectedVehicle && Object.keys(checklistState).length > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {materialsReady && selectedVehicle && Object.keys(checklistState).length > 0 ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Continuar a Mantenimiento
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Complete la verificación
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              )}

              {filteredGuides.length === 0 && !selectedGuide && (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron guías</h3>
                  <p className="text-gray-500">Prueba con otros términos de búsqueda</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
