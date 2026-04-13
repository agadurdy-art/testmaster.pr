"""
IELTS General Training Reading - Advanced Level (Band 7.0-9.0)
=============================================================
Strategic reading content for Advanced Mastery Course - General Training Track.

Content Types:
- Professional documents (policies, contracts, regulations)
- Workplace communications
- Official notices and guidelines
- Complex forms and applications

Skill Categories:
1. Main Idea & Global Understanding
2. Factual Detail Retrieval  
3. Writer's Intention & Purpose
4. Inference & Implication
5. Conditions & Exceptions

Question Types (Band 7.0-9.0):
- Inference questions
- Purpose questions
- Exception/condition questions
- Complex matching
"""

from typing import Dict, List, Any

# =============================================================================
# ADVANCED GENERAL TRAINING READING - MODULE-SPECIFIC CONTENT
# =============================================================================

ADVANCED_GENERAL_READING: Dict[str, Dict[str, Any]] = {
    
    # =========================================================================
    # MODULE 1: DIGITAL FRONTIER - TECHNOLOGY POLICIES
    # =========================================================================
    "digital_frontier": {
        "module_id": "digital_frontier",
        "module_title": "The Digital Frontier: AI, Automation, and the Future of Work",
        "track": "general",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding technical policy documents and digital service agreements",
        "learning_outcome": "After this reading, you will be able to interpret data protection policies, understand your rights in digital services, and identify key compliance requirements.",
        
        "reading_scenario": {
            "title": "Automated Decision-Making Disclosure",
            "text_type": "Corporate Policy Document",
            "context": "You are applying for a job at a large technology company and reviewing their automated hiring disclosure.",
            "word_count": 680,
            
            "passage": """TECHVISION GLOBAL PLC
AUTOMATED DECISION-MAKING DISCLOSURE
Effective Date: 1 March 2024

PURPOSE AND SCOPE

This disclosure explains how TechVision Global uses automated systems in our recruitment processes, in compliance with the EU AI Act (Regulation 2024/1689) and UK Data Protection legislation. This document applies to all applications for employment, contractor positions, and internships.

AUTOMATED SYSTEMS IN USE

1. Resume Screening System ("TalentMatch AI")
Our initial application review employs TalentMatch AI to evaluate qualifications against job requirements. The system analyzes:
- Educational qualifications and relevance to the role
- Professional experience duration and industry alignment
- Skills matching against mandatory and preferred criteria
- Work authorization status verification

The system produces a suitability score between 0-100. Applications scoring below 40 are automatically rejected without human review. Applications scoring 40-70 receive expedited human review. Applications scoring above 70 proceed directly to hiring manager consideration.

2. Video Interview Analysis (Optional)
Candidates may opt into AI-assisted video interview analysis. If selected, this system evaluates:
- Response relevance and coherence
- Professional communication indicators
- Technical knowledge demonstration

Important: Video interview AI does NOT analyze facial expressions, emotional states, accent, or demographic characteristics. Opting out of AI analysis does not affect your candidacy—all video interviews are also reviewed by human recruiters.

3. Background Verification Automation
Automated systems verify educational credentials, professional licenses, and employment history against third-party databases. Discrepancies trigger human review rather than automatic disqualification.

YOUR RIGHTS

Under applicable legislation, you have the right to:

a) Request Human Review: You may request human review of any automated decision affecting your application by emailing recruitment.appeals@techvision.com within 14 days of receiving notification.

b) Access Information: You may request the specific factors that contributed to any automated assessment. We will provide this information within 30 days.

c) Provide Additional Context: If automated screening does not capture relevant qualifications, you may submit a supplementary statement (maximum 500 words) explaining circumstances the system may not recognize.

d) Opt Out of Non-Essential Automation: You may opt out of video interview AI analysis without penalty. Essential automation (resume screening, background verification) cannot be bypassed as these ensure consistent, fair evaluation of all candidates.

LIMITATIONS AND HUMAN OVERSIGHT

Automated systems make recommendations, not final decisions, in the following areas:
- Salary determination
- Interview scheduling beyond initial screening
- Final hiring decisions

All automated screening incorporates bias testing conducted quarterly by external auditors. The most recent audit (December 2023) found no statistically significant disparate impact across protected characteristics.

DATA RETENTION

Application data processed by automated systems is retained for:
- Successful candidates: Duration of employment plus 7 years
- Unsuccessful candidates: 24 months from final decision
- Withdrawn applications: 12 months from withdrawal date

You may request data deletion after the minimum retention period by contacting privacy@techvision.com.

CONTACT AND COMPLAINTS

For questions about automated processing: recruitment.tech@techvision.com
For complaints or concerns: data.protection.officer@techvision.com
External oversight: Information Commissioner's Office (UK) or relevant EU supervisory authority

This disclosure will be updated to reflect changes in our automated systems or applicable regulations. The current version is always available at careers.techvision.com/ai-disclosure.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "According to the document, what happens to applications that score between 40 and 70 on the TalentMatch AI system?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) They are automatically rejected",
                        "B) They receive expedited human review",
                        "C) They proceed directly to hiring manager consideration",
                        "D) They are placed on a waiting list"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'Applications scoring 40-70 receive expedited human review.'"
                },
                {
                    "id": "q2",
                    "question": "Which of the following is NOT analyzed by the video interview AI system?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Response relevance",
                        "B) Professional communication indicators",
                        "C) Facial expressions and emotional states",
                        "D) Technical knowledge demonstration"
                    ],
                    "answer": "C",
                    "explanation": "The document explicitly states the system 'does NOT analyze facial expressions, emotional states, accent, or demographic characteristics.'"
                },
                {
                    "id": "q3",
                    "question": "What is the time limit for requesting human review of an automated decision?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) 7 days",
                        "B) 14 days",
                        "C) 30 days",
                        "D) 24 months"
                    ],
                    "answer": "B",
                    "explanation": "The document states requests must be made 'within 14 days of receiving notification.'"
                },
                {
                    "id": "q4",
                    "question": "What can be inferred about why the company mentions quarterly bias testing?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) The company is required to do so by law",
                        "B) The company wants to demonstrate commitment to fair, non-discriminatory hiring",
                        "C) Bias testing is inexpensive and easy to conduct",
                        "D) External auditors insisted on being mentioned"
                    ],
                    "answer": "B",
                    "explanation": "The bias testing information, combined with the disclosure of 'no statistically significant disparate impact,' demonstrates the company's commitment to fair evaluation."
                },
                {
                    "id": "q5",
                    "question": "Which type of automation can applicants NOT opt out of?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) Video interview AI analysis",
                        "B) Resume screening and background verification",
                        "C) All automated systems",
                        "D) Salary determination automation"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'Essential automation (resume screening, background verification) cannot be bypassed.'"
                },
                {
                    "id": "q6",
                    "question": "How long is application data retained for unsuccessful candidates?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) 12 months",
                        "B) 24 months",
                        "C) 7 years",
                        "D) Duration of employment"
                    ],
                    "answer": "B",
                    "explanation": "The data retention section specifies: 'Unsuccessful candidates: 24 months from final decision.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "disparate impact", "meaning": "unintentional discrimination affecting a protected group disproportionately", "context": "no statistically significant disparate impact"},
                {"term": "opt out", "meaning": "choose not to participate in something", "context": "opt out of AI analysis"},
                {"term": "retention period", "meaning": "length of time data is kept", "context": "minimum retention period"},
                {"term": "compliance", "meaning": "acting in accordance with rules or regulations", "context": "in compliance with"},
                {"term": "expedited", "meaning": "faster than normal process", "context": "expedited human review"}
            ],
            
            "reading_tips": [
                "In policy documents, look for sections with specific numbers (scores, time periods, percentages)",
                "Pay attention to words like 'NOT,' 'cannot,' 'must'—they indicate requirements or prohibitions",
                "Contact information sections often reveal complaint procedures and escalation paths"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 2: GREEN IMPERATIVE - ENVIRONMENTAL REGULATIONS
    # =========================================================================
    "green_imperative": {
        "module_id": "green_imperative",
        "module_title": "The Green Imperative: Climate, Sustainability, and Ecological Balance",
        "track": "general",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding environmental regulations and sustainability policies",
        "learning_outcome": "After this reading, you will be able to interpret environmental compliance documents, understand sustainability reporting requirements, and identify obligations.",
        
        "reading_scenario": {
            "title": "Workplace Sustainability Guidelines",
            "text_type": "Corporate Environmental Policy",
            "context": "You are a new employee at a manufacturing company reviewing their sustainability requirements.",
            "word_count": 650,
            
            "passage": """GREENFIELD MANUFACTURING LTD
SUSTAINABILITY AND ENVIRONMENTAL COMPLIANCE POLICY
Version 4.2 | Last Updated: January 2024

POLICY OVERVIEW

Greenfield Manufacturing is committed to environmental stewardship and regulatory compliance across all operations. This policy outlines mandatory requirements for all employees, contractors, and visitors at our facilities.

WASTE MANAGEMENT REQUIREMENTS

General Waste Segregation (All Staff)
All personnel must segregate waste according to the colour-coded bin system:
- GREEN bins: Recyclable materials (paper, cardboard, clean plastics)
- BLUE bins: General waste (non-recyclable, non-hazardous)
- RED bins: Hazardous materials (chemicals, batteries, fluorescent tubes) — AUTHORISED PERSONNEL ONLY

Hazardous Materials Protocol
Only staff who have completed the Hazardous Materials Handling certification (minimum Level 2) may dispose of items in red bins. Certification must be renewed annually. Non-certified staff discovering hazardous materials must report to their supervisor immediately—DO NOT attempt disposal.

Penalties: Improper waste disposal may result in disciplinary action and, in cases of environmental contamination, personal liability under the Environmental Protection Act 1990.

ENERGY CONSERVATION

Mandatory Practices:
- Switch off lights, monitors, and non-essential equipment when leaving workspaces
- Report malfunctioning HVAC systems within 24 hours via the facilities helpdesk
- Use natural lighting where possible—blinds should remain open during daylight hours unless screen glare is an issue

Optional Programmes:
- Cycle-to-work scheme (salary sacrifice bicycle purchase—see HR for details)
- Electric vehicle charging available in Car Park B (first-come, first-served; £0.15/kWh)
- Carbon offset programme for business travel (voluntary payroll contribution)

Target: Greenfield aims to reduce per-unit energy consumption by 15% by 2026 compared to 2023 baseline. Progress is reported quarterly in the staff newsletter.

WATER CONSERVATION

Production Areas:
Water recycling systems are installed in all wet processing areas. Staff operating these systems must complete online training module WC-101 before starting work. Report any leaks, regardless of size, via the maintenance portal.

Office Areas:
- Dual-flush toilets: use appropriate flush level
- Report dripping taps immediately
- Kitchen areas: dishwashers should only run when fully loaded

SUPPLIER REQUIREMENTS

All suppliers must demonstrate:
- ISO 14001 certification or equivalent environmental management system
- Compliance with our Supplier Code of Conduct (available on request)
- Carbon disclosure via recognised framework (CDP or equivalent) for suppliers exceeding £100,000 annual contract value

Suppliers failing to meet these standards will be given 6 months to achieve compliance. Continued non-compliance will result in contract termination.

REPORTING AND WHISTLEBLOWING

Staff are encouraged to report environmental concerns through:
1. Line managers (for minor operational issues)
2. Environmental compliance team: green@greenfieldmfg.com
3. Anonymous whistleblowing hotline: 0800 555 7890 (for serious concerns or suspected violations)

Protection: Greenfield prohibits retaliation against staff who report environmental concerns in good faith. Reports made maliciously or without reasonable basis may themselves be subject to disciplinary action.

TRAINING AND CERTIFICATION

Mandatory (All Staff):
- Environmental Awareness Induction (completed within first week of employment)
- Annual Environmental Refresher (30-minute online module)

Role-Specific:
- Hazardous Materials Handling Level 2 (production and maintenance staff)
- Environmental Auditor Training (supervisors in designated areas)
- Water Systems Operation WC-101 (wet processing operators)

COMPLIANCE MONITORING

Internal audits are conducted quarterly. External audits occur annually as part of ISO 14001 certification maintenance. Non-conformances must be addressed within timeframes specified by the audit report—typically 30 days for minor issues, immediate action for major non-conformances.

For questions about this policy, contact the Environmental Compliance Manager at sustainability@greenfieldmfg.com.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "Who is permitted to dispose of items in the red hazardous waste bins?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) All staff members",
                        "B) Only staff with current Level 2 Hazardous Materials Handling certification",
                        "C) Supervisors and managers only",
                        "D) External waste management contractors only"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'Only staff who have completed the Hazardous Materials Handling certification (minimum Level 2) may dispose of items in red bins.'"
                },
                {
                    "id": "q2",
                    "question": "Which of the following is NOT a mandatory practice?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Switching off lights when leaving workspaces",
                        "B) Participating in the carbon offset programme",
                        "C) Completing Environmental Awareness Induction",
                        "D) Reporting malfunctioning HVAC systems within 24 hours"
                    ],
                    "answer": "B",
                    "explanation": "The carbon offset programme is listed under 'Optional Programmes,' not mandatory practices."
                },
                {
                    "id": "q3",
                    "question": "What happens to suppliers who fail to meet environmental standards?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Immediate contract termination",
                        "B) 6 months to achieve compliance, then contract termination if still non-compliant",
                        "C) A warning letter with no further consequences",
                        "D) Reduced payment terms"
                    ],
                    "answer": "B",
                    "explanation": "The document states suppliers 'will be given 6 months to achieve compliance. Continued non-compliance will result in contract termination.'"
                },
                {
                    "id": "q4",
                    "question": "What can be inferred about why three different reporting channels are provided?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) The company wants to make reporting as complicated as possible",
                        "B) Different channels suit different types and severities of concerns",
                        "C) Legal requirements mandate exactly three channels",
                        "D) The company doesn't trust any single reporting method"
                    ],
                    "answer": "B",
                    "explanation": "The channels range from 'minor operational issues' (line managers) to 'serious concerns' (anonymous hotline), suggesting different severity levels."
                },
                {
                    "id": "q5",
                    "question": "How often must the Hazardous Materials Handling certification be renewed?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Every 6 months",
                        "B) Every year",
                        "C) Every 2 years",
                        "D) Only once when first hired"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'Certification must be renewed annually.'"
                },
                {
                    "id": "q6",
                    "question": "Under what condition might an employee face disciplinary action for making an environmental report?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication", "Conditions & Exceptions"],
                    "options": [
                        "A) If the report is made anonymously",
                        "B) If the report is made to external authorities",
                        "C) If the report is made maliciously or without reasonable basis",
                        "D) If the report is made more than once"
                    ],
                    "answer": "C",
                    "explanation": "The Protection section states: 'Reports made maliciously or without reasonable basis may themselves be subject to disciplinary action.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "stewardship", "meaning": "responsible management and care of resources", "context": "environmental stewardship"},
                {"term": "segregate", "meaning": "separate into different groups or categories", "context": "segregate waste"},
                {"term": "non-conformance", "meaning": "failure to meet required standards", "context": "non-conformances must be addressed"},
                {"term": "retaliation", "meaning": "punishment or revenge for someone's actions", "context": "prohibits retaliation"},
                {"term": "whistleblowing", "meaning": "reporting wrongdoing or violations", "context": "whistleblowing hotline"}
            ],
            
            "reading_tips": [
                "Look for phrases like 'mandatory' vs 'optional' to distinguish requirements from suggestions",
                "Pay attention to certification requirements and renewal periods",
                "Note consequences for non-compliance—they often indicate importance of requirements"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 3: WORK & EMPLOYMENT - WORKPLACE POLICIES
    # =========================================================================
    "work_employment": {
        "module_id": "work_employment",
        "module_title": "The Modern Workplace: Employment, Remote Work, and Labor Relations",
        "track": "general",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding employment contracts and workplace policies",
        "learning_outcome": "After this reading, you will be able to interpret flexible working policies, understand employee rights and obligations, and identify contractual conditions.",
        
        "reading_scenario": {
            "title": "Flexible Working Policy",
            "text_type": "Employment Policy Document",
            "context": "You are reviewing your employer's updated flexible working policy before submitting a request.",
            "word_count": 720,
            
            "passage": """NEXUS CONSULTING GROUP
FLEXIBLE WORKING POLICY
Human Resources Policy HR-023 | Effective: 1 April 2024

SCOPE AND ELIGIBILITY

This policy applies to all permanent employees who have completed their probationary period (typically 6 months). Fixed-term contract employees may apply after 12 months of continuous service. Agency workers and consultants are not covered by this policy.

Flexible working arrangements include:
- Compressed hours (e.g., full-time hours over 4 days)
- Flexitime (varied start/finish times within core hours)
- Remote/hybrid working
- Part-time arrangements
- Job sharing
- Term-time working (for employees with school-age children)

APPLICATION PROCESS

Step 1: Informal Discussion
Before submitting a formal application, employees should discuss their intentions with their line manager. This conversation is advisory and does not constitute a formal request.

Step 2: Formal Application
Submit form FW-001 to Human Resources with the following:
- Proposed working arrangement in detail
- Requested start date (minimum 8 weeks from application)
- Assessment of impact on your role and team
- Proposed solutions for any challenges identified

Step 3: Review and Decision
Managers must respond in writing within 28 days of receiving a complete application. If additional time is needed, employees will be notified with a revised timeline (maximum extension: 14 days).

DECISION CRITERIA

Applications may only be refused on one or more of the following statutory grounds:
- Burden of additional costs
- Detrimental effect on ability to meet customer demand
- Inability to reorganize work among existing staff
- Inability to recruit additional staff
- Detrimental impact on quality
- Detrimental impact on performance
- Insufficiency of work during proposed working times
- Planned structural changes

Approvals may be:
- Full: exactly as requested
- Modified: with adjustments agreed with the employee
- Temporary: for a trial period (typically 3-6 months)

APPEAL PROCESS

Employees may appeal a refusal within 14 days of receiving the decision. Appeals should be submitted in writing to the HR Director and must state grounds for appeal. An appeal hearing will be held within 21 days, conducted by a senior manager not involved in the original decision. The appeal decision is final.

TRIAL PERIODS AND REVIEW

New flexible arrangements are typically subject to a 3-month trial period. During this time:
- Both parties may revert to original arrangements with 4 weeks' notice
- The arrangement will be formally reviewed at the trial's end
- Successful trials become permanent contractual changes

For arrangements in place longer than 12 months, either party may request a review by providing 8 weeks' notice. However, there is no automatic right to revert to previous arrangements after this period—any changes require mutual agreement.

REMOTE WORKING SPECIFIC CONDITIONS

Employees approved for regular remote working (2+ days per week) must:
- Complete the Display Screen Equipment self-assessment annually
- Maintain appropriate home insurance covering business use
- Ensure reliable internet connectivity (minimum 10 Mbps)
- Be available during core hours (10:00-16:00) unless otherwise agreed
- Attend in-person meetings when reasonably required

Equipment: The company will provide laptop and monitor. Additional equipment requests will be considered based on role requirements. Employees are responsible for their own desk, chair, and workspace setup. Reasonable adjustments for disabled employees will be accommodated.

Expenses: Employees working remotely 3+ days per week are entitled to a monthly home-working allowance of £30 to contribute toward utility costs. This allowance is taxable.

Impact on Other Entitlements:
- Holiday entitlement: unchanged
- Pension contributions: unchanged
- Sick pay: unchanged
- Travel expenses: calculated from home address for hybrid workers

COMPLIANCE AND DATA PROTECTION

Remote workers must:
- Use company VPN for all work-related activities
- Not store company data on personal devices
- Report any security incidents immediately
- Ensure confidential calls cannot be overheard by unauthorized persons

Breach of these requirements may result in withdrawal of remote working privileges and/or disciplinary action.

For questions about this policy, contact flexible.working@nexusconsulting.com""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "Who is eligible to apply for flexible working under this policy?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) All employees from their first day",
                        "B) Permanent employees who have completed probation",
                        "C) Only employees with children",
                        "D) Agency workers and consultants"
                    ],
                    "answer": "B",
                    "explanation": "The policy states it 'applies to all permanent employees who have completed their probationary period.'"
                },
                {
                    "id": "q2",
                    "question": "What is the maximum time a manager has to respond to a flexible working application (including extension)?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) 28 days",
                        "B) 42 days",
                        "C) 14 days",
                        "D) 8 weeks"
                    ],
                    "answer": "B",
                    "explanation": "28 days standard response plus 14-day maximum extension = 42 days total."
                },
                {
                    "id": "q3",
                    "question": "Which of the following is NOT listed as a valid reason for refusing a flexible working request?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Burden of additional costs",
                        "B) Personal preference of the manager",
                        "C) Detrimental effect on quality",
                        "D) Planned structural changes"
                    ],
                    "answer": "B",
                    "explanation": "'Personal preference' is not among the statutory grounds listed. All valid reasons relate to business impact."
                },
                {
                    "id": "q4",
                    "question": "What happens after a flexible working arrangement has been in place for over 12 months?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) It automatically reverts to standard working",
                        "B) It must be renewed annually",
                        "C) Either party can request a review, but changes require mutual agreement",
                        "D) The employee must reapply from the beginning"
                    ],
                    "answer": "C",
                    "explanation": "The policy states that after 12 months 'there is no automatic right to revert—any changes require mutual agreement.'"
                },
                {
                    "id": "q5",
                    "question": "What equipment does the company NOT provide for remote workers?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) Laptop",
                        "B) Monitor",
                        "C) Desk and chair",
                        "D) Additional equipment based on role requirements"
                    ],
                    "answer": "C",
                    "explanation": "The policy states: 'Employees are responsible for their own desk, chair, and workspace setup.'"
                },
                {
                    "id": "q6",
                    "question": "Under what circumstances might an employee face disciplinary action related to this policy?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) If they work fewer remote days than approved",
                        "B) If they breach data protection requirements while working remotely",
                        "C) If they request to return to office-based work",
                        "D) If they disagree with their manager's decision"
                    ],
                    "answer": "B",
                    "explanation": "The Compliance section states: 'Breach of these requirements may result in withdrawal of remote working privileges and/or disciplinary action.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "probationary period", "meaning": "initial trial period of employment", "context": "completed their probationary period"},
                {"term": "statutory", "meaning": "required or established by law", "context": "statutory grounds"},
                {"term": "revert", "meaning": "return to a previous state or arrangement", "context": "revert to original arrangements"},
                {"term": "entitlements", "meaning": "things one has a right to receive", "context": "Impact on Other Entitlements"},
                {"term": "hybrid working", "meaning": "combination of office and remote work", "context": "hybrid workers"}
            ],
            
            "reading_tips": [
                "Track timelines carefully—application deadlines, response periods, notice requirements",
                "Distinguish between automatic rights and things requiring mutual agreement",
                "Note conditions that apply specifically to certain groups (remote workers, employees with children)"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 4: HEALTH PUBLIC POLICY - HEALTHCARE DOCUMENTS
    # =========================================================================
    "health_public_policy": {
        "module_id": "health_public_policy",
        "module_title": "Healthcare Systems: Access, Equity, and Public Health",
        "track": "general",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding healthcare documents and patient rights",
        "learning_outcome": "After this reading, you will be able to interpret medical consent forms, understand patient rights, and navigate healthcare service documents.",
        
        "reading_scenario": {
            "title": "Private Healthcare Package Terms",
            "text_type": "Healthcare Service Agreement",
            "context": "You are reviewing a private health insurance policy before enrolling through your employer.",
            "word_count": 680,
            
            "passage": """WELLCARE HEALTH INSURANCE
CORPORATE HEALTHCARE PACKAGE - STANDARD TIER
Policy Terms and Conditions | Reference: WC/CORP/2024/STD

COVERAGE OVERVIEW

This Standard Tier package provides comprehensive private healthcare coverage for employees of participating corporate clients. Coverage begins on the first day of the month following enrolment completion.

INPATIENT TREATMENT
- Private or semi-private room accommodation
- Surgical procedures (including day-case surgery)
- Diagnostic tests and imaging
- Intensive care and high-dependency care
- Consultant fees and anesthetist charges

Annual benefit limit: £1,500,000 per member
No per-claim limit applies.

OUTPATIENT TREATMENT
- Specialist consultations following GP referral*
- Diagnostic tests (MRI, CT, ultrasound, blood tests)
- Minor surgical procedures (outpatient basis)
- Physiotherapy: up to 15 sessions per condition per year
- Mental health: up to 20 outpatient sessions per year

*Direct specialist access (without GP referral) available for additional premium—see Upgrade Options.

Annual outpatient limit: £15,000 per member

EXCLUSIONS AND LIMITATIONS

This policy does NOT cover:
- Pre-existing conditions (moratorium applies for first 2 years)
- Cosmetic procedures (unless reconstructive following accident/illness)
- Fertility treatment
- Routine dental and optical care (available as add-on)
- Treatment for conditions arising from alcohol or substance abuse (unless related to approved rehabilitation)
- Experimental treatments not approved by NICE
- War, terrorism, or nuclear events

Moratorium Explained: Conditions for which you received treatment, advice, or medication in the 5 years before enrolment are excluded for the first 2 years of coverage. After 2 continuous years of membership with no symptoms or treatment, these conditions become covered.

WAITING PERIODS
- General treatment: None (immediate coverage)
- Psychiatric treatment: 90 days from policy start
- Pregnancy-related complications: 10 months from policy start

CLAIMS PROCESS

Pre-Authorization (Required):
All inpatient admissions must be pre-authorized by calling 0800 999 8888 at least 48 hours before admission (emergencies excepted). Failure to pre-authorize may result in claim denial or reduced benefit payment (typically 50% of eligible costs).

Direct Billing:
WellCare has direct billing arrangements with over 400 hospitals and clinics nationwide. Where direct billing applies, you pay only any applicable excess. A list of network providers is available at wellcare.co.uk/network.

Reimbursement Claims:
For treatment at non-network providers, submit claims within 90 days of treatment using form WC-CLAIM-01. Reimbursement is subject to our reasonable and customary charges schedule. You may be required to pay the difference between actual charges and our schedule rates.

EXCESS (DEDUCTIBLE)

Standard Tier excess: £250 per member per policy year
The excess applies once per year regardless of number of claims. Excess is waived for:
- Direct-billed claims at network hospitals
- Cancer treatment
- Claims following an accident requiring A&E attendance

POLICY CHANGES AND RENEWAL

Your employer pays premiums monthly. Individual coverage continues as long as you remain an employee of a participating company. Upon leaving employment, you may:
- Convert to an individual policy (underwriting applies)
- Continue coverage under COBRA-equivalent provisions for up to 18 months at full premium plus 2% administration fee

Premiums are reviewed annually. We will provide 60 days' notice of any premium increase exceeding 10%. Benefit changes require 90 days' notice.

COMPLAINTS AND APPEALS

If you disagree with a claims decision:
1. Request internal review within 30 days of decision
2. If unsatisfied, escalate to the Financial Ombudsman Service

CONTACT INFORMATION
Claims: claims@wellcare.co.uk | 0800 999 8889
General enquiries: help@wellcare.co.uk | 0800 999 8877
Pre-authorization: 0800 999 8888 (24 hours)""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "When does coverage begin for new enrollees?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Immediately upon enrollment",
                        "B) On the first day of the month following enrollment completion",
                        "C) 30 days after enrollment",
                        "D) On the employee's start date"
                    ],
                    "answer": "B",
                    "explanation": "The policy states: 'Coverage begins on the first day of the month following enrolment completion.'"
                },
                {
                    "id": "q2",
                    "question": "What happens if a member fails to pre-authorize an inpatient admission?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) The claim is automatically approved",
                        "B) The claim may be denied or reduced to 50% of eligible costs",
                        "C) The member must pay a £250 penalty",
                        "D) Coverage is terminated"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'Failure to pre-authorize may result in claim denial or reduced benefit payment (typically 50% of eligible costs).'"
                },
                {
                    "id": "q3",
                    "question": "Which of the following conditions would be covered after 2 years under the moratorium?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) A cosmetic procedure",
                        "B) A pre-existing condition with no symptoms or treatment for 2 continuous years",
                        "C) Fertility treatment",
                        "D) Experimental treatments"
                    ],
                    "answer": "B",
                    "explanation": "The moratorium explanation states: 'After 2 continuous years of membership with no symptoms or treatment, these conditions become covered.'"
                },
                {
                    "id": "q4",
                    "question": "Under which circumstances is the £250 excess waived?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) For all outpatient treatment",
                        "B) For members over 65",
                        "C) For direct-billed claims at network hospitals, cancer treatment, or accident A&E claims",
                        "D) For the first claim each year"
                    ],
                    "answer": "C",
                    "explanation": "The policy lists three waiver conditions: network hospital direct billing, cancer treatment, and A&E accidents."
                },
                {
                    "id": "q5",
                    "question": "What is the waiting period for psychiatric treatment?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) None",
                        "B) 90 days",
                        "C) 10 months",
                        "D) 2 years"
                    ],
                    "answer": "B",
                    "explanation": "The Waiting Periods section states: 'Psychiatric treatment: 90 days from policy start.'"
                },
                {
                    "id": "q6",
                    "question": "What options does a member have when leaving their employer?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Coverage ends immediately with no options",
                        "B) Convert to individual policy (with underwriting) or continue for up to 18 months at full premium plus 2%",
                        "C) Automatic continuation at the same rate",
                        "D) Transfer to a government health program"
                    ],
                    "answer": "B",
                    "explanation": "The policy offers two options: conversion to individual policy with underwriting, or COBRA-equivalent continuation for up to 18 months."
                }
            ],
            
            "vocabulary_focus": [
                {"term": "moratorium", "meaning": "a temporary prohibition or suspension", "context": "moratorium applies"},
                {"term": "excess/deductible", "meaning": "amount you pay before insurance coverage begins", "context": "£250 excess"},
                {"term": "pre-authorization", "meaning": "approval required before receiving treatment", "context": "must be pre-authorized"},
                {"term": "reimbursement", "meaning": "repayment for expenses already paid", "context": "Reimbursement Claims"},
                {"term": "underwriting", "meaning": "process of assessing risk for insurance", "context": "underwriting applies"}
            ],
            
            "reading_tips": [
                "Insurance documents often have 'exclusions'—read these carefully to understand what's NOT covered",
                "Note time limits: waiting periods, claim submission deadlines, appeal windows",
                "Look for conditions that trigger different treatment (waivers, reduced benefits)"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 5: CRIME & JUSTICE - LEGAL DOCUMENTS
    # =========================================================================
    "crime_justice": {
        "module_id": "crime_justice",
        "module_title": "Crime, Punishment, and Rehabilitation",
        "track": "general",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding legal notices and tenant rights documents",
        "learning_outcome": "After this reading, you will be able to interpret tenancy agreements, understand legal rights and obligations, and identify key contractual terms.",
        
        "reading_scenario": {
            "title": "Assured Shorthold Tenancy Agreement (Key Terms)",
            "text_type": "Legal Contract Extract",
            "context": "You are reviewing the key terms of a rental agreement before signing.",
            "word_count": 700,
            
            "passage": """ASSURED SHORTHOLD TENANCY AGREEMENT
Key Terms Summary

This summary highlights important terms of your tenancy. The full agreement contains additional clauses—please read all documents before signing.

PARTIES AND PROPERTY
Landlord: Greenstone Properties Ltd (Company No. 12345678)
Tenant(s): As stated on the signature page
Property: The property described in Schedule 1

TERM AND RENT
Fixed Term: 12 months commencing [date]
Rent: £[amount] per calendar month, payable in advance on the 1st of each month
Payment Method: Standing order to account specified in Schedule 2

After the fixed term expires, the tenancy continues as a statutory periodic tenancy on a month-to-month basis. Either party may end a periodic tenancy by giving at least 2 months' written notice, expiring on the last day of a rental period.

DEPOSIT
Amount: £[amount] (equivalent to 5 weeks' rent as permitted by law)
Protection: Your deposit will be protected in the Deposit Protection Service within 30 days of receipt. You will receive prescribed information about the protection scheme within the same period.

Deductions may be made for:
- Unpaid rent or other charges due under this agreement
- Damage beyond fair wear and tear
- Missing items listed in the inventory
- Cleaning required to restore the property to its condition at the start of tenancy (inventory standard)
- Replacement of lost keys or security devices

TENANT OBLIGATIONS
You must:
1. Pay rent on time. Late payments may incur interest at 3% above Bank of England base rate (applied to amounts overdue by 14+ days only)
2. Keep the property in a clean and tidy condition
3. Report any disrepair or damage promptly
4. Allow the landlord access for inspections (minimum 24 hours' notice except emergencies)
5. Not make alterations without written consent (consent will not be unreasonably withheld for minor alterations)
6. Not sublet or assign without written consent (which may be reasonably withheld)
7. Not use the property for any business purpose
8. Comply with all laws, including not causing nuisance to neighbors
9. Ensure working smoke and carbon monoxide alarms are not disabled or tampered with
10. Not keep pets without written consent (consent may be conditional on payment of an additional deposit and will not be unreasonably withheld for small caged animals)

LANDLORD OBLIGATIONS
The landlord must:
1. Ensure the property is fit for habitation at the start of tenancy
2. Maintain the structure and exterior, including drains, gutters, and external pipes
3. Maintain installations for water, gas, electricity, sanitation, and heating
4. Provide an Energy Performance Certificate and Gas Safety Certificate before the tenancy begins
5. Ensure all furniture meets fire safety regulations
6. Protect your deposit in an approved scheme and provide prescribed information
7. Give at least 24 hours' notice before visiting (except emergencies)
8. Not harass tenants or unlawfully evict

ENDING THE TENANCY
During Fixed Term: The tenant may not terminate early unless the landlord agrees in writing. A break clause applies after 6 months if both parties agree—see Clause 15.

After Fixed Term: Either party may give 2 months' notice. Notice must be in writing and expire on the last day of a rental period.

Early Termination by Landlord: The landlord may seek possession using Section 21 (no-fault) only after the fixed term, with 2 months' notice, provided all legal requirements are met. Section 8 (fault-based) may be used at any time if grounds are proven.

FEES
As of 1 June 2019, most tenant fees are prohibited. You may be charged:
- Rent (as specified)
- Deposit (maximum 5 weeks' rent)
- Holding deposit (maximum 1 week's rent, refundable against first month's rent)
- Payments for early termination (capped at landlord's reasonable costs or remaining rent, whichever is lower)
- Fees for lost keys/security devices (reasonable costs only)
- Default fees (as described under late payment)

DISPUTE RESOLUTION
Disputes should first be raised with the landlord or agent directly. If unresolved, tenants may:
- Contact the local council housing department
- Use the free mediation service provided by [organization]
- Refer deposit disputes to the Deposit Protection Service
- Seek legal advice or contact Citizens Advice

This is a summary only. Both parties should read the complete agreement and seek independent advice if needed.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What happens when the fixed term of the tenancy expires?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) The tenancy automatically ends",
                        "B) The tenancy becomes a statutory periodic tenancy on a month-to-month basis",
                        "C) A new 12-month contract must be signed",
                        "D) The rent increases automatically"
                    ],
                    "answer": "B",
                    "explanation": "The document states: 'After the fixed term expires, the tenancy continues as a statutory periodic tenancy on a month-to-month basis.'"
                },
                {
                    "id": "q2",
                    "question": "Under what condition can a landlord refuse consent for keeping a pet?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication", "Conditions & Exceptions"],
                    "options": [
                        "A) The landlord can refuse any pet request without reason",
                        "B) The landlord can reasonably withhold consent, but consent will not be unreasonably withheld for small caged animals",
                        "C) The landlord must always approve pet requests",
                        "D) Pets are prohibited in all circumstances"
                    ],
                    "answer": "B",
                    "explanation": "The document states consent 'may be conditional on payment of an additional deposit and will not be unreasonably withheld for small caged animals.'"
                },
                {
                    "id": "q3",
                    "question": "When can late payment interest be charged?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval", "Conditions & Exceptions"],
                    "options": [
                        "A) From the first day rent is late",
                        "B) Only after rent is overdue by 14 or more days",
                        "C) After 30 days",
                        "D) Interest cannot be charged"
                    ],
                    "answer": "B",
                    "explanation": "The document specifies interest is 'applied to amounts overdue by 14+ days only.'"
                },
                {
                    "id": "q4",
                    "question": "Which of the following fees is NOT permitted under this agreement?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Deposit",
                        "B) Fees for lost keys",
                        "C) Administration fees for processing the application",
                        "D) Late payment fees"
                    ],
                    "answer": "C",
                    "explanation": "The Fees section states 'most tenant fees are prohibited' and does not list administration/application fees as permitted."
                },
                {
                    "id": "q5",
                    "question": "How much notice must a landlord give before visiting the property?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) No notice required",
                        "B) At least 24 hours (except emergencies)",
                        "C) At least 48 hours",
                        "D) At least 7 days"
                    ],
                    "answer": "B",
                    "explanation": "Both the Tenant Obligations and Landlord Obligations sections specify 'at least 24 hours' notice except emergencies.'"
                },
                {
                    "id": "q6",
                    "question": "What can be inferred about why the document mentions that 'consent will not be unreasonably withheld' for certain requests?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) Landlords must approve all requests",
                        "B) This language protects tenants from arbitrary refusals while preserving landlords' legitimate interests",
                        "C) This language is purely decorative and has no legal meaning",
                        "D) Tenants should never make requests"
                    ],
                    "answer": "B",
                    "explanation": "The phrase balances both parties' interests—landlords can refuse for valid reasons, but cannot arbitrarily deny reasonable requests."
                }
            ],
            
            "vocabulary_focus": [
                {"term": "assured shorthold tenancy", "meaning": "the most common type of residential tenancy in England", "context": "title"},
                {"term": "periodic tenancy", "meaning": "a tenancy that runs from period to period (e.g., month-to-month)", "context": "statutory periodic tenancy"},
                {"term": "fair wear and tear", "meaning": "normal deterioration from ordinary use", "context": "damage beyond fair wear and tear"},
                {"term": "sublet", "meaning": "to rent out all or part of a property you are renting", "context": "Not sublet or assign"},
                {"term": "prescribed information", "meaning": "legally required information that must be provided", "context": "prescribed information about the protection scheme"}
            ],
            
            "reading_tips": [
                "In legal documents, look for phrases like 'must,' 'shall,' and 'may not' to identify obligations",
                "Note time periods: notice periods, deadlines, and waiting times are often critical",
                "'Reasonably' and 'unreasonably' are legal terms—they provide some flexibility but also protection"
            ]
        }
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_general_reading_by_module(module_id: str) -> Dict[str, Any]:
    """Get general training reading content for a specific module."""
    module_lower = module_id.lower().replace('-', '_').replace(' ', '_')
    return ADVANCED_GENERAL_READING.get(module_lower)

def get_all_general_reading_modules() -> List[Dict[str, Any]]:
    """Get summary of all available general training reading modules."""
    return [
        {
            "module_id": k,
            "module_title": v["module_title"],
            "strategic_focus": v["strategic_focus"],
            "band_target": v["band_target"],
            "text_type": v["reading_scenario"]["text_type"]
        }
        for k, v in ADVANCED_GENERAL_READING.items()
    ]

def get_general_document_types() -> List[Dict[str, str]]:
    """Get all document types used in general training reading."""
    return [
        {"id": "policy", "name": "Corporate/Organizational Policy", "description": "Internal company rules and procedures"},
        {"id": "contract", "name": "Legal Contract/Agreement", "description": "Binding legal documents with terms and conditions"},
        {"id": "regulation", "name": "Regulatory Document", "description": "Government or industry regulations and compliance"},
        {"id": "notice", "name": "Official Notice/Announcement", "description": "Formal communications and public notices"},
        {"id": "guidelines", "name": "Professional Guidelines", "description": "Best practices and procedural guidance"}
    ]
