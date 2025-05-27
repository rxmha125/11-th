
'use server';

/**
 * @fileOverview Generates a personalized love poem based on the number of months together.
 *
 * - generatePoem - A function that generates a poem.
 * - PoemGeneratorInput - The input type for the generatePoem function.
 * - PoemGeneratorOutput - The return type for the generatePoem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PoemGeneratorInputSchema = z.object({
  monthsTogether: z
    .number()
    .describe('The number of months the couple has been together.'),
  userName: z.string().describe('The name of the user receiving the poem'),
  partnerName: z.string().describe("The name of the user's partner"),
});
export type PoemGeneratorInput = z.infer<typeof PoemGeneratorInputSchema>;

const PoemGeneratorOutputSchema = z.object({
  poem: z.string().describe('A short, personalized love poem.'),
});
export type PoemGeneratorOutput = z.infer<typeof PoemGeneratorOutputSchema>;

export async function generatePoem(input: PoemGeneratorInput): Promise<PoemGeneratorOutput> {
  return poemGeneratorFlow(input);
}

const poemGeneratorPrompt = ai.definePrompt({
  name: 'poemGeneratorPrompt',
  input: {schema: PoemGeneratorInputSchema},
  output: {schema: PoemGeneratorOutputSchema},
  prompt: `Write a short, personalized love poem for {{userName}} to give to {{partnerName}} celebrating {{monthsTogether}} months together. The poem should be no more than 6 lines.`,
});

const poemGeneratorFlow = ai.defineFlow(
  {
    name: 'poemGeneratorFlow',
    inputSchema: PoemGeneratorInputSchema,
    outputSchema: PoemGeneratorOutputSchema,
  },
  async input => {
    const {output} = await poemGeneratorPrompt(input);
    return output!;
  }
);

