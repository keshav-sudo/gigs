export const SYSTEM_PROMPT = `You are an expert freelance marketplace positioning strategist and conversion copywriter.

Your job is to transform rough freelancer service information and market research into a clear, original, buyer-focused gig offering.

Your priorities are:
1. Clear buyer intent
2. Specific service positioning
3. Realistic scope
4. Strong differentiation
5. Natural keyword usage
6. Clear package progression
7. Realistic pricing
8. Original writing
9. No keyword stuffing
10. No fake claims, fake experience, fake guarantees, or invented credentials

Never copy competitor text.
Analyze competitor data only for:
* recurring buyer terminology
* service patterns
* pricing patterns
* common deliverables
* potential market gaps

Create original content based only on the seller's real skills and supplied information.

The Basic package should solve one focused problem.
The Standard package should provide a meaningful complete solution.
The Premium package should provide an advanced or end-to-end solution.
Package differences must be based on real differences in scope, complexity, integrations, features, deployment, or support.

You must output ONLY valid JSON matching the requested schema. No markdown blocks, no explaining, and no extra text.`;

export const getFullGenerationPrompt = (
  serviceType: string,
  rawDescription: string,
  technologies: string[],
  targetBuyer: string,
  experienceLevel: string,
  pricingPreference: string,
  researchData: {
    competitorTitles?: string;
    competitorPricing?: string;
    commonKeywords?: string;
    popularTags?: string;
    competitorDescriptions?: string;
    marketObservations?: string;
  }
): string => {
  return `Please generate a complete, optimized Fiverr gig draft based on the following input parameters:

Service Type: ${serviceType}
Raw Description: ${rawDescription}
Technologies/Skills: ${technologies.join(', ')}
Target Buyer Profile: ${targetBuyer}
Seller Experience Level: ${experienceLevel}
Pricing Preference: ${pricingPreference}

Research / Competitor Data (if any):
- Competitor Gig Titles: ${researchData.competitorTitles || 'None provided'}
- Competitor Pricing: ${researchData.competitorPricing || 'None provided'}
- Common Keywords: ${researchData.commonKeywords || 'None provided'}
- Popular Tags: ${researchData.popularTags || 'None provided'}
- Competitor Descriptions: ${researchData.competitorDescriptions || 'None provided'}
- General Market Observations: ${researchData.marketObservations || 'None provided'}

Your output MUST be a single JSON object. DO NOT wrap it in \`\`\`json ... \`\`\` code blocks.
The JSON object must strictly match this schema structure:
{
  "gigTitle": "A catchy, SEO-optimized title starting with 'I will'",
  "alternativeTitles": ["alternative title option 1", "alternative title option 2"],
  "category": "Recommended Category (e.g., Programming & Tech)",
  "subcategory": "Recommended Subcategory (e.g., Web Development)",
  "searchTags": ["up to 5 tags"],
  "seoKeywords": ["up to 5 keywords"],
  "packages": {
    "basic": {
      "name": "Focused package name",
      "description": "Short description of basic scope",
      "price": 45, // realistic pricing
      "deliveryDays": 3,
      "revisions": 2,
      "features": ["Feature item 1", "Feature item 2"]
    },
    "standard": {
      "name": "Complete package name",
      "description": "Short description of standard scope",
      "price": 120, // realistic pricing
      "deliveryDays": 5,
      "revisions": 3,
      "features": ["Feature item 1", "Feature item 2", "Feature item 3"]
    },
    "premium": {
      "name": "Advanced package name",
      "description": "Short description of premium scope",
      "price": 250, // realistic pricing
      "deliveryDays": 7,
      "revisions": 5,
      "features": ["Feature item 1", "Feature item 2", "Feature item 3", "Feature item 4"]
    }
  },
  "description": "Full gig description outlining benefits, workflow, what is included, what is not, and why choose the seller. Format it with clean paragraphs, bullet points, and capitalized headers.",
  "faqs": [
    {
      "question": "Clear common buyer FAQ?",
      "answer": "Polite, expert response."
    }
  ],
  "buyerRequirements": ["What info/access is needed from the buyer to start?"],
  "thumbnail": {
    "headline": "Bold high-converting thumbnail title (max 5-6 words)",
    "supportingText": "3-4 bullet points or short key metrics to display in thumbnail",
    "visualConcept": "Brief recommendation of visual style, colors, and layout"
  },
  "shortSummary": "A 1-2 sentence pitch of this gig",
  "upsells": ["Gig extra recommendation 1", "Gig extra recommendation 2"],
  "strategyExplanation": {
    "positioning": "Strategic explanation of target niche",
    "targetBuyer": "Target buyer segment clarification",
    "differentiation": "Key points of difference from generic competitors",
    "pricingLogic": "Brief explanation of standard packages pricing values"
  }
}
`;
};

export const getSectionRegenerationPrompt = (
  originalGig: any,
  sectionPath: string,
  instructions: string
): string => {
  return `You are asked to regenerate a single, specific section of a Fiverr gig draft. 
The current complete gig draft details are:
${JSON.stringify(originalGig, null, 2)}

The section you need to modify/regenerate is: "${sectionPath}"

Specific modification instructions:
"${instructions}"

Keep everything else in the gig unchanged. Provide only the updated value for this specific section. 
Your output must be a single, valid JSON object containing only the updated section key-value pair, matching the format of the target schema.
For example, if the section is "gigTitle", output:
{
  "gigTitle": "Your new generated title text"
}
If the section is "packages.basic", output:
{
  "packages": {
    "basic": {
      "name": "Basic Package Name",
      "description": "Updated Description",
      "price": 50,
      "deliveryDays": 3,
      "revisions": 2,
      "features": ["Feature 1", "Feature 2"]
    }
  }
}
If the section is "faqs", output:
{
  "faqs": [
    { "question": "Q1?", "answer": "A1" },
    ...
  ]
}
If the section is "description", output:
{
  "description": "Updated description text"
}

Do not include any explanation. Just return a single JSON object.`;
};

export const getCorrectionPrompt = (
  invalidJson: string,
  errors: string
): string => {
  return `The following JSON returned previously failed validation:
${invalidJson}

Validation Errors:
${errors}

Please correct the JSON structure to resolve all validation errors. Ensure that you return ONLY valid JSON matching the schema requirements without any codeblocks or explanation.`;
};
