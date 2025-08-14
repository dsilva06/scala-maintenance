import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Vehicles from "./Vehicles";

import Maintenance from "./Maintenance";

import Inspections from "./Inspections";

import Inventory from "./Inventory";

import Documents from "./Documents";

import Trips from "./Trips";

import AIAssistant from "./AIAssistant";

import MigrationGuide from "./MigrationGuide";

import Guides from "./Guides";

import MaintenanceGuides from "./MaintenanceGuides";

import Purchases from "./Purchases";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Vehicles: Vehicles,
    
    Maintenance: Maintenance,
    
    Inspections: Inspections,
    
    Inventory: Inventory,
    
    Documents: Documents,
    
    Trips: Trips,
    
    AIAssistant: AIAssistant,
    
    MigrationGuide: MigrationGuide,
    
    Guides: Guides,
    
    MaintenanceGuides: MaintenanceGuides,
    
    Purchases: Purchases,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Vehicles" element={<Vehicles />} />
                
                <Route path="/Maintenance" element={<Maintenance />} />
                
                <Route path="/Inspections" element={<Inspections />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Trips" element={<Trips />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/MigrationGuide" element={<MigrationGuide />} />
                
                <Route path="/Guides" element={<Guides />} />
                
                <Route path="/MaintenanceGuides" element={<MaintenanceGuides />} />
                
                <Route path="/Purchases" element={<Purchases />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}