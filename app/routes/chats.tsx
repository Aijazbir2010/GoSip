import NaviagtionBar from "@components/NaviagtionBar"
import ChatsList from "@components/ChatsList";
import GoSipLogoBox from "@components/GoSipLogoBox";

import { Outlet, useParams } from "@remix-run/react";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { 
      title: "GoSip - Modern and Secure Chat App" },
    { 
      name: "description", 
      content: "GoSip is a modern, secure, and stylish chat application designed to make messaging effortless and fun. Enjoy real-time chats and customizable features for a truly futuristic communication experience." 
    },
    { 
      name: "keywords", 
      content: "GoSip, modern chat app, secure messaging, real-time chat, futuristic chat application, seamless communication, customizable messaging, instant messaging app" 
    }
  ];
};

const Chats = () => {

  const { chatId } = useParams()

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar />

        <ChatsList />

        {chatId ? <Outlet /> : <GoSipLogoBox />}
    </div>
  )
}

export default Chats