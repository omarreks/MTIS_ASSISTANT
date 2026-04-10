import { z } from "zod";
import OpenAI from "openai";
import { protectedProcedure, router } from "./_core/trpc";
import { getStudentProfile, saveChatMessage } from "./db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId, name } = ctx.user;
      console.log(`[AI Chat] Request from user: ${name} (ID: ${userId})`);

      try {
        // 1. Save user message to history
        const userMessage = input.messages[input.messages.length - 1];
        await saveChatMessage(userId, "user", userMessage.content);

        // 2. Define tools for the AI agent
        const tools: OpenAI.Chat.ChatCompletionTool[] = [
          {
            type: "function",
            function: {
              name: "get_student_info",
              description: "Get detailed academic information for the currently logged-in student (GPA, credits, academic year, etc.)",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          },
        ];

        // 3. Initial OpenAI request
        const systemPrompt = "You are the MTIS Assistant at Modern University for Technology and Information. Your goal is to help students with academic inquiries. You have access to tools to fetch student data. Be professional, helpful, and concise.";
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...input.messages.map(m => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            }))
          ],
          tools,
        });

        const initialMessage = response.choices[0].message;

        // 4. Handle tool calls
        if (initialMessage.tool_calls) {
          const toolMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...input.messages.map(m => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
            initialMessage
          ];

          for (const toolCall of initialMessage.tool_calls) {
            if (toolCall.function.name === "get_student_info") {
              const profile = await getStudentProfile(userId);
              
              toolMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: profile ? JSON.stringify(profile) : "No student profile found.",
              });
            }
          }

          // Fetch final response from AI after tool execution
          const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: toolMessages,
          });

          const finalContent = finalResponse.choices[0].message.content || "I'm sorry, I couldn't process that.";
          await saveChatMessage(userId, "assistant", finalContent);
          return { content: finalContent };
        }

        // 5. No tool call, just return assistant message
        const finalContent = initialMessage.content || "I'm sorry, I couldn't process that.";
        await saveChatMessage(userId, "assistant", finalContent);
        return { content: finalContent };

      } catch (error) {
        console.error("[AI Chat Error]:", error);
        return { content: "I am having trouble connecting to my brain right now. Please try again later." };
      }
    }),
});
