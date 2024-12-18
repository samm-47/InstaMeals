from flask import Flask, request, jsonify
import os
import google.generativeai as genai
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
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
    time_limit = data.get('time_limit', 30)  # Default: 30 minutes
    difficulty = data.get('difficulty', 'easy')
    leftover_ingredients = data.get('leftover_ingredients', [])  # Update key name
    additional_notes = data.get('additional_notes', 'none')     # Update key name


    # Build the prompt for the AI model
    prompt = f"""
    Generate a clear and simple recipe for a {cuisine} dish that meets these dietary restrictions: {dietary}.
    Use the following leftover ingredients: {', '.join(leftover_ingredients)}. The cooking time should be under {time_limit} minutes.
    Ensure the recipe is suitable for a {difficulty} level cook. Please take into account {additional_notes}. Provide a simple, step-by-step recipe with clear ingredient measurements and concise instructions.
    Avoid excessive explanations or fancy formatting like markdown. Add a few ingredients at the bottom that could add to the dish.
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
    
    # Flask-Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')  # Your email
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASS')  # Your email password
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USER')

mail = Mail(app)

@app.route('/send_recipes', methods=['POST'])
def send_recipes():
    data = request.json
    email = data.get('email')  # Recipient's email address
    recipes = data.get('recipes', [])  # List of recipes

    if not email or not recipes:
        return jsonify({"error": "Email and recipes are required"}), 400

    try:
        # Format the recipes into a readable list
        formatted_recipes = "\n\n".join(
            [f"Recipe {i+1}:\n{recipe}" for i, recipe in enumerate(recipes)]
        )

        # Add the note about the email being unmonitored
        note = "\n\nPlease keep in mind that this email is unmonitored."

        # Create the email message
        subject = "Your Saved Recipes"
        body = f"Here are all your saved recipes:\n\n{formatted_recipes}{note}"
        msg = Message(subject=subject, recipients=[email], body=body)

        # Send the email
        mail.send(msg)
        return jsonify({"message": "All recipes sent successfully!"}), 200

    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"error": "Failed to send email"}), 500


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
