import { DatabaseConnection } from "./connection.js";

console.log("========== INITIALIZING DATABASE ==========");
DatabaseConnection.initialize();
console.log("========== INITIALIZATION COMPLETE ==========");
DatabaseConnection.close();
