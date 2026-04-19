"""
IELTS-Style Academic Full Test - Set A - Reading Section
========================================================
100% ORIGINAL CONTENT

Three academic passages with 40 questions total.
"""

from typing import Dict, List, Any


ACADEMIC_SET_A_READING = {
    "total_questions": 40,
    "total_time": 3600,
    "instructions": "You should spend about 20 minutes on each passage. Read the passage and answer questions 1-40.",
    
    "passages": [
        # PASSAGE 1 (Questions 1-13)
        {
            "passage_number": 1,
            "title": "The Rise of Urban Vertical Farming",
            "word_count": 850,
            "difficulty": "moderate",
            "text": """
A
As the global population continues to surge toward an estimated 9.7 billion by 2050, the challenge of feeding humanity has become increasingly urgent. Traditional agriculture, which currently occupies approximately 50% of the world's habitable land, faces mounting pressures from climate change, soil degradation, and water scarcity. In response to these challenges, a revolutionary approach to food production has emerged: vertical farming.

B
Vertical farming refers to the practice of growing crops in vertically stacked layers, typically within controlled indoor environments. Unlike conventional farms that spread horizontally across vast landscapes, vertical farms utilise the vertical dimension of buildings, warehouses, and purpose-built structures. This approach can increase crop yields by a factor of 10 to 20 compared to traditional methods, while using up to 95% less water through recirculating hydroponic or aeroponic systems.

C
The concept of growing food in layered structures is not entirely new. The term "vertical farm" was coined by American ecologist Dickson Despommier in 1999, though the roots of the idea extend back further. In 1915, American geologist Gilbert Ellis Bailey wrote about the potential of "vertical farming" in his book of the same name, envisioning multi-storey buildings dedicated to agricultural production. However, it was not until advances in LED lighting technology and automation made the concept economically viable that vertical farming began its rapid expansion.

D
Modern vertical farms rely on several key technologies. LED lighting systems provide the precise light spectrums required for photosynthesis, with the added benefit of generating significantly less heat than traditional grow lights. Climate control systems maintain optimal temperature, humidity, and carbon dioxide levels year-round. Sensors continuously monitor plant health, nutrient levels, and environmental conditions, feeding data to artificial intelligence systems that can adjust growing parameters in real-time.

E
The advantages of vertical farming extend beyond increased yields and water efficiency. By locating production facilities near urban centres, vertical farms dramatically reduce transportation distances and associated carbon emissions. Produce can be harvested and delivered to consumers within hours, ensuring maximum freshness and nutritional value. Furthermore, the controlled indoor environment eliminates the need for pesticides and herbicides, resulting in cleaner, healthier produce.

F
Critics of vertical farming point to its significant energy requirements, particularly for lighting. While natural sunlight is free and abundant, powering LED systems for thousands of square metres of growing space demands substantial electricity. However, advocates argue that advances in renewable energy and LED efficiency are rapidly reducing this concern. Some vertical farms have achieved carbon neutrality by combining rooftop solar panels with highly efficient growing systems.

G
The economic viability of vertical farming remains a subject of debate. Initial capital costs are considerably higher than for traditional farms, with some facilities requiring investments of tens of millions of dollars. Operating costs, particularly energy, add further financial pressure. Currently, vertical farms focus primarily on high-value leafy greens and herbs, where the premium prices consumers pay for locally grown, pesticide-free produce can offset production costs. Expanding to staple crops like wheat, rice, or corn remains economically challenging.

H
Despite these challenges, the vertical farming industry has experienced explosive growth. The global market was valued at approximately $5.5 billion in 2022 and is projected to exceed $30 billion by 2030. Major investments have flowed into companies like Plenty, AeroFarms, and Bowery Farming, with backing from prominent investors including Jeff Bezos and Softbank. Cities from Singapore to Dubai to New York have embraced vertical farming as part of their food security strategies.

I
Looking ahead, researchers are working to expand the range of crops suitable for vertical cultivation. Trials with tomatoes, peppers, and even dwarf fruit trees have shown promising results. Genetic modification and selective breeding may eventually produce crop varieties specifically optimised for vertical growing conditions. As technology continues to advance and costs decline, vertical farming may play an increasingly vital role in feeding the world's growing urban population.
""",
            "questions": [
                {"id": "R1Q1", "type": "matching_headings", "question": "Paragraph A", "options": ["i) Technological foundations of modern facilities", "ii) Environmental benefits beyond yield increases", "iii) The pressing need for agricultural innovation", "iv) Historical development of the concept", "v) Energy consumption concerns and responses", "vi) Financial considerations and current focus", "vii) Methods and yield improvements", "viii) Future developments and possibilities", "ix) Industry growth and investment"], "answer": "iii"},
                {"id": "R1Q2", "type": "matching_headings", "question": "Paragraph B", "options": ["i) Technological foundations of modern facilities", "ii) Environmental benefits beyond yield increases", "iii) The pressing need for agricultural innovation", "iv) Historical development of the concept", "v) Energy consumption concerns and responses", "vi) Financial considerations and current focus", "vii) Methods and yield improvements", "viii) Future developments and possibilities", "ix) Industry growth and investment"], "answer": "vii"},
                {"id": "R1Q3", "type": "matching_headings", "question": "Paragraph C", "options": ["i) Technological foundations of modern facilities", "ii) Environmental benefits beyond yield increases", "iii) The pressing need for agricultural innovation", "iv) Historical development of the concept", "v) Energy consumption concerns and responses", "vi) Financial considerations and current focus", "vii) Methods and yield improvements", "viii) Future developments and possibilities", "ix) Industry growth and investment"], "answer": "iv"},
                {"id": "R1Q4", "type": "matching_headings", "question": "Paragraph D", "options": ["i) Technological foundations of modern facilities", "ii) Environmental benefits beyond yield increases", "iii) The pressing need for agricultural innovation", "iv) Historical development of the concept", "v) Energy consumption concerns and responses", "vi) Financial considerations and current focus", "vii) Methods and yield improvements", "viii) Future developments and possibilities", "ix) Industry growth and investment"], "answer": "i"},
                {"id": "R1Q5", "type": "matching_headings", "question": "Paragraph E", "options": ["i) Technological foundations of modern facilities", "ii) Environmental benefits beyond yield increases", "iii) The pressing need for agricultural innovation", "iv) Historical development of the concept", "v) Energy consumption concerns and responses", "vi) Financial considerations and current focus", "vii) Methods and yield improvements", "viii) Future developments and possibilities", "ix) Industry growth and investment"], "answer": "ii"},
                {"id": "R1Q6", "type": "true_false_ng", "question": "Vertical farming uses more water than traditional agriculture.", "answer": "FALSE"},
                {"id": "R1Q7", "type": "true_false_ng", "question": "The term 'vertical farm' was first used in the 20th century.", "answer": "TRUE"},
                {"id": "R1Q8", "type": "true_false_ng", "question": "LED lights produce more heat than traditional grow lights.", "answer": "FALSE"},
                {"id": "R1Q9", "type": "true_false_ng", "question": "All vertical farms are now carbon neutral.", "answer": "NOT GIVEN"},
                {"id": "R1Q10", "type": "sentence_completion", "question": "Vertical farms can produce up to ________ times more crops per area than traditional farms.", "answer": "20", "instruction": "Write A NUMBER from the passage"},
                {"id": "R1Q11", "type": "sentence_completion", "question": "The global vertical farming market is expected to exceed $________ billion by 2030.", "answer": "30", "instruction": "Write A NUMBER from the passage"},
                {"id": "R1Q12", "type": "sentence_completion", "question": "Currently, vertical farms mainly grow ________ and herbs.", "answer": "leafy greens", "instruction": "Write NO MORE THAN TWO WORDS from the passage"},
                {"id": "R1Q13", "type": "sentence_completion", "question": "Researchers are conducting trials with tomatoes, peppers, and dwarf ________.", "answer": "fruit trees", "instruction": "Write NO MORE THAN TWO WORDS from the passage"}
            ]
        },
        
        # PASSAGE 2 (Questions 14-26)
        {
            "passage_number": 2,
            "title": "The Psychology of Decision-Making",
            "word_count": 920,
            "difficulty": "challenging",
            "text": """
For decades, economists operated under the assumption that humans are rational actors who make decisions by carefully weighing costs and benefits to maximise their utility. This model, known as homo economicus, suggested that given sufficient information, people would consistently make choices that serve their best interests. However, pioneering research in behavioural economics has revealed that human decision-making is far more complex and often far less rational than classical theory suggested.

Daniel Kahneman, who would later win the Nobel Prize in Economics, conducted groundbreaking research with Amos Tversky in the 1970s that fundamentally challenged the rational actor model. Their work demonstrated that humans rely on mental shortcuts, called heuristics, when making decisions. While these shortcuts often serve us well, they can also lead to systematic errors known as cognitive biases.

One of the most influential concepts to emerge from their research is the distinction between two modes of thinking, which Kahneman termed System 1 and System 2. System 1 is fast, automatic, and emotional. It operates effortlessly and is responsible for quick judgments and intuitions. System 2, by contrast, is slow, deliberate, and logical. It requires conscious effort and is engaged when we need to perform complex calculations or careful analysis.

The interplay between these two systems explains many puzzling aspects of human behaviour. Consider the phenomenon of anchoring, where an initial piece of information disproportionately influences subsequent judgments. In one famous experiment, participants were asked to spin a wheel of fortune that landed on either 10 or 65. They were then asked to estimate the percentage of African countries in the United Nations. Those who saw 10 guessed around 25%, while those who saw 65 guessed around 45%. The random number from the wheel had no logical relevance, yet it significantly affected their estimates. This occurs because System 1 automatically processes the anchor, and System 2 fails to adequately adjust away from it.

Loss aversion represents another crucial discovery. Kahneman and Tversky found that losses loom larger than equivalent gains in people's minds. In their experiments, the pain of losing $100 was approximately twice as intense as the pleasure of gaining $100. This asymmetry has profound implications for economic behaviour, explaining why people often refuse fair gambles, hold onto losing investments too long, and demand significantly more to give up something they own than they would pay to acquire it.

The framing effect demonstrates how the presentation of identical information can lead to different decisions. When told that a medical treatment has a 90% survival rate, people respond more favourably than when told it has a 10% mortality rate. Logically, these statements convey the same information, yet the psychological impact differs dramatically. Politicians, marketers, and negotiators have long exploited this tendency, whether consciously or not.

More recent research has extended our understanding of decision-making to include the role of emotions and social factors. Antonio Damasio's somatic marker hypothesis proposes that emotions play a crucial role in rational decision-making by helping us navigate complex choices efficiently. Studies of patients with damage to emotion-processing brain regions show that without emotional input, even simple decisions become impossibly difficult.

The emerging field of neuroeconomics uses brain imaging to observe decision-making processes in real-time. This research has revealed that different types of decisions activate distinct neural pathways. Choices involving immediate rewards engage the limbic system, associated with emotion and pleasure, while decisions requiring long-term planning activate the prefrontal cortex, linked to rational analysis. The tension between these systems helps explain why people often struggle with decisions involving delayed gratification, such as saving for retirement or maintaining a healthy diet.

Understanding these psychological phenomena has important practical applications. In the realm of public policy, insights from behavioural economics have led to the concept of "nudging" – designing choice environments that guide people toward better decisions without restricting their freedom. Simple interventions, such as making retirement savings opt-out rather than opt-in, or placing healthy foods at eye level in cafeterias, can significantly improve outcomes.

In business, behavioural insights inform everything from pricing strategies to product design. Companies carefully craft default options, loyalty programmes, and payment structures to align consumer behaviour with their objectives. Meanwhile, medical professionals have begun incorporating an understanding of patient decision-making into treatment protocols, improving adherence and outcomes.

As our understanding of decision-making continues to evolve, new questions emerge. How do cultural factors influence cognitive biases? Can we train ourselves to overcome our psychological limitations? And in an age of artificial intelligence, what role should human judgment play in consequential decisions? These questions will shape both research and practice for decades to come.
""",
            "questions": [
                {"id": "R2Q14", "type": "multiple_choice", "question": "The traditional economic model assumed that people:", "options": ["A) often make irrational decisions", "B) rely heavily on emotions", "C) make logical choices to maximize benefits", "D) use mental shortcuts"], "answer": "C"},
                {"id": "R2Q15", "type": "multiple_choice", "question": "Kahneman's System 1 is characterised by:", "options": ["A) deliberate and slow thinking", "B) logical analysis", "C) complex calculations", "D) quick and automatic responses"], "answer": "D"},
                {"id": "R2Q16", "type": "true_false_ng", "question": "In the anchoring experiment, participants were aware of the wheel's influence on their answers.", "answer": "NOT GIVEN"},
                {"id": "R2Q17", "type": "true_false_ng", "question": "Losing $100 feels about twice as bad as gaining $100 feels good.", "answer": "TRUE"},
                {"id": "R2Q18", "type": "true_false_ng", "question": "The framing effect only applies to medical information.", "answer": "FALSE"},
                {"id": "R2Q19", "type": "true_false_ng", "question": "Patients with damage to emotion-processing brain areas make better decisions.", "answer": "FALSE"},
                {"id": "R2Q20", "type": "matching_info", "question": "an example of how random information affects estimates", "paragraph_options": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], "answer": "D"},
                {"id": "R2Q21", "type": "matching_info", "question": "evidence that emotions contribute to rational thinking", "paragraph_options": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], "answer": "G"},
                {"id": "R2Q22", "type": "matching_info", "question": "examples of practical policy applications", "paragraph_options": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"], "answer": "I"},
                {"id": "R2Q23", "type": "sentence_completion", "question": "Mental shortcuts that can lead to errors are called cognitive ________.", "answer": "biases", "instruction": "Write NO MORE THAN ONE WORD"},
                {"id": "R2Q24", "type": "sentence_completion", "question": "The ________ hypothesis suggests emotions help navigate complex choices.", "answer": "somatic marker", "instruction": "Write NO MORE THAN TWO WORDS"},
                {"id": "R2Q25", "type": "sentence_completion", "question": "Decisions about immediate rewards activate the ________ system.", "answer": "limbic", "instruction": "Write NO MORE THAN ONE WORD"},
                {"id": "R2Q26", "type": "sentence_completion", "question": "'Nudging' involves designing choice ________ to guide better decisions.", "answer": "environments", "instruction": "Write NO MORE THAN ONE WORD"}
            ]
        },
        
        # PASSAGE 3 (Questions 27-40)
        {
            "passage_number": 3,
            "title": "Ocean Acidification: The Other CO2 Problem",
            "word_count": 980,
            "difficulty": "most_challenging",
            "text": """
While much attention has been devoted to the atmospheric effects of rising carbon dioxide levels – global warming and climate change – another profound consequence has received comparatively little public notice. Ocean acidification, sometimes called "global warming's equally evil twin," threatens to fundamentally alter marine ecosystems and the billions of people who depend on them.

The chemistry underlying ocean acidification is straightforward. The oceans absorb approximately 30% of the carbon dioxide released into the atmosphere, where it reacts with seawater to form carbonic acid. Since the industrial revolution, the pH of ocean surface waters has dropped by approximately 0.1 units, representing a 26% increase in acidity. While this may seem modest, the logarithmic nature of the pH scale means this shift is significant. Moreover, projections suggest that if current emission trends continue, ocean pH could decline by an additional 0.3 to 0.4 units by 2100 – a change unprecedented in the past 55 million years.

The ecological implications are far-reaching. Calcifying organisms, which build shells or skeletons from calcium carbonate, are particularly vulnerable. These include corals, molluscs such as oysters and mussels, and numerous species of plankton. As seawater becomes more acidic, the availability of carbonate ions – essential building blocks for calcium carbonate structures – decreases. Under sufficiently acidic conditions, existing shells and skeletons can actually begin to dissolve.

Coral reefs, often called the "rainforests of the sea," face a dual threat from warming and acidification. Higher temperatures cause coral bleaching, while acidification impairs their ability to grow and repair. The combined effect could see most tropical coral reefs disappear within decades. Given that coral reefs support approximately 25% of all marine species and provide food and income for some 500 million people worldwide, the consequences would be devastating.

Perhaps equally concerning is the potential impact on pteropods, tiny sea snails that form a crucial link in polar food chains. Pteropods are a primary food source for organisms ranging from zooplankton to salmon to whales. Laboratory studies have shown that their delicate shells begin dissolving when exposed to pH levels projected for 2050. A collapse of pteropod populations would ripple through entire ecosystems.

Beyond calcification, acidification may affect marine life in other ways. Research suggests that changes in seawater chemistry can impair fish behaviour, affecting their ability to detect predators, find suitable habitats, and navigate. One study found that clownfish raised in acidified water lost their ability to recognise the chemical signatures of their anemone hosts. Such behavioural disruptions could have profound implications for population dynamics and ecosystem stability.

The economic stakes are substantial. The global fishing industry generates approximately $150 billion annually and provides primary protein for more than 3 billion people. Shellfish aquaculture alone employs millions and represents a significant economic sector in many coastal communities. Oyster hatcheries in the Pacific Northwest have already experienced failures linked to more acidic waters, providing an early warning of potential widespread impacts.

Mitigation strategies broadly fall into three categories. The most fundamental approach involves reducing carbon dioxide emissions, as this addresses the root cause. However, given the lag between emissions and oceanic effects, some degree of additional acidification is already locked in. Adaptation strategies help affected communities and industries adjust to changing conditions, such as selecting more acid-tolerant species for aquaculture or developing resistant coral strains through assisted evolution.

A third approach involves direct intervention in ocean chemistry. Some researchers have proposed adding alkaline substances to seawater to counteract acidification. Proposals range from dispersing crushed limestone to stimulating the growth of alkalinity-producing organisms. However, such geoengineering approaches remain largely theoretical and raise concerns about unintended consequences. The scale required to meaningfully affect global ocean chemistry would be enormous, and the ecological effects of adding vast quantities of any substance to marine environments are difficult to predict.

Monitoring and research represent critical priorities. While scientists have established that acidification is occurring and identified vulnerable organisms, much remains unknown about how complex ecosystems will respond. The interactions between acidification, warming, pollution, and overfishing create a challenging multi-stressor environment where effects may amplify or counteract one another in unpredictable ways.

Public awareness remains a significant barrier to action. Unlike climate change, which manifests in visible weather events and temperature records, ocean acidification operates invisibly beneath the waves. Its effects unfold gradually and are most apparent in remote ocean environments far from public view. Communicating the urgency of this threat to policymakers and the public represents an ongoing challenge for scientists and advocates.

The path forward requires urgent action on multiple fronts. Reducing emissions must be the priority, but adaptation and further research are equally essential. The oceans have absorbed much of our carbon pollution, buffering atmospheric changes. It would be profoundly tragic if we recognised the full scale of the price they are paying only after irreversible damage has occurred.
""",
            "questions": [
                {"id": "R3Q27", "type": "multiple_choice", "question": "What percentage of atmospheric CO2 do oceans absorb?", "options": ["A) 10%", "B) 20%", "C) 30%", "D) 50%"], "answer": "C"},
                {"id": "R3Q28", "type": "multiple_choice", "question": "The current 0.1 unit pH drop represents:", "options": ["A) a 10% increase in acidity", "B) a 26% increase in acidity", "C) a 30% increase in acidity", "D) no significant change"], "answer": "B"},
                {"id": "R3Q29", "type": "yes_no_ng", "question": "Ocean acidification is generally understood by the public.", "answer": "NO"},
                {"id": "R3Q30", "type": "yes_no_ng", "question": "Geoengineering solutions have been successfully tested at scale.", "answer": "NO"},
                {"id": "R3Q31", "type": "yes_no_ng", "question": "Pteropods are found only in tropical waters.", "answer": "NOT GIVEN"},
                {"id": "R3Q32", "type": "matching_features", "question": "reducing emissions", "feature_options": ["A) addresses root cause", "B) helps adjust to changes", "C) involves adding substances to water"], "answer": "A"},
                {"id": "R3Q33", "type": "matching_features", "question": "assisted evolution of corals", "feature_options": ["A) addresses root cause", "B) helps adjust to changes", "C) involves adding substances to water"], "answer": "B"},
                {"id": "R3Q34", "type": "matching_features", "question": "dispersing crushed limestone", "feature_options": ["A) addresses root cause", "B) helps adjust to changes", "C) involves adding substances to water"], "answer": "C"},
                {"id": "R3Q35", "type": "sentence_completion", "question": "Coral reefs support approximately ________ percent of all marine species.", "answer": "25", "instruction": "Write A NUMBER"},
                {"id": "R3Q36", "type": "sentence_completion", "question": "Pteropods are a crucial food source in ________ food chains.", "answer": "polar", "instruction": "Write NO MORE THAN ONE WORD"},
                {"id": "R3Q37", "type": "sentence_completion", "question": "Studies show clownfish in acidified water cannot recognise their ________ hosts.", "answer": "anemone", "instruction": "Write NO MORE THAN ONE WORD"},
                {"id": "R3Q38", "type": "sentence_completion", "question": "The global fishing industry generates approximately $________ billion annually.", "answer": "150", "instruction": "Write A NUMBER"},
                {"id": "R3Q39", "type": "sentence_completion", "question": "Shellfish aquaculture provides jobs for ________ of workers.", "answer": "millions", "instruction": "Write NO MORE THAN ONE WORD"},
                {"id": "R3Q40", "type": "multiple_choice", "question": "According to the passage, what is a major challenge in addressing ocean acidification?", "options": ["A) lack of scientific knowledge", "B) low public awareness", "C) high cost of research", "D) resistance from fishing industry"], "answer": "B"}
            ]
        }
    ]
}


def get_academic_set_a_reading():
    return ACADEMIC_SET_A_READING
