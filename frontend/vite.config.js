import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
      host: '0.0.0.0',
      port: 5173,

      // Agrega aquí los hosts permitidos
      allowedHosts: [
        '5173-jcjaramill-backupregs-u2jdl4ku16p.ws-us121.gitpod.io'
      ],

      // Si usas HMR sobre ese host, especifícalo también
      hmr: {
        host: '5173-jcjaramill-backupregs-u2jdl4ku16p.ws-us121.gitpod.io'
      }
    }

})