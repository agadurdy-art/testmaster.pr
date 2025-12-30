"""
IELTS Academic Reading - Set C
==============================
100% ORIGINAL CONTENT

FOCUS: Matching Features, Matching Information, Short Answer Questions
Topics: Architectural History, Cognitive Psychology, Environmental Science
"""

ACADEMIC_SET_C_READING = {
    "passages": [
        # PASSAGE 1: Matching Features Heavy
        {
            "passage_number": 1,
            "title": "Pioneers of Modern Architecture",
            "question_type_focus": ["matching_features", "sentence_completion"],
            "text": """The twentieth century witnessed a radical transformation in architectural thinking, led by visionaries who rejected historical ornamentation in favor of functionalism and new materials. Five architects, in particular, shaped the buildings we live and work in today.

**Frank Lloyd Wright** (1867-1959) championed what he called "organic architecture" - buildings designed in harmony with their natural surroundings. His masterpiece, Fallingwater (1935), features cantilevered balconies extending over a waterfall, blurring the boundary between structure and landscape. Wright believed that buildings should grow from their sites "as a plant grows from the soil." He pioneered the open floor plan in residential design, eliminating unnecessary walls to create flowing interior spaces. His career spanned over seventy years, producing more than one thousand designs.

**Le Corbusier** (1887-1965), born Charles-Édouard Jeanneret in Switzerland, approached architecture as a machine-age problem. His famous declaration that "a house is a machine for living in" summarized his rationalist philosophy. Le Corbusier advocated for raising buildings on pilotis (concrete columns), freeing the ground level for circulation and gardens. His Unité d'Habitation in Marseille (1952) pioneered high-density urban housing with integrated amenities. He also developed the Modulor, a measurement system based on human proportions, which he applied throughout his later works.

**Ludwig Mies van der Rohe** (1886-1969) epitomized the principle that "less is more." His buildings feature minimal structural frameworks, floor-to-ceiling glass walls, and a complete absence of applied decoration. The Barcelona Pavilion (1929) showcased his vision: an elegant composition of marble, chrome, and glass planes creating fluid, interconnected spaces. After emigrating to America in 1937, Mies designed influential skyscrapers including the Seagram Building in New York, establishing the glass-and-steel aesthetic that dominated corporate architecture for decades.

**Walter Gropius** (1883-1969) founded the Bauhaus school in Germany in 1919, creating an institution that unified art, craft, and technology. The Bauhaus building in Dessau (1926), which Gropius designed, featured a revolutionary curtain wall of glass wrapping around corners without visible supports. Gropius believed in standardized, mass-producible building components that could make quality design accessible to everyone. After the Nazis closed the Bauhaus, Gropius relocated to Harvard, where he trained a generation of American architects.

**Alvar Aalto** (1898-1976) brought a humanistic dimension to modernism that his contemporaries sometimes lacked. Working in Finland, Aalto favored warm natural materials - brick, wood, and copper - over the steel-and-glass vocabulary of his peers. His Paimio Sanatorium (1933) was designed with patients' psychological well-being in mind, featuring carefully positioned windows to maximize daylight. Aalto also designed furniture, including his famous bent-plywood chairs, believing that architects should consider every detail of the user's experience.

These five architects, despite their different emphases, shared certain convictions: that new materials demanded new forms, that function should drive design decisions, and that architecture could improve society. Their influence persists in contemporary practice, though subsequent generations have challenged some of their assumptions, particularly regarding urban planning and the erasure of local building traditions.""",
            "questions": [
                {"id": "R1Q1", "type": "matching_features", "question": "developed a measurement system based on human body proportions", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Le Corbusier"},
                {"id": "R1Q2", "type": "matching_features", "question": "founded an educational institution that combined art and technology", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Walter Gropius"},
                {"id": "R1Q3", "type": "matching_features", "question": "designed buildings using natural materials in contrast to other modernists", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Alvar Aalto"},
                {"id": "R1Q4", "type": "matching_features", "question": "had a career that lasted more than seven decades", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Frank Lloyd Wright"},
                {"id": "R1Q5", "type": "matching_features", "question": "established a visual style widely copied in commercial buildings", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Mies van der Rohe"},
                {"id": "R1Q6", "type": "matching_features", "question": "considered the emotional needs of building occupants", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Alvar Aalto"},
                {"id": "R1Q7", "type": "matching_features", "question": "believed buildings should integrate with their environment", "options": ["Frank Lloyd Wright", "Le Corbusier", "Mies van der Rohe", "Walter Gropius", "Alvar Aalto"], "answer": "Frank Lloyd Wright"},
                {"id": "R1Q8", "type": "sentence_completion", "question": "Le Corbusier compared a house to a ______.", "answer": "machine"},
                {"id": "R1Q9", "type": "sentence_completion", "question": "The Bauhaus was forced to close by the ______.", "answer": "Nazis"},
                {"id": "R1Q10", "type": "sentence_completion", "question": "Wright designed more than ______ buildings in his career.", "answer": "1000/one thousand/a thousand"},
                {"id": "R1Q11", "type": "sentence_completion", "question": "Mies van der Rohe's design principle was that '______ is more.'", "answer": "less"},
                {"id": "R1Q12", "type": "sentence_completion", "question": "Le Corbusier proposed raising buildings on concrete columns called ______.", "answer": "pilotis"},
                {"id": "R1Q13", "type": "short_answer", "question": "What feature of the Bauhaus building was revolutionary?", "answer": "curtain wall of glass/glass curtain wall"}
            ]
        },
        
        # PASSAGE 2: Matching Information Heavy
        {
            "passage_number": 2,
            "title": "The Science of Decision Making",
            "question_type_focus": ["matching_information", "yes_no_ng"],
            "text": """**A** The human brain makes thousands of decisions daily, from trivial choices about what to eat to consequential judgments affecting careers and relationships. Psychologists and neuroscientists have devoted considerable research to understanding how we make these decisions and why we sometimes make poor ones. Their findings challenge the traditional economic view of humans as purely rational actors.

**B** The dual-process theory, popularized by psychologist Daniel Kahneman, distinguishes between two modes of thinking. System 1 operates automatically, quickly, and with little sense of voluntary control. It handles routine decisions and generates intuitive responses. System 2 requires effortful mental activity, including complex calculations and deliberate choice-making. While System 2 believes itself to be the rational decision-maker, System 1 often influences outcomes without our awareness.

**C** Cognitive biases represent systematic errors in thinking that affect decisions. Confirmation bias leads people to seek information supporting their existing beliefs while ignoring contradictory evidence. The availability heuristic causes us to overestimate the probability of events we can easily recall - hence why plane crashes, though statistically rare, seem more threatening than car accidents. The anchoring effect means that initial information disproportionately influences subsequent judgments, a tendency exploited by skilled negotiators.

**D** Emotions play a larger role in decision-making than traditionally acknowledged. The somatic marker hypothesis, proposed by neuroscientist Antonio Damasio, suggests that emotional signals from the body guide choices, particularly in complex situations. Patients with damage to emotion-processing brain regions make poor decisions despite intact logical reasoning. This finding has implications for artificial intelligence: purely logical systems may lack the emotional dimension necessary for truly human-like judgment.

**E** Social context significantly shapes decisions. Studies show that people in groups often make riskier choices than they would individually, a phenomenon called risky shift. Conformity pressure can override personal judgment, as demonstrated in Solomon Asch's classic experiments where participants agreed with obviously wrong answers to match group consensus. Authority figures also exert powerful influence, as Stanley Milgram's controversial obedience studies dramatically revealed.

**F** The architecture of choice affects outcomes more than most people realize. The arrangement and presentation of options - termed "choice architecture" by behavioral economists - can nudge decisions in particular directions. Default settings are especially powerful: most people stick with pre-selected options, whether for pension contributions, organ donation, or software settings. Reducing the number of choices can paradoxically improve decision satisfaction, as excessive options create anxiety and regret.

**G** Sleep deprivation significantly impairs decision-making capacity. Research shows that tired individuals take more risks, struggle to evaluate long-term consequences, and become more susceptible to cognitive biases. Medical professionals, financial traders, and others making high-stakes decisions while fatigued face elevated error rates. Some organizations have implemented fatigue management protocols similar to those in aviation.

**H** Training can improve decision-making skills, though perhaps less than we might hope. Learning about cognitive biases does not automatically eliminate them, but it can encourage greater deliberation in important choices. Some experts recommend specific techniques: considering the opposite viewpoint, establishing decision-making criteria before evaluating options, and conducting "pre-mortems" imagining why a decision might fail before implementing it.""",
            "questions": [
                {"id": "R2Q14", "type": "matching_information", "question": "A comparison between decisions made alone and in groups", "answer": "E"},
                {"id": "R2Q15", "type": "matching_information", "question": "Research involving people with brain damage", "answer": "D"},
                {"id": "R2Q16", "type": "matching_information", "question": "A method for improving decision quality before taking action", "answer": "H"},
                {"id": "R2Q17", "type": "matching_information", "question": "An explanation of why memorable events seem more likely", "answer": "C"},
                {"id": "R2Q18", "type": "matching_information", "question": "Evidence that unconscious processes guide our choices", "answer": "B"},
                {"id": "R2Q19", "type": "matching_information", "question": "The importance of how options are presented", "answer": "F"},
                {"id": "R2Q20", "type": "matching_information", "question": "Reference to professionals whose decisions may be affected by tiredness", "answer": "G"},
                {"id": "R2Q21", "type": "yes_no_ng", "question": "Daniel Kahneman invented the dual-process theory.", "answer": "Not Given"},
                {"id": "R2Q22", "type": "yes_no_ng", "question": "System 2 is always aware of System 1's influence on decisions.", "answer": "No"},
                {"id": "R2Q23", "type": "yes_no_ng", "question": "Patients with emotional processing damage still reason logically.", "answer": "Yes"},
                {"id": "R2Q24", "type": "yes_no_ng", "question": "Having more choices always leads to better decisions.", "answer": "No"},
                {"id": "R2Q25", "type": "yes_no_ng", "question": "Milgram's experiments studied how people respond to authority.", "answer": "Yes"},
                {"id": "R2Q26", "type": "yes_no_ng", "question": "Learning about biases completely eliminates them from decision-making.", "answer": "No"}
            ]
        },
        
        # PASSAGE 3: Short Answer + Multiple Choice Heavy
        {
            "passage_number": 3,
            "title": "Rewilding: Restoring Natural Ecosystems",
            "question_type_focus": ["short_answer", "multiple_choice"],
            "text": """Rewilding represents a bold approach to conservation that goes beyond protecting existing nature to actively restoring ecological processes. Unlike traditional conservation, which often focuses on preserving landscapes in their current state, rewilding aims to return ecosystems to self-sustaining conditions where natural processes operate without continuous human management.

The concept emerged in North America during the 1990s, initially focusing on large wilderness areas. Conservation biologists Michael Soulé and Reed Noss proposed the "three C's" framework: cores (protected areas), corridors (connections between cores), and carnivores (top predators to regulate ecosystems). Their argument was that many conservation efforts failed because they created isolated habitat fragments too small to support viable populations of large animals.

Europe has embraced rewilding more recently but with considerable enthusiasm. The charity Rewilding Europe, established in 2011, aims to rewild one million hectares across the continent by 2030. Projects range from allowing farmland to revert to forest in Portugal's Côa Valley to reintroducing European bison in Romania's Southern Carpathians. The organization operates in nine "rewilding areas" spanning ten countries.

Reintroducing species that have been locally extinct is central to many rewilding projects. Wolves, absent from much of Western Europe for centuries, have naturally recolonized parts of France, Germany, and Italy as attitudes have changed and forest cover has increased. Beavers, hunted to extinction in Britain in the sixteenth century, have been reintroduced through both official programs and unauthorized releases. Their dam-building activities create wetland habitats benefiting numerous other species and can reduce downstream flooding.

Critics raise several concerns about rewilding. Farmers worry about livestock predation by wolves and other large carnivores. Some ecologists argue that aiming to restore past ecosystem states is misguided since climates and conditions have changed irreversibly. Others question whether European landscapes, shaped by millennia of agriculture, can meaningfully be called "wild" even after intervention. There are also debates about which historical baseline should guide restoration efforts.

The economic arguments for rewilding are increasingly compelling. Abandoned agricultural land represents both a conservation opportunity and an economic problem in many rural areas. Nature-based tourism centered on rewilded landscapes can provide alternative livelihoods. In Scotland's Highlands, rewilding estates attract visitors interested in viewing reintroduced species and restored habitats, generating income that exceeds returns from traditional sheep farming.

Climate change adds urgency to rewilding discussions. Natural ecosystems capture and store carbon dioxide, meaning that allowing forests and wetlands to regenerate contributes to climate mitigation. The Bonn Challenge, an international initiative, targets restoration of 350 million hectares of degraded land by 2030. Rewilding approaches are particularly suitable for difficult terrain where agricultural intensification is uneconomical.

Marine rewilding has received less attention but shows promise. Establishing no-take zones allows fish populations to recover, with spillover effects benefiting adjacent fishing areas. Removing barriers from rivers enables migratory fish to access spawning grounds. Restoration of kelp forests and seagrass meadows sequesters carbon while supporting biodiversity.

The future of rewilding likely involves compromise. Pure wilderness without human influence may be impossible in densely populated regions, but "wilder" landscapes with reduced management can deliver many benefits. The key insight of rewilding is that nature, given space and time, possesses remarkable regenerative capacity. Human responsibility lies in creating conditions where that recovery can occur.""",
            "questions": [
                {"id": "R3Q27", "type": "short_answer", "question": "Who proposed the 'three C's' framework for rewilding?", "answer": "Michael Soulé and Reed Noss/Soulé and Noss"},
                {"id": "R3Q28", "type": "short_answer", "question": "What is the area target for Rewilding Europe by 2030?", "answer": "one million hectares/1 million hectares"},
                {"id": "R3Q29", "type": "short_answer", "question": "In which century were beavers hunted to extinction in Britain?", "answer": "16th/sixteenth"},
                {"id": "R3Q30", "type": "short_answer", "question": "What animal activity can help reduce flooding downstream?", "answer": "beaver dam-building/beavers building dams"},
                {"id": "R3Q31", "type": "short_answer", "question": "What international initiative targets 350 million hectares of land restoration?", "answer": "Bonn Challenge/the Bonn Challenge"},
                {"id": "R3Q32", "type": "short_answer", "question": "What type of marine environments sequester carbon while supporting biodiversity?", "answer": "kelp forests and seagrass meadows"},
                {"id": "R3Q33", "type": "multiple_choice", "question": "According to the passage, traditional conservation typically:", "options": ["A) Aims to return ecosystems to historical conditions", "B) Focuses on maintaining landscapes as they currently are", "C) Requires continuous human intervention", "D) Both B and C"], "answer": "D"},
                {"id": "R3Q34", "type": "multiple_choice", "question": "The passage suggests that wolves have returned to Western Europe mainly because:", "options": ["A) Official reintroduction programs", "B) Changes in attitudes and increased forest cover", "C) Unauthorized releases by activists", "D) Climate change pushing them westward"], "answer": "B"},
                {"id": "R3Q35", "type": "multiple_choice", "question": "According to critics, one problem with rewilding in Europe is that:", "options": ["A) It is too expensive to implement", "B) The climate is unsuitable for wild animals", "C) European landscapes have been agricultural for thousands of years", "D) Local people strongly oppose all rewilding projects"], "answer": "C"},
                {"id": "R3Q36", "type": "multiple_choice", "question": "The economic case for rewilding includes:", "options": ["A) Higher returns from traditional farming", "B) Tourism revenue from rewilded areas", "C) Government subsidies for farmers", "D) Reduced land taxes"], "answer": "B"},
                {"id": "R3Q37", "type": "multiple_choice", "question": "Marine rewilding involves:", "options": ["A) Introducing non-native species", "B) Increasing fishing activity", "C) Creating zones where fishing is prohibited", "D) Draining wetlands"], "answer": "C"},
                {"id": "R3Q38", "type": "sentence_completion", "question": "Rewilding Europe operates in ______ countries.", "answer": "10/ten"},
                {"id": "R3Q39", "type": "sentence_completion", "question": "Rewilding Europe began operations in the year ______.", "answer": "2011"},
                {"id": "R3Q40", "type": "sentence_completion", "question": "The 'three C's' stand for cores, corridors, and ______.", "answer": "carnivores"}
            ]
        }
    ]
}
