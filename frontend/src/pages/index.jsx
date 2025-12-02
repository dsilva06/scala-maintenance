import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Layout.jsx';
import Dashboard from './Dashboard';
import Vehicles from './Vehicles';
import Maintenance from './Maintenance';
import Inspections from './Inspections';
import Inventory from './Inventory';
import Documents from './Documents';
import Trips from './Trips';
import Guides from './Guides';
import MaintenanceGuides from './MaintenanceGuides';
import Purchases from './Purchases';
import AccessDenied from './AccessDenied.jsx';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Pages() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="access-denied" element={<AccessDenied />} />
            <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} redirectTo="/app/access-denied" />}>
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="inspections" element={<Inspections />} />
              <Route path="trips" element={<Trips />} />
              <Route path="guides" element={<Guides />} />
              <Route path="maintenance-guides" element={<MaintenanceGuides />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/app/access-denied" />}>
              <Route path="inventory" element={<Inventory />} />
              <Route path="documents" element={<Documents />} />
              <Route path="purchases" element={<Purchases />} />
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
