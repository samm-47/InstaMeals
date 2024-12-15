// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';  // Ensure you're importing from 'react-dom/client'
import './RecipeGenerator.css';
import App from '../app/app';

const root = ReactDOM.createRoot(document.getElementById('root')!);  // Create a root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
