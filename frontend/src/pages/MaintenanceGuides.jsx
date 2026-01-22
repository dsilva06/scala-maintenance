
import { useState, useEffect, useMemo } from 'react';
import { RepairGuide, Vehicle } from "@/api/entities";
import { listSpareParts } from "@/api/spareParts";
import { createMaintenanceOrder, listMaintenanceOrders, updateMaintenanceOrder } from "@/api/maintenanceOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ArrowRight, Package, Clock, Plus, Edit, Trash2, User, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/auth/AuthContext";

import RequiredMaterialsPanel from "../components/maintenance-guides/RequiredMaterialsPanel";
import GuideChecklist from "../components/maintenance-guides/GuideChecklist";
import RepairGuideForm from "../components/maintenance/RepairGuideForm";

export default function MaintenanceGuides() {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [checklistState, setChecklistState] = useState({});
  const [activeOrder, setActiveOrder] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        RepairGuide.list(),
        listSpareParts({ sort: 'name', limit: 500 }),
        Vehicle.list(),
        listMaintenanceOrders({ sort: '-created_at', limit: 500 }),
      ]);

      const [guidesResult, partsResult, vehiclesResult, ordersResult] = results;

      if (guidesResult.status === 'fulfilled') {
        setGuides(guidesResult.value ?? []);
      }
      if (partsResult.status === 'fulfilled') {
        setSpareParts(partsResult.value ?? []);
      }
      if (vehiclesResult.status === 'fulfilled') {
        setVehicles(vehiclesResult.value ?? []);
      }
      if (ordersResult.status === 'fulfilled') {
        setMaintenanceOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const buildGuideSteps = (guide) => {
    const steps = Array.isArray(guide?.steps) ? guide.steps : [];
    return steps.map((step, index) => {
      const stepNumber = Number(step.step_number ?? index + 1);
      return {
        id: `step_${Number.isFinite(stepNumber) ? stepNumber : index + 1}`,
        step_number: Number.isFinite(stepNumber) ? stepNumber : index + 1,
        title: step.title || `Paso ${index + 1}`,
        description: step.description || "",
      };
    });
  };

  const guideSteps = useMemo(() => buildGuideSteps(selectedGuide), [selectedGuide]);

  const buildChecklistState = (steps) => {
    const initialState = {};
    steps.forEach((step) => {
      initialState[step.id] = false;
    });
    return initialState;
  };

  const buildCompletedChecklistState = (steps) => {
    const completedState = {};
    steps.forEach((step) => {
      completedState[step.id] = true;
    });
    return completedState;
  };

  const buildChecklistStateFromTasks = (steps, tasks) => {
    const initialState = buildChecklistState(steps);
    if (!Array.isArray(tasks)) {
      return initialState;
    }
    tasks.forEach((task) => {
      const stepNumber = Number(task?.step_number);
      if (!Number.isFinite(stepNumber)) {
        return;
      }
      const key = `step_${stepNumber}`;
      if (Object.prototype.hasOwnProperty.call(initialState, key)) {
        initialState[key] = Boolean(task.completed);
      }
    });
    return initialState;
  };

  const buildOrderTasks = (steps, state) =>
    steps.map((step) => ({
      step_number: step.step_number,
      title: step.title,
      description: step.title || step.description || `Paso ${step.step_number}`,
      details: step.description || "",
      completed: Boolean(state?.[step.id]),
    }));

  const resolveSparePart = (requiredPart) => {
    const byId = spareParts.find((part) => String(part.id) === String(requiredPart.part_id));
    if (byId && requiredPart.part_name && byId.name !== requiredPart.part_name) {
      const byName = spareParts.find((part) => part.name === requiredPart.part_name);
      if (byName) return byName;
    }
    if (byId) return byId;
    if (requiredPart.part_sku) {
      const bySku = spareParts.find((part) => part.sku === requiredPart.part_sku);
      if (bySku) return bySku;
    }
    if (requiredPart.part_name) {
      const byName = spareParts.find((part) => part.name === requiredPart.part_name);
      if (byName) return byName;
    }
    return null;
  };

  const buildPartsUsedForGuide = (guide) => {
    const requiredParts = Array.isArray(guide?.required_parts) ? guide.required_parts : [];
    return requiredParts.map((requiredPart) => {
      const part = resolveSparePart(requiredPart);
      const quantity = Number(requiredPart.quantity_needed) || 1;
      const unitCost = Number(part?.unit_cost ?? requiredPart.unit_cost ?? 0);
      return {
        part_id: requiredPart.part_id ?? part?.id ?? null,
        name: requiredPart.part_name || part?.name || "Repuesto",
        sku: requiredPart.part_sku || part?.sku || null,
        category: part?.category || null,
        quantity,
        unit_cost: Number.isFinite(unitCost) ? unitCost : 0,
      };
    });
  };

  const handleGuideFormSubmit = async (guideData) => {
    try {
      if (editingGuide) {
        await RepairGuide.update(editingGuide.id, guideData);
        toast.success("Guía de mantenimiento actualizada correctamente.");
      } else {
        await RepairGuide.create(guideData);
        toast.success("Guía de mantenimiento creada correctamente.");
      }
      setShowGuideForm(false);
      setEditingGuide(null);
      loadData(); // Recargar las guías para mostrar la nueva
    } catch (error) {
      console.error("Error saving repair guide:", error);
      toast.error("Error al guardar la guía de mantenimiento.");
    }
  };

  const handleGuideEdit = (guide) => {
    setEditingGuide(guide);
    setShowGuideForm(true);
  };

  const handleGuideDelete = async (guideId) => {
    if (!window.confirm("¿Eliminar esta guía de mantenimiento?")) return;
    try {
      await RepairGuide.delete(guideId);
      toast.success("Guía eliminada.");
      if (selectedGuide?.id === guideId) {
        setSelectedGuide(null);
      }
      loadData();
    } catch (error) {
      console.error("Error deleting repair guide:", error);
      toast.error("No se pudo eliminar la guía.");
    }
  };

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    const steps = buildGuideSteps(guide);
    const existingOrder = openGuideOrders.get(String(guide?.id));
    const shouldReuseOrder = Boolean(existingOrder);
    setChecklistState(
      shouldReuseOrder
        ? buildChecklistStateFromTasks(steps, existingOrder?.tasks)
        : buildChecklistState(steps)
    );
    setActiveOrder(shouldReuseOrder ? existingOrder : null);
    if (existingOrder?.vehicle_id) {
      const assignedVehicle = vehicles.find((v) => String(v.id) === String(existingOrder.vehicle_id));
      setSelectedVehicle(assignedVehicle || null);
      return;
    }
    if (guide?.vehicle_id) {
      const assignedVehicle = vehicles.find((v) => String(v.id) === String(guide.vehicle_id));
      setSelectedVehicle(assignedVehicle || null);
      return;
    }
    setSelectedVehicle(null);
  };

  useEffect(() => {
    if (activeOrder?.vehicle_id) {
      const assignedVehicle = vehicles.find((v) => String(v.id) === String(activeOrder.vehicle_id));
      if (assignedVehicle && (!selectedVehicle || String(selectedVehicle.id) !== String(assignedVehicle.id))) {
        setSelectedVehicle(assignedVehicle);
      }
      return;
    }
    if (!selectedGuide?.vehicle_id) return;
    const assignedVehicle = vehicles.find((v) => String(v.id) === String(selectedGuide.vehicle_id));
    if (assignedVehicle && (!selectedVehicle || String(selectedVehicle.id) !== String(assignedVehicle.id))) {
      setSelectedVehicle(assignedVehicle);
    }
  }, [selectedGuide, vehicles, selectedVehicle, activeOrder]);

  const handleStartMaintenance = async () => {
    if (!selectedGuide) {
      toast.error("Selecciona una guía para iniciar.");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Selecciona un vehículo antes de iniciar.");
      return;
    }
    if (guideSteps.length === 0) {
      toast.error("La guía no tiene pasos definidos.");
      return;
    }

    if (openGuideOrders.has(String(selectedGuide.id))) {
      toast.error("Esta guía ya está en curso. Finalízala antes de iniciar otra.");
      return;
    }

    setIsStarting(true);
    try {
      const freshChecklist = buildChecklistState(guideSteps);
      setChecklistState(freshChecklist);
      const tasks = buildOrderTasks(guideSteps, freshChecklist);
      const partsUsed = buildPartsUsedForGuide(selectedGuide);
      const assignedMechanic = user?.name || user?.email || "No asignado";
      const payload = {
        vehicle_id: Number(selectedVehicle.id),
        order_number: `MNT-GUIDE-${Date.now()}`,
        type: selectedGuide.type || 'correctivo',
        priority: selectedGuide.priority || 'media',
        status: 'en_progreso',
        title: selectedGuide.name,
        description: selectedGuide.description || selectedGuide.name,
        mechanic: assignedMechanic,
        notes: `Orden generada desde la guía de mantenimiento: "${selectedGuide.name}".`,
        parts: partsUsed.length > 0 ? partsUsed : undefined,
        tasks,
        metadata: {
          source: 'guide',
          guide_id: selectedGuide.id,
          guide_name: selectedGuide.name,
          guide_steps_total: guideSteps.length,
          guide_steps_completed: 0,
        },
      };

      const createdOrder = await createMaintenanceOrder(payload);
      setActiveOrder(createdOrder);
      setMaintenanceOrders((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        next.unshift(createdOrder);
        return next;
      });
      toast.success("Orden creada. Ya puedes avanzar los pasos.");
    } catch (error) {
      console.error("Error creating maintenance order:", error);
      toast.error("No se pudo iniciar la guía.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleChecklistChange = async (nextState) => {
    setChecklistState(nextState);

    if (!activeOrder || !isOrderActive) {
      return;
    }

    const tasks = buildOrderTasks(guideSteps, nextState);
    const completedCount = tasks.filter((task) => task.completed).length;
    const total = tasks.length;

    const payload = {
      tasks,
      metadata: {
        ...(activeOrder.metadata || {}),
        guide_id: selectedGuide?.id ?? activeOrder.metadata?.guide_id,
        guide_name: selectedGuide?.name ?? activeOrder.metadata?.guide_name,
        guide_steps_total: total,
        guide_steps_completed: completedCount,
      },
      status: activeOrder.status === 'pendiente' ? 'en_progreso' : activeOrder.status,
    };

    setIsSyncing(true);
    try {
      const updatedOrder = await updateMaintenanceOrder(activeOrder.id, payload);
      setActiveOrder(updatedOrder);
      setMaintenanceOrders((prev) =>
        Array.isArray(prev)
          ? prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
          : prev
      );
    } catch (error) {
      console.error("Error syncing maintenance order:", error);
      toast.error("No se pudo guardar el progreso.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinalizeMaintenance = async () => {
    if (!activeOrder?.id) {
      return;
    }

    if (!stepStats.allComplete) {
      toast.error("Completa todos los pasos antes de finalizar.");
      return;
    }

    if (!window.confirm("¿Finalizar esta guía de mantenimiento?")) {
      return;
    }

    const hasGuideSteps = guideSteps.length > 0;
    const completedChecklist = hasGuideSteps ? buildCompletedChecklistState(guideSteps) : checklistState;
    const tasks = hasGuideSteps ? buildOrderTasks(guideSteps, completedChecklist) : activeOrder.tasks;
    const totalSteps = hasGuideSteps
      ? guideSteps.length
      : Array.isArray(activeOrder.tasks)
      ? activeOrder.tasks.length
      : 0;

    if (hasGuideSteps) {
      setChecklistState(completedChecklist);
    }

    const updates = {
      status: 'completada',
      completion_date: new Date().toISOString().split('T')[0],
      metadata: {
        ...(activeOrder.metadata || {}),
        guide_steps_total: totalSteps,
        guide_steps_completed: totalSteps,
      },
    };

    const mileage = Number(selectedVehicle?.current_mileage);
    if (Number.isFinite(mileage)) {
      updates.completion_mileage = mileage;
    }

    if (Array.isArray(tasks)) {
      updates.tasks = tasks;
    }

    setIsFinalizing(true);
    try {
      const updatedOrder = await updateMaintenanceOrder(activeOrder.id, updates);
      setActiveOrder(updatedOrder);
      setMaintenanceOrders((prev) =>
        Array.isArray(prev)
          ? prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
          : prev
      );
      toast.success("Mantenimiento finalizado.");
    } catch (error) {
      console.error("Error finalizing maintenance order:", error);
      toast.error("No se pudo finalizar la guía.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleCancelMaintenance = async () => {
    if (!activeOrder?.id) {
      return;
    }

    if (!window.confirm("¿Cancelar esta guía de mantenimiento?")) {
      return;
    }

    setIsFinalizing(true);
    try {
      const updatedOrder = await updateMaintenanceOrder(activeOrder.id, {
        status: 'cancelada',
        metadata: {
          ...(activeOrder.metadata || {}),
          cancelled_at: new Date().toISOString(),
        },
      });
      setActiveOrder(updatedOrder);
      setMaintenanceOrders((prev) =>
        Array.isArray(prev)
          ? prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
          : prev
      );
      toast.success("Guía cancelada.");
    } catch (error) {
      console.error("Error cancelling maintenance order:", error);
      toast.error("No se pudo cancelar la guía.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stepStats = useMemo(() => {
    const total = guideSteps.length;
    const completed = guideSteps.filter((step) => checklistState[step.id]).length;
    return {
      total,
      completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      allComplete: total > 0 && completed === total,
    };
  }, [guideSteps, checklistState]);

  const openGuideOrders = useMemo(() => {
    const activeStatuses = new Set(['pendiente', 'en_progreso']);
    const map = new Map();
    maintenanceOrders.forEach((order) => {
      const guideId = order?.metadata?.guide_id;
      if (!guideId || !activeStatuses.has(order.status)) return;
      const key = String(guideId);
      if (!map.has(key)) {
        map.set(key, order);
        return;
      }
      const existing = map.get(key);
      const existingDate = new Date(existing?.created_at ?? 0).getTime();
      const nextDate = new Date(order?.created_at ?? 0).getTime();
      if (nextDate > existingDate) {
        map.set(key, order);
      }
    });
    return map;
  }, [maintenanceOrders]);

  const isOrderActive = Boolean(activeOrder?.id && (activeOrder.status === 'pendiente' || activeOrder.status === 'en_progreso'));
  const isOrderCompleted = activeOrder?.status === 'completada';
  const isOrderCancelled = activeOrder?.status === 'cancelada';
  const disabledMessage = isOrderCompleted
    ? "Guía completada. Puedes iniciar una nueva orden."
    : isOrderCancelled
    ? "Guía cancelada. Puedes iniciar una nueva orden."
    : "Inicia la guía para registrar el progreso.";

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
                Ejecuta pasos guiados y sincroniza el avance con órdenes de mantenimiento
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
              <Button onClick={() => { setEditingGuide(null); setShowGuideForm(true); }} className="bg-blue-600 hover:bg-blue-700">
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
                onCancel={() => { setShowGuideForm(false); setEditingGuide(null); }}
                guide={editingGuide}
                vehicles={vehicles}
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
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleGuideEdit(guide);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleGuideDelete(guide.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                    className="space-y-10"
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

                    <div className="grid lg:grid-cols-2 gap-10">
                      {/* Checklist */}
                      <GuideChecklist
                        steps={guideSteps}
                        vehicles={vehicles}
                        selectedVehicle={selectedVehicle}
                        onVehicleSelect={setSelectedVehicle}
                        lockVehicleSelection={Boolean(selectedGuide.vehicle_id)}
                        checklistState={checklistState}
                        onChecklistChange={handleChecklistChange}
                        disabled={!isOrderActive}
                        disabledMessage={disabledMessage}
                      />

                      {/* Materials Panel */}
                      <RequiredMaterialsPanel
                        guide={selectedGuide}
                        spareParts={spareParts}
                        selectedVehicle={selectedVehicle}
                        onMaterialsReady={() => {}}
                      />
                    </div>

                    {/* Start + Status */}
                    <motion.div
                      className="flex justify-center pt-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {!isOrderActive ? (
                        <Button
                          onClick={handleStartMaintenance}
                          disabled={!selectedVehicle || guideSteps.length === 0 || isStarting}
                          size="lg"
                          className={`px-12 py-4 text-lg font-semibold rounded-2xl transition-all duration-200 ${
                            selectedVehicle && guideSteps.length > 0 && !isStarting
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isStarting ? (
                            <>
                              <Clock className="w-5 h-5 mr-2" />
                              Creando orden...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-5 h-5 mr-2" />
                              {isOrderCompleted ? "Iniciar nuevo mantenimiento" : "Iniciar Mantenimiento"}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Card className="w-full max-w-3xl border border-slate-200 rounded-3xl shadow-sm bg-white">
                          <CardContent className="p-8 space-y-7">
                            <div className="flex flex-wrap items-center justify-between gap-5">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="text-slate-600 border-slate-200">
                                    Orden {activeOrder.order_number}
                                  </Badge>
                                  <Badge
                                    className={
                                      isOrderCompleted
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isOrderCancelled
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }
                                  >
                                    {isOrderCompleted ? "Completada" : isOrderCancelled ? "Cancelada" : "En progreso"}
                                  </Badge>
                                  {isSyncing && (
                                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                                      Guardando...
                                    </Badge>
                                  )}
                                </div>
                                {activeOrder?.mechanic && (
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <User className="w-4 h-4 text-slate-400" />
                                    Asignado a {activeOrder.mechanic}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-sm text-slate-500">
                                {stepStats.total > 0 && (
                                  <div>
                                    {stepStats.completed}/{stepStats.total} pasos completados
                                  </div>
                                )}
                              </div>
                            </div>

                            {isOrderActive && (
                              <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                  onClick={handleFinalizeMaintenance}
                                  disabled={isFinalizing || isSyncing || !stepStats.allComplete}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  {isFinalizing ? "Finalizando..." : "Finalizar mantenimiento"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleCancelMaintenance}
                                  disabled={isFinalizing || isSyncing}
                                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Cancelar guía
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    window.location.href = createPageUrl('Maintenance');
                                  }}
                                  className="sm:ml-auto border-slate-200 text-slate-600 hover:bg-slate-50"
                                >
                                  Ver en Órdenes de Mantenimiento
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
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
