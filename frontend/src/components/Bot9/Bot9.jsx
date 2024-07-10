import { useEffect, useMemo, useRef, useState } from "react";
import "./Bot9.css";
import Typewriter from 'typewriter-effect';
import axios from "axios";
import MarkDown from "react-markdown";
import remarkGfm from 'remark-gfm'

export default function Bot9() {

    const [sessionToken, setSessionToken] = useState("");
    useEffect(() => {
        setSessionToken(Math.floor(Math.random() * 1000000));
    }, []);

    const API_URL = process.env.REACT_APP_BOT9_SERVER_URL;

    const [responding, setResponding] = useState(false);

    const [chats, setChats] = useState([
        {
            role: "system",
            content: "Hello I am Bot9, your hotel booking assistant. How can I help you today?",
        }
    ]);

    const autoScroll = () => {
        const chatArea = document.querySelector(".charArea");
        chatArea.scrollTo({
            top: chatArea.scrollHeight,
            behavior: "smooth"
        })
    }

    const promptRef = useRef(null);

    useEffect(() => {
        const promptSubmiter = document.getElementById("promptSumitter");
        promptSubmiter.focus();

        if(responding) {
            promptRef.current.disabled = true;
        } else {
            promptRef.current.disabled = false;
        }

        const handleKeyPress =  async (e) => {
            if(e.key === "Enter") {
                const prompt = promptSubmiter.value;
                setChats(prevChats => [...prevChats, {
                    sessionToken: sessionToken,
                    role: "user",
                    content: prompt
                }]);
                promptSubmiter.value = "";
                console.log(API_URL+"/chat");
                setChats(prevChats => [...prevChats, {
                    sessionToken: sessionToken,
                    role: "system",
                    content: "prompting . . ."
                }]);
                await axios.post(API_URL+"/chat", {
                    role: "user",
                    prompt: prompt
                }).then(response => {
                    if (response){
                        setResponding(true);
                        setChats(prevChats => prevChats.slice(0, prevChats.length - 1));
                        setChats(prevChats => [...prevChats, {
                            role: "system",
                            content: response.data
                        }]);
                    }
                }).catch(error => {
                    console.error(error);
                }
                ).finally(() => {
                    setResponding(false);
                });
            }
        };
        promptSubmiter.addEventListener("keypress", handleKeyPress);

        // Cleanup event listener on component unmount
        return () => {
            promptSubmiter.removeEventListener("keypress", handleKeyPress); 
        };
    }, []);

    useEffect(() => {
        autoScroll();
    }
    , [chats]);

    return (
        <div className="bot9">
            <div className="topNav">
                Bot9 Hotel Booking Chat Bot
            </div>
            <div className="chatScreen">
                <div className="charArea">
                    {
                        chats.map((chat, index) => (
                            <div key={index} className={`chatBubble ${chat.role}`}>
                                <div className="userTitle">
                                    <img src={chat.role === "user" ? "https://api.multiavatar.com/stefan.svg" : "https://api.multiavatar.com/kathrin.svg"} alt="" height={30} width={30} />
                                    {chat.role === "user" ? "You" : "Bot9 Hotel Booking Assistant"}
                                </div>
                                {
                                    <MarkDown remarkPlugins={[remarkGfm]}>{chat.content}</MarkDown>
                                }
                            </div>  
                        ))
                    }
                </div>
            </div>
            <div className="inputArea">
                <input ref={promptRef} id="promptSumitter" type="text" className="promptInput" placeholder="Write your thoughts here . . . "  />
            </div>
        </div>
    );
}
