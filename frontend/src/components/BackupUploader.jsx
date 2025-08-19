import React, { useState, useRef, useEffect } from 'react';
import { uploadBackup } from '../services/BackupService';

const lineas = [
  'Granulación', 'Compresión', 'Preparación', 'Recubrimiento',
  'Línea 1', 'Línea 2', 'Línea 3', 'Línea 4', 'Linea 5',
  'Línea 6', 'Línea 7', 'Línea 8', 'Línea 9', 'Línea 10'
];

const tecnicos = ['Juan Jaramillo', 'Miguel Garcia', 'Ronald Gonzalez'];

const sistemas = ['PC-HMI', 'Lector de Codigo', 'Telecamara', 'PLC'];

const maquinasPorLinea = {
  Granulación: ['CIT 60', 'CIT 120', 'DIOSNA P400', 'ACG', 'GLATT'],
  Compresión: ['Fette 2090-1', 'Fette 2090-2', 'Fette 2090-3', 'Fette 2090-4', 'Fette 2020', 'Fette 1200', 'Fette WIP', 'Fette 3090'],
  Preparación: ['Canguro 500', 'Canguro 1200'],
  Recubrimiento: ['Multicota 150-1', 'Multicota 150-2', 'Multicota 370'],
  'Línea 1': ['Estuchadora Uhlmann L1', 'Blistera Uhlmann L1', 'Balanza dinámica L1'],
  'Línea 2': ['Estuchadora HV L2', 'Blistera M92 L2', 'Balanza dinámica L2'],
  'Línea 3': ['Estuchadora HV L3', 'Blistera Blipack L3', 'Balanza dinámica L3', 'Tamper L3'],
  'Línea 4': ['Estuchadora HV L4', 'Blistera Blipack L4', 'Balanza dinámica L4'],
  'Linea 5': ['Estuchadora HV L5', 'Blistera NMX L5', 'Balanza dinámica L5', 'Enfajadora G35 L5'],
  'Línea 6': ['Estuchadora Uhlmann L6', 'Blistera Uhlmann L6', 'Balanza dinámica L6'],
  'Línea 7': ['Estuchadora Uhlmann L7', 'Blistera Uhlmann L7', 'Balanza dinámica L7'],
  'Línea 8': ['Estuchadora Marchesini L8', 'Blistera Marchesini L8', 'Balanza dinámica L8', 'Tamper L8'],
  'Línea 9': ['Estuchadora Uhlmann L9', 'Blistera Uhlmann L9', 'Balanza dinámica L9'],
  'Línea 10': ['Estuchadora HV L10', 'Blistera M92 L10', 'Balanza dinámica L10']
};

function BackUploader({ onUploadComplete, isAuthenticated }) {
  const [file, setFile] = useState(null);
  const [tecnico, setTecnico] = useState('');
  const [maquina, setMaquina] = useState('');
  const [sistema, setSistema] = useState('');
  const [linea, setLinea] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressKb, setProgressKb] = useState(0);
  const [maquinasDisponibles, setMaquinasDisponibles] = useState([]);
  const [hash, setHash] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Limpiar estado al iniciar sesión
      setStatus('');
      setHash('');
      setFile(null);
      setTecnico('');
      setMaquina('');
      setSistema('');
      setLinea('');
      setMaquinasDisponibles([]);
      setProgress(0);
      setProgressKb(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isAuthenticated]);
  

  const handleLineaChange = (e) => {
    const selected = e.target.value;
    setLinea(selected);
    const maquinas = maquinasPorLinea[selected] || [];
    setMaquinasDisponibles(maquinas.sort());
    setMaquina(''); // reset selección
  };

