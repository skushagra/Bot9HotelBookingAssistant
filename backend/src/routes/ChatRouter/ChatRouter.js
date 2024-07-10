import OpenAI from "../../openai/ai.js";


const ChatSessions = {
    0: OpenAI
};

const ChatRouter = async (req, res) => {
    const { role, prompt, sessionToken } = req.body;
    const chatSession = ChatSessions[sessionToken];

    let response = null;
    if(chatSession) {
        response = await chatSession.createChatPrompt(prompt);
    } else {
        ChatSessions[sessionToken] = OpenAI;
        const session = ChatSessions[sessionToken];
        response = await session.createChatPrompt(prompt);
    }
    if (role === "user") {
        res.send(response);
    } else {
        res.send("Invalid role");
    }
}

export default ChatRouter;