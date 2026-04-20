import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';

console.log("React app.jsx entry point hit");

const container = document.getElementById('app');
if (container) {
    console.log("Mounting container found, initializing root...");
    try {
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <Root />
            </React.StrictMode>
        );
        console.log("Root render called successfully");
    } catch (error) {
        console.error("React mounting error:", error);
        container.innerHTML = `<div style="padding: 20px; color: red;">JavaScript Runtime Error: ${error.message}</div>`;
    }
} else {
    console.error("Mounting container #app NOT found in DOM");
}
