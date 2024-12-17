'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(new Set()); // Track selected recipes for deletion
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal state
  const [modalRecipe, setModalRecipe] = useState<string>(''); // Recipe to show in modal

  // Load saved recipes from localStorage on component mount
  useEffect(() => {
    const storedRecipes = localStorage.getItem('savedRecipes');
    if (storedRecipes) {
      try {
        const parsedRecipes = JSON.parse(storedRecipes);
        if (Array.isArray(parsedRecipes)) {
          setSavedRecipes(parsedRecipes);
        }
      } catch (error) {
        console.error('Error loading recipes from localStorage:', error);
      }
    }
  }, []);

  // Save recipes to localStorage whenever savedRecipes state changes
  useEffect(() => {
    if (savedRecipes.length > 0) {
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    }
  }, [savedRecipes]);

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

    const ingredientsArray = ingredients.split(',').map((ingredient) => ingredient.trim());

    const recipeRequest: RecipeRequest = {
      cuisine,
      dietary,
      ingredients: ingredientsArray,
      time_limit: timeLimit,
      difficulty,
    };

    try {
      const response = await axios.post<RecipeResponse>('http://127.0.0.1:5000/generate_recipe', recipeRequest);
      setRecipe(response.data.recipe);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (recipe && !savedRecipes.includes(recipe)) {
      setSavedRecipes((prevRecipes) => [...prevRecipes, recipe]);
    }
  };

  // Open modal with the clicked recipe
  const openModal = (recipe: string) => {
    setModalRecipe(recipe);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalRecipe('');
  };

  // Handle deletion of a recipe
  const handleDeleteRecipe = (index: number) => {
    const updatedRecipes = savedRecipes.filter((_, i) => i !== index);
    setSavedRecipes(updatedRecipes);
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Recipe Generator Section */}
        <div className="recipe-generator">
          <h1 className="title">Welcome to InstaMeals</h1>
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label>Cuisine:</label>
              <input
                type="text"
                name="cuisine"
                value={cuisine}
                onChange={handleInputChange}
                placeholder="e.g., Italian, Indian"
              />
            </div>
            <div className="input-group">
              <label>Dietary Restrictions:</label>
              <input
                type="text"
                name="dietary"
                value={dietary}
                onChange={handleInputChange}
                placeholder="e.g., Vegetarian, Gluten-free"
              />
            </div>
            <div className="input-group">
              <label>Ingredients (comma-separated):</label>
              <input
                type="text"
                name="ingredients"
                value={ingredients}
                onChange={handleInputChange}
                placeholder="e.g., tomato, mozzarella"
              />
            </div>
            <div className="input-group">
              <label>Time Limit (minutes):</label>
              <input
                type="number"
                name="timeLimit"
                value={timeLimit}
                onChange={handleInputChange}
                placeholder="e.g., 30"
              />
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
              <h2>Recipe:</h2>
              <pre>{recipe}</pre>
              <button className="save-btn" onClick={handleSaveRecipe}>
                Save Recipe
              </button>
            </div>
          )}
        </div>

        {/* Saved Recipes Section */}
        <div className="saved-recipes">
          <h2>Saved Recipes</h2>
          <ul>
            {savedRecipes.map((savedRecipe, index) => (
              <li key={index} className="saved-recipe-item">
                <pre onClick={() => openModal(savedRecipe)}>{savedRecipe}</pre>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteRecipe(index)} 
                  title="Delete Recipe">
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Saved Recipe</h2>
            <pre>{modalRecipe}</pre>
            <button className="close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
