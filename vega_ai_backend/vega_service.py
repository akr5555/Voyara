import json
# FIXED IMPORT: We import VegaRequest (which exists) instead of VegaContext
from schemas import VegaRequest, VegaResponse 
from context_builder import build_context
from rules_engine import apply_rules
from prompt_templates import SYSTEM_PROMPT, DAY_ACTIVITY_PROMPT
from gemini_client import gemini_client

def _format_preferences(preferences):
    if not preferences:
        return "None provided"
    return ", ".join(preferences)

def _format_rules(rules):
    if not rules:
        return "No additional rules"
    return ", ".join(rules)

def run_vega(request: VegaRequest):
    """
    Main function called by main.py.
    Orchestrates the AI flow using Gemini.
    """
    print(f"--- Vega Processing Trip: {request.trip_id} ---")

    # 1. Build Context (returns a dict)
    context = build_context(request)

    # 2. Apply Rules (modifies the dict)
    context = apply_rules(context)

    # 3. Assemble the Prompt
    full_prompt = DAY_ACTIVITY_PROMPT.format(
        city=context["city"],
        country=context["country"],
        day=context["day"],
        time_slot=context["time_slot"],
        remaining_budget=context["remaining_budget"],
        # PASS THE NEW DATA HERE 👇
        adults=request.adults,
        children=request.children,
        
        preferences=_format_preferences(context["preferences"]),
        rules=_format_rules(context.get("rules", [])),
    )

    # 4. Call Cloud AI (Gemini)
    print("--- Sending to Gemini... ---")
    raw_response = gemini_client.generate(SYSTEM_PROMPT, full_prompt)
    print("--- Gemini Responded ---")

    # 5. Parse JSON safely
    try:
        # Clean up Markdown if Gemini adds it (e.g. ```json ... ```)
        clean_json = raw_response.replace("```json", "").replace("```", "").strip()
        
        parsed_data = json.loads(clean_json)
        
        # Return the data directly. main.py will convert it to JSON automatically.
        return parsed_data

    except json.JSONDecodeError:
        print(f"CRITICAL: Could not parse JSON. Raw: {raw_response}")
        # Fallback empty response to prevent crash
        return {"suggestions": []}
    except Exception as e:
        print(f"Error: {e}")
        return {"suggestions": []}