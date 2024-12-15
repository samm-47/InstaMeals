from flask import Flask, request, jsonify
import os
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
# Load your API token securely (e.g., from environment variables)
API_TOKEN = os.getenv("GEMINI_API_TOKEN")

# Configure the Generative AI model
genai.configure(api_key=API_TOKEN)

# Initialize the chat history (empty at first)
chat_history = []

# Assuming you're using a fine-tuned model (e.g., gemini-1.5-flash)
model = genai.GenerativeModel("gemini-1.5-flash")

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    # Get user inputs from the frontend
    data = request.json
    cuisine = data.get('cuisine', 'any')
    dietary = data.get('dietary', 'none')
    ingredients = data.get('ingredients', [])  # List of included ingredients
    time_limit = data.get('time_limit', 30)  # Default: 30 minutes
    difficulty = data.get('difficulty', 'easy')

    # Build the prompt for the AI model
    prompt = f"""
    Generate a clear and simple recipe for a {cuisine} dish that meets these dietary restrictions: {dietary}.
    Use the following ingredients: {', '.join(ingredients)}. The cooking time should be under {time_limit} minutes.
    Ensure the recipe is suitable for a {difficulty} level cook. Provide a simple, step-by-step recipe with clear ingredient measurements and concise instructions.
    Avoid excessive explanations or fancy formatting like markdown.
    """

    # Append the user's question (prompt) to the chat history for context
    chat_history.append({"role": "user", "parts": prompt})

    try:
        # Create a new chat session with the model, using the updated chat history
        chat_session = model.start_chat(history=chat_history)

        # Send the prompt to the model
        response = chat_session.send_message(prompt)

        # Extract the generated recipe from the response
        recipe = response.text if hasattr(response, 'text') else "No recipe generated."
        
        # Clean up the response to remove unwanted formatting, if necessary
        recipe_cleaned = recipe.replace("##", "").replace("\n\n", "\n").strip()

        # Set a chatbot message based on the recipe generation result
        chat_message = "Here is your recipe!" if recipe_cleaned else "Sorry, no recipe could be generated."

    except Exception as e:
        print("Error calling chat model:", str(e))
        return jsonify({"error": "Failed to communicate with the model."}), 500

    # Append the model's response to the chat history for context
    chat_history.append({"role": "model", "parts": recipe_cleaned})

    # Return both chat message and recipe
    return jsonify({
        "chat_message": chat_message,
        "recipe": recipe_cleaned
    })
# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)