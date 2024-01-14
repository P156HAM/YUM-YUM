//note to self: the call only works when the API-key is provided as a string, this needs to be further devoloped.
import { MenuList } from "@zocom/types";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "xxx",
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
      const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
      const functionArgsArr = Object.values(functionArgs);
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

//

// export const fetchRecommendations = async (input: string, menu: MenuList) => {
//   const menuContext = createMenuContext(menu);
//   const completeQuestion = `${menuContext} Based on the following ingredients: ${input}, what would you recommend?`;

//   const url = "https://chatgpt-42.p.rapidapi.com/conversationgpt4";
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-RapidAPI-Key": "d9c4b149f7msh362415cf73c0f6ap1a25f2jsnd103b349832c",
//       "X-RapidAPI-Host": "chatgpt-42.p.rapidapi.com",
//     },
//     body: JSON.stringify({
//       messages: [
//         {
//           role: "user",
//           content: completeQuestion,
//         },
//       ],
//       system_prompt: "",
//       temperature: 0.9,
//       top_k: 5,
//       top_p: 0.9,
//       max_tokens: 256,
//       web_access: false,
//     }),
//   };

//   try {
//     const response = await fetch(url, options);
//     const result = await response.json();
//     console.log("API Response:", result);
//     return result;
//   } catch (error) {
//     console.error("Error fetching recommendations:", error);
//     return null;
//   }
// };

// async function main() {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "system", content: "You are a helpful assistant." }],
//     model: "gpt-3.5-turbo",
//   });

//   console.log(completion.choices[0]);
// }

// main();

// const createMenuContext = (menu: MenuList) => {
//   let context =
//     "Our restaurant specializes in a variety of wonton dishes and dips. Some of our popular dishes include: ";

//   menu.wonton.forEach((wonton) => {
//     context += `${
//       wonton.name
//     }, made with ingredients like ${wonton.ingredients?.join(", ")}. `;
//   });

//   context += "We also offer a selection of dips such as ";

//   menu.dip.forEach((dip, index, array) => {
//     context += dip.name;
//     if (index < array.length - 1) {
//       context += ", ";
//     }
//   });

//   return context + ".";
// };
