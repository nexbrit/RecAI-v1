export const CV_EXTRACTION_SYSTEM = `You are an expert CV parser for IT recruitment. Your task is to extract structured information from CV text.

EXTRACTION RULES:
1. Extract all contact information available
2. List all technical skills with estimated proficiency and years
3. Parse work experience chronologically (most recent first)
4. Identify the domain/industry for each company
5. Extract achievements and responsibilities separately
6. Note any certifications with issuing bodies
7. Calculate total years of experience
8. Flag any red flags (gaps, inconsistencies, job hopping)

SKILL PROFICIENCY GUIDELINES:
- beginner: Less than 1 year, mentioned but not heavily used
- intermediate: 1-3 years, used in projects
- advanced: 3-5 years, primary skill
- expert: 5+ years, deep expertise, leadership role

Be thorough but accurate - don't invent information.`;

export const CV_EXTRACTION_USER = (cvText: string) => `
Parse and extract structured data from this CV:

---
${cvText}
---

Return your extraction as JSON in this exact format:
\`\`\`json
{
  "candidate": {
    "fullName": "John Smith",
    "email": "john@email.com",
    "phone": "+44 1234567890",
    "location": "London, UK",
    "linkedIn": "linkedin.com/in/johnsmith",
    "summary": "Brief professional summary",
    "totalYearsExperience": 8
  },
  "skills": [
    {
      "name": "Java",
      "normalizedName": "Java",
      "yearsExperience": 5,
      "proficiency": "advanced",
      "lastUsed": 2024,
      "context": "Backend development at fintech company"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "companyType": "startup",
      "domain": "fintech",
      "title": "Senior Developer",
      "startDate": "2020-01",
      "endDate": null,
      "isCurrent": true,
      "responsibilities": ["Led development of...", "Managed team of..."],
      "achievements": ["Increased performance by 50%", "Delivered project ahead of schedule"],
      "technologiesUsed": ["Java", "Spring Boot", "AWS"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "BSc",
      "field": "Computer Science",
      "year": 2015
    }
  ],
  "certifications": [
    {
      "name": "AWS Solutions Architect",
      "issuer": "Amazon",
      "year": 2022
    }
  ],
  "languages": ["English", "Spanish"],
  "completenessScore": 85,
  "redFlags": ["6-month gap in 2019"]
}
\`\`\``;
