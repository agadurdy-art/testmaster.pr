"""
IELTS Writing Task 2 - Authentic Essay Generator & Model Answers
================================================================
Generates IELTS-authentic essay prompts with multi-band model answers.

ULTRA MASTER PROMPT RULES:
- Every prompt must be academically relevant
- Model answers at Band 6 and Band 8.5 levels
- Academic reasoning notes for learning
- Template-free, natural academic writing
"""

import random
from typing import Dict, List, Any, Optional
from datetime import datetime
from content.writing_task2_prompts import (
    ESSAY_PROMPTS,
    MODEL_ANSWERS,
    LETTER_PROMPTS,
    LETTER_MODEL_ANSWERS,
)


class WritingTask2Generator:
    """
    Generates IELTS Writing Task 2 essay prompts with model answers.
    
    Essay Types:
    1. Opinion (Agree/Disagree)
    2. Discussion (Discuss both views)
    3. Advantage/Disadvantage
    4. Problem/Solution
    5. Two-part question
    """
    
    # Prompt/model-answer DATA lives in content/writing_task2_prompts.py
    # (Faz 1 refactor, 2026-07-02). Bound as class attributes so existing
    # references (cls.ESSAY_PROMPTS, WritingTask2Generator.ESSAY_PROMPTS, ...) keep working.
    ESSAY_PROMPTS = ESSAY_PROMPTS
    MODEL_ANSWERS = MODEL_ANSWERS
    LETTER_PROMPTS = LETTER_PROMPTS
    LETTER_MODEL_ANSWERS = LETTER_MODEL_ANSWERS

    
    @classmethod
    def get_essay_prompts(cls, essay_type: str = None, band_level: str = None) -> List[Dict]:
        """Get essay prompts, optionally filtered by type."""
        prompts = []
        prompt_id = 1
        
        types_to_include = [essay_type] if essay_type and essay_type != 'all' else cls.ESSAY_PROMPTS.keys()
        
        for etype in types_to_include:
            if etype in cls.ESSAY_PROMPTS:
                for prompt in cls.ESSAY_PROMPTS[etype]:
                    prompts.append({
                        "id": prompt_id,
                        "type": etype,
                        "prompt": prompt["prompt"],
                        "topic": prompt["topic"],
                        "key_points": prompt.get("key_points", []),
                        "useful_vocabulary": prompt.get("useful_vocabulary", []),
                        "band_level": band_level or "5.5-6.5"
                    })
                    prompt_id += 1
        
        return prompts
    
    @classmethod
    def get_letter_prompts(cls, letter_type: str = None) -> List[Dict]:
        """Get letter prompts for General Training Task 1."""
        prompts = []
        prompt_id = 1
        
        types_to_include = [letter_type] if letter_type and letter_type != 'all' else cls.LETTER_PROMPTS.keys()
        
        for ltype in types_to_include:
            if ltype in cls.LETTER_PROMPTS:
                for prompt in cls.LETTER_PROMPTS[ltype]:
                    prompts.append({
                        "id": prompt_id,
                        "type": ltype,
                        "prompt": prompt["prompt"],
                        "topic": prompt["topic"],
                        "letter_type": prompt["letter_type"],
                        "addressee": prompt["addressee"],
                        "closing": prompt["closing"],
                        "key_points": prompt.get("key_points", [])
                    })
                    prompt_id += 1
        
        return prompts
    
    @classmethod
    def get_model_answer(cls, prompt_type: str, topic: str, band_level: float) -> Dict:
        """Get model answer for a specific prompt type and band level."""
        band_key = "band6" if band_level < 7.0 else "band85"
        key = f"{prompt_type}_{topic}_{band_key}"
        
        if key in cls.MODEL_ANSWERS:
            return cls.MODEL_ANSWERS[key]
        
        # Try to find a generic match
        for model_key, model in cls.MODEL_ANSWERS.items():
            if prompt_type in model_key and band_key in model_key:
                return model
        
        return None
    
    @classmethod
    def get_letter_model_answer(cls, letter_type: str, topic: str, band_level: float) -> Dict:
        """Get model answer for a letter prompt."""
        band_key = "band6" if band_level < 7.0 else "band85"
        key = f"{letter_type}_{topic}_{band_key}"
        
        if key in cls.LETTER_MODEL_ANSWERS:
            return cls.LETTER_MODEL_ANSWERS[key]
        
        # Try to find a generic match
        for model_key, model in cls.LETTER_MODEL_ANSWERS.items():
            if letter_type in model_key and band_key in model_key:
                return model
        
        return None


# Create singleton instance
writing_task2_generator = WritingTask2Generator()
