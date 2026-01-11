from schemas import VegaRequest


def build_context(request: VegaRequest) -> dict:
    """
    Builds a deterministic, read-only context for Vega.
    No AI logic. No assumptions. No mutations.
    """

    context = {
        "trip_id": request.trip_id,
        "city": request.city,
        "country": request.country,
        "day": request.day,
        "time_slot": request.time_slot.lower(),
        "total_budget": request.total_budget,
        "remaining_budget": request.remaining_budget,
        "preferences": request.preferences or []
    }

    return context

if __name__ == "__main__":
    from schemas import VegaRequest

    test = VegaRequest(
        trip_id="t1",
        city="Paris",
        country="France",
        day=3,
        time_slot="Afternoon",
        total_budget=15000,
        remaining_budget=3500,
        preferences=["food", "walking"]
    )

    print(build_context(test))
