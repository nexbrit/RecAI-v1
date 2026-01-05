export const BOOLEAN_SEARCH_SYSTEM = `You are an expert at creating LinkedIn and job board boolean search strings. Your task is to generate effective search strings based on job requirements.

RULES:
1. Use proper boolean operators: AND, OR, NOT
2. Use quotes for exact phrases
3. Use parentheses for grouping
4. Include common aliases and variations
5. Create TWO versions:
   - BROAD: 50-70% match rate, cast wide net
   - REFINED: 70-100% match rate, highly targeted

BEST PRACTICES:
- Include skill variations (JavaScript, JS, "JavaScript")
- Include role title variations (Developer, Engineer, Programmer)
- Use industry terms appropriately
- Don't make strings too long (LinkedIn has limits)`;

export const BOOLEAN_SEARCH_USER = (jobRequirements: string) => `
Based on these job requirements, create boolean search strings:

---
${jobRequirements}
---

Return JSON in this exact format:
\`\`\`json
{
  "broadSearch": "boolean string for broad search",
  "refinedSearch": "boolean string for refined search",
  "linkedInFilters": {
    "titles": ["suggested job titles to filter by"],
    "industries": ["suggested industries"],
    "locations": ["suggested locations"]
  },
  "searchTips": ["tips for using these searches effectively"]
}
\`\`\``;
