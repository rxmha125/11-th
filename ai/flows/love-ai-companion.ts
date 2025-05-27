
'use server';

/**
 * @fileOverview A Love AI Companion that provides supportive and affectionate messages.
 *
 * - getLoveAiMessage - A function that returns a love-themed message.
 * - GetLoveAiMessageInput - The input type for the getLoveAiMessage function.
 * - GetLoveAiMessageOutput - The return type for the getLoveAiMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLoveAiMessageInputSchema = z.object({
  milestone: z
    .string()
    .optional()
    .describe('A milestone in the relationship (e.g., "first date", "6 months", "1 year").'),
  userInteraction: z
    .string()
    .optional()
    .describe('A description of the user interaction (e.g., "clicked surprise button", "scrolled timeline", "requested another thought (timestamp/random_id)").'),
});
export type GetLoveAiMessageInput = z.infer<typeof GetLoveAiMessageInputSchema>;

const GetLoveAiMessageOutputSchema = z.object({
  message: z.string().describe('A supportive and affectionate message.'),
});
export type GetLoveAiMessageOutput = z.infer<typeof GetLoveAiMessageOutputSchema>;

export async function getLoveAiMessage(input: GetLoveAiMessageInput): Promise<GetLoveAiMessageOutput> {
  return getLoveAiMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loveAiMessagePrompt',
  input: {schema: GetLoveAiMessageInputSchema},
  output: {schema: GetLoveAiMessageOutputSchema},
  prompt: `You are a supportive and affectionate AI companion, designed to enhance the emotional impact of an anniversary web experience.

  Based on the relationship milestone or user interaction, provide a relevant and heartwarming message. The message should be relatively short and sweet.

  Examples:
  - Milestone: "11 months" -> Message: "11 months and counting... ready for 100 more?"
  - User Interaction: "clicked surprise button" -> Message: "She's going to love this... 💌"
  - User Interaction: "requested another thought" -> Message: "Thinking of you always brings a smile to my face! 😊"
  - User Interaction: "viewed first memory" -> Message: "Remember that first spark? It still burns so brightly! ✨"

  Milestone: {{milestone}}
  User Interaction: {{userInteraction}}

  Respond with a single, unique, and heartfelt message. Avoid repetition if similar inputs are provided.`,
  config: { // Added safety settings
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE', // Be permissive for general content
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', // Adjust if needed, but love messages should be fine
      },
    ],
  },
});

const getLoveAiMessageFlow = ai.defineFlow(
  {
    name: 'getLoveAiMessageFlow',
    inputSchema: GetLoveAiMessageInputSchema,
    outputSchema: GetLoveAiMessageOutputSchema,
  },
  async input => {
    console.log('Love AI Companion flow received input:', JSON.stringify(input)); // Log received input
    try {
      const {output} = await prompt(input);
      if (!output || !output.message) {
        console.error('Love AI Companion flow: Prompt returned empty output.');
        return { message: "My heart is full of love for you, even when words are few. 💖" };
      }
      return output;
    } catch (error) {
      console.error('Error in getLoveAiMessageFlow:', error);
      // Provide a meaningful fallback if the AI call fails
      return { message: "Thinking of our journey... it's simply wonderful! 🥰 (Flow error)" };
    }
  }
);

