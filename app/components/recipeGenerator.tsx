'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import './RecipeGenerator.css';

interface RecipeRequest {
  cuisine: string;
  dietary: string;
  ingredients: string[];
  time_limit: number;
  difficulty: string;
}

interface RecipeResponse {
  chat_message: string;
  recipe: string;
}

const RecipeGenerator: React.FC = () => {
  const [cuisine, setCuisine] = useState<string>('');
  const [dietary, setDietary] = useState<string>('');
  const [ingredients, setIngredients] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [recipe, setRecipe] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cuisine') setCuisine(value);
    else if (name === 'dietary') setDietary(value);
    else if (name === 'ingredients') setIngredients(value);
    else if (name === 'timeLimit') setTimeLimit(Number(value));
    else if (name === 'difficulty') setDifficulty(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe('');
    setChatMessage('');

    const ingredientsArray = ingredients.split(',').map((ingredient) => ingredient.trim());

    const recipeRequest: RecipeRequest = {
      cuisine,
      dietary,
      ingredients: ingredientsArray,
      time_limit: timeLimit,
      difficulty,
    };

    try {
      const response = await axios.post<RecipeResponse>('https://instameals.onrender.com/generate_recipe', recipeRequest);
      setRecipe(response.data.recipe);
      setChatMessage(response.data.chat_message);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Welcome to InstaMeals</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label>Cuisine:</label>
          <input type="text" name="cuisine" value={cuisine} onChange={handleInputChange} placeholder="e.g., Italian, Indian" />
        </div>
        <div className="input-group">
          <label>Dietary Restrictions:</label>
          <input type="text" name="dietary" value={dietary} onChange={handleInputChange} placeholder="e.g., Vegetarian, Gluten-free" />
        </div>
        <div className="input-group">
          <label>Ingredients (comma-separated):</label>
          <input type="text" name="ingredients" value={ingredients} onChange={handleInputChange} placeholder="e.g., tomato, mozzarella" />
        </div>
        <div className="input-group">
          <label>Time Limit (minutes):</label>
          <input type="number" name="timeLimit" value={timeLimit} onChange={handleInputChange} placeholder="e.g., 30" />
        </div>
        <div className="input-group">
          <label>Difficulty:</label>
          <select name="difficulty" value={difficulty} onChange={handleInputChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </form>
  
      {error && <p className="error-message">{error}</p>}
  
      {recipe && (
        <div className="recipe">
          <h2>Generated Recipe:</h2>
          <pre>{recipe}</pre>
        </div>
      )}
    </div>
  );
}  

export default RecipeGenerator;
