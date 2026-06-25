import { CLI_URL } from '../config/constants';

export const cliService = {
  // Auto-detectar credenciales Firebase para un proyecto
  detectFirebaseConfig: async (projectId) => {
    const res = await fetch(`${CLI_URL}/api/project/detect-firebase-config?projectId=${encodeURIComponent(projectId)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  // Levantar servidor de desarrollo para una instancia de cliente
  startDevServer: async (clientId) => {
    const res = await fetch(`${CLI_URL}/api/project/dev/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  // Detener servidor de desarrollo de un cliente
  stopDevServer: async (clientId) => {
    const res = await fetch(`${CLI_URL}/api/project/dev/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  // Obtener desviación física (drift) global
  getGlobalDrift: async () => {
    const res = await fetch(`${CLI_URL}/api/project/drift/global`);
    if (!res.ok) {
      throw new Error(`Error HTTP ${res.status} al escanear paridad global`);
    }
    return res.json();
  },

  // Desplegar reglas de seguridad Firebase
  deployFirebaseRules: async (clientId, type) => {
    const res = await fetch(`${CLI_URL}/api/project/firebase-rules/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, type })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  // Descartar cambios de Git en un archivo específico de un proyecto
  gitDiscardChanges: async (projectId, relativePath) => {
    const res = await fetch(`${CLI_URL}/api/git/discard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, relativePath })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error HTTP ${res.status}`);
    }
    return res.json();
  },

  // Generar URL para streaming SSE de instalación de dependencias
  getDependencyInstallSseUrl: (clientId) => {
    return `${CLI_URL}/api/project/dependencies/install?clientId=${encodeURIComponent(clientId)}`;
  },

  // Generar URL para streaming SSE de logs del servidor dev
  getDevLogsSseUrl: (clientId) => {
    return `${CLI_URL}/api/project/dev/logs-stream?clientId=${encodeURIComponent(clientId)}`;
  },

  // Generar URL para streaming SSE de sincronización y despliegue global
  getGlobalSyncSseUrl: (clientIds, deployMode) => {
    const idsParam = encodeURIComponent(JSON.stringify(clientIds));
    return `${CLI_URL}/api/instancias/sync-and-deploy-stream?clientIds=${idsParam}&deploy=${deployMode ? 'true' : 'false'}`;
  }
};
