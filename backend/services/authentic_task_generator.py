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
    
    # ============ BAR CHART AUTHENTIC TEMPLATES ============
    BAR_CHART_TEMPLATES = {
        "comparison": [
            {
                "template": "The bar chart below shows the average monthly spending on different categories by households in {city} in {year}.",
                "subject_type": "spending",
                "location_type": "cities",
                "categories": [
                    ["Housing", "Food", "Transportation", "Healthcare", "Entertainment", "Education"],
                    ["Rent/Mortgage", "Groceries", "Utilities", "Insurance", "Leisure", "Savings"]
                ],
                "value_range": (200, 2500),
                "y_label": "Monthly spending ($)"
            },
            {
                "template": "The chart below compares the percentage of graduates employed in different sectors in {country} in {year1} and {year2}.",
                "subject_type": "employment",
                "location_type": "countries",
                "categories": [
                    ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail"],
                    ["IT sector", "Banking", "Medical field", "Teaching", "Industry", "Commerce"]
                ],
                "value_range": (5, 35),
                "y_label": "Percentage of graduates (%)"
            }
        ],
        "ranking": [
            {
                "template": "The bar chart below shows the number of international tourists visiting five different cities in {region} in {year}.",
                "subject_type": "tourism",
                "location_type": "regions",
                "categories": [
                    ["Paris", "London", "Rome", "Barcelona", "Amsterdam"],
                    ["Tokyo", "Seoul", "Bangkok", "Singapore", "Hong Kong"],
                    ["New York", "Los Angeles", "Miami", "Las Vegas", "San Francisco"]
                ],
                "value_range": (3, 20),
                "y_label": "Tourists (millions)"
            },
            {
                "template": "The chart illustrates the annual CO2 emissions from five major industrial countries in {year}.",
                "subject_type": "emissions",
                "location_type": "countries",
                "categories": None,
                "value_range": (200, 10000),
                "y_label": "CO2 emissions (million tonnes)"
            }
        ],
        "time_comparison": [
            {
                "template": "The bar chart compares the number of books borrowed from the public library in {city} across four different age groups in {year1} and {year2}.",
                "subject_type": "library_usage",
                "location_type": "cities",
                "categories": [
                    ["Under 18", "18-35", "36-55", "Over 55"],
                    ["Children", "Young adults", "Middle-aged", "Seniors"]
                ],
                "value_range": (1000, 15000),
                "y_label": "Books borrowed"
            },
            {
                "template": "The chart below shows the production of three types of vehicles in {country} in {year1} and {year2}.",
                "subject_type": "manufacturing",
                "location_type": "countries",
                "categories": [
                    ["Sedans", "SUVs", "Electric vehicles"],
                    ["Compact cars", "Family vehicles", "Hybrid models"]
                ],
                "value_range": (50000, 500000),
                "y_label": "Units produced"
            }
        ]
    }
    
    # ============ PIE CHART AUTHENTIC TEMPLATES ============
    PIE_CHART_TEMPLATES = {
        "distribution": [
            {
                "template": "The pie charts below show the distribution of household energy consumption in {city} in {year1} and {year2}.",
                "subject_type": "energy",
                "location_type": "cities",
                "categories": [
                    ["Heating", "Cooling", "Lighting", "Appliances", "Water heating", "Other"],
                    ["Space heating", "Air conditioning", "Electronics", "Kitchen appliances", "Hot water", "Miscellaneous"]
                ],
                "has_comparison": True
            },
            {
                "template": "The chart below illustrates how students at a university in {city} spent their leisure time in {year}.",
                "subject_type": "leisure",
                "location_type": "cities",
                "categories": [
                    ["Social media", "Sports", "Reading", "Gaming", "Socializing", "Other"],
                    ["Online activities", "Physical activities", "Educational pursuits", "Entertainment", "Hobbies", "Rest"]
                ],
                "has_comparison": False
            }
        ],
        "budget": [
            {
                "template": "The pie charts compare the government spending on different sectors in {country} in {year1} and {year2}.",
                "subject_type": "government_spending",
                "location_type": "countries",
                "categories": [
                    ["Education", "Healthcare", "Defence", "Infrastructure", "Social welfare", "Other"],
                    ["Schools", "Hospitals", "Military", "Transport", "Benefits", "Administration"]
                ],
                "has_comparison": True
            },
            {
                "template": "The chart shows how a typical family in {city} allocates their monthly income in {year}.",
                "subject_type": "family_budget",
                "location_type": "cities",
                "categories": [
                    ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Savings"],
                    ["Rent", "Groceries", "Car costs", "Bills", "Leisure", "Investments"]
                ],
                "has_comparison": False
            }
        ]
    }
    
    # ============ TABLE AUTHENTIC TEMPLATES ============
    TABLE_TEMPLATES = {
        "statistics": [
            {
                "template": "The table below shows information about five countries, including their population, GDP per capita, and literacy rate in {year}.",
                "subject_type": "country_stats",
                "location_type": "countries",
                "columns": ["Country", "Population (millions)", "GDP per capita ($)", "Literacy rate (%)"],
                "row_type": "countries"
            },
            {
                "template": "The table provides data about the number of students enrolled in different university courses in {city} over three academic years ({year1}, {year2}, and {year3}).",
                "subject_type": "enrollment",
                "location_type": "cities",
                "columns": ["Course", "Year 1", "Year 2", "Year 3"],
                "row_type": "courses"
            }
        ],
        "comparison": [
            {
                "template": "The table below compares the transport systems in four cities in terms of annual passengers, ticket prices, and network coverage in {year}.",
                "subject_type": "transport_comparison",
                "location_type": "cities",
                "columns": ["City", "Annual passengers (millions)", "Ticket price ($)", "Network length (km)"],
                "row_type": "cities"
            },
            {
                "template": "The table shows the percentage of people using different modes of transport to commute to work in five cities in {year}.",
                "subject_type": "commuting",
                "location_type": "cities",
                "columns": ["City", "Car (%)", "Public transport (%)", "Bicycle (%)", "Walking (%)"],
                "row_type": "cities"
            }
        ]
    }
    
    # ============ PROCESS DIAGRAM AUTHENTIC TEMPLATES ============
    PROCESS_TEMPLATES = {
        "manufacturing": [
            {
                "template": "The diagram below shows the process of producing chocolate from cocoa beans.",
                "subject_type": "chocolate_production",
                "stages": [
                    {"name": "Harvesting", "description": "Cocoa pods are harvested from trees"},
                    {"name": "Fermentation", "description": "Beans are fermented for 5-7 days"},
                    {"name": "Drying", "description": "Fermented beans are sun-dried"},
                    {"name": "Roasting", "description": "Dried beans are roasted at high temperatures"},
                    {"name": "Grinding", "description": "Roasted beans are ground into cocoa liquor"},
                    {"name": "Pressing", "description": "Liquor is pressed to separate cocoa butter"},
                    {"name": "Mixing", "description": "Cocoa powder, butter, and sugar are combined"},
                    {"name": "Conching", "description": "Mixture is refined for smooth texture"},
                    {"name": "Tempering", "description": "Chocolate is heated and cooled precisely"},
                    {"name": "Moulding", "description": "Final product is shaped and packaged"}
                ],
                "is_cyclical": False,
                "has_branching": True
            },
            {
                "template": "The diagram illustrates the stages involved in manufacturing cement.",
                "subject_type": "cement_production",
                "stages": [
                    {"name": "Quarrying", "description": "Limestone and clay are extracted"},
                    {"name": "Crushing", "description": "Raw materials are crushed into small pieces"},
                    {"name": "Grinding", "description": "Crushed materials are ground into powder"},
                    {"name": "Mixing", "description": "Powders are blended in correct proportions"},
                    {"name": "Preheating", "description": "Mixture is heated to remove moisture"},
                    {"name": "Kiln firing", "description": "Material is heated to 1450°C in rotary kiln"},
                    {"name": "Clinker cooling", "description": "Hot clinker is rapidly cooled"},
                    {"name": "Final grinding", "description": "Clinker is ground with gypsum"},
                    {"name": "Storage", "description": "Cement is stored in silos"},
                    {"name": "Packaging", "description": "Final product is bagged or shipped"}
                ],
                "is_cyclical": False,
                "has_branching": False
            }
        ],
        "natural": [
            {
                "template": "The diagram below illustrates the water cycle and how water moves through the environment.",
                "subject_type": "water_cycle",
                "stages": [
                    {"name": "Evaporation", "description": "Water from oceans and lakes turns to vapor"},
                    {"name": "Transpiration", "description": "Plants release water vapor"},
                    {"name": "Condensation", "description": "Water vapor forms clouds"},
                    {"name": "Precipitation", "description": "Rain or snow falls to the ground"},
                    {"name": "Surface runoff", "description": "Water flows into streams and rivers"},
                    {"name": "Infiltration", "description": "Water seeps into the ground"},
                    {"name": "Groundwater flow", "description": "Water moves through underground aquifers"},
                    {"name": "Collection", "description": "Water accumulates in oceans and lakes"}
                ],
                "is_cyclical": True,
                "has_branching": True
            },
            {
                "template": "The diagram shows how silk is produced from silkworms.",
                "subject_type": "silk_production",
                "stages": [
                    {"name": "Egg laying", "description": "Moths lay eggs on mulberry leaves"},
                    {"name": "Hatching", "description": "Larvae emerge after 10 days"},
                    {"name": "Feeding", "description": "Silkworms eat mulberry leaves for 4-6 weeks"},
                    {"name": "Cocoon spinning", "description": "Larvae spin silk cocoons around themselves"},
                    {"name": "Harvesting", "description": "Cocoons are collected before moths emerge"},
                    {"name": "Boiling", "description": "Cocoons are boiled to loosen silk fibers"},
                    {"name": "Reeling", "description": "Single silk threads are unwound from cocoons"},
                    {"name": "Twisting", "description": "Multiple threads are twisted together"},
                    {"name": "Weaving", "description": "Silk threads are woven into fabric"}
                ],
                "is_cyclical": False,
                "has_branching": False
            }
        ],
        "institutional": [
            {
                "template": "The diagram below shows the process of applying for a student visa in {country}.",
                "subject_type": "visa_application",
                "stages": [
                    {"name": "Research", "description": "Check visa requirements and gather documents"},
                    {"name": "Online form", "description": "Complete the online application form"},
                    {"name": "Document preparation", "description": "Prepare supporting documents"},
                    {"name": "Fee payment", "description": "Pay the visa application fee"},
                    {"name": "Biometrics", "description": "Provide fingerprints and photographs"},
                    {"name": "Interview", "description": "Attend visa interview if required"},
                    {"name": "Processing", "description": "Application is reviewed by authorities"},
                    {"name": "Decision", "description": "Visa is approved or rejected"},
                    {"name": "Collection", "description": "Collect passport with visa stamp"}
                ],
                "is_cyclical": False,
                "has_branching": True
            }
        ]
    }
    
    # ============ MAP AUTHENTIC TEMPLATES ============
    MAP_TEMPLATES = {
        "development": [
            {
                "template": "The maps below show the development of a town called Bridgeford in {country} between {year1} and {year2}.",
                "subject_type": "town_development",
                "location_type": "countries",
                "features_before": ["Farmland", "Small village centre", "River", "Forest", "Country road"],
                "features_after": ["Shopping centre", "Residential area", "Industrial zone", "Highway", "Railway station", "Sports complex"]
            },
            {
                "template": "The two maps illustrate changes to a university campus in {city} over a 20-year period ({year1} to {year2}).",
                "subject_type": "campus_development",
                "location_type": "cities",
                "features_before": ["Main building", "Library", "Parking lot", "Sports field", "Cafeteria"],
                "features_after": ["New lecture halls", "Research centre", "Multi-storey car park", "Student accommodation", "Technology hub", "Green spaces"]
            }
        ],
        "planning": [
            {
                "template": "The diagrams show the current layout and proposed changes to a shopping centre in {city}.",
                "subject_type": "shopping_centre",
                "location_type": "cities",
                "features_before": ["Department store", "Food court", "Small shops", "Parking area", "Bus stop"],
                "features_after": ["Cinema complex", "Expanded food court", "Boutique shops", "Underground parking", "Pedestrian plaza", "Green roof"]
            },
            {
                "template": "The maps compare the existing and planned layout of a public park in {city}.",
                "subject_type": "park_redesign",
                "location_type": "cities",
                "features_before": ["Lake", "Walking paths", "Playground", "Open grass area", "Old bridge"],
                "features_after": ["Expanded lake", "Cycling paths", "Modern playground", "Amphitheatre", "New footbridge", "Café", "Botanical garden"]
            }
        ]
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
    
    # ============ BAR CHART GENERATOR ============
    @classmethod
    def generate_bar_chart_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Bar Chart task."""
        
        # Select category
        if topic and topic in cls.BAR_CHART_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.BAR_CHART_TEMPLATES.keys()))
        
        template_config = random.choice(cls.BAR_CHART_TEMPLATES[category])
        
        # Determine complexity
        if band_level == "4.0-5.0":
            num_categories = 4
            num_groups = 1
        elif band_level == "5.5-6.5":
            num_categories = 5
            num_groups = 2
        else:
            num_categories = 6
            num_groups = 2
        
        # Generate years
        year = random.randint(2015, 2023)
        year1 = year - 10
        year2 = year
        
        # Get location
        location_type = template_config.get("location_type", "cities")
        if location_type == "cities":
            location = random.choice(cls.LOCATIONS["cities"])
        elif location_type == "countries":
            location = random.choice(cls.LOCATIONS["countries"])
        else:
            location = random.choice(cls.LOCATIONS["regions"])
        
        # Generate task description
        task_description = template_config["template"].format(
            city=location,
            country=location,
            region=location,
            year=year,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate categories
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            categories = categories_list[:num_categories]
        else:
            categories = random.sample(cls.LOCATIONS["countries"], num_categories)
        
        # Generate data
        value_range = template_config.get("value_range", (10, 100))
        datasets = []
        
        if num_groups == 1:
            values = [round(random.uniform(*value_range), 1) for _ in categories]
            datasets.append({
                "label": str(year),
                "values": values
            })
        else:
            for yr in [year1, year2]:
                values = [round(random.uniform(*value_range), 1) for _ in categories]
                datasets.append({
                    "label": str(yr),
                    "values": values
                })
        
        return {
            "task_description": task_description,
            "title": f"Data for {location} ({year1}-{year2})" if num_groups > 1 else f"Data for {location} ({year})",
            "x_label": "Category",
            "y_label": template_config.get("y_label", "Value"),
            "categories": categories,
            "datasets": datasets,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_categories": num_categories,
                "num_groups": num_groups
            },
            "metadata": {
                "chart_type": "bar_chart",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ PIE CHART GENERATOR ============
    @classmethod
    def generate_pie_chart_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Pie Chart task."""
        
        if topic and topic in cls.PIE_CHART_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.PIE_CHART_TEMPLATES.keys()))
        
        template_config = random.choice(cls.PIE_CHART_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_segments = 4
            has_comparison = False
        elif band_level == "5.5-6.5":
            num_segments = 5
            has_comparison = template_config.get("has_comparison", False)
        else:
            num_segments = 6
            has_comparison = True
        
        year = random.randint(2015, 2023)
        year1 = year - 10
        year2 = year
        
        location_type = template_config.get("location_type", "cities")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year=year,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Generate segments
        if template_config.get("categories"):
            categories_list = random.choice(template_config["categories"])
            segments = categories_list[:num_segments]
        else:
            segments = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F"][:num_segments]
        
        # Generate percentages that sum to 100
        def generate_percentages(n):
            values = [random.randint(5, 40) for _ in range(n)]
            total = sum(values)
            return [round(v * 100 / total, 1) for v in values]
        
        datasets = []
        if has_comparison:
            datasets.append({
                "label": str(year1),
                "values": generate_percentages(num_segments)
            })
            datasets.append({
                "label": str(year2),
                "values": generate_percentages(num_segments)
            })
        else:
            datasets.append({
                "label": str(year),
                "values": generate_percentages(num_segments)
            })
        
        return {
            "task_description": task_description,
            "title": f"Distribution in {location}" + (f" ({year1} vs {year2})" if has_comparison else f" ({year})"),
            "segments": segments,
            "datasets": datasets,
            "has_comparison": has_comparison,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_segments": num_segments
            },
            "metadata": {
                "chart_type": "pie_chart",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ TABLE GENERATOR ============
    @classmethod
    def generate_table_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Table task."""
        
        if topic and topic in cls.TABLE_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.TABLE_TEMPLATES.keys()))
        
        template_config = random.choice(cls.TABLE_TEMPLATES[category])
        
        # Complexity
        if band_level == "4.0-5.0":
            num_rows = 4
        elif band_level == "5.5-6.5":
            num_rows = 5
        else:
            num_rows = 6
        
        year = random.randint(2018, 2023)
        year1 = year - 2
        year2 = year - 1
        year3 = year
        
        location_type = template_config.get("location_type", "cities")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year=year,
            year1=year1,
            year2=year2,
            year3=year3
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        columns = template_config.get("columns", ["Category", "Value 1", "Value 2", "Value 3"])
        row_type = template_config.get("row_type", "categories")
        
        # Generate row labels
        if row_type == "countries":
            row_labels = random.sample(cls.LOCATIONS["countries"], num_rows)
        elif row_type == "cities":
            row_labels = random.sample(cls.LOCATIONS["cities"], num_rows)
        elif row_type == "courses":
            row_labels = random.sample(["Business", "Engineering", "Medicine", "Law", "Arts", "Science", "IT", "Education"], num_rows)
        else:
            row_labels = [f"Item {i+1}" for i in range(num_rows)]
        
        # Generate data
        rows = []
        for label in row_labels:
            row_data = [label]
            for col in columns[1:]:  # Skip first column (label)
                if "%" in col:
                    row_data.append(round(random.uniform(5, 95), 1))
                elif "million" in col.lower():
                    row_data.append(round(random.uniform(1, 50), 1))
                elif "$" in col:
                    row_data.append(round(random.uniform(100, 50000), 0))
                else:
                    row_data.append(round(random.uniform(10, 1000), 0))
            rows.append(row_data)
        
        return {
            "task_description": task_description,
            "title": f"Data for {location} ({year})",
            "columns": columns,
            "rows": rows,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_rows": num_rows,
                "num_columns": len(columns)
            },
            "metadata": {
                "chart_type": "table",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ PROCESS DIAGRAM GENERATOR ============
    @classmethod
    def generate_process_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Process Diagram task."""
        
        if topic and topic in cls.PROCESS_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.PROCESS_TEMPLATES.keys()))
        
        template_config = random.choice(cls.PROCESS_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_stages = 6
        elif band_level == "5.5-6.5":
            num_stages = 8
        else:
            num_stages = 10
        
        location = random.choice(cls.LOCATIONS["countries"])
        
        task_description = template_config["template"].format(country=location)
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        # Get stages
        stages = template_config.get("stages", [])[:num_stages]
        
        return {
            "task_description": task_description,
            "title": template_config["subject_type"].replace("_", " ").title(),
            "stages": stages,
            "is_cyclical": template_config.get("is_cyclical", False),
            "has_branching": template_config.get("has_branching", False),
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "num_stages": len(stages)
            },
            "metadata": {
                "chart_type": "process",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }
    
    # ============ MAP GENERATOR ============
    @classmethod
    def generate_map_task(cls, topic: str = None, band_level: str = "5.5-6.5") -> Dict[str, Any]:
        """Generate a complete, authentic Map Comparison task."""
        
        if topic and topic in cls.MAP_TEMPLATES:
            category = topic
        else:
            category = random.choice(list(cls.MAP_TEMPLATES.keys()))
        
        template_config = random.choice(cls.MAP_TEMPLATES[category])
        
        # Complexity based on band
        if band_level == "4.0-5.0":
            num_features_before = 4
            num_features_after = 5
        elif band_level == "5.5-6.5":
            num_features_before = 5
            num_features_after = 6
        else:
            num_features_before = 5
            num_features_after = 7
        
        year1 = random.randint(1990, 2005)
        year2 = year1 + random.randint(15, 25)
        
        location_type = template_config.get("location_type", "countries")
        location = random.choice(cls.LOCATIONS[location_type])
        
        task_description = template_config["template"].format(
            city=location,
            country=location,
            year1=year1,
            year2=year2
        )
        task_description += "\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."
        
        features_before = template_config.get("features_before", [])[:num_features_before]
        features_after = template_config.get("features_after", [])[:num_features_after]
        
        return {
            "task_description": task_description,
            "title": f"Development in {location} ({year1}-{year2})",
            "year_before": year1,
            "year_after": year2,
            "features_before": features_before,
            "features_after": features_after,
            "band_calibration": {
                "target_band": band_level,
                "complexity": "simple" if band_level == "4.0-5.0" else "intermediate" if band_level == "5.5-6.5" else "complex",
                "time_span": f"{year2 - year1} years"
            },
            "metadata": {
                "chart_type": "map",
                "category": category,
                "subject_type": template_config["subject_type"]
            }
        }


# Create singleton instance
authentic_task_generator = AuthenticTaskGenerator()
