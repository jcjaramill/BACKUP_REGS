
export function uploadBackup(file, metadata, onProgressPercent, onProgressKb) {
  return new Promise((resolve, reject) => {
    if (!metadata) {
      reject(new Error("Metadata no definida"));
      return;
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append("file", file);
    formData.append("tecnico", metadata.tecnico);
    formData.append("maquina", metadata.maquina);
    formData.append("sistema", metadata.sistema);
    formData.append("linea", metadata.linea);

    xhr.open("POST", "https://8000-jcjaramill-backupregs-u2jdl4ku16p.ws-us121.gitpod.io/api/upload-backup", true);

    // 🔐 Añadir token JWT si existe
    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        const kb = Math.round(event.loaded / 1024);
        if (onProgressPercent) onProgressPercent(percent);
        if (onProgressKb) onProgressKb(kb);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        console.log(xhr.responseText)
        try {
          const errorData = JSON.parse(xhr.responseText);
          const message = errorData.detail || `Error ${xhr.status}: ${xhr.statusText}`;
          reject(new Error(message));
        } catch {
          reject(new Error(`Error ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };


    xhr.onerror = () => reject(new Error("Error de red al subir el archivo."));
    xhr.send(formData);
  });
}


export async function fetchBackups() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://8000-jcjaramill-backupregs-u2jdl4ku16p.ws-us121.gitpod.io/api/backups", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}