const handleUpload = async () => {
  // 🔐 Validación de sesión
  if (!isAuthenticated) {
    setStatus("🔒 Debes iniciar sesión para subir backups.");
    return;
  }

  // 📋 Validación de campos obligatorios
  if (!file || !tecnico || !maquina || !sistema || !linea) {
    setStatus("⚠️ Completa todos los campos antes de subir.");
    return;
  }

  // 📁 Validación de formato de archivo
  const EXTENSIONES_PERMITIDAS = [".tib", ".zip", ".csv", ".7z"];
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !EXTENSIONES_PERMITIDAS.includes(`.${extension}`)) {
    setStatus(`❌ Formato no permitido: .${extension}. Permitidos: ${EXTENSIONES_PERMITIDAS.join(", ")}`);
    return;
  }

  // 📦 Validación de tamaño (ejemplo: 2GB)
  const MAX_MB = 2048;
  if (file.size > MAX_MB * 1024 * 1024) {
    setStatus(`❌ El archivo supera el límite de ${MAX_MB}MB.`);
    return;
  }

  // ✅ Si todo está bien, iniciar subida
  setStatus("Cargando...");
  setProgress(0);
  setProgressKb(0);

  const handleProgress = (percent) => {
    setProgress(percent);
    if (percent === 100) {
      setStatus("Espere...");
    }
  };

  try {
    const metadata = { tecnico, maquina, sistema, linea };

    const response = await uploadBackup(
      file,
      metadata,
      handleProgress,
      setProgressKb
    );

    setStatus("✅ Backup registrado correctamente.");
    setHash(response.sha256);
    setProgress(0);
    setProgressKb(0);
    setLinea("");
    setMaquina("");
    setSistema("");
    setTecnico("");
    fileInputRef.current.value = "";

    if (onUploadComplete) onUploadComplete();
  } catch (err) {
    console.error("Error:", err);

    if (err.message.includes("401")) {
      setStatus("🔒 Sesión no válida. Por favor, inicia sesión.");
    } else if (err.message.includes("Formato de archivo no permitido")) {
      setStatus(`❌ ${err.message}`);
    } else if (err.message.includes("413")) {
      setStatus("❌ El archivo excede el tamaño permitido.");
    } else {
      setStatus(`❌ ${err.message}`);
    }
  }
};

return (
  <div className="bg-white shadow-md rounded-lg p-2 max-w-7xl mx-auto text-sm text-gray-700">
    {/* Título arriba */}
    <h2 className="text-base font-semibold text-gray-800 mb-4">📁 Subir Backup</h2>

    {/* Campos y botón en una sola fila */}
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <input 
        type="file"
        ref={fileInputRef} 
        onChange={e => {
          setFile(e.target.files[0]);
          setStatus('');
          setHash('');
          setProgress(0);
          setProgressKb(0);
        }} 
        className="min-w-[160px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" 
      />

      <select value={linea} onChange={handleLineaChange} className="min-w-[160px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
        <option value="">Línea/Núcleo</option>
        {lineas.map((l, i) => <option key={i} value={l}>{l}</option>)}
      </select>

      <select value={maquina} onChange={e => setMaquina(e.target.value)} disabled={!maquinasDisponibles.length} className="min-w-[160px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
        <option value="">Máquina</option>
        {maquinasDisponibles.map((m, i) => <option key={i} value={m}>{m}</option>)}
      </select>

      <select value={sistema} onChange={e => setSistema(e.target.value)} className="min-w-[160px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
        <option value="">Sistema</option>
        {sistemas.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>

      <select value={tecnico} onChange={e => setTecnico(e.target.value)} className="min-w-[160px] border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
        <option value="">Técnico</option>
        {tecnicos.map((t, i) => <option key={i} value={t}>{t}</option>)}
      </select>

      <button 
        onClick={handleUpload} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition shadow-sm"
      >
        Subir
      </button>
    </div>

    {/* Barra de progreso centrada */}
    {progress > 0 && progress < 100 && (
      <div className="flex flex-col items-center mb-2">
        <div className="w-full max-w-sm bg-gray-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-1 text-xs text-gray-500">{progressKb} KB subidos ({progress}%)</p>
      </div>
    )}

    {/* Estado final centrado */}
    {status && (
      <div className="flex justify-center mt-2">
        <p className="text-xs text-gray-500">{status}</p>
      </div>
    )}

    {/* Estado final centrado */}    
    {hash && (
    <div className="mt-2 text-xs text-gray-500 text-center">
        <span className="font-medium text-gray-700">SHA256:</span> {hash}
    </div>
    )}
    
  </div>
);


}

export default BackUploader;
