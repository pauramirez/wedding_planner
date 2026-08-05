import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { initRum } from "./lib/dd.js";
import "./styles/global.css";

initRum();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
