import { app, BrowserWindow } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // In production, we'd load index.html from dist/public/index.html
    // But depending on the structure, it might be in public/index.html
    // Let's resolve the path relative to this script
    // __dirname is dist/electron. So we need to go up to dist, then to public?
    // Wait, public is usually copied to dist/public or kept at project root.
    // If it's kept at project root, it's: path.join(__dirname, '../../public/index.html')
    // We will assume it's copied to dist/public or we just load it from project root.
    mainWindow.loadFile(path.join(__dirname, "../../public/index.html"));
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});
