import React, { useEffect, useState } from 'react';
import BackupUploader from './components/BackupUploader';
import BackupHistory from './components/BackupHistory';
import Header from './components/Header';
import { fetchBackups } from './services/BackupService';

function BackupDashboard() {
  const [backups, setBackups] = useState(null);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadBackups = async () => {
    try {
      const data = await fetchBackups();
      setBackups(Array.isArray(data) ? data : []);
      setError('');
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Error al cargar backups:', err);
      if (err.message.includes('401')) {
        setError('🔒 No estás autenticado. Inicia sesión para ver el historial.');
        setIsAuthenticated(false);
      } else {
        setError('Error al cargar backups.');
      }
      setBackups([]);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleAuthChange = () => {
    loadBackups(); // ← actualiza todo al iniciar/cerrar sesión
  };

  return (
    <div>
      <Header onAuthChange={handleAuthChange} />
      <div className="max-w-6xl mx-auto">
        <BackupUploader
          onUploadComplete={loadBackups}
          isAuthenticated={isAuthenticated}
        />
        <hr className="my-6" />
        <BackupHistory backups={backups} error={error} />
      </div>
    </div>
  );
}

export default BackupDashboard;
