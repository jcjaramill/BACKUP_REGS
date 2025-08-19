import React from 'react';

function BackupHistory({ backups, error }) {
  const isLoading = !Array.isArray(backups) && !error;
  const safeBackups = Array.isArray(backups) ? backups : [];

  return (
    <div className="flex flex-col items-center bg-white shadow-md rounded p-6 max-w-6xl mx-auto mt-8">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Historial de Backups</h3>

      {error ? (
        <p className="text-red-500">🔒 No estás autenticado. Inicia sesión para ver el historial.</p>
      ) : isLoading ? (
        <p className="text-gray-500">Cargando historial...</p>
      ) : safeBackups.length === 0 ? (
        <p className="text-gray-500">No se encontraron backups registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Archivo subido</th>
                <th className="px-4 py-2 text-left">Destino</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Técnico</th>
                <th className="px-4 py-2 text-left">Sistema</th>
                <th className="px-4 py-2 text-left">Máquina</th>
                <th className="px-4 py-2 text-left">Línea/Núcleo</th>
                <th className="px-4 py-2 text-left">Tamaño (MB)</th>
              </tr>
            </thead>
            <tbody>
              {safeBackups.map((b, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{b.filename}</td>
                  <td className="px-4 py-2">{b.destination}</td>
                  <td className="px-4 py-2">{new Date(b.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">{b.tecnico}</td>
                  <td className="px-4 py-2">{b.sistema}</td>
                  <td className="px-4 py-2">{b.maquina}</td>
                  <td className="px-4 py-2">{b.linea}</td>
                  <td className="px-4 py-2">{(b.size_bytes / (1024 * 1024)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


export default BackupHistory;
