import React, { useEffect, useState } from 'react';
import BackupUploader from './components/BackupUploader';
import BackupHistory from './components/BackupHistory';
import { fetchBackups } from './services/BackupService';

function BackupDashboard() {
  const [backups, setBackups] = useState(null);

  const loadBackups = async () => {
        try {
            const data = await fetchBackups();
            setBackups(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error('Error al cargar backups:', err);
            setBackups([]); // ← fallback seguro
        }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <BackupUploader onUploadComplete={loadBackups} />
      <hr className="my-6" />
      <BackupHistory backups={backups} />
    </div>
  );
}

export default BackupDashboard;
