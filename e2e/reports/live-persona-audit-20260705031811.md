# Live Persona Audit — 20260705031811

Base: https://testmaster.pro
Generated: 2026-07-05T03:21:20.182Z

## Summary

- Personas created/tested: 11
- Route checks: 54
- OK: 54
- Hard failures: 0
- Client/API warnings: 10
- Public essay async smoke: OK — IELTS Ace by testmaster.pro Writing Speaking Reading Listening Samples Pricing Log in Try free Sample Evaluation — see exactly how your essay will be scored. Nothing here is editable. Jump to evaluator → Home/Score my essay Score my own essay — free, one per email. Paste your IELTS writing task belo

## SEO/GEO Raw HTML

- Sitemap URLs: 14
- JS shell pages in sitemap: 0/14
- Pages with raw HTML H1: 14/14
- Unique raw titles: 14
- Unique raw descriptions: 14

| URL | Status | Title | Raw H1 | JS shell | Raw text len |
|---|---:|---|---:|---:|---:|
| / | 200 | IELTS Ace — AI IELTS Writing &amp; Speaking Practice with Band Feedback | yes | no | 7467 |
| /score-my-essay | 200 | Free IELTS Writing Checker — AI Band Score &amp; Feedback | IELTS Ace | yes | no | 2130 |
| /score-my-speaking | 200 | IELTS Speaking Practice with AI Feedback — All 4 Criteria | IELTS Ace | yes | no | 2221 |
| /ielts-band-score-calculator | 200 | IELTS Band Score Calculator — Overall Band with Official Rounding | IELTS Ace | yes | no | 3487 |
| /ielts-faq | 200 | IELTS FAQ — Band Scores, Scoring, Format &amp; Validity | IELTS Ace | yes | no | 5581 |
| /pricing | 200 | Pricing — Free, Weekly, Monthly &amp; Exam Pack | IELTS Ace | yes | no | 5111 |
| /samples/writing/band-5-0-task2 | 200 | IELTS Writing Task 2 — Band 5.0 Sample &amp; Feedback | IELTS Ace | yes | no | 5734 |
| /samples/writing/band-6-5-task2 | 200 | IELTS Writing Task 2 — Band 6.5 Sample &amp; Feedback | IELTS Ace | yes | no | 6016 |
| /samples/writing/band-8-0-task2 | 200 | IELTS Writing Task 2 — Band 8.0 Sample &amp; Feedback | IELTS Ace | yes | no | 6532 |
| /samples/speaking/band-6-5-part2 | 200 | IELTS Speaking Part 2 — Band 6.5 Sample &amp; Feedback | IELTS Ace | yes | no | 5819 |
| /about | 200 | About IELTS Ace — Honest AI IELTS Band Scores | yes | no | 6316 |
| /contact | 200 | Contact — IELTS Ace | yes | no | 1143 |
| /privacy | 200 | Privacy Policy — IELTS Ace | yes | no | 3393 |
| /terms | 200 | Terms of Service — IELTS Ace | yes | no | 2736 |

## Persona Route Findings

### beginner — codex.20260705031811.beginner@testmaster.pro
- OK /dashboard -> /dashboard; body 2758; h1 "Good morning, Codex."
- OK /quick-assessment -> /quick-assessment; body 627; h1 "15 minutes to your estimated band."
- OK /beginner-course -> /beginner-course; body 466; h1 "Let's Learn English!"; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/beginner-english/lessons; console: Failed to load resource: the server responded with a status of 404 ()
- OK /learning-tools -> /learning-tools; body 952; h1 "Your IELTS Tools"

