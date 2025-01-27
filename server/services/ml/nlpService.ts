import { z } from 'zod';

const TaskSchema = z.object({
  description: z.string(),
  steps: z.array(z.string()),
  constraints: z.array(z.string())
});

export type Task = z.infer<typeof TaskSchema>;

interface ActionValidation {
  valid: boolean;
  reason?: string;
}

const VENICE_API_URL = 'https://api.venice.ai/api/v1/chat/completions';
const VENICE_API_KEY = 'YtUUTkpPC1OU2kUU9Q9vOIrse0QApvmuoRLCxpWmrs';

export class NLPService {
  private temperature: number = 0.7;
  private maxTokens: number = 1000;

  private async makeVeniceRequest(messages: Array<{ role: string; content: string }>) {
    try {
      const response = await fetch(VENICE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VENICE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "fastest",
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`Venice API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Venice API request failed:', error);
      throw new Error(`Venice API request failed: ${error?.message || 'Unknown error'}`);
    }
  }

  public async parseTask(input: string): Promise<Task> {
    try {
      const content = await this.makeVeniceRequest([
        {
          role: "system",
          content: `Parse the given task into structured steps and constraints.
                   Consider UI interaction safety, system resource usage, and task complexity.
                   Break down complex tasks into atomic steps.
                   Return JSON with fields: description (string), steps (array of strings), constraints (array of strings)`
        },
        {
          role: "user",
          content: input
        }
      ]);

      const parsed = TaskSchema.safeParse(JSON.parse(content));

      if (!parsed.success) {
        throw new Error(`Invalid task format: ${parsed.error.message}`);
      }

      return parsed.data;
    } catch (error: any) {
      console.error('Error parsing task:', error);
      throw new Error(`Failed to parse task: ${error?.message || 'Unknown error'}`);
    }
  }

  public async validateAction(
    action: string,
    constraints: string[]
  ): Promise<ActionValidation> {
    try {
      const content = await this.makeVeniceRequest([
        {
          role: "system",
          content: `Validate if the proposed action complies with the given constraints.
                   Consider safety, resource usage, and potential side effects.
                   Return JSON with fields: valid (boolean) and reason (string).`
        },
        {
          role: "user",
          content: JSON.stringify({ action, constraints })
        }
      ]);

      const result = JSON.parse(content);
      return {
        valid: result.valid,
        reason: result.reason
      };
    } catch (error: any) {
      console.error('Error validating action:', error);
      return {
        valid: false,
        reason: `Validation error: ${error?.message || 'Unknown error'}`
      };
    }
  }

  public async generateNextAction(
    task: Task,
    currentStep: number,
    context: string
  ): Promise<string> {
    try {
      const content = await this.makeVeniceRequest([
        {
          role: "system",
          content: `Generate the next action for the current step of the task.
                   Consider the current context and previous steps.
                   Return a specific, executable action.`
        },
        {
          role: "user",
          content: JSON.stringify({
            task,
            currentStep,
            context
          })
        }
      ]);

      return content;
    } catch (error: any) {
      console.error('Error generating next action:', error);
      throw new Error(`Failed to generate next action: ${error?.message || 'Unknown error'}`);
    }
  }
}