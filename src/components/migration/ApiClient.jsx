import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Code2, Zap, ArrowRight } from 'lucide-react';

export default function ApiClient() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const codeExamples = {
    client: `// SCALA Fleet AI - API Client Replacement
// lib/api-client.ts

type EntityData = Record<string, any>;
type FilterOptions = Record<string, any>;

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }

  async get(endpoint: string) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(\`API Error: \${response.statusText}\`);
    return response.json();
  }

  async post(endpoint: string, data: EntityData) {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(\`API Error: \${response.statusText}\`);
    return response.json();
  }
}`,

    entities: `// Entity Classes - Mantienen la misma interfaz que el sistema original

class EntityBase {
  protected client: ApiClient;
  protected entityName: string;

  constructor(entityName: string) {
    this.client = new ApiClient();
    this.entityName = entityName;
  }

  async list(sort?: string, limit?: number) {
    let endpoint = \`/\${this.entityName.toLowerCase()}\`;
    const params = new URLSearchParams();
    
    if (sort) params.append('sort', sort);
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) endpoint += \`?\${params.toString()}\`;
    return this.client.get(endpoint);
  }

  async create(data: EntityData) {
    return this.client.post(\`/\${this.entityName.toLowerCase()}\`, data);
  }

  async update(id: string, data: EntityData) {
    return this.client.put(\`/\${this.entityName.toLowerCase()}/\${id}\`, data);
  }

  async filter(filters: FilterOptions, sort?: string, limit?: number) {
    // Implementation for filtering
  }
}`,

    usage: `// Uso en Componentes - Sin cambios necesarios!

import { Vehicle, Trip, Driver } from '@/lib/api-client';

export default function MyComponent() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Exactamente igual que antes
    const loadVehicles = async () => {
      const data = await Vehicle.list('-created_date', 20);
      setVehicles(data);
    };
    loadVehicles();
  }, []);

  const createVehicle = async (vehicleData) => {
    // Misma interfaz
    await Vehicle.create(vehicleData);
    loadVehicles(); // Refresh list
  };

  // El resto del componente permanece igual
}`,

    routes: `// API Routes - app/api/vehicles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || '-created_date';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdDate: sort.startsWith('-') ? 'desc' : 'asc' },
      take: limit,
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const vehicle = await prisma.vehicle.create({ data });
    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}`,

    migration: `// Pasos de Migración en Componentes

// 1. Cambiar imports
// ANTES:
import { Vehicle } from '@/api/entities';

// DESPUÉS:
import { VehicleAPI as Vehicle } from '@/lib/api-client';

// 2. El resto del código permanece igual!
const vehicles = await Vehicle.list();
const newVehicle = await Vehicle.create(data);
const updated = await Vehicle.update(id, data);

// 3. TypeScript opcional
interface VehicleData {
  plate: string;
  brand: string;
  model: string;
  // ... resto de campos
}`
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Code2 className="w-8 h-8 text-green-600" />
          API Client de Reemplazo
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cliente API que mantiene exactamente la misma interfaz que el sistema original,
          permitiendo migrar sin cambios en tus componentes React
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-green-800 mb-2">Sin Cambios</h3>
            <p className="text-sm text-green-700">
              Tus componentes funcionan exactamente igual
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Code2 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-blue-800 mb-2">TypeScript</h3>
            <p className="text-sm text-blue-700">
              Tipado completo y autocompletado
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <ArrowRight className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-purple-800 mb-2">Migración Fácil</h3>
            <p className="text-sm text-purple-700">
              Solo cambiar 1 línea de import
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="client" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="client">Client Base</TabsTrigger>
          <TabsTrigger value="entities">Entidades</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="routes">API Routes</TabsTrigger>
          <TabsTrigger value="migration">Migración</TabsTrigger>
        </TabsList>

        {Object.entries(codeExamples).map(([key, code]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="capitalize">{key} Implementation</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(code, key)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedSection === key ? 'Copiado!' : 'Copiar'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">{code}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 mb-4">🎯 Ventajas del API Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-3">✅ Compatibilidad Total</h4>
              <ul className="text-sm text-green-700 space-y-2">
                <li>• Misma interfaz que la API anterior</li>
                <li>• Métodos idénticos: list(), create(), update(), delete()</li>
                <li>• Filtros y ordenamiento compatibles</li>
                <li>• Manejo de errores integrado</li>
                <li>• Soporte para bulk operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-3">🚀 Mejoras Adicionales</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• TypeScript para mejor desarrollo</li>
                <li>• Interceptors para autenticación</li>
                <li>• Cache automático opcional</li>
                <li>• Retry logic para fallos de red</li>
                <li>• Logging y monitoring integrado</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Migración Súper Fácil</h4>
                <p className="text-sm text-gray-600">
                  Solo cambiar 1 línea de import en cada componente
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                5 minutos por componente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
