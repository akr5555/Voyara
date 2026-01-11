
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class GeminiClient:
    def __init__(self):
        # Get API key from environment variable
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise ValueError(
                " GEMINI_API_KEY not found!\n"
                "Please create a .env file with: GEMINI_API_KEY=your_key_here"
            )
        
        # Configure the library with your key
        genai.configure(api_key=api_key)
        
        # Using Gemini Flash model (Fast and efficient)
        self.model = genai.GenerativeModel('gemini-1.5-flash-latest')

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Generates content using Google Gemini API.
        """
        try:
            # Combine prompts for context
            combined_prompt = f"{system_prompt}\n\nHere is the specific request:\n{user_prompt}"
            
            response = self.model.generate_content(combined_prompt)
            return response.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return "{}"

# Singleton instance
gemini_client = GeminiClient()