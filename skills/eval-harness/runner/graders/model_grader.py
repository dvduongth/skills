"""Model-based grader: uses LLM to score outputs against rubrics."""
import json
import os
from pathlib import Path


class ModelGrader:
    """Runs model-based graders: llm_rubric, coverage_check, groundedness, hallucination_check."""

    def __init__(self, model: str = "claude-sonnet-4-6"):
        self.model = model
        self._client = None

    def _get_client(self):
        if self._client is None:
            import anthropic
            self._client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        return self._client

    def grade(self, grader_config: dict, trial_context: dict) -> dict:
        grader_type = grader_config["type"]
        transcript = trial_context.get("transcript", "")

        if grader_type == "llm_rubric":
            return self._run_rubric(grader_config, transcript)
        elif grader_type == "coverage_check":
            return self._run_coverage(grader_config, transcript)
        elif grader_type == "groundedness":
            return self._run_groundedness(transcript)
        elif grader_type == "hallucination_check":
            return self._run_hallucination(transcript)
        elif grader_type == "screenshot_verify":
            return self._run_screenshot(grader_config, trial_context)
        elif grader_type == "final_output":
            return self._run_rubric(grader_config, transcript)
        else:
            return {"score": 0.0, "passed": False, "details": {"error": f"Unknown model grader: {grader_type}"}}

    def _call_grader_llm(self, prompt: str) -> dict:
        """Call LLM and parse JSON response with score."""
        client = self._get_client()
        try:
            response = client.messages.create(
                model=self.model,
                max_tokens=512,
                messages=[{"role": "user", "content": prompt}]
            )
            text = response.content[0].text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            data = json.loads(text)
            score = float(data.get("score", 0.0))
            return {"score": min(1.0, max(0.0, score)), "passed": score >= 0.5,
                    "details": {"reasoning": data.get("reasoning", ""), "raw": text}}
        except Exception as e:
            return {"score": 0.0, "passed": False, "details": {"error": str(e)}}

    def _run_rubric(self, config: dict, transcript: str) -> dict:
        rubric_path = config.get("rubric", "")
        rubric_text = ""
        if rubric_path and Path(rubric_path).exists():
            rubric_text = Path(rubric_path).read_text()

        prompt = f"""You are an eval grader. Score the following agent output against the rubric.

RUBRIC:
{rubric_text or "Score overall quality from 0.0 to 1.0."}

AGENT OUTPUT:
{transcript[-3000:]}

Return ONLY valid JSON: {{"score": 0.0-1.0, "reasoning": "brief explanation"}}"""
        return self._call_grader_llm(prompt)

    def _run_coverage(self, config: dict, transcript: str) -> dict:
        topics = config.get("required_topics", [])
        prompt = f"""Check if the following output covers all required topics.

Required topics: {json.dumps(topics)}

Output to check:
{transcript[-3000:]}

For each topic, determine if it's covered. Score = (covered topics) / (total topics).
Return ONLY valid JSON: {{"score": 0.0-1.0, "reasoning": "which topics covered/missing"}}"""
        return self._call_grader_llm(prompt)

    def _run_groundedness(self, transcript: str) -> dict:
        prompt = f"""Check if every factual claim in this output has a cited source URL.

Output to check:
{transcript[-3000:]}

Score 1.0 if all claims are grounded, 0.0 if many ungrounded claims exist.
Return ONLY valid JSON: {{"score": 0.0-1.0, "reasoning": "list any ungrounded claims"}}"""
        return self._call_grader_llm(prompt)

    def _run_hallucination(self, transcript: str) -> dict:
        prompt = f"""Check this output for hallucinations — invented facts, false information, or made-up sources.

Output to check:
{transcript[-3000:]}

Score 1.0 if no hallucinations found, lower if hallucinations detected.
Return ONLY valid JSON: {{"score": 0.0-1.0, "reasoning": "list any hallucinations found"}}"""
        return self._call_grader_llm(prompt)

    def _run_screenshot(self, config: dict, ctx: dict) -> dict:
        description = config.get("description", "")
        screenshot_b64 = ctx.get("screenshot_b64", "")
        if not screenshot_b64:
            return {"score": 0.0, "passed": False, "details": {"error": "No screenshot in trial context"}}

        client = self._get_client()
        try:
            response = client.messages.create(
                model=self.model,
                max_tokens=256,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": screenshot_b64}},
                        {"type": "text", "text": f'Does this screenshot show: "{description}"?\nReturn ONLY JSON: {{"score": 0.0-1.0, "reasoning": "..."}}'}
                    ]
                }]
            )
            text = response.content[0].text.strip()
            data = json.loads(text)
            score = float(data.get("score", 0.0))
            return {"score": score, "passed": score >= 0.5, "details": data}
        except Exception as e:
            return {"score": 0.0, "passed": False, "details": {"error": str(e)}}
