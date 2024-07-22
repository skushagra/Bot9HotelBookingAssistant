import openai from 'openai';
import axios from 'axios';
import Chat from "../models/chat.js"
import { v4 as uuidv4 } from 'uuid';
import { OPENAI_KEY } from '../env.js';
class OpenAI {
    constructor() {
        this.openai = new openai({
            apiKey: OPENAI_KEY,
        });

        this.completion = null;
        this.sessionToken= uuidv4();

        this.chat = [
            { role: "system", content: "You are a helpful assistant." },
            { role: "system", content: "You are a bot to book hotel rooms for bot9 resort." },
            { role: "system", content: "You are to talk only about the hotel and queries related to its booking." },
            { role: "system", content: "You should detect and reply in the tone and language of the user. Use a language translator to translate English responses to the script of the language of the user." },
            { role: "system", content: "Maintain the flow of the conversation and ask different questions and give different responses. Return all responses in with markdown, formatting the reply based on the prompt. Use Bold text, bullet points, and tables to show data to the user." },
            { role: "system", content: "When a user first responds, you should greet them and welcome them to the hotel." },
            { role: "system", content: "You should ask the user for their name and then use it in the conversation." },
            { role: "system", content: "You should ask if they are planning to book a room." },
            { role: "system", content: "You should show the user all the available room options." },
            { role: "system", content: "When a user wants to book a room, ask for their name, email, the room they want to stay in, and for how many nights they are staying." },
        ];

        this.rooms = null;
    }

    async createChatCompletion() {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: this.chat,
            functions: [
                {
                    name: "fetchRoomDetails",
                    description: "Fetch the details of available rooms.",
                    parameters: {
                        type: "object",
                        properties: {},
                        required: []
                    }
                },
                {
                    name: "makeBooking",
                    description: "Make a booking for a room.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Name of the user" },
                            email: { type: "string", description: "Email of the user" },
                            roomId: { type: "integer", description: "ID corresponging to the type of room to book entered by the user" },
                            nights: { type: "integer", description: "Number of nights to stay" }
                        },
                        required: ["name", "email", "roomId", "nights"]
                    }
                }
            ]
        });
        return completion;
    }

    async handleFunctionOpenAICall(functionCall) {
        const { name, arguments: args } = functionCall;
        const parsedArgs = JSON.parse(args);
        switch (name) {
            case 'fetchRoomDetails': {
                const roomsDetails = await this.fetchRoomDetails().then((roomDetails) => {
                    return roomDetails;
                });
                return roomsDetails;
            }
            case 'makeBooking': {
                if (!parsedArgs.name || !parsedArgs.email) {
                    throw new Error("Name and email are required for booking.");
                }
                const bookingDetails = JSON.stringify({
                    "email": parsedArgs.email,
                    "fullName": parsedArgs.name,
                    "nights": parsedArgs.nights,
                    "roomId": parsedArgs.roomId,
                });
                const respo = await this.makeBooking(bookingDetails).then((bookingResponse) => {
                    return bookingResponse;
                });
                return respo;
            }
            default:
                throw new Error(`Unsupported function: ${name}`);
        }
    }

    async fetchRoomDetails() {
        try {
            const res = await axios.get('https://bot9assignement.deno.dev/rooms');
            const rooms = await res.data;
            return rooms;
        } catch (error) {
            console.error('Error fetching room details:', error);
            return [];
        }
    }

    async makeBooking(bookingDetails) {
        try {
            const res = await axios.post('https://bot9assignement.deno.dev/book', bookingDetails);
            const booking = await res.data;
            return booking;
        } catch (error) {
            console.error('Error making booking:', error);
            return null;
        }
    }

    async createChatPrompt(prompt) {
        this.chat.push({ role: "user", content: prompt });
        Chat.create({ 
            role: "user",
            message: prompt,
            sessionToken: this.sessionToken,
        });
        this.completion = await this.createChatCompletion();
        const message = this.completion.choices[0].message;

        if (message.function_call) {
            const functionCallResponse = await this.handleFunctionOpenAICall(message.function_call);
            this.chat.push({ role: "system", content: JSON.stringify(functionCallResponse) });
            this.completion = this.createChatCompletion();
            Chat.create({ 
                role: "system",
                message: (await this.completion).choices[0].message.content,
                sessionToken: this.sessionToken,
            });
            return (await this.completion).choices[0].message.content;
        } else {
            this.chat.push({ role: "system", content: message.content });
            Chat.create({ 
                role: "system",
                message: message.content,
                sessionToken: this.sessionToken,
            });
        }

        return message.content;
    }
}

export default new OpenAI();
