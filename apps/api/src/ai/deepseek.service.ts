import { GeneratedGigContentSchema, GeneratedGigContent } from '@gigcraft-ai/shared';
import { SYSTEM_PROMPT, getFullGenerationPrompt, getSectionRegenerationPrompt, getCorrectionPrompt } from './prompts.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const getApiKey = (): string => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not defined.');
  }
  return apiKey;
};

const getModel = (): string => {
  return process.env.DEEPSEEK_MODEL || 'deepseek-chat';
};

// Strips markdown code blocks if the LLM includes them
const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

export const callDeepSeek = async (messages: ChatMessage[]): Promise<string> => {
  const apiKey = getApiKey();
  const model = getModel();

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API returned error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      choices: Array<{
        message: {
          content: string;
        };
      }>;
    };

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek API returned an empty completion response.');
    }

    return content;
  } catch (error) {
    console.error('Error in callDeepSeek:', error);
    throw error;
  }
};

export const generateGigContent = async (
  serviceType: string,
  rawDescription: string,
  technologies: string[],
  targetBuyer: string,
  experienceLevel: string,
  pricingPreference: string,
  researchData: any
): Promise<GeneratedGigContent> => {
  const userPrompt = getFullGenerationPrompt(
    serviceType,
    rawDescription,
    technologies,
    targetBuyer,
    experienceLevel,
    pricingPreference,
    researchData
  );

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];

  console.log('Sending full generation request to DeepSeek...');
  const firstResponse = await callDeepSeek(messages);
  const cleanedFirst = cleanJsonResponse(firstResponse);

  let parsed: any;
  try {
    parsed = JSON.parse(cleanedFirst);
  } catch (err) {
    console.warn('Failed to parse first response as JSON. Retrying with correction...');
    return await retryWithCorrection(cleanedFirst, 'JSON syntax error: Unable to parse response as JSON object.', messages);
  }

  const validation = GeneratedGigContentSchema.safeParse(parsed);
  if (validation.success) {
    return validation.data;
  }

  // If validation fails, compile the errors and trigger self-correction once
  const errorDetails = validation.error.errors
    .map((e) => `Path "${e.path.join('.')}" : ${e.message}`)
    .join('\n');

  console.warn('Validation failed on first attempt. Error details:\n', errorDetails);
  console.log('Retrying generation with error-correction prompt...');

  return await retryWithCorrection(cleanedFirst, errorDetails, messages);
};

const retryWithCorrection = async (
  invalidJson: string,
  errors: string,
  originalMessages: ChatMessage[]
): Promise<GeneratedGigContent> => {
  const correctionPrompt = getCorrectionPrompt(invalidJson, errors);

  const messages: ChatMessage[] = [
    ...originalMessages,
    { role: 'assistant', content: invalidJson },
    { role: 'user', content: correctionPrompt }
  ];

  const correctedResponse = await callDeepSeek(messages);
  const cleanedCorrected = cleanJsonResponse(correctedResponse);

  const parsed = JSON.parse(cleanedCorrected);
  const validation = GeneratedGigContentSchema.safeParse(parsed);

  if (!validation.success) {
    const doubleErrorDetails = validation.error.errors
      .map((e) => `Path "${e.path.join('.')}" : ${e.message}`)
      .join('\n');
    throw new Error(`AI generated response failed validation twice. Errors:\n${doubleErrorDetails}`);
  }

  return validation.data;
};

// Regenerates a specific section. Instructions could be: "Shorten content", "Make More Technical"
export const regenerateSection = async (
  originalGig: any,
  sectionPath: string,
  instructions: string
): Promise<any> => {
  const userPrompt = getSectionRegenerationPrompt(originalGig, sectionPath, instructions);

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];

  console.log(`Sending section regeneration request for "${sectionPath}" to DeepSeek...`);
  const response = await callDeepSeek(messages);
  const cleaned = cleanJsonResponse(response);

  try {
    const parsed = JSON.parse(cleaned);
    // Return parsed JSON representing the updated section value
    return parsed;
  } catch (err) {
    throw new Error('Failed to parse section regeneration response as valid JSON.');
  }
};
