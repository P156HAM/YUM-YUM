//note to self: the call only works when the API-key is provided as a string, this needs to be further devoloped.
import { MenuList } from "@zocom/types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function fetchMenu(): Promise<MenuList> {
  const API_URL: string = import.meta.env.VITE_API_URL;
  const response = await fetch(`${API_URL}/`);
  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }
  return response.json();
}

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "fetchMenu",
      description: "Get food recommendations based on preferred ingredients",
      parameters: {
        type: "object",
        properties: {
          ingredients: {
            type: "array",
            items: {
              type: "string",
            },
            description: "List of ingredients you like",
          },
        },
        required: [],
      },
    },
  },
];

const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Only use the functions you have been provided with to get the menu items, you will be then a helpful assistant for the restaurant customer to give them recommendations based on their preferences of ingredients or other preferences.",
  },
];

export async function agent(userInput: string) {
  messages.push({
    role: "user",
    content: userInput,
  });

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      tools: tools,
    });
    const { finish_reason, message } = response.choices[0];

    if (finish_reason === "tool_calls" && message.tool_calls) {
      const functionName = message.tool_calls[0].function.name;
      const functionToCall = fetchMenu;
      const functionResponse = await functionToCall.apply(null);

      messages.push({
        role: "function",
        name: functionName,
        content: `
                  The result of the last function was this: ${JSON.stringify(
                    functionResponse
                  )}
                  `,
      });
    } else if (finish_reason === "stop") {
      messages.push(message);
      return message.content;
    }
  }
  return "The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.";
}

const response = await agent(
  "Please suggest some activities based on my location and the weather."
);

console.log("response:", response);
