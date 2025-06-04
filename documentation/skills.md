Hedgehog — Skill Estimation Engine
Overview
Skill Estimation is the core intelligence behind the Hedgehog learning platform. It drives the personalized syllabus generation and predicted grade calculation for every student.

The system models each student's mathematical proficiency across a network of 180 core knowledge skills and a set of special skills. For each skill, we track:

Skill Level (SL) — current mastery, in percentage. (student dependent)

Skill Velocity (SV) — rate of change, in percentage per activity. (student dependent)

Skill Freshness (SF) — time since last engagement, in days. (student dependent)

Skill weight (SW) — the importace of the skill. (independant of student)

These metrics allow Hedgehog to dynamically adjust learning priorities, update predictions, and offer targeted learning paths.

1. Graph Tree Structure
To reflect interdependencies between skills, Hedgehog builds a Directed Acyclic Graph (DAG) of all skills:

Parent–Child relationships represent pedagogical prerequisites.

The structure allows inference of untested skills via related ones.

It supports curriculum sequencing, ensuring prerequisites are mastered first.

📊 Skill Weight (SW)
Every skill is assigned a Skill Weight (SW) based on how many other skills depend on it (i.e., number of descendants in the graph). Skills with higher SW values:

Have greater influence on SL inference.

Are prioritized in personalized syllabus design.

2. Diagnostic Test (DT)
At the start of a student’s journey, they complete a Diagnostic Test:

Questions are selected to cover high-impact, diverse skills.

The results are used to initialize SL and SV values for a subset of skills.

Unassessed skills are inferred using the skill graph and weighted propagation.

📄 See detailed structure and logic in diagnostic_test.md.

3. Ongoing Skill Calculation
Post-DT, all student activities affect skill estimations:

Activity Type	Effect on SL	Notes
Ascertain quizzes	Moderate	Adaptive follow-up quizzes
Video engagement	Light	Especially for conceptual skills
Interactive simulations	Moderate	Effective for application skills
Final tests	Strong	Most reliable for accurate estimation

Each activity has an associated impact weight and confidence level depending on the context.

4. Skill Velocity (SV)
Skill Velocity reflects the rate and direction of learning. It is calculated using a logarithmic decay model:

Early interactions with a skill (1st, 2nd questions) cause large SL updates (e.g. ±40%, ±20%).

Further repetitions reduce influence gradually (e.g. 100th question → ±1%).

This prevents overfitting from repetitive drilling while allowing genuine learning to shine.

5. Skill Amortization
To model skill decay over time, Hedgehog includes amortization:

If a skill is not practiced, its SL gradually decreases, and SV increases.

Example: A student last practiced Probability 60 days ago. SL drops from 75% to 73%, SV increases to ±5%.

This dynamic ensures predictions reflect current proficiency, not just historical performance.

6. Skill Freshness (SF)
Skill Freshness (SF) tracks the number of days since a skill was last engaged:

Weekly tests are dynamically generated to revive stale skills.

Skills with the highest SF are prioritized in quizzes to maintain broad retention.

SF is a crucial input in selecting review topics and maintaining readiness for final assessments.

Conclusion
The Hedgehog Skill Estimation Engine provides a nuanced, data-driven approach to student modeling. By combining initial diagnostics, graph-based inference, activity tracking, and temporal decay, it enables the creation of tailored, effective syllabi and precise performance predictions.
