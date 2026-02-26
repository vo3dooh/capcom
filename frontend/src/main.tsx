import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/app/styles/global.css";

console.log("MAIN LOADED ✅", new Date().toISOString());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
