import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

export interface Task {
  description: string;
  steps: string[];
  constraints: string[];
}

export interface NLPProcessorConfig {
  temperature: number;
  maxTokens: number;
}

export function useNLPProcessor(config: NLPProcessorConfig = {
  temperature: 0.7,
  maxTokens: 1000
}) {
  const parseTask = async (input: string): Promise<Task> => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Parse the given task into structured steps and constraints. Return JSON with fields: description, steps (array), constraints (array)"
          },
          {
            role: "user",
            content: input
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content) as Task;
    } catch (error) {
      console.error('Error parsing task:', error);
      throw error;
    }
  };

  const validateAction = async (
    action: string,
    constraints: string[]
  ): Promise<boolean> => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Validate if the proposed action complies with the given constraints. Return JSON with field: valid (boolean)"
          },
          {
            role: "user",
            content: JSON.stringify({ action, constraints })
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.valid;
    } catch (error) {
      console.error('Error validating action:', error);
      return false;
    }
  };

  return {
    parseTask,
    validateAction
  };
}
