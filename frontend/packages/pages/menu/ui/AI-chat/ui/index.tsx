import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { MenuList } from "@zocom/types";
import { agent, userPhoto, chefPhoto, closeLogo } from "@zocom/ai-chat";
import "./style.scss";

export const FoodRecommender = ({ menu }: { menu: MenuList }) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  type ChatMessage = {
    user: boolean;
    text: string;
  };

  type Recommendations = {
    name: string;
    description: string;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    let nextBotMessage = "";

    // Process user input
    if (userInput.toLowerCase() === "hello") {
      nextBotMessage =
        "Hello! I am YUMYUM chef. I can help you choose what to eat. Please tell me what ingredients you like.";
    } else {
      // Call the API for recommendations
      const apiResponse = await agent(userInput);
      nextBotMessage =
        apiResponse || "I couldn't find any recommendations at the moment.";
    }
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { user: true, text: userInput },
      { user: false, text: nextBotMessage },
    ]);

    setUserInput("");
  };

  const recommendDishes = (input: string) => {
    const keywords = input.toLowerCase().split(" ");
    const recommendedWontons = menu.wonton
      .filter((wonton) =>
        keywords.some(
          (keyword) =>
            wonton.name.toLowerCase().includes(keyword) ||
            wonton.desc.toLowerCase().includes(keyword) ||
            wonton.ingredients?.some((ingredient) =>
              ingredient.toLowerCase().includes(keyword)
            )
        )
      )
      .map((wonton) => ({ name: wonton.name, description: wonton.desc }));

    const recommendedDips = menu.dip
      .filter((dip) =>
        keywords.some(
          (keyword) =>
            dip.name.toLowerCase().includes(keyword) ||
            dip.desc.toLowerCase().includes(keyword)
        )
      )
      .map((dip) => ({ name: dip.name, description: dip.desc }));

    setRecommendations([...recommendedWontons, ...recommendedDips]);
  };

  return (
    <div className="food-recommender">
      {isChatOpen ? (
        <div className="chat-box">
          <header className="chat-header">
            <img
              className="close-chat"
              src={closeLogo}
              onClick={() => setIsChatOpen(false)}
            />
          </header>
          <div className="chat-history">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.user ? "user-row" : "bot-row"
                }`}
              >
                <img
                  src={message.user ? userPhoto : chefPhoto}
                  alt={message.user ? "User" : "Bot"}
                  className="message-photo"
                />
                <div className={`message ${message.user ? "user" : "bot"}`}>
                  {message.text}
                </div>
              </div>
            ))}
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation">
                {rec.name}: {rec.description}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Enter your message here"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : (
        <div className="chat-circle" onClick={() => setIsChatOpen(true)}>
          Chat
        </div>
      )}
    </div>
  );
};
