
'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import './RecipeGenerator.css';

interface RecipeRequest {
  cuisine: string;
  dietary: string;
  leftover_ingredients: string[];
  time_limit: number;
  difficulty: string;
  additional_notes: string;
}

interface RecipeResponse {
  recipe: string;
}

const RecipeGenerator: React.FC = () => {
  const [cuisine, setCuisine] = useState('');
  const [dietary, setDietary] = useState('');
  const [leftoverIngredients, setLeftoverIngredients] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [recipe, setRecipe] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRecipe, setModalRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const [savedRecipes, setSavedRecipes] = useState<string[] | null>(null);

useEffect(() => {
  const storedRecipes = localStorage.getItem('savedRecipes');
  if (storedRecipes) {
    try {
      const parsedRecipes = JSON.parse(storedRecipes);
      if (Array.isArray(parsedRecipes)) {
        setSavedRecipes(parsedRecipes);
      } else {
        setSavedRecipes([]); // Fallback if parsed data isn't an array
      }
    } catch (err) {
      console.error('Error loading recipes from localStorage:', err);
      setSavedRecipes([]); // Set to empty array on error
    }
  } else {
    setSavedRecipes([]); // No saved recipes found
  }
}, []);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'cuisine':
        setCuisine(value);
        break;
      case 'dietary':
        setDietary(value);
        break;
      case 'leftoverIngredients':
        setLeftoverIngredients(value);
        break;
      case 'timeLimit':
        setTimeLimit(Number(value));
        break;
      case 'difficulty':
        setDifficulty(value);
        break;
      case 'additionalNotes':
        setAdditionalNotes(value);
        break;
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const sendRecipesToEmail = async () => {
    try {
      const response = await axios.post('https://instameals.onrender.com/send_recipes', {
        email,
        recipes: savedRecipes,
      });
      if (response.status === 200) {
        setEmailSent(true);
        alert('Recipes sent successfully!');
      } else {
        alert('Failed to send recipes. Please try again.');
      }
    } catch (err) {
      console.error('Error sending recipes:', err);
      alert('An error occurred while sending recipes. Please try again.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe('');

    const leftoverIngredientsArray = leftoverIngredients
      .split(',')
      .map((ingredient) => ingredient.trim());

    const recipeRequest: RecipeRequest = {
      cuisine,
      dietary,
      leftover_ingredients: leftoverIngredientsArray,
      time_limit: timeLimit,
      difficulty,
      additional_notes: additionalNotes,
    };

    try {
      const response = await axios.post<RecipeResponse>('https://instameals.onrender.com/generate_recipe', recipeRequest);
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
      const updatedSavedRecipes = [...savedRecipes, recipe];
      setSavedRecipes(updatedSavedRecipes);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedSavedRecipes));
    }
  };

  const openModal = (recipe: string) => {
    setModalRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalRecipe('');
  };

  const handleDeleteRecipe = (index: number) => {
    const updatedRecipes = savedRecipes.filter((_, i) => i !== index);
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
  };

  return (
    <div className="container">
      <div className="main-content">
        {/* Recipe Generator Section */}
        <div className="recipe-generator">
          <h1 className="title">Welcome to InstaMeals</h1>
          <form onSubmit={handleSubmit} className="form">
            {[
              { label: 'Cuisine', name: 'cuisine', value: cuisine, placeholder: 'e.g., Italian, Indian' },
              { label: 'Dietary Restrictions', name: 'dietary', value: dietary, placeholder: 'e.g., Vegetarian, Gluten-free' },
              { label: 'Leftover Ingredients (comma-separated)', name: 'leftoverIngredients', value: leftoverIngredients, placeholder: 'e.g., tomato, mozzarella' },
              { label: 'Additional Notes', name: 'additionalNotes', value: additionalNotes, placeholder: 'e.g., No spicy food, add extra cheese' },
            ].map((field, index) => (
              <div className="input-group" key={index}>
                <label>{field.label}:</label>
                <input type="text" name={field.name} value={field.value} onChange={handleInputChange} placeholder={field.placeholder} />
              </div>
            ))}

            <div className="input-group">
              <label>Time Limit (minutes):</label>
              <input type="number" name="timeLimit" value={timeLimit} onChange={handleInputChange} placeholder="e.g., 30" />
            </div>
            <div className="input-group">
              <label>Difficulty:</label>
              <select name="difficulty" value={difficulty} onChange={handleInputChange}>
                {['easy', 'medium', 'hard'].map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
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
    <div className="recipe-content">
      {recipe.split('\n').map((line, index) => {
        if (line.trim().startsWith('*')) {
          return (
            <li key={index}>
              {line.trim().substring(1).trim()}
            </li>
          );
        } else if (line.match(/^\d+\./)) {
          return (
            <p key={index} style={{ marginLeft: '20px' }}>
              {line.trim()}
            </p>
          );
        } else {
          return <p key={index}>{line.trim()}</p>;
        }
      })}
    </div>
    <button className="save-btn" onClick={handleSaveRecipe}>
      Save Recipe
    </button>
  </div>
)}

        </div>

        <div className="saved-recipes">
  <h2>Saved Recipes</h2>
  {savedRecipes === null ? ( // Check if still initializing
    <p className="message message-loading">Loading recipes...</p>
  ) : savedRecipes.length === 0 ? ( // No recipes saved
    <p className="message message-empty">No saved recipes</p>
  ) : (
    <ul>
      {savedRecipes.map((savedRecipe, index) => (
        <li key={index} className="saved-recipe-item">
          <pre onClick={() => openModal(savedRecipe)}>{savedRecipe}</pre>
          <button className="delete-btn" onClick={() => handleDeleteRecipe(index)} aria-label="Delete Recipe">
            🗑️
          </button>
        </li>
      ))}
    </ul>
  )}
  <div className="email-section">
    <h3>Send Saved Recipes to Your Email</h3>
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={handleEmailChange}
    />
    <button onClick={sendRecipesToEmail}>Send Recipes</button>
    {emailSent && <p>Email sent successfully!</p>}
  </div>
</div>




      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal} aria-label="Close Recipe Modal">
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
