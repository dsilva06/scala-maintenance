import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Database, Code, Settings, Rocket, DollarSign } from 'lucide-react';

export default function MigrationGuide() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚚 SCALA Fleet AI - Migración Completa
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Guía completa para hacer tu aplicación completamente independiente
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              ✅ Sin dependencias externas
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              🔐 Control total de datos
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
              💰 Monetización libre
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="database">Base de Datos</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="deployment">Despliegue</TabsTrigger>
            <TabsTrigger value="costs">Costos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Stack Tecnológico Recomendado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Frontend</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Next.js 14 + React + TypeScript</li>
                      <li>• Tailwind CSS + Shadcn/ui</li>
                      <li>• Framer Motion (animaciones)</li>
                      <li>• React Leaflet (mapas)</li>
                      <li>• Recharts (gráficos)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Backend</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Node.js + Express + TypeScript</li>
                      <li>• PostgreSQL + Prisma ORM</li>
                      <li>• NextAuth.js (autenticación)</li>
                      <li>• AWS S3 / Cloudinary (storage)</li>
                      <li>• OpenAI API (asistente IA)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📋 Módulos Implementados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    'Dashboard', 'Vehículos', 'Viajes', 'Mantenimiento',
                    'Inspecciones', 'Inventario', 'Documentos', 'Asistente IA'
                  ].map((module) => (
                    <div key={module} className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm font-medium text-blue-800">{module}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⏱️ Cronograma de Migración</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { fase: 'Configuración inicial', tiempo: '1-2 días', descripcion: 'Repositorio, dependencias, base de datos' },
                    { fase: 'Backend API', tiempo: '5-7 días', descripcion: 'Esquemas, APIs REST, autenticación' },
                    { fase: 'Frontend', tiempo: '7-10 días', descripcion: 'Componentes React, ruteo, UI' },
                    { fase: 'Integraciones', tiempo: '3-5 días', descripcion: 'Mapas, upload, IA, notificaciones' },
                    { fase: 'Testing y despliegue', tiempo: '2-3 días', descripcion: 'CI/CD, producción, monitoreo' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.fase}</div>
                        <div className="text-sm text-gray-600">{item.descripcion}</div>
                      </div>
                      <Badge variant="outline">{item.tiempo}</Badge>
                    </div>
                  ))}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-800">Total Estimado: 3-4 semanas</div>
                    <div className="text-sm text-green-600">Para desarrollador experimentado</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Esquema de Base de Datos PostgreSQL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`-- SCALA Fleet AI - PostgreSQL Schema

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'activo',
    created_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES drivers(id),
    origin VARCHAR(500) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    origin_coords JSONB,
    destination_coords JSONB,
    status VARCHAR(50) DEFAULT 'planificado',
    created_date TIMESTAMP DEFAULT NOW()
);

-- ... más tablas (maintenance_orders, inspections, etc.)`}
                  </pre>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Características del Schema:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Compatibilidad 1:1 con entidades actuales</li>
                    <li>• Soporte completo para JSONB (coords, configuraciones)</li>
                    <li>• Índices optimizados para performance</li>
                    <li>• Triggers automáticos para updated_date</li>
                    <li>• Constrains y validaciones de integridad</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🔧 API Client de Reemplazo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`// Reemplaza las llamadas de base44
import { Vehicle, Trip, Driver } from '@/lib/api-client';

// Antes (base44):
await Vehicle.list()
await Vehicle.create(data)
await Vehicle.update(id, data)

// Después (independiente):
await VehicleAPI.list()
await VehicleAPI.create(data) 
await VehicleAPI.update(id, data)

// La interfaz es exactamente la misma!`}
                  </pre>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">✅ Ventajas</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Misma interfaz que base44</li>
                      <li>• Sin cambios en componentes</li>
                      <li>• TypeScript completo</li>
                      <li>• Manejo de errores integrado</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">🔄 Rutas API</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• /api/vehicles</li>
                      <li>• /api/trips</li>
                      <li>• /api/maintenance</li>
                      <li>• /api/inspections</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⚛️ Migración de Componentes React</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Estructura de Carpetas</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded text-sm">
                      <pre>
{`src/
├── app/
│   ├── dashboard/
│   ├── vehicles/
│   ├── trips/
│   ├── maintenance/
│   └── ...
├── components/
│   ├── ui/              # Shadcn components
│   ├── dashboard/
│   ├── vehicles/
│   └── ...
└── lib/
    ├── api-client.ts
    └── utils.ts`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Componentes Listos</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Todos los .jsx existentes</li>
                        <li>• Shadcn/ui components</li>
                        <li>• Tailwind CSS styling</li>
                        <li>• Framer Motion animations</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">🔄 Cambios Necesarios</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Cambiar imports de entidades</li>
                        <li>• Actualizar tipos TypeScript</li>
                        <li>• Ajustar rutas de navegación</li>
                        <li>• Configurar autenticación</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Opciones de Despliegue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-bold text-green-600 mb-3">✅ Vercel (Recomendado)</h4>
                    <ul className="text-sm space-y-2">
                      <li>• Deploy automático desde Git</li>
                      <li>• Edge functions incluidas</li>
                      <li>• CDN global</li>
                      <li>• $20/mes (Pro plan)</li>
                    </ul>
                    <div className="mt-4 p-3 bg-green-50 rounded">
                      <code className="text-xs">vercel --prod</code>
                    </div>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-bold text-blue-600 mb-3">Railway</h4>
                    <ul className="text-sm space-y-2">
                      <li>• PostgreSQL incluido</li>
                      <li>• Deploy desde Git</li>
                      <li>• Escalado automático</li>
                      <li>• $5-20/mes</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 border rounded-lg">
                    <h4 className="font-bold text-purple-600 mb-3">Render</h4>
                    <ul className="text-sm space-y-2">
                      <li>• Free tier disponible</li>
                      <li>• PostgreSQL managed</li>
                      <li>• SSL automático</li>
                      <li>• $7-25/mes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Análisis de Costos Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">💰 Costos Operativos</h4>
                    {[
                      { servicio: 'Hosting (Vercel Pro)', costo: '$20-50', descripcion: 'Frontend + API Routes' },
                      { servicio: 'Base de Datos (PlanetScale)', costo: '$10-30', descripcion: 'PostgreSQL managed' },
                      { servicio: 'Storage (AWS S3)', costo: '$5-15', descripcion: 'Archivos e imágenes' },
                      { servicio: 'OpenAI API', costo: '$20-100', descripcion: 'Asistente IA' },
                      { servicio: 'Mapas (OpenStreetMap)', costo: 'Gratis', descripcion: 'Leaflet + OSM' },
                      { servicio: 'Email (SendGrid)', costo: '$15-30', descripcion: 'Notificaciones' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.servicio}</div>
                          <div className="text-sm text-gray-600">{item.descripcion}</div>
                        </div>
                        <div className="font-bold text-green-600">{item.costo}</div>
                      </div>
                    ))}
                    <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total Mensual:</span>
                        <span className="text-xl font-bold text-green-700">$70-225</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🎯 ROI y Beneficios</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-800">✅ Control Total</h5>
                        <p className="text-sm text-blue-600">Posees el 100% del código y datos</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-800">💰 Monetización Libre</h5>
                        <p className="text-sm text-purple-600">Cobrar sin restricciones a tus clientes</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-800">🚀 Escalabilidad</h5>
                        <p className="text-sm text-green-600">Crecer sin límites de la plataforma</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h5 className="font-medium text-yellow-800">🔒 Seguridad</h5>
                        <p className="text-sm text-yellow-600">Control completo de datos sensibles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para hacer SCALA Fleet AI completamente tuyo?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Con esta guía de migración tendrás todo lo necesario para crear una aplicación 
              independiente, escalable y completamente bajo tu control.
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3-4 semanas</div>
                <div className="text-sm text-gray-600">Tiempo de migración</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$70-225</div>
                <div className="text-sm text-gray-600">Costo mensual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Control total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}