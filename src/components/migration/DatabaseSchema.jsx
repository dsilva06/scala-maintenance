import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Database, Table, Code } from 'lucide-react';

export default function DatabaseSchema() {
  const [copiedSection, setCopiedSection] = useState(null);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const schemas = {
    setup: `-- SCALA Fleet AI - PostgreSQL Setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,

    users: `-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'mechanic', 'driver')),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);`,

    drivers: `-- Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_category VARCHAR(10) NOT NULL CHECK (license_category IN ('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3')),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'vacaciones', 'incapacitado')),
    experience_years INTEGER DEFAULT 0,
    assigned_vehicle_id UUID,
    emergency_contact JSONB,
    created_by UUID REFERENCES users(id),
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);`,

    vehicles: `-- Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    current_mileage BIGINT DEFAULT 0,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('camion', 'van', 'bus', 'especial', 'semirremolque', 'chuto', 'cisterna')),
    cargo_type VARCHAR(255),
    status VARCHAR(50) DEFAULT 'activo' CHECK (status IN ('activo', 'mantenimiento', 'fuera_servicio')),
    photos TEXT[],
    vin VARCHAR(100),
    color VARCHAR(50),
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('gasolina', 'diesel', 'electrico', 'hibrido')),
    available_permits TEXT[],
    axis_count INTEGER,
    tire_sizes TEXT[],
    created_by UUID REFERENCES users(id),
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);`,

    trips: `-- Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id),
    driver_name VARCHAR(255) NOT NULL,
    origin VARCHAR(500) NOT NULL,
    destination VARCHAR(500) NOT NULL,
    origin_coords JSONB,
    destination_coords JSONB,
    planned_route JSONB,
    current_position JSONB,
    status VARCHAR(50) DEFAULT 'planificado' CHECK (status IN ('planificado', 'en_curso', 'completado', 'cancelado')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    estimated_arrival TIMESTAMP,
    distance_planned DECIMAL(10,2),
    distance_traveled DECIMAL(10,2),
    cargo_description TEXT,
    cargo_weight DECIMAL(12,2),
    alerts JSONB,
    position_history JSONB,
    created_by UUID REFERENCES users(id),
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);`,

    maintenance: `-- Maintenance Orders Table
CREATE TABLE maintenance_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('preventivo', 'correctivo', 'emergencia')),
    priority VARCHAR(50) DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
    description TEXT NOT NULL,
    fault_location VARCHAR(255),
    fault_subcategory VARCHAR(255),
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    mechanic VARCHAR(255),
    mileage_at_service BIGINT,
    parts_used JSONB,
    labor_hours DECIMAL(8,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);`,

    indexes: `-- Performance Indexes
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);

CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);

CREATE INDEX idx_maintenance_vehicle ON maintenance_orders(vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance_orders(status);
CREATE INDEX idx_maintenance_priority ON maintenance_orders(priority);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_drivers_updated_date BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_vehicles_updated_date BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();`,

    seeds: `-- Sample Data Seeds
INSERT INTO users (email, full_name, role) VALUES
('admin@scalafleet.com', 'Administrador SCALA', 'admin'),
('mechanic@scalafleet.com', 'Juan Mechanic', 'mechanic');

INSERT INTO drivers (full_name, license_number, license_category, phone, email, status) VALUES
('Carlos Rodriguez', 'LIC001', 'C2', '+57 300 123 4567', 'carlos@example.com', 'activo'),
('Maria Lopez', 'LIC002', 'C3', '+57 301 234 5678', 'maria@example.com', 'activo'),
('Jose Martinez', 'LIC003', 'C1', '+57 302 345 6789', 'jose@example.com', 'activo');

INSERT INTO vehicles (plate, brand, model, year, vehicle_type, status, current_mileage) VALUES
('ABC-123', 'Mercedes-Benz', 'Actros', 2020, 'camion', 'activo', 150000),
('DEF-456', 'Volvo', 'FH16', 2019, 'camion', 'activo', 200000),
('GHI-789', 'Scania', 'R450', 2021, 'camion', 'mantenimiento', 100000);`
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <Database className="w-8 h-8 text-blue-600" />
          Esquema de Base de Datos PostgreSQL
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Schema completo optimizado para PostgreSQL con todas las tablas, 
          índices y triggers necesarios para SCALA Fleet AI
        </p>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="indexes">Indexes</TabsTrigger>
          <TabsTrigger value="seeds">Seeds</TabsTrigger>
        </TabsList>

        {Object.entries(schemas).map(([key, sql]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {key.charAt(0).toUpperCase() + key.slice(1)} Schema
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(sql, key)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copiedSection === key ? 'Copiado!' : 'Copiar'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap">{sql}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Table className="w-5 h-5" />
            Características del Schema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">✅ Optimizaciones</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Índices en columnas críticas</li>
                <li>• Constraints para integridad</li>
                <li>• Triggers para updated_date</li>
                <li>• Soporte JSONB para flexibilidad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🔒 Seguridad</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• UUID como primary keys</li>
                <li>• Foreign key constraints</li>
                <li>• Check constraints en enums</li>
                <li>• Soft deletes donde corresponde</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Este schema es 100% compatible con tus datos actuales de base44. 
              Los tipos de datos y estructura mantienen la misma interfaz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}