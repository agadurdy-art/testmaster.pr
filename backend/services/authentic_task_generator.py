"""
IELTS Writing Task 1 - Authentic Task Generator
================================================
Generates IELTS-authentic task descriptions following the ULTRA MASTER PROMPT.

CORE RULE: Every task MUST include:
- A specific location (city, country, institution, region)
- A clear subject/system/activity
- A defined time period
- A realistic academic or social context

If a task cannot be imagined as coming from a real IELTS exam paper, it is INVALID.
"""

import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime


class AuthenticTaskGenerator:
    """
    Generates IELTS-authentic task descriptions and datasets.
    
    AUTHENTICITY RULES (NON-NEGOTIABLE):
    1. Every task has specific location, subject, time period
    2. Data must force analysis (trends, comparisons, exceptions)
    3. Band-based complexity calibration
    4. No generic or template-like descriptions
    """
    
    # ============ AUTHENTIC LOCATIONS ============
    LOCATIONS = {
        "cities": [
            "Melbourne, Australia", "Sydney, Australia", "Auckland, New Zealand",
            "London, UK", "Manchester, UK", "Edinburgh, Scotland",
            "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada",
            "New York, USA", "Los Angeles, USA", "Chicago, USA",
            "Singapore", "Hong Kong", "Tokyo, Japan",
            "Berlin, Germany", "Paris, France", "Amsterdam, Netherlands",
            "Dubai, UAE", "Mumbai, India", "Seoul, South Korea"
        ],
        "countries": [
            "the United Kingdom", "the United States", "Canada", "Australia", 
            "New Zealand", "Germany", "France", "Japan", "South Korea",
            "China", "India", "Brazil", "Singapore", "Netherlands", "Sweden"
        ],
        "regions": [
            "Western Europe", "Southeast Asia", "North America", "Oceania",
            "the European Union", "the Asia-Pacific region", "the Middle East"
        ],
        "institutions": [
            "a social centre in Melbourne", "a community college in London",
            "a public library in Toronto", "a sports facility in Sydney",
            "a cultural centre in Singapore", "a community hall in Auckland",
            "a recreation centre in Vancouver", "a youth centre in Manchester"
        ]
    }
    
    # ============ LINE GRAPH AUTHENTIC TEMPLATES ============
    LINE_GRAPH_TEMPLATES = {
        "participation": [
            {
                "template": "The graph below gives information on the numbers of participants for different activities at {location} for the period {start_year} to {end_year}.",
                "subject_type": "activities",
                "location_type": "institutions",
                "data_type": "participants",
                "unit": "number of participants",
                "categories": [
                    ["Film club", "Martial arts", "Amateur dramatics", "Table tennis", "Musical performances"],
                    ["Swimming", "Yoga classes", "Dance workshops", "Book club", "Art classes"],
                    ["Badminton", "Chess club", "Photography", "Language classes", "Cooking workshops"]
                ],
                "value_range": (10, 80),
                "y_label": "Number of participants"
            },
            {
                "template": "The line graph shows the number of visitors to three different museums in {city} between {start_year} and {end_year}.",
                "subject_type": "museums",
                "location_type": "cities",
                "data_type": "visitors",
                "unit": "thousands",
                "categories": [
                    ["National History Museum", "Modern Art Gallery", "Science Museum"],
                    ["City Museum", "Maritime Museum", "Archaeological Museum"],
                    ["Contemporary Art Centre", "Natural History Museum", "Technology Museum"]
                ],
                "value_range": (50, 300),
                "y_label": "Visitors (thousands)"
            }
        ],
        "economic": [
            {
                "template": "The graph below shows the unemployment rates in {country} and two other countries between {start_year} and {end_year}.",
                "subject_type": "unemployment",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": None,  # Will use country names
                "value_range": (3, 15),
                "y_label": "Unemployment rate (%)"
            },
            {
                "template": "The line graph illustrates changes in the average house prices in three different cities in {country} from {start_year} to {end_year}.",
                "subject_type": "house_prices",
                "location_type": "countries",
                "data_type": "currency",
                "unit": "thousand dollars",
                "categories": None,  # Will use city names
                "value_range": (150, 600),
                "y_label": "Average price (thousand $)"
            }
        ],
        "education": [
            {
                "template": "The graph below shows the percentage of students from different countries who achieved Band 7 or above in IELTS Academic tests between {start_year} and {end_year}.",
                "subject_type": "ielts_results",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": None,
                "value_range": (15, 55),
                "y_label": "Percentage achieving Band 7+"
            },
            {
                "template": "The line graph shows changes in the number of international students enrolled at universities in {country} from {start_year} to {end_year}.",
                "subject_type": "student_enrollment",
                "location_type": "countries",
                "data_type": "number",
                "unit": "thousands",
                "categories": [
                    ["Undergraduate", "Postgraduate", "Research students"],
                    ["Business studies", "Engineering", "Sciences", "Arts"]
                ],
                "value_range": (20, 150),
                "y_label": "Number of students (thousands)"
            }
        ],
        "environment": [
            {
                "template": "The graph below shows carbon dioxide emissions per capita in four countries between {start_year} and {end_year}.",
                "subject_type": "emissions",
                "location_type": "countries",
                "data_type": "metric",
                "unit": "metric tonnes",
                "categories": None,
                "value_range": (2, 18),
                "y_label": "CO2 emissions (metric tonnes per capita)"
            },
            {
                "template": "The line graph illustrates the percentage of electricity generated from renewable sources in three countries from {start_year} to {end_year}.",
                "subject_type": "renewable_energy",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": None,
                "value_range": (5, 60),
                "y_label": "Percentage from renewables"
            }
        ],
        "transport": [
            {
                "template": "The graph below shows the number of passengers using three different types of public transport in {city} between {start_year} and {end_year}.",
                "subject_type": "transport",
                "location_type": "cities",
                "data_type": "passengers",
                "unit": "millions",
                "categories": [
                    ["Underground/Metro", "Bus", "Tram"],
                    ["Subway", "City buses", "Light rail"],
                    ["Metro system", "Bus network", "Ferry services"]
                ],
                "value_range": (10, 80),
                "y_label": "Passengers (millions)"
            }
        ],
        "health": [
            {
                "template": "The line graph shows the life expectancy at birth in three countries between {start_year} and {end_year}.",
                "subject_type": "life_expectancy",
                "location_type": "countries",
                "data_type": "years",
                "unit": "years",
                "categories": None,
                "value_range": (65, 85),
                "y_label": "Life expectancy (years)"
            },
            {
                "template": "The graph below shows the percentage of the population with access to clean drinking water in four developing countries from {start_year} to {end_year}.",
                "subject_type": "water_access",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": None,
                "value_range": (30, 95),
                "y_label": "Population with access (%)"
            }
        ],
        "technology": [
            {
                "template": "The graph below shows the percentage of households with internet access in four countries between {start_year} and {end_year}.",
                "subject_type": "internet",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": None,
                "value_range": (10, 95),
                "y_label": "Households with internet (%)"
            },
            {
                "template": "The line graph illustrates changes in smartphone ownership among different age groups in {country} from {start_year} to {end_year}.",
                "subject_type": "smartphones",
                "location_type": "countries",
                "data_type": "percentage",
                "unit": "percent",
                "categories": [
                    ["18-29 years", "30-49 years", "50-64 years", "65+ years"],
                    ["Young adults", "Middle-aged", "Older adults", "Seniors"]
                ],
                "value_range": (5, 98),
                "y_label": "Smartphone ownership (%)"
            }
        ]
    }
    
    # ============ TREND PATTERNS FOR ACADEMIC ANALYSIS ============
    TREND_PATTERNS = {
        "simple": [
            {"name": "steady_increase", "description": "consistent upward trend"},
            {"name": "steady_decrease", "description": "consistent downward trend"},
            {"name": "stable", "description": "remained relatively constant"}
        ],
        "intermediate": [
            {"name": "fluctuating_increase", "description": "overall upward with fluctuations"},
            {"name": "sharp_rise_then_stable", "description": "initial rapid increase then leveling off"},
            {"name": "gradual_decline", "description": "slow but consistent decrease"},
            {"name": "overtaking", "description": "one line surpassing another"}
        ],
        "complex": [
            {"name": "convergence", "description": "lines moving closer together"},
            {"name": "divergence", "description": "lines moving further apart"},
            {"name": "peak_then_decline", "description": "rise to maximum then fall"},
            {"name": "recovery", "description": "decline followed by recovery"},
            {"name": "cyclical", "description": "repeated pattern of rise and fall"}
        ]
    }
    
    # ============ TIME PERIODS ============
    TIME_PERIODS = {
        "short": {"duration": 5, "examples": [(2018, 2023), (2015, 2020), (2017, 2022)]},
        "medium": {"duration": 10, "examples": [(2010, 2020), (2013, 2023), (2005, 2015)]},
        "long": {"duration": 20, "examples": [(2000, 2020), (2003, 2023), (1990, 2010)]}
    }
    
    @classmethod
    def validate_task_authenticity(cls, task_description: str, data: dict) -> Tuple[bool, List[str]]:
        """
        Task Authenticity Linter - validates that a task meets IELTS standards.
        
        Returns: (is_valid, list_of_issues)
        """
        issues = []
        
        # Check 1: Location specificity
        has_location = any([
            any(city in task_description for city in cls.LOCATIONS["cities"]),
            any(country in task_description for country in cls.LOCATIONS["countries"]),
            any(region in task_description for region in cls.LOCATIONS["regions"]),
            any(inst in task_description.lower() for inst in ["centre", "center", "university", "museum", "library"])
        ])
        if not has_location:
            issues.append("MISSING_LOCATION: Task must include specific location")
        
        # Check 2: Time period
        import re
        year_pattern = r'\b(19|20)\d{2}\b'
        years_found = re.findall(year_pattern, task_description)
        if len(years_found) < 2:
            issues.append("MISSING_TIME_PERIOD: Task must include start and end years")
        
        # Check 3: Subject specificity
        vague_terms = ["information about", "data about", "some information", "various"]
        if any(term in task_description.lower() for term in vague_terms):
            issues.append("VAGUE_SUBJECT: Task description too generic")
        
        # Check 4: Data forces analysis
        if data:
            values = []
            if "datasets" in data:
                for ds in data["datasets"]:
                    values.extend(ds.get("values", []))
            
            if values:
                # Check for meaningful variation
                if len(set(values)) < 3:
                    issues.append("FLAT_DATA: Data lacks meaningful variation")
                
                # Check for at least one notable trend or comparison
                max_val = max(values) if values else 0
                min_val = min(values) if values else 0
                if max_val > 0 and (max_val - min_val) / max_val < 0.15:
                    issues.append("INSUFFICIENT_CONTRAST: Data needs more variation for analysis")
        
        return (len(issues) == 0, issues)
    
    @classmethod
    def generate_line_graph_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """
        Generate a complete, authentic Line Graph task.
        
        Returns:
        - task_description: IELTS-authentic task prompt
        - data: Structured dataset for SVG generation
        - analysis_hints: Key features for model answer
        - band_calibration: Complexity indicators
        """
        # Select topic category
        if topic and topic in cls.LINE_GRAPH_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.LINE_GRAPH_TEMPLATES.keys()))
        
        # Select template
        template_config = random.choice(cls.LINE_GRAPH_TEMPLATES[category])
        
        # Determine complexity based on band
        if band_level == "4.0-5.0":
            num_lines = 2
            num_years = 5
            time_period = "short"
            trend_complexity = "simple"
        elif band_level == "5.5-6.5":
            num_lines = 3
            num_years = 8
            time_period = "medium"
            trend_complexity = "intermediate"
        else:  # 7.0-9.0
            num_lines = 4
            num_years = 10
            time_period = "long"
            trend_complexity = "complex"
        
        # Generate time range
        period_config = cls.TIME_PERIODS[time_period]
        start_year, end_year = random.choice(period_config["examples"])
        
        # Adjust years based on num_years
        actual_end = start_year + num_years
        if actual_end > 2024:
            start_year = 2024 - num_years
            actual_end = 2024
        
        years = list(range(start_year, actual_end + 1, max(1, (actual_end - start_year) // (num_years - 1))))
        if len(years) > num_years:
            years = years[:num_years]
        
        # Select location
        location_type = template_config.get("location_type", "cities")
        if location_type == "cities":
            location = random.choice(cls.LOCATIONS["cities"])
            city = location
        elif location_type == "countries":
            location = random.choice(cls.LOCATIONS["countries"])
            city = location
        else:
            location = random.choice(cls.LOCATIONS["institutions"])
            city = location
        
        # Generate task description
        task_description = template_config["template"].format(
            location=location,
            city=city,
            country=location if location_type == "countries" else random.choice(cls.LOCATIONS["countries"]),
            start_year=years[0],
            end_year=years[-1]
        )
        
        # Add standard IELTS instruction
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate categories (line labels)
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            line_labels = categories_list[:num_lines]
        else:
            # Use countries
            line_labels = random.sample(cls.LOCATIONS["countries"], num_lines)
        
        # Generate data with meaningful trends
        datasets = cls._generate_trending_data(
            num_lines=num_lines,
            num_points=len(years),
            value_range=template_config["value_range"],
            complexity=trend_complexity,
            labels=line_labels
        )
        
        # Identify key features for analysis
        analysis_hints = cls._identify_key_features(datasets, years)
        
        # Build complete response
        result = {
            "task_description": task_description,
            "title": cls._extract_title(task_description, years),
            "x_label": "Year",
            "y_label": template_config["y_label"],
            "x_values": [str(y) for y in years],
            "datasets": datasets,
            "analysis_hints": analysis_hints,
            "band_calibration": {
                "target_band": band_level,
                "complexity": trend_complexity,
                "num_variables": num_lines,
                "time_span": f"{years[-1] - years[0]} years"
            },
            "metadata": {
                "category": category,
                "subject_type": template_config["subject_type"],
                "data_type": template_config["data_type"],
                "unit": template_config["unit"]
            }
        }
        
        # Validate authenticity
        is_valid, issues = cls.validate_task_authenticity(task_description, result)
        if not is_valid:
            # Regenerate if invalid (recursive with max depth)
            return cls.generate_line_graph_task(topic, band_level)
        
        return result
    
    @classmethod
    def _generate_trending_data(
        cls, 
        num_lines: int, 
        num_points: int, 
        value_range: Tuple[int, int],
        complexity: str,
        labels: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate data with meaningful trends based on complexity."""
        
        min_val, max_val = value_range
        datasets = []
        
        # Select trend patterns based on complexity
        trend_pool = cls.TREND_PATTERNS[complexity]
        
        # Ensure at least one interesting relationship
        if complexity == "complex" and num_lines >= 3:
            # Force an overtaking scenario
            trend_assignments = ["steady_increase", "peak_then_decline", "recovery"]
            if num_lines > 3:
                trend_assignments.extend(random.choices(
                    [t["name"] for t in trend_pool], 
                    k=num_lines - 3
                ))
        else:
            trend_assignments = [random.choice(trend_pool)["name"] for _ in range(num_lines)]
        
        for i, label in enumerate(labels):
            trend = trend_assignments[i] if i < len(trend_assignments) else "fluctuating_increase"
            values = cls._generate_trend_values(
                trend=trend,
                num_points=num_points,
                min_val=min_val,
                max_val=max_val,
                starting_offset=i * 0.1  # Offset to differentiate lines
            )
            datasets.append({
                "label": label,
                "values": values,
                "trend_type": trend
            })
        
        return datasets
    
    @classmethod
    def _generate_trend_values(
        cls, 
        trend: str, 
        num_points: int, 
        min_val: int, 
        max_val: int,
        starting_offset: float = 0
    ) -> List[float]:
        """Generate values following a specific trend pattern."""
        
        range_size = max_val - min_val
        base = min_val + range_size * (0.3 + starting_offset * 0.4)
        values = []
        
        for i in range(num_points):
            progress = i / (num_points - 1) if num_points > 1 else 0
            
            if trend == "steady_increase":
                val = base + (range_size * 0.5 * progress)
            elif trend == "steady_decrease":
                val = base + range_size * 0.4 - (range_size * 0.4 * progress)
            elif trend == "stable":
                val = base + random.uniform(-range_size * 0.05, range_size * 0.05)
            elif trend == "fluctuating_increase":
                val = base + (range_size * 0.4 * progress) + random.uniform(-range_size * 0.1, range_size * 0.1)
            elif trend == "sharp_rise_then_stable":
                if progress < 0.4:
                    val = base + (range_size * 0.5 * progress / 0.4)
                else:
                    val = base + range_size * 0.5 + random.uniform(-range_size * 0.05, range_size * 0.05)
            elif trend == "gradual_decline":
                val = base + range_size * 0.3 - (range_size * 0.25 * progress)
            elif trend == "peak_then_decline":
                if progress < 0.5:
                    val = base + (range_size * 0.5 * progress / 0.5)
                else:
                    val = base + range_size * 0.5 - (range_size * 0.3 * (progress - 0.5) / 0.5)
            elif trend == "recovery":
                if progress < 0.4:
                    val = base - (range_size * 0.2 * progress / 0.4)
                else:
                    val = base - range_size * 0.2 + (range_size * 0.4 * (progress - 0.4) / 0.6)
            elif trend == "convergence":
                val = base + (range_size * 0.3 - range_size * 0.1 * starting_offset * 10) * (1 - progress * 0.6)
            elif trend == "divergence":
                val = base + (range_size * 0.4 * progress * (1 + starting_offset))
            elif trend == "overtaking":
                if starting_offset < 0.05:  # First line
                    val = base + range_size * 0.3 - (range_size * 0.15 * progress)
                else:  # Other lines
                    val = base - range_size * 0.1 + (range_size * 0.5 * progress)
            else:
                val = base + random.uniform(-range_size * 0.1, range_size * 0.1)
            
            # Add small noise for realism
            noise = random.uniform(-range_size * 0.02, range_size * 0.02)
            val = max(min_val, min(max_val, val + noise))
            values.append(round(val, 1))
        
        return values
    
    @classmethod
    def _identify_key_features(cls, datasets: List[Dict], years: List[int]) -> Dict[str, Any]:
        """Identify key features for academic analysis."""
        
        features = {
            "overall_trend": None,
            "highest_point": None,
            "lowest_point": None,
            "notable_changes": [],
            "comparisons": [],
            "exceptions": []
        }
        
        all_values = []
        for ds in datasets:
            all_values.extend(ds["values"])
        
        # Overall trend
        first_avg = sum(ds["values"][0] for ds in datasets) / len(datasets)
        last_avg = sum(ds["values"][-1] for ds in datasets) / len(datasets)
        
        if last_avg > first_avg * 1.15:
            features["overall_trend"] = "general upward trend"
        elif last_avg < first_avg * 0.85:
            features["overall_trend"] = "general downward trend"
        else:
            features["overall_trend"] = "mixed or stable trends"
        
        # Find highest and lowest
        max_val = max(all_values)
        min_val = min(all_values)
        
        for ds in datasets:
            if max_val in ds["values"]:
                idx = ds["values"].index(max_val)
                features["highest_point"] = {
                    "label": ds["label"],
                    "value": max_val,
                    "year": years[idx]
                }
            if min_val in ds["values"]:
                idx = ds["values"].index(min_val)
                features["lowest_point"] = {
                    "label": ds["label"],
                    "value": min_val,
                    "year": years[idx]
                }
        
        # Notable changes
        for ds in datasets:
            for i in range(1, len(ds["values"])):
                change = ds["values"][i] - ds["values"][i-1]
                pct_change = abs(change / ds["values"][i-1]) * 100 if ds["values"][i-1] > 0 else 0
                if pct_change > 25:
                    features["notable_changes"].append({
                        "label": ds["label"],
                        "from_year": years[i-1],
                        "to_year": years[i],
                        "direction": "increase" if change > 0 else "decrease",
                        "magnitude": f"{pct_change:.0f}%"
                    })
        
        # Comparisons (at end point)
        end_values = [(ds["label"], ds["values"][-1]) for ds in datasets]
        end_values.sort(key=lambda x: x[1], reverse=True)
        
        if len(end_values) >= 2:
            features["comparisons"].append({
                "type": "final_ranking",
                "highest": end_values[0][0],
                "lowest": end_values[-1][0]
            })
        
        return features
    
    @classmethod
    def _extract_title(cls, task_description: str, years: List[int]) -> str:
        """Extract a suitable title from task description."""
        
        # Find the main subject from the task
        import re
        
        # Try to extract between "shows" and "between/from/for"
        match = re.search(r'(?:shows?|gives?|illustrates?)\s+(?:information on\s+)?(?:the\s+)?(.+?)(?:\s+(?:between|from|for|in)\s+)', task_description, re.IGNORECASE)
        
        if match:
            subject = match.group(1).strip()
            # Capitalize properly
            subject = ' '.join(word.capitalize() if word.lower() not in ['of', 'in', 'at', 'the', 'a', 'an', 'for', 'and', 'or'] else word.lower() for word in subject.split())
            return f"{subject} ({years[0]}-{years[-1]})"
        
        return f"Data Overview ({years[0]}-{years[-1]})"


# Create singleton instance
authentic_task_generator = AuthenticTaskGenerator()
