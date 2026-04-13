"""
IELTS Writing Evaluation System
================================
Provides detailed IELTS-authentic evaluation with proper band descriptors.

Criteria:
- Task Achievement (Task 1) / Task Response (Task 2)
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy
"""

import os
import json
import re
from typing import Dict, List, Any, Optional


class IELTSEvaluator:
    """
    Evaluates IELTS Writing responses against official band descriptors.
    """
    
    # Official IELTS Band Descriptors (Summarized)
    BAND_DESCRIPTORS = {
        "task_achievement": {
            9: "Fully satisfies all requirements of the task. Clearly presents a fully developed response.",
            8: "Covers all requirements sufficiently. Presents, highlights and illustrates key features/bullet points clearly and appropriately.",
            7: "Covers the requirements of the task. Presents a clear overview of main trends, differences or stages. Clearly presents and highlights key features/bullet points but could be more fully extended.",
            6: "Addresses the requirements of the task. Presents an overview with information appropriately selected. Presents and adequately highlights key features/bullet points but details may be irrelevant, inappropriate or inaccurate.",
            5: "Generally addresses the task; the format may be inappropriate in places. Recounts detail mechanically with no clear overview; there may be no data to support the description.",
            4: "Attempts to address the task but does not cover all key features/bullet points; the format may be inappropriate."
        },
        "coherence_cohesion": {
            9: "Uses cohesion in such a way that it attracts no attention. Skilfully manages paragraphing.",
            8: "Sequences information and ideas logically. Manages all aspects of cohesion well. Uses paragraphing sufficiently and appropriately.",
            7: "Logically organises information and ideas; there is clear progression throughout. Uses a range of cohesive devices appropriately although there may be some under-/over-use.",
            6: "Arranges information and ideas coherently and there is a clear overall progression. Uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical.",
            5: "Presents information with some organisation but there may be a lack of overall progression. Makes inadequate, inaccurate or over-use of cohesive devices.",
            4: "Presents information and ideas but these are not arranged coherently and there is no clear progression in the response."
        },
        "lexical_resource": {
            9: "Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as 'slips'.",
            8: "Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation.",
            7: "Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness of style and collocation.",
            6: "Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with some inaccuracy. Makes some errors in spelling and/or word formation, but they do not impede communication.",
            5: "Uses a limited range of vocabulary, but this is minimally adequate for the task. May make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader.",
            4: "Uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task."
        },
        "grammatical_range": {
            9: "Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as 'slips'.",
            8: "Uses a wide range of structures. The majority of sentences are error-free. Makes only very occasional errors or inappropriacies.",
            7: "Uses a variety of complex structures. Produces frequent error-free sentences. Has good control of grammar and punctuation but may make a few errors.",
            6: "Uses a mix of simple and complex sentence forms. Makes some errors in grammar and punctuation but they rarely reduce communication.",
            5: "Uses only a limited range of structures. Attempts complex sentences but these tend to be less accurate than simple sentences.",
            4: "Uses only a very limited range of structures with only rare use of subordinate clauses."
        }
    }
    
    # Keywords for analysis
    COHESIVE_DEVICES = {
        "addition": ["furthermore", "moreover", "in addition", "additionally", "also", "besides"],
        "contrast": ["however", "nevertheless", "on the other hand", "in contrast", "conversely", "whereas", "while", "although"],
        "cause_effect": ["therefore", "consequently", "as a result", "thus", "hence", "because", "since"],
        "sequence": ["firstly", "secondly", "finally", "initially", "subsequently", "then", "next"],
        "example": ["for example", "for instance", "such as", "namely", "specifically"],
        "summary": ["overall", "in conclusion", "to summarize", "in summary", "to sum up"]
    }
    
    TASK1_VOCABULARY = {
        "trends": ["increase", "decrease", "rise", "fall", "grow", "decline", "fluctuate", "remain stable", "peak", "plummet", "surge", "drop"],
        "comparisons": ["higher than", "lower than", "more than", "less than", "compared to", "in comparison", "similarly", "likewise"],
        "approximations": ["approximately", "about", "around", "roughly", "nearly", "just under", "just over"],
        "time_references": ["from", "to", "between", "during", "over the period", "throughout"]
    }
    
    async def evaluate(
        self,
        response: str,
        task_data: Dict[str, Any],
        task_type: str = "task1"
    ) -> Dict[str, Any]:
        """
        Evaluate an IELTS writing response comprehensively.
        """
        # Basic metrics
        word_count = len(response.split())
        sentence_count = len(re.split(r'[.!?]+', response))
        paragraph_count = len([p for p in response.split('\n\n') if p.strip()])
        
        # Evaluate each criterion
        task_achievement = self._evaluate_task_achievement(response, task_data, task_type)
        coherence = self._evaluate_coherence(response)
        lexical = self._evaluate_lexical(response, task_type)
        grammar = self._evaluate_grammar(response)
        
        # Calculate overall band
        scores = [
            task_achievement["score"],
            coherence["score"],
            lexical["score"],
            grammar["score"]
        ]
        overall_band = round(sum(scores) / len(scores) * 2) / 2  # Round to nearest 0.5
        
        # Identify strengths and weaknesses
        strengths = []
        weaknesses = []
        
        criteria = [
            ("Task Achievement", task_achievement),
            ("Coherence & Cohesion", coherence),
            ("Lexical Resource", lexical),
            ("Grammatical Range", grammar)
        ]
        
        for name, criterion in criteria:
            if criterion["score"] >= 7:
                strengths.append(f"{name}: {criterion['feedback']}")
            elif criterion["score"] <= 5:
                weaknesses.append(f"{name}: {criterion['feedback']}")
        
        # Generate improvement suggestions
        suggestions = self._generate_suggestions(
            task_achievement, coherence, lexical, grammar, task_type
        )
        
        # AI-enhanced feedback if available
        try:
            ai_feedback = await self._get_ai_feedback(response, task_data, overall_band)
        except:
            ai_feedback = None
        
        return {
            "overall_band": overall_band,
            "word_count": word_count,
            "task_achievement": {
                "score": task_achievement["score"],
                "band_descriptor": self.BAND_DESCRIPTORS["task_achievement"].get(int(task_achievement["score"]), ""),
                "feedback": task_achievement["feedback"],
                "details": task_achievement["details"]
            },
            "coherence_cohesion": {
                "score": coherence["score"],
                "band_descriptor": self.BAND_DESCRIPTORS["coherence_cohesion"].get(int(coherence["score"]), ""),
                "feedback": coherence["feedback"],
                "details": coherence["details"]
            },
            "lexical_resource": {
                "score": lexical["score"],
                "band_descriptor": self.BAND_DESCRIPTORS["lexical_resource"].get(int(lexical["score"]), ""),
                "feedback": lexical["feedback"],
                "details": lexical["details"]
            },
            "grammatical_range": {
                "score": grammar["score"],
                "band_descriptor": self.BAND_DESCRIPTORS["grammatical_range"].get(int(grammar["score"]), ""),
                "feedback": grammar["feedback"],
                "details": grammar["details"]
            },
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvement_suggestions": suggestions,
            "vocabulary_to_use": self._suggest_vocabulary(response, task_type),
            "grammar_corrections": grammar.get("corrections", []),
            "examiner_comment": self._generate_examiner_comment(overall_band, task_achievement, coherence),
            "ai_feedback": ai_feedback
        }
    
    def _evaluate_task_achievement(
        self, 
        response: str, 
        task_data: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """Evaluate Task Achievement criterion."""
        
        response_lower = response.lower()
        word_count = len(response.split())
        
        score = 6.0  # Base score
        details = []
        
        # Check word count
        if task_type == "task1":
            min_words = 150
        else:
            min_words = 250
        
        if word_count >= min_words:
            score += 0.5
            details.append(f"✓ Word count ({word_count}) meets requirement")
        else:
            score -= 1
            details.append(f"✗ Word count ({word_count}) below minimum ({min_words})")
        
        # Check for overview (Task 1)
        if task_type == "task1":
            overview_indicators = ["overall", "in general", "broadly speaking", "main trend", "key feature"]
            has_overview = any(ind in response_lower for ind in overview_indicators)
            
            if has_overview:
                score += 0.5
                details.append("✓ Contains overview/summary of main trends")
            else:
                score -= 0.5
                details.append("✗ Missing clear overview of main trends")
        
        # Check for specific data (Task 1)
        if task_type == "task1":
            numbers = re.findall(r'\d+(?:\.\d+)?%?', response)
            if len(numbers) >= 4:
                score += 0.5
                details.append(f"✓ Good use of specific data ({len(numbers)} data points)")
            elif len(numbers) >= 2:
                details.append(f"○ Some data included ({len(numbers)} data points)")
            else:
                score -= 0.5
                details.append("✗ Insufficient specific data/figures")
        
        # Check for comparisons
        comparison_words = ["compared", "while", "whereas", "however", "in contrast", "similarly", "higher", "lower", "more", "less"]
        comparisons = sum(1 for word in comparison_words if word in response_lower)
        
        if comparisons >= 3:
            score += 0.5
            details.append("✓ Good use of comparisons")
        elif comparisons >= 1:
            details.append("○ Some comparisons made")
        else:
            details.append("✗ Few or no comparisons")
        
        # Cap score
        score = max(4, min(9, score))
        
        feedback = self._get_ta_feedback(score)
        
        return {
            "score": score,
            "feedback": feedback,
            "details": details
        }
    
    def _evaluate_coherence(self, response: str) -> Dict[str, Any]:
        """Evaluate Coherence and Cohesion criterion."""
        
        response_lower = response.lower()
        score = 6.0
        details = []
        
        # Check paragraphing
        paragraphs = [p for p in response.split('\n\n') if p.strip()]
        if len(paragraphs) >= 3:
            score += 0.5
            details.append(f"✓ Good paragraphing ({len(paragraphs)} paragraphs)")
        elif len(paragraphs) == 2:
            details.append(f"○ Adequate paragraphing ({len(paragraphs)} paragraphs)")
        else:
            score -= 0.5
            details.append("✗ Poor paragraphing - consider using more paragraphs")
        
        # Check cohesive devices
        total_devices = 0
        devices_used = []
        
        for category, words in self.COHESIVE_DEVICES.items():
            for word in words:
                count = response_lower.count(word)
                if count > 0:
                    total_devices += count
                    devices_used.append(word)
        
        unique_devices = len(set(devices_used))
        
        if unique_devices >= 6:
            score += 1
            details.append(f"✓ Excellent range of cohesive devices ({unique_devices} different types)")
        elif unique_devices >= 4:
            score += 0.5
            details.append(f"✓ Good range of cohesive devices ({unique_devices} types)")
        elif unique_devices >= 2:
            details.append(f"○ Some cohesive devices used ({unique_devices} types)")
        else:
            score -= 0.5
            details.append("✗ Limited use of cohesive devices")
        
        # Check for logical progression
        sequence_markers = ["firstly", "secondly", "finally", "first", "second", "third", "initially", "subsequently", "then"]
        has_sequence = any(marker in response_lower for marker in sequence_markers)
        
        if has_sequence:
            score += 0.5
            details.append("✓ Good logical sequencing")
        
        score = max(4, min(9, score))
        feedback = self._get_cc_feedback(score, unique_devices)
        
        return {
            "score": score,
            "feedback": feedback,
            "details": details,
            "devices_found": devices_used[:10]
        }
    
    def _evaluate_lexical(self, response: str, task_type: str) -> Dict[str, Any]:
        """Evaluate Lexical Resource criterion."""
        
        words = response.lower().split()
        unique_words = set(words)
        
        score = 6.0
        details = []
        
        # Type-token ratio (vocabulary diversity)
        ttr = len(unique_words) / len(words) if words else 0
        
        if ttr >= 0.6:
            score += 1
            details.append(f"✓ Excellent vocabulary diversity (TTR: {ttr:.2f})")
        elif ttr >= 0.5:
            score += 0.5
            details.append(f"✓ Good vocabulary diversity (TTR: {ttr:.2f})")
        elif ttr >= 0.4:
            details.append(f"○ Adequate vocabulary (TTR: {ttr:.2f})")
        else:
            score -= 0.5
            details.append(f"✗ Limited vocabulary range (TTR: {ttr:.2f})")
        
        # Check for task-specific vocabulary (Task 1)
        if task_type == "task1":
            task_vocab_found = []
            for category, words_list in self.TASK1_VOCABULARY.items():
                for word in words_list:
                    if word in response.lower():
                        task_vocab_found.append(word)
            
            if len(task_vocab_found) >= 8:
                score += 1
                details.append(f"✓ Excellent use of task-specific vocabulary")
            elif len(task_vocab_found) >= 5:
                score += 0.5
                details.append(f"✓ Good use of task vocabulary ({len(task_vocab_found)} relevant terms)")
            elif len(task_vocab_found) >= 2:
                details.append(f"○ Some task vocabulary ({len(task_vocab_found)} terms)")
            else:
                score -= 0.5
                details.append("✗ Limited task-specific vocabulary")
        
        # Check for sophisticated vocabulary
        sophisticated_words = [
            "significant", "considerable", "dramatic", "substantial", "marginal",
            "predominant", "fluctuate", "plateau", "surge", "plummet",
            "comprise", "constitute", "account for", "represent"
        ]
        sophisticated_count = sum(1 for word in sophisticated_words if word in response.lower())
        
        if sophisticated_count >= 4:
            score += 0.5
            details.append("✓ Good use of sophisticated vocabulary")
        
        # Check for repetition
        word_freq = {}
        for word in words:
            if len(word) > 4:  # Only check longer words
                word_freq[word] = word_freq.get(word, 0) + 1
        
        repeated_words = [w for w, count in word_freq.items() if count >= 4]
        if repeated_words:
            score -= 0.5
            details.append(f"✗ Some word repetition: {', '.join(repeated_words[:3])}")
        
        score = max(4, min(9, score))
        feedback = self._get_lr_feedback(score)
        
        return {
            "score": score,
            "feedback": feedback,
            "details": details
        }
    
    def _evaluate_grammar(self, response: str) -> Dict[str, Any]:
        """Evaluate Grammatical Range and Accuracy criterion."""
        
        sentences = re.split(r'[.!?]+', response)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        score = 6.0
        details = []
        corrections = []
        
        # Check sentence variety
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        # Check for complex sentences
        complex_markers = ["which", "that", "who", "whom", "whose", "where", "when", "while", "although", "because", "since", "if", "unless"]
        complex_count = sum(1 for s in sentences if any(m in s.lower() for m in complex_markers))
        complex_ratio = complex_count / len(sentences) if sentences else 0
        
        if complex_ratio >= 0.5:
            score += 1
            details.append(f"✓ Excellent variety of sentence structures ({complex_count} complex sentences)")
        elif complex_ratio >= 0.3:
            score += 0.5
            details.append(f"✓ Good mix of sentence types ({complex_count} complex sentences)")
        elif complex_ratio >= 0.15:
            details.append(f"○ Some complex sentences ({complex_count})")
        else:
            score -= 0.5
            details.append("✗ Limited sentence variety - use more complex structures")
        
        # Check for passive voice (appropriate for Task 1)
        passive_patterns = [" is ", " are ", " was ", " were ", " been ", " being "]
        passive_count = sum(1 for p in passive_patterns if p in response.lower())
        
        if passive_count >= 2:
            details.append("✓ Appropriate use of passive voice")
        
        # Simple grammar error detection
        common_errors = [
            (r'\b(a)\s+[aeiou]', "Article error: 'a' before vowel"),
            (r'\b(an)\s+[^aeiou\s]', "Article error: 'an' before consonant"),
            (r'\b(have|has)\s+\w+ed\b', ""),  # Possible verb form check
            (r'\s{2,}', "Double spacing detected"),
        ]
        
        error_count = 0
        for pattern, message in common_errors:
            matches = re.findall(pattern, response.lower())
            if matches and message:
                error_count += len(matches)
                corrections.append(message)
        
        if error_count == 0:
            score += 0.5
            details.append("✓ No obvious grammatical errors detected")
        elif error_count <= 2:
            details.append("○ Minor errors that don't impede communication")
        else:
            score -= 0.5
            details.append(f"✗ Several grammatical issues detected ({error_count})")
        
        score = max(4, min(9, score))
        feedback = self._get_gr_feedback(score, complex_ratio)
        
        return {
            "score": score,
            "feedback": feedback,
            "details": details,
            "corrections": corrections,
            "sentence_stats": {
                "count": len(sentences),
                "avg_length": round(avg_sentence_length, 1),
                "complex_ratio": round(complex_ratio, 2)
            }
        }
    
    def _get_ta_feedback(self, score: float) -> str:
        """Get Task Achievement feedback."""
        if score >= 8:
            return "Excellent task achievement - all requirements fully addressed with relevant details"
        elif score >= 7:
            return "Good task coverage - main features presented clearly with appropriate selection"
        elif score >= 6:
            return "Adequate response - key features covered but could include more specific detail"
        elif score >= 5:
            return "Task partially addressed - more focus on key features and data needed"
        else:
            return "Task not adequately addressed - review requirements and include relevant information"
    
    def _get_cc_feedback(self, score: float, device_count: int) -> str:
        """Get Coherence & Cohesion feedback."""
        if score >= 8:
            return "Excellent organization with sophisticated use of cohesive devices"
        elif score >= 7:
            return "Well-organized with good use of linking words and clear progression"
        elif score >= 6:
            return "Adequately organized - consider varying your cohesive devices more"
        elif score >= 5:
            return "Some organization issues - work on paragraph structure and linking"
        else:
            return "Needs better organization - use more cohesive devices and clear paragraphing"
    
    def _get_lr_feedback(self, score: float) -> str:
        """Get Lexical Resource feedback."""
        if score >= 8:
            return "Excellent vocabulary range with natural and sophisticated word choices"
        elif score >= 7:
            return "Good vocabulary with appropriate use of less common words"
        elif score >= 6:
            return "Adequate vocabulary - try to use more varied and precise expressions"
        elif score >= 5:
            return "Limited vocabulary range - expand your academic word knowledge"
        else:
            return "Basic vocabulary - significant improvement needed"
    
    def _get_gr_feedback(self, score: float, complex_ratio: float) -> str:
        """Get Grammatical Range feedback."""
        if score >= 8:
            return "Excellent grammar with wide range of accurate complex structures"
        elif score >= 7:
            return "Good grammatical control with variety of sentence types"
        elif score >= 6:
            return "Adequate grammar - increase use of complex sentences"
        elif score >= 5:
            return "Some grammatical errors - focus on accuracy in complex structures"
        else:
            return "Limited grammatical range - practice more complex sentence patterns"
    
    def _generate_suggestions(
        self,
        ta: Dict, cc: Dict, lr: Dict, gr: Dict,
        task_type: str
    ) -> List[str]:
        """Generate specific improvement suggestions."""
        suggestions = []
        
        # Task Achievement suggestions
        if ta["score"] < 7:
            if task_type == "task1":
                suggestions.append("Include a clear overview paragraph summarizing the main trends")
                suggestions.append("Use more specific data from the visual to support your points")
            suggestions.append("Make more comparisons between different categories/time periods")
        
        # Coherence suggestions
        if cc["score"] < 7:
            suggestions.append("Use a wider variety of cohesive devices (however, furthermore, in contrast)")
            suggestions.append("Organize your response into clear paragraphs: intro, overview, body details")
        
        # Lexical suggestions
        if lr["score"] < 7:
            suggestions.append("Use more precise vocabulary for describing changes (surge, plummet, fluctuate)")
            suggestions.append("Avoid repeating the same words - use synonyms and paraphrasing")
        
        # Grammar suggestions
        if gr["score"] < 7:
            suggestions.append("Include more complex sentence structures (relative clauses, conditionals)")
            suggestions.append("Vary your sentence lengths and types for better range")
        
        return suggestions[:5]  # Limit to top 5
    
    def _suggest_vocabulary(self, response: str, task_type: str) -> List[str]:
        """Suggest vocabulary improvements."""
        suggestions = []
        response_lower = response.lower()
        
        # Common replacements
        replacements = {
            "went up": ["increased", "rose", "grew", "climbed"],
            "went down": ["decreased", "fell", "declined", "dropped"],
            "a lot": ["significantly", "considerably", "substantially"],
            "big": ["significant", "substantial", "considerable"],
            "small": ["minor", "slight", "marginal"],
            "shows": ["illustrates", "demonstrates", "indicates", "reveals"]
        }
        
        for common, better in replacements.items():
            if common in response_lower:
                suggestions.append(f"Replace '{common}' with: {', '.join(better)}")
        
        return suggestions[:5]
    
    def _generate_examiner_comment(
        self,
        overall_band: float,
        ta: Dict,
        cc: Dict
    ) -> str:
        """Generate an examiner-style comment."""
        
        if overall_band >= 8:
            return f"This is an excellent response demonstrating sophisticated language use and full task achievement. Band {overall_band}"
        elif overall_band >= 7:
            return f"A well-developed response with good organization and vocabulary. Some minor improvements could be made. Band {overall_band}"
        elif overall_band >= 6:
            return f"An adequate response that addresses the task requirements. To improve, focus on including more specific details and varying your language. Band {overall_band}"
        elif overall_band >= 5:
            return f"The response partially addresses the task but needs more development. Work on organization and vocabulary range. Band {overall_band}"
        else:
            return f"This response needs significant improvement in task achievement, organization, and language use. Band {overall_band}"
    
    async def _get_ai_feedback(
        self,
        response: str,
        task_data: Dict[str, Any],
        band: float
    ) -> Optional[str]:
        """Get additional AI-powered feedback."""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            llm = LlmChat(
                api_key=os.environ.get("EMERGENT_LLM_KEY"),
                model="gpt-4o"
            )
            
            prompt = f"""As an IELTS examiner, provide 2-3 specific, actionable tips to improve this Band {band} response.

RESPONSE:
{response[:500]}...

Focus on the most impactful improvements. Be concise and specific."""
            
            result = await llm.chat([UserMessage(content=prompt)])
            return result.strip()
        except:
            return None


# Create singleton instance
ielts_evaluator = IELTSEvaluator()
