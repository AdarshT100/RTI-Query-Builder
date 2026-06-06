def run_stage_one(complaint: str) -> dict:
    return {"questions": [], "language_note": None}

def run_stage_two(complaint: str, answers: dict) -> dict:
    return {"addressee": "[Applicant Authority]", "subject": "", "requests": [], "authority_confidence": "unknown", "scope_note": None}
