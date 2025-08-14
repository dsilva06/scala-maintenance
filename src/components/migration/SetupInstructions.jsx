import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Copy, Terminal, Package, Settings, Rocket } from 'lucide-react';

export default function SetupInstructions() {
  const [copiedCommand, setCopiedCommand] = useState(null);

  const copyToClipboard = (text, command) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const steps = [
    {
      id: 'project',
      title: '1. Crear Proyecto',
      description: 'Inicializar proyecto Next.js con TypeScript',
      commands: [
        'mkdir scala-fleet-ai',
        'cd scala-fleet-ai',
        'npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"'
      ]
    },
    {
      id: 'dependencies',
      title: '2. Instalar Dependencias',
      description: 'Todas las librerías necesarias',
      commands: [
        'npm install @prisma/client prisma',
        'npm install @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-button',
        'npm install date-fns framer-motion leaflet lodash lucide-react',
        'npm install next-auth openai react-hook-form react-leaflet',
        'npm install -D @types/leaflet @types/lodash tsx'
      ]
    },
    {
      id: 'database',
      title: '3. Configurar Base de Datos',
      description: 'PostgreSQL y Prisma setup',
      commands: [
        'createdb scala_fleet_ai',
        'npx prisma init',
        'npx prisma migrate dev --name init',
        'npx prisma generate'
      ]
    },
    {
      id: 'shadcn',
      title: '4. Configurar Shadcn/ui',
      description: 'Componentes UI listos para usar',
      commands: [
        'npx shadcn-ui@latest init',
        'npx shadcn-ui@latest add button card input label select textarea',
        'npx shadcn-ui@latest add table badge progress dialog dropdown-menu',
        'npx shadcn-ui@latest add command popover checkbox tabs separator toast'
      ]
    },
    {
      id: 'structure',
      title: '5. Estructura de Carpetas',
      description: 'Organización del proyecto',
      commands: [
        'mkdir -p src/app/{dashboard,vehicles,trips,maintenance,inspections,inventory,documents,ai-assistant}',
        'mkdir -p src/components/{ui,dashboard,vehicles,trips,maintenance,inspections,inventory,documents}',
        'mkdir -p src/lib public/uploads'
      ]
    },
    {
      id: 'env',
      title: '6. Variables de Entorno',
      description: 'Configuración de servicios',
      content: `# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/scala_fleet_ai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
OPENAI_API_KEY="your-openai-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"`
    }
  ];

  const troubleshooting = [
    {
      error: 'Error de conexión a DB',
      solution: 'Verificar DATABASE_URL en .env.local',
      command: 'npx prisma db push'
    },
    {
      error: 'Error de Prisma',
      solution: 'Regenerar cliente Prisma',
      command: 'npx prisma generate'
    },
    {
      error: 'Error de Next.js',
      solution: 'Limpiar cache',
      command: 'rm -rf .next && npm run dev'
    },
    {
      error: 'Error de tipos TypeScript',
      solution: 'Verificar tipos',
      command: 'npm run type-check'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Rocket className="w-8 h-8 text-blue-600" />
          Guía de Instalación Completa
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Paso a paso para configurar tu aplicación SCALA Fleet AI independiente, 
          desde cero hasta producción
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="migration">Migración</TabsTrigger>
          <TabsTrigger value="deployment">Despliegue</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Prerequisitos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="font-medium">Node.js</div>
                  <div className="text-sm text-gray-600">v18 o superior</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="font-medium">PostgreSQL</div>
                  <div className="text-sm text-gray-600">v14 o superior</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="font-medium">Git</div>
                  <div className="text-sm text-gray-600">Control de versiones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {step.title}
                </CardTitle>
                <p className="text-gray-600">{step.description}</p>
              </CardHeader>
              <CardContent>
                {step.commands ? (
                  <div className="space-y-3">
                    {step.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="flex items-center gap-3 p-3 bg-gray-900 text-green-400 rounded-lg">
                        <Terminal className="w-4 h-4 flex-shrink-0" />
                        <code className="flex-1 text-sm">{command}</code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-white border-gray-600 hover:bg-gray-800"
                          onClick={() => copyToClipboard(command, `${step.id}-${cmdIndex}`)}
                        >
                          {copiedCommand === `${step.id}-${cmdIndex}` ? 'Copiado!' : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">{step.content}</pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-3 text-white border-gray-600"
                      onClick={() => copyToClipboard(step.content, step.id)}
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      {copiedCommand === step.id ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="migration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔄 Proceso de Migración de Componentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">ANTES (sistema original)</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">{`import { Vehicle } from '@/api/entities';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    const loadVehicles = async () => {
      const data = await Vehicle.list();
      setVehicles(data);
    };
    loadVehicles();
  }, []);
}`}</pre>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">DESPUÉS (independiente)</h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                      <pre className="text-sm">{`import { VehicleAPI as Vehicle } from '@/lib/api-client';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    const loadVehicles = async () => {
      const data = await Vehicle.list();
      setVehicles(data);
    };
    loadVehicles();
  }, []);
}`}</pre>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    ✅ Solo 1 Cambio por Componente
                  </h4>
                  <p className="text-sm text-green-700">
                    Cambiar la línea de import y el resto del código permanece exactamente igual.
                    Todos tus componentes React funcionarán sin modificaciones adicionales.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Pasos de Migración:</h4>
                  <div className="space-y-2">
                    {[
                      'Copiar componente existente a src/components/',
                      'Cambiar import de entidad por API client',
                      'Verificar que funcione correctamente',
                      'Repetir para siguiente componente'
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">✅ Vercel (Recomendado)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Deploy automático desde Git</li>
                  <li>• Edge functions incluidas</li>
                  <li>• CDN global</li>
                  <li>• SSL automático</li>
                </ul>
                <Badge className="bg-green-100 text-green-800">$20/mes</Badge>
                <div className="mt-4 p-3 bg-gray-900 text-green-400 rounded">
                  <code className="text-xs">vercel --prod</code>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">Railway</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• PostgreSQL incluido</li>
                  <li>• Deploy desde Git</li>
                  <li>• Escalado automático</li>
                  <li>• Monitoring integrado</li>
                </ul>
                <Badge className="bg-blue-100 text-blue-800">$5-20/mes</Badge>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-700">Render</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 mb-4">
                  <li>• Free tier disponible</li>
                  <li>• PostgreSQL managed</li>
                  <li>• SSL automático</li>
                  <li>• Fácil configuración</li>
                </ul>
                <Badge className="bg-purple-100 text-purple-800">$7-25/mes</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Checklist de Despliegue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Preparación</h4>
                  <div className="space-y-2">
                    {[
                      'Variables de entorno configuradas',
                      'Base de datos creada en producción',
                      'Migraciones ejecutadas',
                      'Seeds de datos ejecutados',
                      'Dominio configurado (opcional)'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Post-Deploy</h4>
                  <div className="space-y-2">
                    {[
                      'Verificar funcionamiento básico',
                      'Probar autenticación',
                      'Verificar upload de archivos',
                      'Probar integración con IA',
                      'Configurar monitoreo'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Solución de Problemas Comunes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-600">❌ {item.error}</h4>
                      <Badge variant="outline">Solución</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.solution}</p>
                    <div className="flex items-center gap-3 p-2 bg-gray-900 text-green-400 rounded">
                      <Terminal className="w-4 h-4" />
                      <code className="text-sm flex-1">{item.command}</code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-white border-gray-600"
                        onClick={() => copyToClipboard(item.command, `trouble-${index}`)}
                      >
                        {copiedCommand === `trouble-${index}` ? 'Copiado!' : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">💡 Comandos Útiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { desc: 'Resetear base de datos', cmd: 'npx prisma migrate reset' },
                  { desc: 'Ver base de datos', cmd: 'npx prisma studio' },
                  { desc: 'Verificar tipos', cmd: 'npm run type-check' },
                  { desc: 'Limpiar proyecto', cmd: 'rm -rf node_modules .next && npm install' },
                  { desc: 'Ver logs en producción', cmd: 'vercel logs' },
                  { desc: 'Ejecutar seeds', cmd: 'npm run db:seed' }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm mb-1">{item.desc}</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-900 text-green-400 rounded text-xs">
                      <code className="flex-1">{item.cmd}</code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-6 w-6 p-0 text-white border-gray-600"
                        onClick={() => copyToClipboard(item.cmd, `util-${index}`)}
                      >
                        <Copy className="w-2 h-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
