import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { mcpClientService } from '../../services/mcp-client-service';
import prisma from '../../config/database';
import { healthAdvisorService } from '../health-advisor/health-advisor-service';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY is not set. Chatbot will not work.');
}

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

export class ChatController {
    /**
     * Main chat handler supporting Copilot modes.
     */
    async handleChat(req: Request, res: Response): Promise<void> {
        const { message, sessionId, mode = 'ask', userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        try {
            // 1. Resolve or create Chat Session
            let session;
            if (sessionId) {
                session = await prisma.chatSession.findUnique({
                    where: { id: sessionId },
                    include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } }
                });
            }

            if (!session) {
                const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
                if (!dbUser) {
                    res.status(404).json({ error: 'User not found in database' });
                    return;
                }

                // Check for existing session for this specific mode to reuse
                session = await prisma.chatSession.findFirst({
                    where: {
                        userId: dbUser.id,
                        sessionMode: mode
                    },
                    orderBy: { lastActivity: 'desc' },
                    include: { messages: { orderBy: { createdAt: 'asc' } } }
                });

                if (!session) {
                    session = await prisma.chatSession.create({
                        data: {
                            userId: dbUser.id,
                            sessionMode: mode,
                        },
                        include: { messages: true }
                    });
                }
            } else {
                // Update lastActivity
                await prisma.chatSession.update({
                    where: { id: session.id },
                    data: { lastActivity: new Date() }
                });
            }

            // 2. Save User Message
            await prisma.chatMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'user',
                    content: message
                }
            });

            let finalResponse = "";

            // 3. Routing based on mode
            // Prepare context: Use latest 10 messages (5 exchanges) for context window
            const historyContext = (session as any).messages ? (session as any).messages.slice(-10) : [];

            if (mode === 'ask') {
                console.log(`🧠 Ask Mode: Routing to HealthAdvisorService for user ${userId}`);
                // TODO: Update HealthAdvisorService to accept historyContext if needed for multi-turn RAG
                // For now, we pass the message as is, but could augment with previous context
                const adviceResult = await healthAdvisorService.getHealthAdvice(userId, message);
                finalResponse = adviceResult.advice || "I couldn't generate advice at this moment.";
            } else {
                console.log(`🤖 Agent Mode: Using MCP Tool-Calling logic for user ${userId}`);
                finalResponse = await this.handleAgentMode(userId, message, historyContext);
            }

            // 4. Save Assistant Response
            await prisma.chatMessage.create({
                data: {
                    sessionId: session.id,
                    role: 'assistant',
                    content: finalResponse
                }
            });

            // 5. Final Response
            res.json({
                response: finalResponse,
                sessionId: session.id
            });

        } catch (error: any) {
            console.error('Chat processing error:', error);
            res.status(500).json({
                error: 'Failed to process chat message',
                details: error.message
            });
        }
    }

    /**
     * Handles the Agent mode which involves MCP tool-calling.
     */
    private async handleAgentMode(userId: string, message: string, history: any[]): Promise<string> {
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

        const systemContext = `You are the NutriAI Task Agent. Your goal is to help the user manage their inventory and logs.
        The user's ID is "${userId}". Use this ID for all tool calls. 
        If nutritional data or prices are missing, estimate them (Prices in BDT). 
        Always be helpful and concise.`;

        const messages: any[] = [
            { role: 'system', content: systemContext },
            ...history.map((h: any) => ({
                role: h.role === 'assistant' ? 'assistant' : 'user',
                content: h.content,
            })),
            { role: 'user', content: message },
        ];

        // Initial Chat Completion
        let completion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            tools: tools,
            tool_choice: 'auto',
        });

        let responseMessage = completion.choices[0].message;

        // Handle Tool Calls Loop
        while (responseMessage.tool_calls) {
            messages.push(responseMessage);

            for (const toolCall of responseMessage.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                console.log(`🤖 Agent triggered tool: ${functionName}`);
                const toolResult = await mcpClientService.callTool(functionName, functionArgs);

                let contentString = "";
                if (toolResult.content && Array.isArray(toolResult.content)) {
                    contentString = (toolResult.content as any).map((c: any) => c.text).join("\n");
                } else {
                    contentString = JSON.stringify(toolResult);
                }

                messages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: contentString,
                });
            }

            completion = await groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.3-70b-versatile',
                tools: tools,
                tool_choice: 'auto',
            });

            responseMessage = completion.choices[0].message;
        }

        return responseMessage.content || "I have completed the requested tasks.";
    }

    /**
     * Retrieves the latest chat session history for a user.
     */
    async getHistory(req: Request, res: Response): Promise<void> {
        const { userId, mode } = req.query;

        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId is required' });
            return;
        }

        try {
            const user = await prisma.user.findUnique({
                where: { clerkId: userId }
            });

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            // Find the most recent session for this user AND mode
            const session = await prisma.chatSession.findFirst({
                where: {
                    userId: user.id,
                    sessionMode: (mode as string) || 'ask'
                },
                orderBy: { lastActivity: 'desc' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

            if (!session) {
                res.json({ history: [], sessionId: null, mode: 'ask' });
                return;
            }

            res.json({
                history: session.messages,
                sessionId: session.id,
                mode: (session as any).sessionMode || 'ask'
            });

        } catch (error: any) {
            console.error('Failed to fetch chat history:', error);
            res.status(500).json({ error: 'Failed to fetch chat history' });
        }
    }
}

export const chatController = new ChatController();
