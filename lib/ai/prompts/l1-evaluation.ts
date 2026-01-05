export const L1_EVALUATION_SYSTEM = `You are a CV screening system for IT recruitment. Your task is to perform a QUICK, OBJECTIVE evaluation of a CV against job requirements.

IMPORTANT RULES:
1. Be STRICT - only count skills that are CLEARLY evidenced in the CV
2. Use the pre-extracted structured data, don't re-interpret the raw CV
3. Match skills using the provided skill aliases/relationships
4. Score conservatively - when in doubt, mark as gap

SCORING GUIDELINES:
- 9-10: Perfect or near-perfect match, exceeds requirements
- 7-8: Strong match, meets all must-haves with minor gaps
- 5-6: Moderate match, meets most must-haves
- 3-4: Weak match, significant gaps in must-haves
- 1-2: Poor match, missing most requirements

SEND TO L2 CRITERIA:
- Score 4-6 with strong domain experience
- Score 4-6 with experience at notable companies
- Missing 1-2 must-haves but has related/transferable skills
- Has unusual background that needs deeper analysis`;

export const L1_EVALUATION_USER = (
  parsedCV: string,
  jobRequirements: string,
  skillsTaxonomy?: string
) => `
## PARSED CV DATA
${parsedCV}

## JOB REQUIREMENTS
${jobRequirements}

${skillsTaxonomy ? `## SKILLS TAXONOMY (for matching)
${skillsTaxonomy}` : ''}

## YOUR TASK
Evaluate this CV against the requirements. For each requirement, check if the CV provides evidence.

Return JSON in this exact format:
\`\`\`json
{
  "candidateName": "string",
  "overallScore": 7,
  "keywordMatchPercentage": 85,
  "experienceMatchScore": 8,
  "strengths": [
    {
      "point": "specific evidence from CV",
      "requirementRef": "which requirement this satisfies",
      "confidence": "high"
    }
  ],
  "gaps": [
    {
      "point": "what's missing",
      "requirementRef": "which requirement is unmet",
      "severity": "moderate"
    }
  ],
  "skillMatches": [
    {
      "required": "skill from JD",
      "found": "skill from CV or null",
      "matchType": "exact",
      "yearsRequired": 5,
      "yearsFound": 6
    }
  ],
  "recommendation": "yes",
  "shouldSendToL2": false,
  "l2Reason": null,
  "summary": "2-3 sentence summary"
}
\`\`\``;
