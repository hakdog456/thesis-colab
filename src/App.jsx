import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastContainer } from './components/common/ToastContainer';
import { DocumentPage } from './pages/DocumentPage';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DocumentPage />} />
            <Route path="/document/:id" element={<DocumentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
