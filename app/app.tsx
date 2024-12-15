// src/App.tsx
import React from 'react';
import RecipeGenerator from './components/recipeGenerator';
import './RecipeGenerator.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <RecipeGenerator />
    </div>
  );
};

export default App;
