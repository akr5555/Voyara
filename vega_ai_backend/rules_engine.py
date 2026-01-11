def apply_rules(context: dict) -> dict:
    """
    Applies hard and soft constraints to the Vega context.
    This is a SAFETY and COMPLIANCE layer.
    No AI logic here.
    """

    enforced_rules = []

    # ----------------------------
    # HARD RULES (Block execution)
    # ----------------------------

    if context["remaining_budget"] <= 0:
        raise ValueError("No remaining budget available")

    if context["time_slot"] not in ["morning", "afternoon", "evening"]:
        raise ValueError("Invalid time slot")

    if context["day"] <= 0:
        raise ValueError("Invalid day number")

    # ----------------------------
    # COUNTRY PACK RULES (Soft)
    # ----------------------------

    country = context["country"].lower()

    if country == "japan":
        enforced_rules.append("Prefer public transport")
        enforced_rules.append("Avoid late-night activities")

    elif country == "france":
        enforced_rules.append("Prefer walkable activities")
        enforced_rules.append("Include cultural experiences")

    elif country == "india":
        enforced_rules.append("Avoid long travel during peak heat hours")
        enforced_rules.append("Prefer local experiences")

    # ----------------------------
    # PREFERENCE RULES (Soft)
    # ----------------------------

    if "relaxed" in context.get("preferences", []):
        enforced_rules.append("Avoid tightly packed schedules")

    if "food" in context.get("preferences", []):
        enforced_rules.append("Include food-related experiences")

    # Attach rules back to context
    context["rules"] = enforced_rules

    return context
