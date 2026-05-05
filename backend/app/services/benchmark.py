"""
EvalForge - Multi-Model Benchmark Service
Benchmarks multiple LLMs and compares performance metrics.
"""

import time
from typing import Dict, List, Optional, Any
from datetime import datetime

from app.core.config import settings
from app.core.embeddings import embedding_service
from app.models.schemas import (
    BenchmarkRequest, BenchmarkResponse, BenchmarkModelResult,
    BatchBenchmarkRequest, BatchBenchmarkResponse,
)


class BenchmarkService:
    COST_PER_1K = {
        "gemini": 0.00025, "gemini-1.5-flash": 0.000075,
        "gemini-1.5-pro": 0.00125, "openai": 0.002,
        "gpt-4o-mini": 0.00015, "gpt-4o": 0.005, "gpt-3.5-turbo": 0.0005,
    }

    async def benchmark_single(self, request: BenchmarkRequest) -> BenchmarkResponse:
        results = []
        for model_name in request.models:
            result = await self._run_model(model_name, request.prompt, request.context)
            if request.expected_output and result.output and not result.error:
                result.semantic_similarity = embedding_service.semantic_similarity(
                    request.expected_output, result.output
                )
            results.append(result)

        valid = [r for r in results if not r.error]
        best_model = "N/A"
        if valid:
            best_model = (max(valid, key=lambda r: r.semantic_similarity or 0).model_name
                          if request.expected_output else
                          min(valid, key=lambda r: r.latency_ms).model_name)

        return BenchmarkResponse(
            prompt=request.prompt[:100], results=results,
            best_model=best_model, summary=self._build_summary(results),
            timestamp=datetime.utcnow().isoformat(),
        )

    async def benchmark_batch(self, request: BatchBenchmarkRequest) -> BatchBenchmarkResponse:
        all_results = {m: [] for m in request.models}
        for sample in request.samples:
            sample.models = request.models
            response = await self.benchmark_single(sample)
            for result in response.results:
                if result.model_name in all_results:
                    all_results[result.model_name].append(result)

        model_summaries = {}
        for model, results in all_results.items():
            valid = [r for r in results if not r.error]
            model_summaries[model] = {
                "total_runs": len(results), "successful_runs": len(valid),
                "avg_latency_ms": round(sum(r.latency_ms for r in valid) / len(valid), 2) if valid else 0,
                "avg_similarity": round(sum(r.semantic_similarity or 0 for r in valid) / len(valid), 4) if valid else 0,
            }

        best_model = max(model_summaries.items(), key=lambda x: x[1]["avg_similarity"])[0] if model_summaries else "N/A"
        return BatchBenchmarkResponse(
            total_samples=len(request.samples), models_compared=request.models,
            model_summaries=model_summaries, best_overall_model=best_model,
            timestamp=datetime.utcnow().isoformat(),
        )

    async def _run_model(self, model_name: str, prompt: str, context: Optional[str] = None) -> BenchmarkModelResult:
        full_prompt = f"Context: {context}\n\nQuestion: {prompt}\n\nAnswer:" if context else prompt
        start_time = time.time()
        try:
            if "gemini" in model_name or model_name == "gemini":
                output, token_count = await self._call_gemini(full_prompt)
            elif "gpt" in model_name or model_name == "openai":
                output, token_count = await self._call_openai(full_prompt, model_name)
            else:
                return BenchmarkModelResult(model_name=model_name, output="", latency_ms=0, error=f"Unknown model: {model_name}")
            latency_ms = (time.time() - start_time) * 1000
            cost_key = model_name if model_name in self.COST_PER_1K else ("gemini" if "gemini" in model_name else "openai")
            cost = (token_count / 1000) * self.COST_PER_1K.get(cost_key, 0.001)
            return BenchmarkModelResult(model_name=model_name, output=output, latency_ms=round(latency_ms, 2), token_count=token_count, cost_estimate=round(cost, 6))
        except Exception as e:
            return BenchmarkModelResult(model_name=model_name, output="", latency_ms=round((time.time() - start_time) * 1000, 2), error=str(e))

    async def _call_gemini(self, prompt: str) -> tuple:
        import google.generativeai as genai
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not configured")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        output = response.text
        return output, int(len(output.split()) * 1.3)

    async def _call_openai(self, prompt: str, model_name: str = "gpt-3.5-turbo") -> tuple:
        from openai import OpenAI
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")
        actual_model = model_name if model_name != "openai" else "gpt-3.5-turbo"
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(model=actual_model, messages=[{"role": "user", "content": prompt}], max_tokens=1024)
        output = response.choices[0].message.content
        token_count = response.usage.total_tokens if response.usage else len(output.split())
        return output, token_count

    def _build_summary(self, results: List[BenchmarkModelResult]) -> Dict[str, Any]:
        valid = [r for r in results if not r.error]
        if not valid:
            return {"error": "No successful model runs"}
        return {
            "total_models": len(results), "successful_models": len(valid),
            "fastest": {"model": min(valid, key=lambda r: r.latency_ms).model_name, "latency_ms": min(r.latency_ms for r in valid)},
            "most_accurate": {"model": max(valid, key=lambda r: r.semantic_similarity or 0).model_name, "similarity": max(r.semantic_similarity or 0 for r in valid)} if any(r.semantic_similarity for r in valid) else None,
        }

benchmark_service = BenchmarkService()
