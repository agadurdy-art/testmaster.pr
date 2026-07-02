"""
IELTS Writing Task 1 authentic task template data (locations, line graph /
bar chart / pie chart / table / process diagram / map templates, trend
patterns, time periods). Extracted from services/authentic_task_generator.py
(Faz 1 refactor, 2026-07-02). DATA ONLY.
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
