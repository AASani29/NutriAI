
import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { mcpClientService } from '../../services/mcp-client-service';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY is not set. Chatbot will not work.');
}

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

export class ChatController {
    async handleChat(req: Request, res: Response): Promise<void> {
        const { message, history = [], userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        try {
            // 1. Get Tools from MCP
            const toolsList = await mcpClientService.listTools();
            const tools = toolsList.tools.map((tool: any) => {
                const parameters = { ...tool.inputSchema };
                delete parameters.$schema;
                return {
                    type: "function" as const,
                    function: {
                        name: tool.name,
                        description: tool.description,
                        parameters: parameters,
                    },
                };
            });

            // 2. Prepare Messages
            const systemContext = `(System: The user's ID is "${userId}". You must use this ID for all tool calls that require 'userId'. 
IMPORTANT: When adding items or logging consumption, if the user doesn't provide specific nutritional data (calories, protein, etc.), price, or category, you MUST estimate them based on the food item and quantity and pass them to the tool parameters. Do not ask the user for them unless necessary.)`;

            const messages: any[] = [
                { role: 'system', content: systemContext },
                ...history.map((h: any) => ({
                    role: h.role === 'model' ? 'assistant' : 'user', // Map 'model' to 'assistant' for Groq
                    content: h.content,
                })),
                { role: 'user', content: message },
            ];

            // 3. Initial Chat Completion
            let completion = await groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.3-70b-versatile',
                tools: tools,
                tool_choice: 'auto',
            });

            let responseMessage = completion.choices[0].message;

            // 4. Handle Tool Calls Loop
            while (responseMessage.tool_calls) {
                // Determine if we need to loop again (Groq might return multiple tool calls)
                // Add the assistant's message with tool_calls to the conversation history
                messages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    let functionArgs = JSON.parse(toolCall.function.arguments);

                    // Hack: Groq sometimes wraps arguments in an array [ { ... } ]
                    if (Array.isArray(functionArgs)) {
                        console.warn('⚠️ Groq returned array arguments, un-wrapping...');
                        functionArgs = functionArgs[0];
                    }

                    console.log(`🤖 Chatbot triggering tool: ${functionName}`, functionArgs);

                    // Execute Tool via MCP
                    const toolResult = await mcpClientService.callTool(functionName, functionArgs);

                    // Parse result content if it is a stringified JSON (common in MCP, but we need string for Groq)
                    let contentString = "";
                    if (toolResult.content && Array.isArray(toolResult.content)) {
                        contentString = (toolResult.content as any).map((c: any) => c.text).join("\n");
                    } else {
                        contentString = JSON.stringify(toolResult);
                    }

                    console.log(`✅ Tool executed result length:`, contentString.length);

                    messages.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: contentString,
                    });
                }

                // Get next completion from Groq with tool outputs
                completion = await groq.chat.completions.create({
                    messages: messages,
                    model: 'llama-3.3-70b-versatile',
                    tools: tools,
                    tool_choice: 'auto', // Continue allowing tools
                });

                responseMessage = completion.choices[0].message;
            }

            // 5. Final Response
            res.json({ response: responseMessage.content });

        } catch (error: any) {
            console.error('Chat processing error:', error);
            res.status(500).json({
                error: 'Failed to process chat message',
                details: error.message,
                stack: error.stack
            });
        }
    }
}

export const chatController = new ChatController();