### writing — codex.20260705031811.writing@testmaster.pro
- OK /writing-practice -> /writing-practice; body 647; h1 "Writing Practice"
- OK /question-bank/writing/task2 -> /question-bank/writing/task2; body 3623; h1 "Writing Task 2"
- OK /question-bank/writing/task1 -> /question-bank/writing/task1; body 1047; h1 "Writing Task 1"
- OK /sample-reports -> /sample-reports; body 1310; h1 "Sample reports"; console: Error generating visual: TypeError: Failed to fetch at window.fetch (https://testmaster.pro/assets/index-DXlUb5mi.js:20:7023) at D (https://testmaster.pro/assets/WritingTask1Practice-C4c0PCr1.js:1:5688) at https://testmaster.pro/assets/Writ

### speaking — codex.20260705031811.speaking@testmaster.pro
- OK /speaking-practice -> /speaking-practice; body 1581; h1 ""
- OK /speaking/v2 -> /speaking/v2; body 1581; h1 ""
- OK /full-mock -> /full-mock; body 759; h1 "A full IELTS Speaking mock with Liz."
- OK /liz -> /liz; body 458; h1 "Meet Liz, Your AI Teacher"

### reading — codex.20260705031811.reading@testmaster.pro
- OK /question-bank -> /question-bank; body 269; h1 ""
- OK /question-bank/reading/academic -> /question-bank/reading/academic; body 7045; h1 "Academic Reading Practice"; console: Error loading topics: TypeError: Failed to fetch at window.fetch (https://testmaster.pro/assets/index-DXlUb5mi.js:20:7023) at ye (https://testmaster.pro/assets/QuestionBank-CYwQ4xlH.js:1:79884) at gs (https://testmaster.pro/assets/QuestionB
- OK /question-bank/reading/general -> /question-bank/reading/general; body 6470; h1 "General Training Reading"
- OK /question-bank/reading/practice -> /question-bank/reading/practice; body 1191; h1 "Practice by Question Type"

### listening — codex.20260705031811.listening@testmaster.pro
- OK /question-bank/listening -> /question-bank/listening; body 1247; h1 "Listening Practice"
- OK /test/listening -> /test/listening; body 296; h1 ""; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/tests?test_type=listening; console: Failed to load resource: the server responded with a status of 404 ()
- OK /full-test -> /full-test; body 2065; h1 "IELTS Full Test Mode"
- OK /progress -> /progress; body 771; h1 "Nothing to show — yet."

### mock — codex.20260705031811.mock@testmaster.pro
- OK /full-test -> /full-test; body 2059; h1 "IELTS Full Test Mode"
- OK /test/reading -> /test/reading; body 290; h1 ""; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/tests?test_type=reading; console: Failed to load resource: the server responded with a status of 404 ()
- OK /test/writing -> /test/writing; body 290; h1 ""; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/tests?test_type=writing; console: Failed to load resource: the server responded with a status of 404 ()
- OK /my-results -> /my-results; body 350; h1 "My speaking results"

### vocab — codex.20260705031811.vocab@testmaster.pro
- OK /grammar -> /grammar; body 2498; h1 "The IELTS 8 Grammar Blueprint"
- OK /vocabulary -> /vocabulary; body 2490; h1 "IELTS Vocabulary — by Theme"
- OK /mastery-course -> /mastery-course; body 521; h1 "IELTS Mastery Blueprint"
- OK /advanced-mastery -> /advanced-mastery; body 2959; h1 "Advanced IELTS Mastery"; console: Error fetching modules: TypeError: Failed to fetch at window.fetch (https://testmaster.pro/assets/index-DXlUb5mi.js:20:7023) at cs (https://testmaster.pro/assets/MasteryCourse-RqwkBR3I.js:1:64941) at https://testmaster.pro/assets/MasteryCou

### pricing — codex.20260705031811.pricing@testmaster.pro
- OK /pricing -> /pricing; body 2643; h1 "Pay for exactly the days you need."
- OK /profile -> /profile; body 1036; h1 "Your profile."
- OK /checkout/bank/monthly -> /checkout/bank/monthly; body 706; h1 "Pay 243.000 ₫"
- OK /contact -> /contact; body 439; h1 "Contact"

### mobile — codex.20260705031811.mobile@testmaster.pro
- OK / -> /; body 6520; h1 "Score your IELTS in minutes — in your language."
- OK /dashboard -> /dashboard; body 2637; h1 "Good morning, Codex."
- OK /question-bank -> /question-bank; body 64; h1 ""
- OK /pricing -> /pricing; body 2630; h1 "Pay for exactly the days you need."; console: Error loading topics: TypeError: Failed to fetch at window.fetch (https://testmaster.pro/assets/index-DXlUb5mi.js:20:7023) at ye (https://testmaster.pro/assets/QuestionBank-CYwQ4xlH.js:1:79884) at gs (https://testmaster.pro/assets/QuestionB

### returning — codex.20260705031811.returning@testmaster.pro
- OK /dashboard/v2 -> /dashboard/v2; body 2765; h1 "Good morning, there."
- OK /courses -> /courses; body 1667; h1 "Three courses. One clear path."; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/beginner-english/lessons; console: Failed to load resource: the server responded with a status of 404 ()
- OK /review-bank -> /review-bank; body 302; h1 ""
- OK /learning -> /learning; body 102; h1 ""; responses: 404 https://ielts-backend-production-fefd.up.railway.app/api/learning-platform/progress/8061be68-fc12-44bb-903a-0d94e1d076a5, 404 https://ielts-backend-production-fefd.up.railway.app/api/learning-platform/levels; console: Failed to load resource: the server responded with a status of 404 ()

## Public Route Findings

- OK / -> /; body 6623; h1 "Score your IELTS in minutes — in your language."
- OK /score-my-essay -> /score-my-essay; body 1336; h1 "Score my own essay — free, one per email."
- OK /score-my-speaking -> /score-my-speaking; body 1426; h1 "Score my speaking — free, one per email."
- OK /ielts-band-score-calculator -> /ielts-band-score-calculator; body 2712; h1 "IELTS Band Score Calculator"
- OK /ielts-faq -> /ielts-faq; body 4818; h1 "Frequently asked questions about IELTS"
- OK /pricing -> /pricing; body 2700; h1 "Pay for exactly the days you need."
- OK /samples/writing/band-5-0-task2 -> /samples/writing/band-5-0-task2; body 4235; h1 "A real Band 5.0 Writing Task 2, graded as Cambridge would."
- OK /samples/writing/band-6-5-task2 -> /samples/writing/band-6-5-task2; body 4517; h1 "A real Band 6.5 Writing Task 2, graded as Cambridge would."
- OK /samples/writing/band-8-0-task2 -> /samples/writing/band-8-0-task2; body 5035; h1 "A real Band 8.0 Writing Task 2, graded as Cambridge would."
- OK /samples/speaking/band-6-5-part2 -> /samples/speaking/band-6-5-part2; body 4316; h1 "The full Speaking Practice — four states, one scroll."
- OK /about -> /about; body 5574; h1 "Built by a teacher who got tired of telling students the same thing every IELTS book leaves out."
- OK /contact -> /contact; body 430; h1 "Contact"
- OK /privacy -> /privacy; body 2668; h1 "Privacy Policy"
- OK /terms -> /terms; body 2013; h1 "Terms of Service"

JSON: /Users/aga/testmaster-fresh/e2e/reports/live-persona-audit-20260705031811.json