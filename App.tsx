import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import PatientListPage from './pages/PatientListPage';
import AddPatientPage from './pages/AddPatientPage';
import TreatmentPage from './pages/TreatmentPage';
import AcupointSelectionPage from './pages/AcupointSelectionPage';
import EditPatientPage from './pages/EditPatientPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <AppProvider>
      <div className="bg-gray-100 min-h-screen font-sans">
        <div className="container mx-auto max-w-lg">
          <HashRouter>
            <Routes>
              <Route path="/" element={<PatientListPage />} />
              <Route path="/add" element={<AddPatientPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patient/edit/:id" element={<EditPatientPage />} />
              <Route path="/patient/:id" element={<TreatmentPage />} />
              <Route path="/patient/:id/acupoints" element={<AcupointSelectionPage />} />
            </Routes>
          </HashRouter>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;