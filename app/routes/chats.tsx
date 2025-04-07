import { useState, useEffect } from "react";
import socket from "~/socket";
import NaviagtionBar from "@components/NaviagtionBar"
import ChatsList from "@components/ChatsList";
import GoSipLogoBox from "@components/GoSipLogoBox";
import { getUser } from "utils/getUser";
import { getChatRooms } from "utils/getChatRooms";

import { Outlet, useParams, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import type { userType } from "types/user";
import type { chatRoomType } from "types/chatRoom";
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

// Loader
export const loader = async ({ request }: { request: Request }) => {

  const responseHeaders = new Headers()

  const response = await getUser(request, responseHeaders)

  const user = response?.user || null

  if (!user) {
    return redirect('/login')
  }

  const chatRooms = await getChatRooms(request)

  return json({ user, chatRooms }, { headers: responseHeaders })
}

const Chats = () => {

  const { chatId } = useParams()
  const loaderData = useLoaderData<{ user: userType, chatRooms: chatRoomType[] }>()
  const [user, setUser] = useState<userType | null>(null)
  const [chatRooms, setChatRooms] = useState<chatRoomType[] | null>(null)

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }

    if (!chatRooms) {
      setChatRooms(loaderData.chatRooms)
    }
  }, [loaderData])

  useEffect(() => {
    if (user) {
      socket.emit('join', user.GoSipID)
    }
  }, [user])

  useEffect(() => {
    socket.on('unreadCountUpdate', ({ chatRoomID, unreadCount }) => {
      setChatRooms((prev) => {
        if (!prev) return prev

        return prev.map((chatRoom) => chatRoom.chatRoomID === chatRoomID ? {...chatRoom, unreadCount} : chatRoom)
      })
    })

    return () => {
      socket.off('unreadCountUpdate')
    }
  }, [])

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar profilePic={user?.profilePic || '/GoSipDefaultProfilePic.jpg'}/>

        <ChatsList chatRooms={chatRooms} user={user}/>

        {chatId ? <Outlet /> : <GoSipLogoBox />}
    </div>
  )
}

export default Chats