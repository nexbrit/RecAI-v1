import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 0.3,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<T> {
  const response = await generateCompletion(systemPrompt, userPrompt, options);

  // Extract JSON from the response
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/);
  const jsonString = jsonMatch ? jsonMatch[1] : response;

  try {
    return JSON.parse(jsonString.trim());
  } catch (error) {
    // Try to find JSON object in the response
    const objectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error(`Failed to parse JSON response: ${response}`);
  }
}

export { anthropic };
