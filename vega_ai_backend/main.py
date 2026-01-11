from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from schemas import VegaRequest
from vega_service import run_vega

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Voyara Vega AI",
    description="Assistive AI trip planning service",
    version="1.0.0"
)

# CORS - Get allowed origins from environment or default to all
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """
    Root endpoint - Service information
    """
    return {
        "service": "Voyara Vega AI",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "suggest": "/api/ai/vega/suggest",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring
    """
    return {"status": "healthy"}

@app.post("/api/ai/vega/suggest")
def vega_suggest(request: VegaRequest):
    """
    Assistive AI endpoint.
    Returns suggestions only.
    No autonomous actions.
    
    Returns:
        JSON response with suggestions, status, and metadata
    """
    logger.info(f"Received request for trip_id={request.trip_id}, city={request.city}, country={request.country}")
    try:
        result = run_vega(request)
        logger.info(f"Successfully generated suggestions for trip_id={request.trip_id}")
        
        # Ensure we always return a properly structured response
        response = {
            "success": True,
            "trip_id": request.trip_id,
            "city": request.city,
            "country": request.country,
            "day": request.day,
            "time_slot": request.time_slot,
            "suggestions": result.get("suggestions", []),
            "message": f"Generated {len(result.get('suggestions', []))} suggestions"
        }
        return response
    except Exception as e:
        logger.error(f"Error generating suggestions: {str(e)}")
        return {
            "success": False,
            "trip_id": request.trip_id,
            "city": request.city,
            "country": request.country,
            "suggestions": [],
            "error": str(e),
            "message": "Failed to generate suggestions"
        }
