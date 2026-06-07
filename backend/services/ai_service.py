import json
import os
from pathlib import Path

_PROMPTS_DIR = Path(__file__).parent.parent/"prompts"

_SYSTEM_PROMPT = (_PROMPTS_DIR/"system_prompt.txt").read_text(encoding="utf-8")

def _call_anthropic(system_prompt: str, user_prompt: str) ->str:
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY environment variable not set")
    
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model = "claude-opus-4-5",
        max_tokens = 2048,
        system = system_prompt,
        messages = [{ "role": "user", "content": user_prompt }],
    )

    for block in message.content:
        if block.type == "text":
            return block.text
        
    raise RuntimeError("Anthropic response contains no  text blocks")

def _call_gemini(system_prompt:str, user_prompt: str) -> str:
    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable not set")
    
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model ="gemini-2.5-flash",
        contents = user_prompt,
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=2048,
        ),
    )
    return response.text


def _call_model(system_prompt: str, user_prompt:str) -> str:
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
    if provider == "anthropic":
        return _call_anthropic(system_prompt, user_prompt)
    elif provider == "gemini":
        return _call_gemini(system_prompt, user_prompt)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider} , Valid options are 'anthropic' and 'gemini' ")
    
def assemble_resolved_context(answers:dict) ->str:
    if not answers:
        return (
            "None required. The complaint contained sufficient context to proceed directly to RTI generation"
        )
    lines = []
    for defect_type, answer in answers.items():
        lines.append(f"{defect_type}: {answer}")
    return "\n".join(lines)
    
_STAGE_1_PROMPT_TEMPLATE = """\
STAGE 1 - DEFECT DETECTION AND CLARIFYING QUESTIONS

Complaint:
\"\"\"
{complaint}
\"\"\"
Instructions:
1. Analyse the complaint against the seven defect types defined \
in your instructions.
2. Identify every defect type present in the complaint.
3. For each defect where information is genuinely missing — that \
is, where the complaint does not already contain enough context \
to resolve the defect — generate one clarifying question.
4. Do not generate a question for a defect that the complaint \
already resolves. If the complaint names a department, do not \
ask for the department. If the complaint contains a date range, \
do not ask for a date range.
5. If the complaint contains no identifiable subject matter, event, \
or implied government service — such that clarifying questions \
cannot reasonably produce a usable RTI — return this exact JSON \
and nothing else:
   {{"insufficient_context": true, "prompt": "Your complaint doesn\u2019t \
contain enough detail for us to generate an RTI application. \
Could you describe the specific issue \u2014 for example, which \
service failed, what happened, and roughly when?"}}
6. If the complaint is a non_rti_able_matter, return this exact JSON \
and nothing else:
   {{"non_rti_able": true, "reason": "[one sentence explanation]", \
"alternative": "[one mechanism from the permitted list only]"}}
7. For the alternative field in non_rti_able responses, use only \
one of these permitted mechanisms:
   - "National Consumer Disputes Redressal Commission (NCDRC) or State Consumer Forum for consumer complaints"
   - "Centralized Public Grievance Redress and Monitoring System (CPGRAMS) at pgportal.gov.in for general government grievances"
   - "Civil court or High Court for legal disputes and rights enforcement"
   - "State Human Rights Commission for human rights violations"
   - "Banking Ombudsman (RBI) for banking complaints"
   - "Insurance Ombudsman (IRDAI) for insurance complaints"
   - "Labour Commissioner or Industrial Tribunal for employment disputes"
   If no mechanism clearly applies, use CPGRAMS as the default.
8. If the complaint is valid and questions are needed, return a JSON \
object with a questions array using the Stage 1 schema in your \
instructions. Set language_note to a plain English string if the \
complaint was in a non-English language, otherwise null.
9. If the complaint is valid and no clarifying questions are needed \
because all defects are already resolved, return:
   {{"questions": [], "language_note": null}}
10. Return raw JSON only. No preamble, no explanation, \
no markdown fences.
"""

_STAGE_2_PROMPT_TEMPLATE = """\
STAGE 2 — RTI APPLICATION GENERATION
 
Original complaint:
\"\"\"
{complaint}
\"\"\"
 
Resolved context from clarification:
{resolved_context}
 
Instructions:
1. Using the original complaint and all resolved context above, \
generate a complete RTI application following the transformation \
rules in your instructions.
2. Apply all transformation rules without exception — extract and \
convert emotional language, use document vocabulary, apply the \
tripartite formula to every request line, add file notings where \
a decision or rejection is present.
3. Identify the most appropriate public authority based on all \
available context. Set authority_confidence to "identified", \
"uncertain", or "unknown" based on how clearly the authority \
is determinable from the complaint and resolved context.
4. If the complaint contained multiple unrelated grievances, scope \
the RTI to the single most actionable grievance and populate \
scope_note with a plain-language explanation of what was scoped \
out and why. If the complaint is single-issue, set scope_note \
to null.
5. Populate detected_defects with the list of defect type enum \
values identified in the original complaint, regardless of \
whether they were resolved through clarification.
6. Use placeholder tokens [Applicant Name], [Applicant Address], \
[Applicant Contact] for all personal fields. Never invent \
personal details.
7. Return raw JSON only matching the Stage 2 schema in your \
instructions. No preamble, no explanation, no markdown fences.
"""

def run_stage_one(complaint:str) -> dict:
    user_prompt = _STAGE_1_PROMPT_TEMPLATE.format(complaint=complaint)
    raw = _call_model(_SYSTEM_PROMPT, user_prompt)

    cleaned = _strip_json_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecoderError as e:
        raise ValueError(
            f"Stage 1 response was not valid JSON."
            F"Parse error: {e}. Raw response: {raw!r}"
        )
    
def run_stage_two(complaint: str, answers: dict)-> dict:
    resolved_context = assemble_resolved_context(answers)
    user_prompt = _STAGE_2_PROMPT_TEMPLATE.format(
        complaint=complaint,
        resolved_context=resolved_context,
    )
    raw = _call_model(_SYSTEM_PROMPT, user_prompt)

    cleaned = _strip_json_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecoderError as e:
        raise ValueError(
            f"Stage 2 response was not valid JSON."
            f"Parse error: {e}. Raw response: {raw!r}"
        )
    
def _strip_json_fences(text:str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        first_newline = stripped.find("\n")
        if first_newline != -1:
            stripped = stripped[first_newline+1:]
        
        if stripped.endswith("```"):
            stripped = stripped[:-3].rstrip()
    return stripped.strip()
    
