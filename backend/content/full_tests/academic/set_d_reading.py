"""
IELTS Academic Reading - Set D
==============================
100% ORIGINAL CONTENT

FOCUS: Classification, Table Completion, Yes/No/Not Given
Topics: Animal Communication, Economic History, Digital Privacy
"""

ACADEMIC_SET_D_READING = {
    "passages": [
        # PASSAGE 1: Classification Heavy
        {
            "passage_number": 1,
            "title": "Animal Communication Systems",
            "question_type_focus": ["classification", "sentence_completion"],
            "text": """The study of animal communication has revealed sophisticated systems that challenge our understanding of language and cognition. Researchers have identified distinct categories of communicative behaviour across species, each with unique characteristics and purposes.

**Chemical Communication**

Chemical signals, or pheromones, represent one of the oldest forms of animal communication. Ants use pheromones to create trails leading to food sources, with different chemicals indicating different types of resources. The alarm pheromone released by a threatened ant can trigger defensive behaviour in nestmates within seconds. Queen bees produce pheromones that regulate hive behaviour, suppress worker reproduction, and attract drones during mating flights. Moths can detect pheromones from potential mates several kilometres away, demonstrating the remarkable sensitivity of chemical communication.

**Acoustic Communication**

Sound-based communication offers advantages in environments where visual signals are impractical. Whales produce songs that travel thousands of kilometres through ocean waters. Research on humpback whales has revealed that their songs change over time, with new phrases spreading through populations - a phenomenon resembling cultural transmission. Birds use song for territory defence and mate attraction, with some species capable of learning hundreds of distinct song types. Elephants communicate using infrasound - frequencies below human hearing - that can travel up to ten kilometres through both air and ground.

**Visual Communication**

Visual signals provide immediate, directional information but require line of sight. The elaborate displays of birds of paradise, with their vivid plumage and complex dances, represent extreme examples of visual communication evolved through sexual selection. Cuttlefish can produce dynamic colour patterns within milliseconds, using specialised cells called chromatophores to communicate mood, intention, and camouflage. Fireflies use bioluminescence to signal potential mates, with species-specific flash patterns ensuring reproductive isolation.

**Tactile Communication**

Touch-based communication plays crucial roles in social bonding and information transfer. Primates engage in grooming that reinforces social hierarchies and alliances. Honeybees perform the famous waggle dance, using body movements to convey the distance and direction of food sources to hivemates. The duration of the waggle indicates distance, while the angle relative to vertical represents direction relative to the sun.

**Multimodal Communication**

Many species combine multiple signal types for more effective communication. Dogs, for instance, use acoustic signals (barking, whining), visual signals (tail position, ear position), chemical signals (scent marking), and tactile signals (licking, nuzzling) in combination. This redundancy ensures message transmission even when some channels are compromised by environmental conditions.

The complexity of these systems raises fundamental questions about the nature of language. While animal communication clearly serves adaptive functions, debate continues about whether any non-human system possesses the generativity, displacement, and cultural transmission that characterise human language.""",
            "questions": [
                {"id": "R1Q1", "type": "classification", "question": "Ants creating trails to food", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Chemical"},
                {"id": "R1Q2", "type": "classification", "question": "Humpback whale songs changing over time", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Acoustic"},
                {"id": "R1Q3", "type": "classification", "question": "Cuttlefish colour patterns", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Visual"},
                {"id": "R1Q4", "type": "classification", "question": "Primate grooming behaviour", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Tactile"},
                {"id": "R1Q5", "type": "classification", "question": "Elephant infrasound", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Acoustic"},
                {"id": "R1Q6", "type": "classification", "question": "Firefly flash patterns", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Visual"},
                {"id": "R1Q7", "type": "classification", "question": "Queen bee pheromones", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Chemical"},
                {"id": "R1Q8", "type": "classification", "question": "Honeybee waggle dance", "categories": ["Chemical", "Acoustic", "Visual", "Tactile"], "answer": "Tactile"},
                {"id": "R1Q9", "type": "sentence_completion", "question": "Moths can detect pheromones from ______ away.", "answer": "several kilometres/kilometers"},
                {"id": "R1Q10", "type": "sentence_completion", "question": "Elephant infrasound can travel up to ______ kilometres.", "answer": "10/ten"},
                {"id": "R1Q11", "type": "sentence_completion", "question": "Cuttlefish use specialised cells called ______ to change colour.", "answer": "chromatophores"},
                {"id": "R1Q12", "type": "sentence_completion", "question": "In the waggle dance, the angle represents direction relative to the ______.", "answer": "sun"},
                {"id": "R1Q13", "type": "sentence_completion", "question": "Dogs use ______ communication types in combination.", "answer": "four/4/multiple"}
            ]
        },
        
        # PASSAGE 2: Table Completion + Yes/No/Not Given
        {
            "passage_number": 2,
            "title": "The Industrial Revolutions: A Comparative Analysis",
            "question_type_focus": ["table_completion", "yes_no_ng"],
            "text": """The concept of industrial revolution has been applied to several distinct periods of technological and economic transformation. Historians now recognise four such revolutions, each characterised by specific innovations and societal impacts.

**The First Industrial Revolution (1760-1840)**

Beginning in Britain, the first industrial revolution centred on the mechanisation of textile production and the development of iron-making techniques. The water frame, spinning jenny, and power loom transformed cottage industries into factory systems. James Watt's improvements to the steam engine, patented in 1769, provided a versatile power source that revolutionised manufacturing and transportation. By 1830, Britain produced eighty percent of Europe's coal and fifty percent of its iron, establishing industrial supremacy that would last nearly a century.

**The Second Industrial Revolution (1870-1914)**

The second revolution, sometimes called the Technological Revolution, emerged primarily in Germany and the United States. Key innovations included the internal combustion engine, electrical power generation, and the telephone. Henry Ford's assembly line, introduced in 1913, epitomised the era's focus on mass production and standardisation. Steel production soared, enabling construction of railways, bridges, and eventually skyscrapers. Chemical industries developed synthetic dyes, fertilisers, and pharmaceuticals.

**The Third Industrial Revolution (1969-2010)**

Also termed the Digital Revolution, this period witnessed the rise of electronics, telecommunications, and computing. The Intel 4004 microprocessor, released in 1971, began the miniaturisation that would lead to personal computers and smartphones. The internet, initially developed for military communication, became publicly accessible in 1991, fundamentally altering commerce, communication, and information access. Manufacturing became increasingly automated, with robots performing tasks once requiring human labour.

**The Fourth Industrial Revolution (2010-present)**

The current revolution, identified by Klaus Schwab of the World Economic Forum, is characterised by the fusion of digital, biological, and physical systems. Artificial intelligence, machine learning, and robotics are transforming industries from healthcare to agriculture. The Internet of Things connects billions of devices, generating unprecedented volumes of data. Advances in biotechnology, including gene editing and synthetic biology, promise to reshape medicine and manufacturing.

**Comparative Impacts**

Each revolution has brought both opportunities and disruptions. The first revolution created an urban working class and sparked labour movements. The second established corporate capitalism and consumer culture. The third revolution generated new industries while eliminating others, contributing to growing inequality between those with and without technical skills. The fourth revolution raises concerns about automation-driven unemployment and the ethical implications of artificial intelligence.

Notably, the pace of change has accelerated dramatically. While the first revolution unfolded over nearly a century, each subsequent revolution has compressed into shorter timeframes. The current revolution is occurring so rapidly that policy frameworks and educational systems struggle to adapt.""",
            "questions": [
                {"id": "R2Q14", "type": "table_completion", "question": "First Industrial Revolution dates: 1760-______", "answer": "1840"},
                {"id": "R2Q15", "type": "table_completion", "question": "First Revolution primary location: ______", "answer": "Britain"},
                {"id": "R2Q16", "type": "table_completion", "question": "Watt's steam engine patent year: ______", "answer": "1769"},
                {"id": "R2Q17", "type": "table_completion", "question": "Second Revolution emergence locations: Germany and ______", "answer": "United States/USA/US"},
                {"id": "R2Q18", "type": "table_completion", "question": "Ford's assembly line introduction year: ______", "answer": "1913"},
                {"id": "R2Q19", "type": "table_completion", "question": "Third Revolution alternative name: ______ Revolution", "answer": "Digital"},
                {"id": "R2Q20", "type": "table_completion", "question": "Intel 4004 microprocessor release year: ______", "answer": "1971"},
                {"id": "R2Q21", "type": "table_completion", "question": "Internet became publicly accessible: ______", "answer": "1991"},
                {"id": "R2Q22", "type": "table_completion", "question": "Fourth Revolution identifier: Klaus ______", "answer": "Schwab"},
                {"id": "R2Q23", "type": "yes_no_ng", "question": "Britain produced most of Europe's coal by 1830.", "answer": "Yes"},
                {"id": "R2Q24", "type": "yes_no_ng", "question": "The assembly line was invented by Henry Ford.", "answer": "Not Given"},
                {"id": "R2Q25", "type": "yes_no_ng", "question": "The internet was originally developed for commercial purposes.", "answer": "No"},
                {"id": "R2Q26", "type": "yes_no_ng", "question": "Each industrial revolution has occurred more quickly than the previous one.", "answer": "Yes"}
            ]
        },
        
        # PASSAGE 3: Mixed Question Types
        {
            "passage_number": 3,
            "title": "Digital Privacy in the Modern Age",
            "question_type_focus": ["multiple_choice", "summary_completion", "yes_no_ng"],
            "text": """The digital age has fundamentally transformed the relationship between individuals, corporations, and governments regarding personal information. What was once private by default - daily movements, purchasing habits, social connections - now leaves digital traces that can be collected, analysed, and monetised.

**The Data Economy**

Personal data has become one of the world's most valuable commodities. Technology companies build business models around collecting user information and selling targeted advertising. A 2019 study estimated that the average American's data generates approximately $240 annually for technology platforms. Social media users unknowingly provide detailed profiles of their interests, relationships, and behaviours simply through normal platform usage.

The collection extends far beyond social media. Smart devices in homes monitor activity patterns. Fitness trackers record health data. Location services track movements with metre-level precision. Vehicle systems log driving behaviour. The aggregation of these data streams creates comprehensive profiles that would have seemed dystopian just decades ago.

**Legal Frameworks**

Regulatory responses have varied dramatically across jurisdictions. The European Union's General Data Protection Regulation (GDPR), implemented in 2018, established stringent requirements for consent, data access, and the "right to be forgotten." Companies violating GDPR face fines up to €20 million or four percent of global revenue, whichever is higher.

The United States, in contrast, has taken a sector-specific approach with no comprehensive federal privacy law. The California Consumer Privacy Act (CCPA), effective from 2020, represents the most significant state-level initiative, giving residents rights to know what data is collected and to request deletion. However, this patchwork approach creates compliance challenges for businesses operating across multiple jurisdictions.

China has pursued a different model, implementing data protection laws while maintaining extensive government surveillance capabilities. The Personal Information Protection Law, effective 2021, mirrors GDPR in many respects but exempts state security applications.

**Technical Countermeasures**

Individuals concerned about privacy have various tools available. Virtual Private Networks (VPNs) mask internet activity from service providers. End-to-end encryption, implemented by messaging services like Signal, ensures that only sender and recipient can read communications. Privacy-focused browsers and search engines avoid tracking user behaviour.

However, technical solutions face limitations. Metadata - information about communications rather than content - often remains accessible even when content is encrypted. Advanced data analysis can de-anonymize supposedly anonymous datasets by correlating multiple data points. Machine learning enables inference of sensitive attributes from seemingly innocuous information.

**Societal Implications**

The privacy debate extends beyond individual harm to broader democratic concerns. Surveillance capabilities enable authoritarian control. Targeted misinformation can manipulate political discourse. Corporate data monopolies raise competition concerns. The psychological effects of knowing one is constantly observed may influence behaviour in subtle but significant ways.

Some scholars argue that traditional notions of privacy as individual control over information are inadequate for the digital age. They propose instead a model of data governance that treats personal information as a collective resource requiring democratic oversight. Under this framework, decisions about data use would be subject to public deliberation rather than terms-of-service agreements that few users read or understand.

The resolution of these tensions will shape society for generations. Finding the balance between data-driven innovation and fundamental privacy rights remains one of the defining challenges of our time.""",
            "questions": [
                {"id": "R3Q27", "type": "multiple_choice", "question": "According to the passage, the average American's data generates approximately:", "options": ["A) $24 annually", "B) $240 annually", "C) $2,400 annually", "D) $24,000 annually"], "answer": "B"},
                {"id": "R3Q28", "type": "multiple_choice", "question": "GDPR was implemented in:", "options": ["A) 2016", "B) 2017", "C) 2018", "D) 2020"], "answer": "C"},
                {"id": "R3Q29", "type": "multiple_choice", "question": "The maximum GDPR fine is:", "options": ["A) €10 million or 2% of revenue", "B) €20 million or 4% of revenue", "C) €50 million or 5% of revenue", "D) €100 million or 10% of revenue"], "answer": "B"},
                {"id": "R3Q30", "type": "summary_completion", "question": "The California Consumer Privacy Act became effective in ______.", "answer": "2020"},
                {"id": "R3Q31", "type": "summary_completion", "question": "China's Personal Information Protection Law became effective in ______.", "answer": "2021"},
                {"id": "R3Q32", "type": "summary_completion", "question": "______ masks internet activity from service providers.", "answer": "VPN/VPNs/Virtual Private Networks"},
                {"id": "R3Q33", "type": "summary_completion", "question": "______ is mentioned as a messaging service with end-to-end encryption.", "answer": "Signal"},
                {"id": "R3Q34", "type": "yes_no_ng", "question": "The US has a comprehensive federal privacy law.", "answer": "No"},
                {"id": "R3Q35", "type": "yes_no_ng", "question": "China's privacy law is identical to GDPR.", "answer": "No"},
                {"id": "R3Q36", "type": "yes_no_ng", "question": "Most users carefully read terms-of-service agreements.", "answer": "No"},
                {"id": "R3Q37", "type": "yes_no_ng", "question": "Technical solutions can completely protect user privacy.", "answer": "No"},
                {"id": "R3Q38", "type": "multiple_choice", "question": "The passage suggests that metadata:", "options": ["A) Is always encrypted", "B) Is less important than content", "C) Can remain accessible even with encryption", "D) Is never collected by companies"], "answer": "C"},
                {"id": "R3Q39", "type": "multiple_choice", "question": "Some scholars propose treating personal data as:", "options": ["A) Individual property", "B) Corporate assets", "C) A collective resource", "D) Government information"], "answer": "C"},
                {"id": "R3Q40", "type": "yes_no_ng", "question": "The author believes the privacy debate has been fully resolved.", "answer": "No"}
            ]
        }
    ]
}
