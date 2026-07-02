"""
IELTS Writing Task 1 - Realistic Data Generators
================================================
IELTSDataGenerator: synthesises realistic IELTS Task 1 datasets.
Split out of services/chart_generator.py (Faz 1 refactor, 2026-07-02).
"""

import json
import random
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import math


class IELTSDataGenerator:
    """Generate realistic IELTS Task 1 datasets with authentic data."""
    
    # Real country names by region
    COUNTRIES = {
        "europe": ["UK", "Germany", "France", "Italy", "Spain", "Netherlands", "Sweden", "Poland"],
        "asia": ["China", "Japan", "South Korea", "India", "Singapore", "Thailand", "Vietnam", "Indonesia"],
        "americas": ["USA", "Canada", "Brazil", "Mexico", "Argentina", "Chile"],
        "oceania": ["Australia", "New Zealand"],
        "middle_east": ["UAE", "Saudi Arabia", "Qatar", "Turkey"]
    }
    
    # Realistic topic-specific data templates
    TOPIC_TEMPLATES = {
        "education": {
            "line_titles": [
                "University Enrollment Rates in Selected Countries ({years})",
                "Percentage of Population with Higher Education ({years})",
                "Government Spending on Education as % of GDP ({years})",
                "Student-Teacher Ratios in Primary Schools ({years})",
                "Literacy Rates Among Adults Aged 15+ ({years})"
            ],
            "bar_titles": [
                "Educational Attainment by Country ({year})",
                "Average Years of Schooling by Country ({year})",
                "PISA Test Scores by Country ({year})",
                "Percentage of GDP Spent on Education ({year})"
            ],
            "pie_titles": [
                "Distribution of University Students by Field of Study ({year})",
                "Education Funding Sources ({year})",
                "Types of Higher Education Institutions ({year})"
            ],
            "y_labels": ["Percentage (%)", "Years", "Score", "Ratio", "Million students"],
            "pie_categories": [
                ["Engineering", "Business", "Medicine", "Arts & Humanities", "Sciences", "Law"],
                ["Government Funding", "Tuition Fees", "Private Donations", "Research Grants", "Other"],
                ["Public Universities", "Private Universities", "Vocational Schools", "Community Colleges"]
            ]
        },
        "health": {
            "line_titles": [
                "Life Expectancy at Birth ({years})",
                "Healthcare Expenditure as % of GDP ({years})",
                "Number of Doctors per 1,000 People ({years})",
                "Infant Mortality Rate per 1,000 Live Births ({years})",
                "Obesity Rates Among Adults ({years})"
            ],
            "bar_titles": [
                "Healthcare Spending per Capita by Country ({year})",
                "Hospital Beds per 1,000 Population ({year})",
                "Vaccination Coverage Rates ({year})",
                "Mental Health Service Availability ({year})"
            ],
            "pie_titles": [
                "Causes of Death in Developed Countries ({year})",
                "Healthcare Budget Allocation ({year})",
                "Types of Medical Treatments ({year})"
            ],
            "y_labels": ["Years", "Percentage (%)", "Per 1,000 people", "USD", "Rate"],
            "pie_categories": [
                ["Heart Disease", "Cancer", "Respiratory Diseases", "Accidents", "Diabetes", "Other"],
                ["Hospitals", "Primary Care", "Medications", "Mental Health", "Research", "Administration"],
                ["Surgery", "Medication", "Therapy", "Preventive Care", "Emergency Care"]
            ]
        },
        "technology": {
            "line_titles": [
                "Internet Penetration Rates ({years})",
                "Smartphone Users as % of Population ({years})",
                "E-commerce Sales Growth ({years})",
                "Investment in Artificial Intelligence ({years})",
                "Renewable Energy Adoption Rates ({years})"
            ],
            "bar_titles": [
                "5G Network Coverage by Country ({year})",
                "Number of Tech Startups per Million People ({year})",
                "R&D Spending as % of GDP ({year})",
                "Digital Payment Adoption Rates ({year})"
            ],
            "pie_titles": [
                "Global Smartphone Market Share by Brand ({year})",
                "Internet Usage by Activity Type ({year})",
                "Cloud Computing Market Distribution ({year})"
            ],
            "y_labels": ["Percentage (%)", "Billion USD", "Million users", "Index score"],
            "pie_categories": [
                ["Apple", "Samsung", "Xiaomi", "Oppo", "Huawei", "Others"],
                ["Social Media", "Video Streaming", "Online Shopping", "Gaming", "Work/Study", "Other"],
                ["Amazon AWS", "Microsoft Azure", "Google Cloud", "Alibaba Cloud", "Others"]
            ]
        },
        "environment": {
            "line_titles": [
                "CO2 Emissions per Capita ({years})",
                "Renewable Energy Share of Total Energy ({years})",
                "Forest Coverage as % of Land Area ({years})",
                "Air Quality Index in Major Cities ({years})",
                "Plastic Waste Generation ({years})"
            ],
            "bar_titles": [
                "Carbon Footprint by Country ({year})",
                "Recycling Rates by Country ({year})",
                "Electric Vehicle Adoption Rates ({year})",
                "Protected Natural Areas as % of Land ({year})"
            ],
            "pie_titles": [
                "Global Energy Sources ({year})",
                "Sources of Greenhouse Gas Emissions ({year})",
                "Waste Composition in Urban Areas ({year})"
            ],
            "y_labels": ["Tonnes per capita", "Percentage (%)", "Million tonnes", "Index"],
            "pie_categories": [
                ["Oil", "Natural Gas", "Coal", "Nuclear", "Renewables", "Hydroelectric"],
                ["Transportation", "Industry", "Electricity", "Agriculture", "Buildings", "Other"],
                ["Organic", "Paper", "Plastic", "Glass", "Metal", "Other"]
            ]
        },
        "economy": {
            "line_titles": [
                "GDP Growth Rate ({years})",
                "Unemployment Rate ({years})",
                "Inflation Rate ({years})",
                "Foreign Direct Investment Inflows ({years})",
                "Trade Balance as % of GDP ({years})"
            ],
            "bar_titles": [
                "GDP per Capita by Country ({year})",
                "Average Annual Salary by Country ({year})",
                "Cost of Living Index ({year})",
                "Employment Rate by Country ({year})"
            ],
            "pie_titles": [
                "GDP Composition by Sector ({year})",
                "Government Budget Allocation ({year})",
                "Export Composition by Category ({year})"
            ],
            "y_labels": ["Percentage (%)", "USD", "Billion USD", "Index"],
            "pie_categories": [
                ["Services", "Manufacturing", "Agriculture", "Construction", "Mining"],
                ["Healthcare", "Education", "Defense", "Infrastructure", "Social Welfare", "Other"],
                ["Machinery", "Electronics", "Vehicles", "Chemicals", "Food Products", "Other"]
            ]
        },
        "society": {
            "line_titles": [
                "Urban Population as % of Total ({years})",
                "Average Household Size ({years})",
                "Marriage Rate per 1,000 People ({years})",
                "Birth Rate per 1,000 People ({years})",
                "Immigration Rate ({years})"
            ],
            "bar_titles": [
                "Population Density by Country ({year})",
                "Average Age of Population ({year})",
                "Gender Pay Gap by Country ({year})",
                "Poverty Rate by Country ({year})"
            ],
            "pie_titles": [
                "Population Distribution by Age Group ({year})",
                "Household Types ({year})",
                "Employment by Sector ({year})"
            ],
            "y_labels": ["Percentage (%)", "People per km²", "Years", "Rate"],
            "pie_categories": [
                ["0-14 years", "15-24 years", "25-54 years", "55-64 years", "65+ years"],
                ["Single Person", "Couple no Children", "Nuclear Family", "Extended Family", "Other"],
                ["Services", "Industry", "Agriculture", "Government", "Self-employed"]
            ]
        }
    }
    
    @staticmethod
    def get_random_countries(count: int, diverse: bool = True) -> List[str]:
        """Get random country names."""
        if diverse:
            # Get countries from different regions
            all_countries = []
            regions = list(IELTSDataGenerator.COUNTRIES.keys())
            random.shuffle(regions)
            for region in regions:
                countries = IELTSDataGenerator.COUNTRIES[region]
                all_countries.extend(random.sample(countries, min(2, len(countries))))
            random.shuffle(all_countries)
            return all_countries[:count]
        else:
            all_countries = []
            for countries in IELTSDataGenerator.COUNTRIES.values():
                all_countries.extend(countries)
            return random.sample(all_countries, min(count, len(all_countries)))
    
    @staticmethod
    def generate_realistic_trend(base: float, length: int, trend_type: str, volatility: float = 0.1) -> List[float]:
        """Generate realistic data trend."""
        values = [base]
        for i in range(1, length):
            if trend_type == "increasing":
                change = base * random.uniform(0.02, 0.08)
            elif trend_type == "decreasing":
                change = -base * random.uniform(0.02, 0.06)
            elif trend_type == "stable":
                change = base * random.uniform(-0.02, 0.02)
            elif trend_type == "fluctuating":
                change = base * random.uniform(-0.08, 0.08)
            else:  # peak_then_decline or other
                if i < length // 2:
                    change = base * random.uniform(0.03, 0.07)
                else:
                    change = -base * random.uniform(0.02, 0.05)
            
            noise = base * volatility * random.uniform(-1, 1)
            new_val = values[-1] + change + noise
            values.append(round(max(5, new_val), 1))
        
        return values
    
    @staticmethod
    def generate_line_graph_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic line graph data."""
        topic_key = topic if topic in IELTSDataGenerator.TOPIC_TEMPLATES else "education"
        templates = IELTSDataGenerator.TOPIC_TEMPLATES[topic_key]
        
        # Years based on band level
        if band_level == "4.0-5.0":
            years = ["2018", "2019", "2020", "2021", "2022"]
            num_lines = 2
        elif band_level == "5.5-6.5":
            years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023"]
            num_lines = 3
        else:
            years = ["2010", "2012", "2014", "2016", "2018", "2020", "2022", "2024"]
            num_lines = 4
        
        # Select countries
        countries = IELTSDataGenerator.get_random_countries(num_lines)
        
        # Select title and y_label
        title_template = random.choice(templates["line_titles"])
        title = title_template.format(years=f"{years[0]}-{years[-1]}")
        y_label = random.choice(templates["y_labels"])
        
        # Generate realistic datasets
        datasets = []
        trends = ["increasing", "decreasing", "stable", "fluctuating", "peak_then_decline"]
        used_trends = random.sample(trends, min(num_lines, len(trends)))
        
        for i, country in enumerate(countries):
            trend = used_trends[i % len(used_trends)]
            
            # Set realistic base values based on y_label
            if "Percentage" in y_label:
                base = random.uniform(30, 80)
            elif "Years" in y_label:
                base = random.uniform(70, 85)
            elif "USD" in y_label or "Billion" in y_label:
                base = random.uniform(100, 500)
            else:
                base = random.uniform(20, 60)
            
            values = IELTSDataGenerator.generate_realistic_trend(base, len(years), trend)
            datasets.append({
                "label": country,
                "values": values
            })
        
        return {
            "title": title,
            "x_label": "Year",
            "y_label": y_label,
            "x_values": years,
            "datasets": datasets
        }
    
    @staticmethod
    def generate_bar_chart_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic bar chart data."""
        topic_key = topic if topic in IELTSDataGenerator.TOPIC_TEMPLATES else "education"
        templates = IELTSDataGenerator.TOPIC_TEMPLATES[topic_key]
        
        if band_level == "4.0-5.0":
            num_countries = 4
            num_years = 1
        elif band_level == "5.5-6.5":
            num_countries = 5
            num_years = 2
        else:
            num_countries = 6
            num_years = 3
        
        countries = IELTSDataGenerator.get_random_countries(num_countries)
        years = ["2010", "2015", "2020", "2024"][:num_years]
        
        title_template = random.choice(templates["bar_titles"])
        title = title_template.format(year=years[-1] if num_years == 1 else f"{years[0]}-{years[-1]}")
        y_label = random.choice(templates["y_labels"])
        
        datasets = []
        for year in years:
            values = []
            for _ in countries:
                if "Percentage" in y_label:
                    val = random.uniform(20, 90)
                elif "USD" in y_label:
                    val = random.uniform(5000, 80000)
                elif "Years" in y_label:
                    val = random.uniform(10, 18)
                else:
                    val = random.uniform(30, 95)
                values.append(round(val, 1))
            datasets.append({"label": year, "values": values})
        
        return {
            "title": title,
            "x_label": "Country",
            "y_label": y_label,
            "categories": countries,
            "datasets": datasets
        }
    
    @staticmethod
    def generate_pie_chart_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic pie chart data."""
        topic_key = topic if topic in IELTSDataGenerator.TOPIC_TEMPLATES else "education"
        templates = IELTSDataGenerator.TOPIC_TEMPLATES[topic_key]
        
        if band_level == "4.0-5.0":
            num_slices = 4
        elif band_level == "5.5-6.5":
            num_slices = 5
        else:
            num_slices = 6
        
        # Select categories and title
        categories_list = random.choice(templates["pie_categories"])
        categories = categories_list[:num_slices]
        
        title_template = random.choice(templates["pie_titles"])
        title = title_template.format(year="2023")
        
        # Generate realistic percentages that sum to 100
        values = []
        remaining = 100
        for i in range(num_slices - 1):
            if i == 0:
                # First category often largest
                max_val = min(45, remaining - (num_slices - i - 1) * 5)
                val = random.randint(25, max_val)
            else:
                max_val = remaining - (num_slices - i - 1) * 5
                min_val = max(5, remaining // (num_slices - i + 1) - 10)
                val = random.randint(min_val, max(min_val, min(30, max_val)))
            values.append(val)
            remaining -= val
        values.append(remaining)
        
        # Sort by value descending for better visualization
        data = [{"label": categories[i], "value": values[i]} for i in range(num_slices)]
        data.sort(key=lambda x: x["value"], reverse=True)
        
        return {
            "title": title,
            "data": data
        }
    
    @staticmethod
    def generate_table_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic table data."""
        topic_key = topic if topic in IELTSDataGenerator.TOPIC_TEMPLATES else "education"
        
        if band_level == "4.0-5.0":
            num_rows = 4
            num_cols = 3
        elif band_level == "5.5-6.5":
            num_rows = 5
            num_cols = 4
        else:
            num_rows = 6
            num_cols = 5
        
        countries = IELTSDataGenerator.get_random_countries(num_rows)
        years = ["2015", "2018", "2020", "2022", "2024"][:num_cols - 1]
        
        headers = ["Country"] + years
        rows = []
        
        for country in countries:
            row = [country]
            base = random.uniform(40, 75)
            for i in range(len(years)):
                change = random.uniform(-3, 5)
                val = round(base + i * 2 + change, 1)
                row.append(f"{val}%")
            rows.append(row)
        
        title_template = random.choice(IELTSDataGenerator.TOPIC_TEMPLATES[topic_key]["line_titles"])
        title = title_template.format(years=f"{years[0]}-{years[-1]}")
        
        return {
            "title": title,
            "headers": headers,
            "rows": rows
        }
    
    @staticmethod
    def generate_process_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic process diagram data."""
        processes = {
            "education": {
                "title": "The Process of University Application",
                "steps": [
                    {"label": "Step 1", "description": "Research universities and programs"},
                    {"label": "Step 2", "description": "Prepare application documents"},
                    {"label": "Step 3", "description": "Submit online application"},
                    {"label": "Step 4", "description": "Take entrance exams"},
                    {"label": "Step 5", "description": "Attend interview"},
                    {"label": "Step 6", "description": "Receive offer letter"},
                ]
            },
            "environment": {
                "title": "The Water Treatment Process",
                "steps": [
                    {"label": "Collection", "description": "Water collected from source"},
                    {"label": "Screening", "description": "Large debris removed"},
                    {"label": "Coagulation", "description": "Chemicals added to bind particles"},
                    {"label": "Filtration", "description": "Water passes through filters"},
                    {"label": "Disinfection", "description": "Chlorine kills bacteria"},
                    {"label": "Distribution", "description": "Clean water supplied to homes"},
                ]
            },
            "technology": {
                "title": "The Software Development Lifecycle",
                "steps": [
                    {"label": "Planning", "description": "Define requirements and scope"},
                    {"label": "Design", "description": "Create system architecture"},
                    {"label": "Development", "description": "Write and review code"},
                    {"label": "Testing", "description": "Identify and fix bugs"},
                    {"label": "Deployment", "description": "Release to production"},
                    {"label": "Maintenance", "description": "Monitor and update"},
                ]
            },
            "health": {
                "title": "The Process of Clinical Drug Trials",
                "steps": [
                    {"label": "Discovery", "description": "Identify potential drug compound"},
                    {"label": "Pre-clinical", "description": "Laboratory and animal testing"},
                    {"label": "Phase I", "description": "Small group safety trial"},
                    {"label": "Phase II", "description": "Larger efficacy trial"},
                    {"label": "Phase III", "description": "Large-scale trials"},
                    {"label": "Approval", "description": "Regulatory review and approval"},
                ]
            },
            "economy": {
                "title": "The Manufacturing Production Process",
                "steps": [
                    {"label": "Raw Materials", "description": "Source and procure materials"},
                    {"label": "Processing", "description": "Transform raw materials"},
                    {"label": "Assembly", "description": "Combine components"},
                    {"label": "Quality Check", "description": "Inspect for defects"},
                    {"label": "Packaging", "description": "Prepare for shipping"},
                    {"label": "Distribution", "description": "Ship to retailers"},
                ]
            }
        }
        
        topic_key = topic if topic in processes else "education"
        process = processes[topic_key]
        
        if band_level == "4.0-5.0":
            steps = process["steps"][:4]
        elif band_level == "5.5-6.5":
            steps = process["steps"][:5]
        else:
            steps = process["steps"]
        
        return {
            "title": process["title"],
            "steps": steps
        }
    
    @staticmethod
    def generate_map_data(topic: str, band_level: str) -> Dict[str, Any]:
        """Generate realistic map comparison data."""
        maps = {
            "default": {
                "title": "Changes to Riverside Town Center (2000-2020)",
                "before": [
                    {"type": "building", "x": 50, "y": 50, "label": "Old Factory"},
                    {"type": "area", "x": 150, "y": 40, "width": 100, "height": 70, "label": "Farmland", "fill": "#86efac"},
                    {"type": "building", "x": 280, "y": 60, "label": "Houses"},
                    {"type": "road", "x1": 20, "y1": 180, "x2": 350, "y2": 180},
                    {"type": "area", "x": 100, "y": 200, "width": 80, "height": 50, "label": "Park", "fill": "#86efac"},
                    {"type": "building", "x": 220, "y": 210, "label": "School"},
                ],
                "after": [
                    {"type": "building", "x": 50, "y": 50, "label": "Shopping Mall"},
                    {"type": "building", "x": 150, "y": 40, "label": "Apartments"},
                    {"type": "building", "x": 250, "y": 40, "label": "Office Tower"},
                    {"type": "building", "x": 280, "y": 100, "label": "Car Park"},
                    {"type": "road", "x1": 20, "y1": 180, "x2": 350, "y2": 180},
                    {"type": "road", "x1": 175, "y1": 140, "x2": 175, "y2": 220},
                    {"type": "area", "x": 50, "y": 200, "width": 60, "height": 40, "label": "Park", "fill": "#86efac"},
                    {"type": "building", "x": 250, "y": 200, "label": "Hospital"},
                    {"type": "circle", "x": 175, "y": 180, "radius": 15, "label": "Roundabout", "fill": "#d1d5db"},
                ]
            }
        }
        
        map_data = maps["default"]
        return {
            "title": map_data["title"],
            "before": map_data["before"],
            "after": map_data["after"]
        }



# Singleton instance (historically exposed via services.chart_generator)
data_generator = IELTSDataGenerator()
