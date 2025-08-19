import React, { useState, useEffect } from "react";

function Header({ onAuthChange }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState("");
  const [usuarioActivo, setUsuarioActivo] = useState("");

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8002/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          setUsuarioActivo(data.usuario || data.username || "Usuario");
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        });
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8002/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password: password }),
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setUsuario("");
        setPassword("");
        if (onAuthChange) onAuthChange(); // ✅
      } else {
        setError("❌ Credenciales inválidas");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Error de conexión");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario("");
    setPassword("");
    setUsuarioActivo("");
    if (onAuthChange) onAuthChange(); // ✅
  };


  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">📦 Backup Dashboard</h1>

      {token ? (
        <div className="flex items-center gap-4">
          <span className="text-green-400">Sesión: {usuarioActivo}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
          >
            Iniciar sesión
          </button>
          {error && <span className="text-red-400 ml-2">{error}</span>}
        </form>
      )}
    </header>
  );
}

export default Header;
