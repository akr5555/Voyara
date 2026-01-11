import os
import requests
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL_NAME = os.getenv("VEGA_MODEL", "phi3")


def query_ollama(prompt: str) -> str:
    """
    Sends a single prompt to Ollama and returns the model response.
    Stateless, single-shot inference only.
    """

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()

        return response.json().get("response", "").strip()

    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Ollama request failed: {str(e)}")
