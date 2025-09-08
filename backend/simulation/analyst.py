import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

_ACTIVE_MODEL = None

def _find_and_cache_active_model():
    """
    Asks the Groq API for its list of models and finds the first suitable,
    active chat model. Caches the result for the application's lifetime.
    """
    global _ACTIVE_MODEL
    if _ACTIVE_MODEL:
        return _ACTIVE_MODEL
    
    try:
        print("Finding an active Groq chat model...")
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        models = client.models.list().data
        
        found_model = None
        # Find the first available model that is NOT for audio (whisper or tts)
        for model in models:
            model_id_lower = model.id.lower()
            if model.active and "whisper" not in model_id_lower and "tts" not in model_id_lower:
                found_model = model.id
                if "llama3" in model_id_lower: # Prefer Llama3 if available
                    break
        
        if found_model:
            print(f"Success! Using active model: {found_model}")
            _ACTIVE_MODEL = found_model
            return _ACTIVE_MODEL
        else:
            raise ValueError("No suitable active chat model found at Groq.")
            
    except Exception as e:
        print(f"CRITICAL: Could not retrieve model list from Groq API. Analyst will be offline. Error: {e}")
        return None

# Find the model once when the server starts
_find_and_cache_active_model()

def get_dynamic_commentary(event_type: str, data: dict) -> str:
    """
    Generates dynamic commentary for a live simulation event using an LLM.
    """
    if not _ACTIVE_MODEL:
        return "Analyst is offline (could not find an active model)."

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    system_prompt = "You are a concise supply chain analyst providing a one-sentence summary for a live dashboard. Be insightful but brief."
    prompt = ""
    if event_type == "BULLWHIP":
        prompt = f"A bullwhip effect is suspected at week {data['week']}. Retailer order is {data['retailer_order']} while Distributor order has spiked to {data['distributor_order']}. Explain this variance."
    elif event_type == "DEMAND_SHIFT":
        prompt = f"At week {data['week']}, the base customer demand permanently increased from 20 to 25. Briefly state the long-term impact of this market shift."
    elif event_type == "DISRUPTION":
         prompt = f"A major disruption was injected at week {data['week']}. Demand was artificially spiked to {data['value']} for {data['duration']} weeks. Describe the immediate impact."
    else:
        return "An unknown event occurred."

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
            model=_ACTIVE_MODEL,
            temperature=0.5,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error during commentary: {e}")
        return "Analyst is currently offline due to API error."


def get_final_summary(summary_data: dict) -> str:
    """
    Generates a final executive summary of the entire simulation run.
    """
    if not _ACTIVE_MODEL:
        return "Could not generate final summary (could not find an active model)."

    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    system_prompt = "You are an AI analyst summarizing a completed supply chain simulation for an executive dashboard. Provide a 2-3 sentence insightful summary of the results."
    prompt = f"The simulation is complete. Here is the final data: {str(summary_data)}. Analyze these results, focusing on the total costs and the performance of different agent types (AI vs RULE)."

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
            model=_ACTIVE_MODEL,
            temperature=0.7,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error during summary: {e}")
        return "Could not generate final summary due to an API error."