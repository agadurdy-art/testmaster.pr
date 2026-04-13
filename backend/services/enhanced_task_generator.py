"""
IELTS Writing Task 1 - Enhanced Authentic Task Generator
=========================================================
ULTRA MASTER PROMPT Implementation - Complete Version

Supports ALL visual types:
- Line Graph
- Bar Chart (simple, grouped, stacked)
- Pie Chart (single, multiple)
- Table
- Process Diagram
- Map Comparison

Each task includes:
- Specific location (city, country, institution)
- Clear subject/system
- Defined time period
- Realistic academic context
- Band-calibrated complexity
"""

import random
import json
from typing import Dict, List, Any, Optional
from datetime import datetime


class EnhancedTaskGenerator:
    """
    Generates IELTS-authentic Task 1 descriptions with proper complexity calibration.
    """
    
    # ============ LOCATIONS DATABASE ============
    LOCATIONS = {
        "cities": [
            "Melbourne, Australia", "Sydney, Australia", "Auckland, New Zealand",
            "London, UK", "Manchester, UK", "Edinburgh, Scotland", "Birmingham, UK",
            "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Ottawa, Canada",
            "New York, USA", "Los Angeles, USA", "Chicago, USA", "Boston, USA",
            "Singapore", "Hong Kong", "Tokyo, Japan", "Osaka, Japan",
            "Berlin, Germany", "Munich, Germany", "Paris, France", "Lyon, France",
            "Amsterdam, Netherlands", "Stockholm, Sweden", "Copenhagen, Denmark",
            "Dubai, UAE", "Abu Dhabi, UAE", "Mumbai, India", "Delhi, India",
            "Seoul, South Korea", "Taipei, Taiwan", "Bangkok, Thailand"
        ],
        "countries": [
            "the United Kingdom", "the United States", "Canada", "Australia", 
            "New Zealand", "Germany", "France", "Japan", "South Korea",
            "China", "India", "Brazil", "Singapore", "Netherlands", "Sweden",
            "Italy", "Spain", "Norway", "Denmark", "Finland"
        ],
        "regions": [
            "Western Europe", "Southeast Asia", "North America", "Oceania",
            "the European Union", "the Asia-Pacific region", "the Middle East",
            "Latin America", "Sub-Saharan Africa", "the Nordic countries"
        ],
        "institutions": [
            "a university in Melbourne", "a research centre in London",
            "a public library in Toronto", "a hospital in Sydney",
            "a community centre in Singapore", "a school in Auckland",
            "a museum in Vancouver", "a sports facility in Manchester",
            "a government agency in Berlin", "a technology company in San Francisco"
        ],
        "universities": [
            "the University of Melbourne", "Oxford University", "Cambridge University",
            "the University of Toronto", "Harvard University", "MIT",
            "the National University of Singapore", "the University of Tokyo",
            "the University of Sydney", "McGill University"
        ]
    }
    
    # ============ TIME PERIODS ============
    TIME_PERIODS = {
        "short": [(2018, 2023), (2019, 2024), (2020, 2025)],
        "medium": [(2010, 2020), (2012, 2022), (2015, 2025)],
        "long": [(2000, 2020), (1990, 2020), (2000, 2025)],
        "historical": [(1980, 2020), (1970, 2010), (1985, 2015)],
        "forecast": [(2020, 2050), (2025, 2050), (2030, 2060)]
    }
    
    # ============ LINE GRAPH TEMPLATES ============
    LINE_GRAPH_TEMPLATES = [
        # Tourism & Visitors
        {
            "template": "The line graph shows the number of visitors to three different {venues} in {city} between {start_year} and {end_year}.",
            "venues": ["museums", "art galleries", "tourist attractions", "national parks"],
            "categories_options": [
                ["National Museum", "Art Gallery", "Science Centre"],
                ["City Museum", "Modern Art Gallery", "History Museum"],
                ["Central Park", "Botanical Gardens", "Wildlife Reserve"]
            ],
            "y_label": "Number of visitors (thousands)",
            "value_range": (100, 500),
            "trends": ["growth", "decline", "fluctuation", "stability"]
        },
        # Education
        {
            "template": "The graph below shows the percentage of students graduating from {institution} in three different subjects between {start_year} and {end_year}.",
            "institution_type": "universities",
            "categories_options": [
                ["Engineering", "Business Studies", "Medicine"],
                ["Computer Science", "Law", "Arts"],
                ["Natural Sciences", "Social Sciences", "Humanities"]
            ],
            "y_label": "Percentage of graduates (%)",
            "value_range": (5, 40),
            "trends": ["growth", "decline", "convergence"]
        },
        # Transportation
        {
            "template": "The line graph illustrates the number of passengers using three different types of public transport in {city} from {start_year} to {end_year}.",
            "categories_options": [
                ["Bus", "Subway/Metro", "Tram"],
                ["Train", "Bus", "Ferry"],
                ["Light Rail", "Bus Rapid Transit", "Underground"]
            ],
            "y_label": "Passengers (millions)",
            "value_range": (50, 300),
            "trends": ["growth", "shift", "fluctuation"]
        },
        # Energy
        {
            "template": "The graph shows electricity production from three different sources in {country} between {start_year} and {end_year}.",
            "categories_options": [
                ["Nuclear", "Renewable", "Fossil Fuels"],
                ["Coal", "Natural Gas", "Solar/Wind"],
                ["Hydroelectric", "Nuclear", "Thermal"]
            ],
            "y_label": "Electricity production (TWh)",
            "value_range": (100, 800),
            "trends": ["transition", "growth", "decline"]
        },
        # Employment
        {
            "template": "The line graph compares unemployment rates in {country} among three different age groups from {start_year} to {end_year}.",
            "categories_options": [
                ["18-25 years", "26-40 years", "41-60 years"],
                ["Under 25", "25-54", "55 and over"],
                ["Youth (16-24)", "Prime age (25-54)", "Older workers (55+)"]
            ],
            "y_label": "Unemployment rate (%)",
            "value_range": (3, 20),
            "trends": ["fluctuation", "convergence", "divergence"]
        },
        # Health
        {
            "template": "The graph below shows the number of people diagnosed with three common health conditions in {country} between {start_year} and {end_year}.",
            "categories_options": [
                ["Diabetes", "Heart Disease", "Obesity"],
                ["Asthma", "Allergies", "Mental Health Issues"],
                ["Hypertension", "Arthritis", "Depression"]
            ],
            "y_label": "Number of cases (millions)",
            "value_range": (2, 15),
            "trends": ["growth", "stabilization", "fluctuation"]
        },
        # Internet & Technology
        {
            "template": "The line graph shows internet usage by three different age groups in {country} from {start_year} to {end_year}.",
            "categories_options": [
                ["16-24 years", "25-44 years", "45-64 years"],
                ["Teenagers", "Adults", "Seniors"],
                ["Under 30", "30-50", "Over 50"]
            ],
            "y_label": "Percentage using internet daily (%)",
            "value_range": (20, 95),
            "trends": ["growth", "convergence", "saturation"]
        }
    ]
    
    # ============ BAR CHART TEMPLATES ============
    BAR_CHART_TEMPLATES = [
        # Spending/Budget
        {
            "template": "The bar chart shows the average household spending on different categories in {city} in {year}.",
            "categories": ["Housing", "Food", "Transportation", "Healthcare", "Education", "Entertainment"],
            "y_label": "Average monthly spending ($)",
            "value_range": (200, 2000),
            "chart_style": "simple"
        },
        # Comparison between countries
        {
            "template": "The chart below compares the percentage of GDP spent on {sector} in five different countries in {year}.",
            "sector": ["education", "healthcare", "defence", "infrastructure", "research and development"],
            "categories": None,  # Will use country names
            "y_label": "Percentage of GDP (%)",
            "value_range": (2, 12),
            "chart_style": "simple"
        },
        # Water/Resource usage
        {
            "template": "The bar chart shows water consumption by different sectors in {country} in {start_year} and {end_year}.",
            "categories": ["Agriculture", "Industry", "Domestic", "Commercial"],
            "y_label": "Water consumption (billion cubic meters)",
            "value_range": (50, 400),
            "chart_style": "grouped"
        },
        # Working hours
        {
            "template": "The chart compares average weekly working hours in six different countries in {year}.",
            "categories": None,
            "y_label": "Average working hours per week",
            "value_range": (30, 50),
            "chart_style": "simple"
        },
        # Waste production
        {
            "template": "The bar chart shows the amount of waste produced per person in five cities in {year}.",
            "categories": None,  # Cities
            "y_label": "Waste per person (kg per year)",
            "value_range": (200, 800),
            "chart_style": "simple"
        },
        # Student enrollment by subject
        {
            "template": "The chart below shows student enrollment numbers in different faculties at {institution} for male and female students in {year}.",
            "institution_type": "universities",
            "categories": ["Engineering", "Medicine", "Business", "Arts", "Science", "Law"],
            "y_label": "Number of students",
            "value_range": (500, 3000),
            "chart_style": "grouped"
        }
    ]
    
    # ============ PIE CHART TEMPLATES ============
    PIE_CHART_TEMPLATES = [
        # Household budget
        {
            "template": "The pie chart shows how an average household in {country} spent their monthly income in {year}.",
            "segments": ["Housing/Rent", "Food & Groceries", "Transportation", "Utilities", "Healthcare", "Entertainment", "Savings", "Other"],
            "must_sum_100": True
        },
        # Energy sources
        {
            "template": "The pie chart illustrates the proportion of electricity generated from different sources in {country} in {year}.",
            "segments": ["Coal", "Natural Gas", "Nuclear", "Hydroelectric", "Wind", "Solar", "Other Renewables"],
            "must_sum_100": True
        },
        # Time allocation
        {
            "template": "The chart shows how working adults in {city} typically spend their leisure time on weekends.",
            "segments": ["Watching TV/Streaming", "Social Media", "Sports/Exercise", "Reading", "Socializing", "Hobbies", "Shopping", "Other"],
            "must_sum_100": True
        },
        # Company revenue
        {
            "template": "The pie charts compare the market share of smartphone brands in {region} in {start_year} and {end_year}.",
            "segments": ["Apple", "Samsung", "Huawei", "Xiaomi", "Other"],
            "comparison": True,
            "must_sum_100": True
        },
        # Land use
        {
            "template": "The pie chart shows the distribution of land use in {country} in {year}.",
            "segments": ["Agricultural", "Forest", "Urban/Built-up", "Water bodies", "Barren land", "Protected areas"],
            "must_sum_100": True
        },
        # Tourism spending
        {
            "template": "The chart below shows the breakdown of tourist spending in {city} by category.",
            "segments": ["Accommodation", "Food & Dining", "Shopping", "Entertainment", "Transportation", "Tours & Activities"],
            "must_sum_100": True
        }
    ]
    
    # ============ TABLE TEMPLATES ============
    TABLE_TEMPLATES = [
        {
            "template": "The table below shows the percentage of adults who participated in various leisure activities in {country} in {start_year} and {end_year}.",
            "row_headers": ["Reading", "Gardening", "DIY projects", "Sports/Exercise", "Arts & Crafts", "Cooking for pleasure"],
            "column_headers": ["2015 (%)", "2020 (%)"],
            "value_range": (10, 70)
        },
        {
            "template": "The table provides information about underground railway systems in six cities.",
            "row_headers": ["London", "Paris", "Tokyo", "New York", "Shanghai", "Moscow"],
            "column_headers": ["Year opened", "System size (km)", "Passengers (millions/year)"],
            "data_types": ["year", "number", "number"]
        },
        {
            "template": "The table compares data for three types of farms in {country} in {year}.",
            "row_headers": ["Small farms", "Medium farms", "Large farms"],
            "column_headers": ["Number of farms", "Average size (hectares)", "% of total output", "Workers employed"],
            "value_range": (5, 500)
        },
        {
            "template": "The table below shows consumer spending on different items in five countries in {year}.",
            "row_headers": ["Ireland", "Italy", "Spain", "Sweden", "Turkey"],
            "column_headers": ["Food/Drinks/Tobacco (%)", "Clothing/Footwear (%)", "Leisure/Education (%)", "Other (%)"],
            "value_range": (5, 40),
            "must_sum_100": True
        },
        {
            "template": "The table shows the results of a survey about the most important factors when choosing a job, by age group.",
            "row_headers": ["Salary", "Work-life balance", "Career growth", "Job security", "Company culture", "Location"],
            "column_headers": ["18-30 years", "31-45 years", "46-60 years"],
            "value_range": (5, 35),
            "is_ranking": True
        }
    ]
    
    # ============ PROCESS DIAGRAM TEMPLATES ============
    PROCESS_TEMPLATES = [
        {
            "template": "The diagram below shows how {product} is produced.",
            "product": "chocolate",
            "stages": [
                {"name": "Harvesting", "description": "Cocoa pods are harvested from trees"},
                {"name": "Fermentation", "description": "Beans are fermented for 5-7 days"},
                {"name": "Drying", "description": "Beans are dried in the sun"},
                {"name": "Roasting", "description": "Dried beans are roasted at high temperature"},
                {"name": "Grinding", "description": "Roasted beans are ground into cocoa mass"},
                {"name": "Pressing", "description": "Cocoa butter is separated from cocoa solids"},
                {"name": "Mixing", "description": "Ingredients are mixed together"},
                {"name": "Tempering", "description": "Mixture is heated and cooled to stabilize"},
                {"name": "Moulding", "description": "Chocolate is poured into moulds"},
                {"name": "Packaging", "description": "Final product is wrapped and packaged"}
            ],
            "is_cyclical": False
        },
        {
            "template": "The diagram illustrates the process of water treatment for domestic use.",
            "product": "clean water",
            "stages": [
                {"name": "Intake", "description": "Water is drawn from reservoir or river"},
                {"name": "Screening", "description": "Large debris is removed"},
                {"name": "Coagulation", "description": "Chemicals are added to clump particles"},
                {"name": "Sedimentation", "description": "Heavy particles settle at the bottom"},
                {"name": "Filtration", "description": "Water passes through sand and gravel filters"},
                {"name": "Disinfection", "description": "Chlorine is added to kill bacteria"},
                {"name": "Storage", "description": "Clean water is stored in reservoirs"},
                {"name": "Distribution", "description": "Water is pumped to homes"}
            ],
            "is_cyclical": False
        },
        {
            "template": "The diagram shows the life cycle of the salmon.",
            "product": "salmon life cycle",
            "stages": [
                {"name": "Eggs", "description": "Female salmon lays eggs in gravel"},
                {"name": "Alevin", "description": "Baby fish with yolk sac attached"},
                {"name": "Fry", "description": "Young fish emerge and begin feeding"},
                {"name": "Parr", "description": "Juvenile salmon with distinctive markings"},
                {"name": "Smolt", "description": "Fish adapt for saltwater and migrate"},
                {"name": "Adult Ocean", "description": "Salmon grow in the ocean for 1-5 years"},
                {"name": "Spawning Migration", "description": "Adults return to freshwater to breed"},
                {"name": "Spawning", "description": "Adults mate and lay eggs, cycle repeats"}
            ],
            "is_cyclical": True
        },
        {
            "template": "The diagram below shows how cement is manufactured.",
            "product": "cement",
            "stages": [
                {"name": "Quarrying", "description": "Limestone and clay are extracted"},
                {"name": "Crushing", "description": "Raw materials are crushed into small pieces"},
                {"name": "Mixing", "description": "Crusite limestone and clay are mixed with water"},
                {"name": "Heating", "description": "Mixture is heated in a rotating kiln at 1450°C"},
                {"name": "Clinker formation", "description": "Material forms clinite nodules"},
                {"name": "Cooling", "description": "Clinite is cooled in a cooler"},
                {"name": "Grinding", "description": "Clinite is ground with gypsum into fine powder"},
                {"name": "Packaging", "description": "Cement is bagged or stored in silos"}
            ],
            "is_cyclical": False
        },
        {
            "template": "The diagram illustrates how glass bottles are recycled.",
            "product": "recycled glass",
            "stages": [
                {"name": "Collection", "description": "Used bottles collected from recycling bins"},
                {"name": "Sorting", "description": "Glass sorted by color (clear, green, brown)"},
                {"name": "Cleaning", "description": "Labels and caps removed, glass washed"},
                {"name": "Crushing", "description": "Glass crushed into small pieces (cullet)"},
                {"name": "Melting", "description": "Cullet melted in furnace at 1500°C"},
                {"name": "Moulding", "description": "Molten glass shaped into new bottles"},
                {"name": "Annealing", "description": "Bottles slowly cooled to strengthen"},
                {"name": "Quality Check", "description": "Bottles inspected and packaged"}
            ],
            "is_cyclical": True
        }
    ]
    
    # ============ MAP TEMPLATES ============
    MAP_TEMPLATES = [
        {
            "template": "The maps below show the changes that took place in {place_name} between {start_year} and {end_year}.",
            "place_name": "Westfield town centre",
            "time_before": "1980",
            "time_after": "2020",
            "features_before": [
                "a large market square in the centre",
                "residential houses along Main Street",
                "a small park on the eastern side",
                "a river running through the south",
                "farmland to the north"
            ],
            "features_after": [
                "a shopping mall where the market was",
                "apartment blocks replacing houses",
                "an expanded park with sports facilities",
                "a bridge over the river",
                "a business district to the north"
            ],
            "key_changes": ["commercialization", "urbanization", "modernization"]
        },
        {
            "template": "The two maps compare the island of {island_name} before and after the construction of tourist facilities.",
            "place_name": "Kalua Island",
            "time_before": "Before development",
            "time_after": "After development",
            "features_before": [
                "beach along the western coast",
                "dense vegetation in the interior",
                "a small fishing village in the south",
                "a freshwater lake in the centre",
                "hills in the northern area"
            ],
            "features_after": [
                "a hotel complex near the beach",
                "swimming pool next to the hotel",
                "restaurant and reception facilities",
                "footpaths connecting all areas",
                "a pier for boat trips"
            ],
            "key_changes": ["tourism development", "infrastructure addition"]
        },
        {
            "template": "The maps show a university campus at present and plans for its development by {future_year}.",
            "place_name": "Greenwood University",
            "time_before": "Current",
            "time_after": "2035 (Planned)",
            "features_before": [
                "main lecture halls in the centre",
                "library on the eastern side",
                "student accommodation to the north",
                "car park to the west",
                "sports field in the south"
            ],
            "features_after": [
                "new science building added",
                "expanded library with digital centre",
                "additional student housing blocks",
                "underground parking replacing surface lot",
                "indoor sports centre replacing open field"
            ],
            "key_changes": ["expansion", "modernization", "sustainability"]
        },
        {
            "template": "The diagrams show how the village of {village_name} changed over a 50-year period.",
            "place_name": "Chorlton village",
            "time_before": "1970",
            "time_after": "2020",
            "features_before": [
                "scattered farmhouses across the area",
                "a single main road through the village",
                "the village school near the church",
                "agricultural fields surrounding the village",
                "a small stream on the eastern boundary"
            ],
            "features_after": [
                "housing estates on former farmland",
                "a new bypass road around the village",
                "a supermarket and retail park",
                "the school has been extended",
                "the stream area is now a nature reserve"
            ],
            "key_changes": ["suburbanization", "commercial development", "transportation improvements"]
        }
    ]
    
    # ============ BAND COMPLEXITY SETTINGS ============
    BAND_COMPLEXITY = {
        "4.0-5.0": {
            "data_points": 4,
            "categories": 3,
            "trends": "simple",
            "description_style": "straightforward"
        },
        "5.5-6.5": {
            "data_points": 6,
            "categories": 4,
            "trends": "moderate",
            "description_style": "detailed"
        },
        "7.0-9.0": {
            "data_points": 8,
            "categories": 5,
            "trends": "complex",
            "description_style": "sophisticated"
        }
    }
    
    def __init__(self):
        self.topics_by_course = {
            "beginner": ["daily_life", "family", "food", "work", "education", "travel", "health", "hobbies"],
            "mastery": ["technology", "environment", "urbanization", "media", "culture", "economics"],
            "advanced": ["globalization", "scientific_research", "policy", "demographics", "sustainability"]
        }
    
    def generate_task(
        self,
        visual_type: str,
        topic: Optional[str] = None,
        band_level: str = "5.5-6.5"
    ) -> Dict[str, Any]:
        """
        Generate a complete IELTS Task 1 with authentic description and data.
        """
        generators = {
            "line_graph": self._generate_line_graph,
            "bar_chart": self._generate_bar_chart,
            "pie_chart": self._generate_pie_chart,
            "table": self._generate_table,
            "process": self._generate_process,
            "map": self._generate_map
        }
        
        generator = generators.get(visual_type)
        if not generator:
            raise ValueError(f"Unknown visual type: {visual_type}")
        
        return generator(topic, band_level)
    
    def _generate_line_graph(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate line graph task."""
        template = random.choice(self.LINE_GRAPH_TEMPLATES)
        complexity = self.BAND_COMPLEXITY.get(band_level, self.BAND_COMPLEXITY["5.5-6.5"])
        
        # Select time period
        if band_level == "4.0-5.0":
            period = random.choice(self.TIME_PERIODS["short"])
        elif band_level == "7.0-9.0":
            period = random.choice(self.TIME_PERIODS["historical"])
        else:
            period = random.choice(self.TIME_PERIODS["medium"])
        
        start_year, end_year = period
        years = list(range(start_year, end_year + 1, max(1, (end_year - start_year) // complexity["data_points"])))
        
        # Select location
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        institution = random.choice(self.LOCATIONS["universities"])
        
        # Build description
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{institution}", institution)
        description = description.replace("{start_year}", str(start_year))
        description = description.replace("{end_year}", str(end_year))
        
        if "{venues}" in description:
            venue = random.choice(template.get("venues", ["museums"]))
            description = description.replace("{venues}", venue)
        
        # Generate categories
        categories = random.choice(template.get("categories_options", [["Category A", "Category B", "Category C"]]))
        categories = categories[:complexity["categories"]]
        
        # Generate data with realistic trends
        datasets = []
        value_range = template.get("value_range", (50, 200))
        
        for cat in categories:
            trend = random.choice(template.get("trends", ["growth", "decline", "fluctuation"]))
            values = self._generate_trend_data(years, value_range, trend, complexity["trends"])
            datasets.append({"label": cat, "values": values})
        
        # Add IELTS instruction
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "line_graph",
            "task_description": full_description,
            "title": description.split(".")[0],
            "x_values": years,
            "x_label": "Year",
            "y_label": template.get("y_label", "Values"),
            "datasets": datasets,
            "band_calibration": {
                "target_band": band_level,
                "complexity": complexity["trends"]
            },
            "analysis_hints": {
                "overall_trend": self._identify_overall_trend(datasets),
                "notable_features": self._identify_notable_features(datasets, years),
                "comparison_points": self._identify_comparison_points(datasets)
            }
        }
    
    def _generate_bar_chart(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate bar chart task."""
        template = random.choice(self.BAR_CHART_TEMPLATES)
        complexity = self.BAND_COMPLEXITY.get(band_level, self.BAND_COMPLEXITY["5.5-6.5"])
        
        year = random.randint(2019, 2023)
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        
        # Build description
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 5))
        description = description.replace("{end_year}", str(year))
        
        if "{sector}" in description:
            sector = random.choice(template.get("sector", ["education"]))
            description = description.replace("{sector}", sector)
        
        if "{institution}" in description:
            institution = random.choice(self.LOCATIONS.get(template.get("institution_type", "universities")))
            description = description.replace("{institution}", institution)
        
        # Generate categories
        if template.get("categories"):
            categories = template["categories"][:complexity["categories"] + 1]
        else:
            categories = random.sample(self.LOCATIONS["countries"], complexity["categories"] + 1)
        
        # Generate data
        value_range = template.get("value_range", (100, 500))
        chart_style = template.get("chart_style", "simple")
        
        if chart_style == "grouped":
            # Two sets of data for comparison
            datasets = [
                {"label": "Group A", "values": [random.randint(*value_range) for _ in categories]},
                {"label": "Group B", "values": [random.randint(*value_range) for _ in categories]}
            ]
        else:
            datasets = [{"label": "Values", "values": [random.randint(*value_range) for _ in categories]}]
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "bar_chart",
            "chart_style": chart_style,
            "task_description": full_description,
            "title": description.split(".")[0],
            "categories": categories,
            "y_label": template.get("y_label", "Values"),
            "datasets": datasets,
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_pie_chart(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate pie chart task."""
        template = random.choice(self.PIE_CHART_TEMPLATES)
        
        year = random.randint(2019, 2023)
        city = random.choice(self.LOCATIONS["cities"])
        country = random.choice(self.LOCATIONS["countries"])
        region = random.choice(self.LOCATIONS["regions"])
        
        description = template["template"]
        description = description.replace("{city}", city)
        description = description.replace("{country}", country)
        description = description.replace("{region}", region)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 10))
        description = description.replace("{end_year}", str(year))
        
        segments = template["segments"]
        
        # Generate percentages that sum to 100
        if template.get("comparison"):
            # Two pie charts
            values_1 = self._generate_percentages(len(segments))
            values_2 = self._generate_percentages(len(segments))
            datasets = [
                {"label": f"{year - 10}", "values": values_1},
                {"label": f"{year}", "values": values_2}
            ]
        else:
            values = self._generate_percentages(len(segments))
            datasets = [{"label": "Percentage", "values": values}]
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "pie_chart",
            "task_description": full_description,
            "title": description.split(".")[0],
            "segments": segments,
            "datasets": datasets,
            "is_comparison": template.get("comparison", False),
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_table(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate table task."""
        template = random.choice(self.TABLE_TEMPLATES)
        
        country = random.choice(self.LOCATIONS["countries"])
        year = random.randint(2019, 2023)
        
        description = template["template"]
        description = description.replace("{country}", country)
        description = description.replace("{year}", str(year))
        description = description.replace("{start_year}", str(year - 5))
        description = description.replace("{end_year}", str(year))
        
        row_headers = template["row_headers"]
        column_headers = template["column_headers"]
        value_range = template.get("value_range", (10, 50))
        
        # Generate table data
        rows = []
        for row_header in row_headers:
            row = [row_header]
            if template.get("must_sum_100"):
                values = self._generate_percentages(len(column_headers))
                row.extend(values)
            else:
                for _ in column_headers:
                    row.append(random.randint(*value_range))
            rows.append(row)
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "table",
            "task_description": full_description,
            "title": description.split(".")[0],
            "columns": ["Category"] + column_headers,
            "rows": rows,
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_process(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate process diagram task."""
        template = random.choice(self.PROCESS_TEMPLATES)
        
        description = template["template"]
        description = description.replace("{product}", template["product"])
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "process",
            "task_description": full_description,
            "title": description,
            "stages": template["stages"],
            "is_cyclical": template.get("is_cyclical", False),
            "product": template["product"],
            "band_calibration": {"target_band": band_level}
        }
    
    def _generate_map(self, topic: Optional[str], band_level: str) -> Dict[str, Any]:
        """Generate map comparison task."""
        template = random.choice(self.MAP_TEMPLATES)
        
        description = template["template"]
        description = description.replace("{place_name}", template["place_name"])
        description = description.replace("{island_name}", template.get("place_name", "Kalua"))
        description = description.replace("{village_name}", template.get("place_name", "Chorlton"))
        description = description.replace("{start_year}", template["time_before"])
        description = description.replace("{end_year}", template["time_after"])
        description = description.replace("{future_year}", template.get("time_after", "2035"))
        
        full_description = f"""{description}

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words."""
        
        return {
            "visual_type": "map",
            "task_description": full_description,
            "title": description,
            "place_name": template["place_name"],
            "time_before": template["time_before"],
            "time_after": template["time_after"],
            "features_before": template["features_before"],
            "features_after": template["features_after"],
            "key_changes": template.get("key_changes", []),
            "band_calibration": {"target_band": band_level}
        }
    
    # ============ HELPER METHODS ============
    
    def _generate_trend_data(
        self, 
        years: List[int], 
        value_range: tuple, 
        trend: str,
        complexity: str
    ) -> List[float]:
        """Generate realistic trend data."""
        n = len(years)
        min_val, max_val = value_range
        
        if trend == "growth":
            base = random.uniform(min_val, min_val + (max_val - min_val) * 0.3)
            values = [base + (max_val - base) * (i / n) ** 0.8 for i in range(n)]
        elif trend == "decline":
            base = random.uniform(max_val * 0.7, max_val)
            values = [base - (base - min_val) * (i / n) ** 0.8 for i in range(n)]
        elif trend == "fluctuation":
            mid = (min_val + max_val) / 2
            values = [mid + random.uniform(-0.3, 0.3) * (max_val - min_val) for _ in range(n)]
        elif trend == "convergence":
            start = random.uniform(min_val, max_val)
            target = random.uniform(min_val + (max_val - min_val) * 0.4, max_val * 0.6)
            values = [start + (target - start) * (i / n) for i in range(n)]
        else:  # stability
            base = random.uniform(min_val + (max_val - min_val) * 0.3, max_val * 0.7)
            values = [base + random.uniform(-0.05, 0.05) * base for _ in range(n)]
        
        # Add noise for complexity
        if complexity == "complex":
            noise = 0.1
        elif complexity == "moderate":
            noise = 0.05
        else:
            noise = 0.02
        
        values = [v + random.uniform(-noise, noise) * v for v in values]
        return [round(v, 1) for v in values]
    
    def _generate_percentages(self, n: int) -> List[float]:
        """Generate n percentages that sum to 100."""
        values = [random.random() for _ in range(n)]
        total = sum(values)
        percentages = [round(v / total * 100, 1) for v in values]
        
        # Adjust to sum exactly to 100
        diff = 100 - sum(percentages)
        percentages[0] = round(percentages[0] + diff, 1)
        
        return percentages
    
    def _identify_overall_trend(self, datasets: List[Dict]) -> str:
        """Identify the overall trend in the data."""
        trends = []
        for ds in datasets:
            values = ds["values"]
            if values[-1] > values[0] * 1.1:
                trends.append("increasing")
            elif values[-1] < values[0] * 0.9:
                trends.append("decreasing")
            else:
                trends.append("stable")
        
        if all(t == "increasing" for t in trends):
            return "All categories showed an upward trend"
        elif all(t == "decreasing" for t in trends):
            return "All categories experienced a decline"
        else:
            return "The trends varied across different categories"
    
    def _identify_notable_features(self, datasets: List[Dict], years: List[int]) -> List[str]:
        """Identify notable features for analysis."""
        features = []
        
        for ds in datasets:
            values = ds["values"]
            label = ds["label"]
            
            # Highest and lowest points
            max_idx = values.index(max(values))
            min_idx = values.index(min(values))
            
            features.append(f"{label} peaked at {max(values)} in {years[max_idx]}")
            
            # Significant changes
            for i in range(1, len(values)):
                change = (values[i] - values[i-1]) / values[i-1] * 100 if values[i-1] != 0 else 0
                if abs(change) > 20:
                    direction = "increased" if change > 0 else "decreased"
                    features.append(f"{label} {direction} sharply between {years[i-1]} and {years[i]}")
        
        return features[:5]
    
    def _identify_comparison_points(self, datasets: List[Dict]) -> List[str]:
        """Identify key comparison points."""
        if len(datasets) < 2:
            return []
        
        comparisons = []
        
        # Compare final values
        final_values = [(ds["label"], ds["values"][-1]) for ds in datasets]
        final_values.sort(key=lambda x: x[1], reverse=True)
        
        comparisons.append(f"{final_values[0][0]} had the highest final value at {final_values[0][1]}")
        comparisons.append(f"{final_values[-1][0]} recorded the lowest at {final_values[-1][1]}")
        
        return comparisons


# Create singleton instance
enhanced_task_generator = EnhancedTaskGenerator()
