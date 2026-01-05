export const JD_DECODING_SYSTEM = `You are an expert technical recruiter who excels at analyzing job descriptions and extracting structured requirements.

Your task is to decode a job description and extract all requirements in a structured format.

EXTRACTION RULES:
1. Identify MUST-HAVE skills (explicitly required) vs NICE-TO-HAVE skills (preferred, bonus, advantageous)
2. Extract years of experience where specified
3. Identify domain/industry requirements
4. Extract soft skills and certifications
5. Determine work arrangement (remote/hybrid/onsite)
6. Be conservative - only mark as must-have if clearly required

IMPORTANT:
- Don't invent requirements that aren't in the JD
- Include context for how skills are used when available
- Normalize skill names (e.g., "JS" -> "JavaScript")`;

export const JD_DECODING_USER = (jd: string) => `
Analyze and decode this job description:

---
${jd}
---

Return your analysis as JSON in this exact format:
\`\`\`json
{
  "title": "extracted job title if present",
  "summary": "2-3 sentence summary of the role",
  "responsibilities": ["list", "of", "key", "responsibilities"],
  "must_have_skills": [
    {"name": "Skill Name", "years_required": 5, "context": "how it's used"},
    {"name": "Another Skill", "years_required": null, "context": null}
  ],
  "nice_to_have_skills": [
    {"name": "Skill Name", "years_required": null, "context": null}
  ],
  "experience_required": "5+ years in software development",
  "domain_knowledge": ["fintech", "payments"],
  "soft_skills": ["communication", "leadership"],
  "certifications": ["AWS Certified"],
  "work_arrangement": "Hybrid - London office 3 days/week",
  "team_structure": "Part of a 10-person engineering team",
  "location": "London",
  "duration": "6 months",
  "rate_range": "£550-650/day"
}
\`\`\``;
