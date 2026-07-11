import { contextBridge } from 'electron';

// Expose minimal API to renderer
contextBridge.exposeInMainWorld('api', {
    // We will use IPC in Praktikum 09.
    // For now, it's just a placeholder.
    version: process.versions.electron
});
