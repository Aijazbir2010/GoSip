import { useState, useEffect, useRef } from "react";
import socket from "~/socket";
import NaviagtionBar from "@components/NaviagtionBar"
import ChatsList from "@components/ChatsList";
import GoSipLogoBox from "@components/GoSipLogoBox";
import { getUser } from "utils/getUser";
import { getChatRooms } from "utils/getChatRooms";
import { getFriendRequests } from "utils/getFriendRequests";

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

  const friendRequests = await getFriendRequests(request)

  return json({ user, chatRooms, friendRequests: friendRequests.users }, { headers: responseHeaders })
}

const Chats = () => {

  const { chatId } = useParams()
  const loaderData = useLoaderData<{ user: userType, chatRooms: chatRoomType[], friendRequests: { name: string, GoSipID: string, profilePic: string }[] }>()
  const [user, setUser] = useState<userType | null>(null)
  const [chatRooms, setChatRooms] = useState<chatRoomType[] | null>(null)
  const allChatRoomsRef = useRef(loaderData.chatRooms)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }

    if (!chatRooms) {
      setChatRooms(loaderData.chatRooms)
    }
  }, [loaderData])

  useEffect(() => {
    socket.emit('join')

    const unreadCountUpdateHandler = ({ chatRoomID, unreadCount }: { chatRoomID: string, unreadCount: number }) => {
      setChatRooms((prev) => {
        if (!prev) return prev

        return prev.map((chatRoom) => chatRoom.chatRoomID === chatRoomID ? {...chatRoom, unreadCount} : chatRoom)
      })
    }

    const acceptedRequestHandler = (data: { chatRoomID: string, friend: { name: string, GoSipID: string, profilePic: string }, unreadCount: number }) => {
      setChatRooms((prev) => {
        if (!prev) return prev

        allChatRoomsRef.current = [...prev, data]
        return [...prev, data]
      })
    }

    const removedFriendHandler = (GoSipID: string) => {
      setChatRooms((prev) => {
        if (!prev) return prev

        allChatRoomsRef.current = prev.filter(chatRoom => chatRoom.friend.GoSipID !== GoSipID)
        return prev.filter(chatRoom => chatRoom.friend.GoSipID !== GoSipID)
      })
    }

    socket.on('unreadCountUpdate', unreadCountUpdateHandler)

    socket.on('acceptedRequest', acceptedRequestHandler)

    socket.on('removedFriend', removedFriendHandler)

    return () => {
      socket.off('unreadCountUpdate', unreadCountUpdateHandler)
      socket.off('acceptedRequest', acceptedRequestHandler)
      socket.off('removedFriend', removedFriendHandler)
    }
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setQuery(query)

    if (query.trim() === '') {
      setChatRooms(allChatRoomsRef.current)
      return
    }

    setChatRooms(allChatRoomsRef.current.filter(chatRoom => chatRoom.friend.name.toLowerCase().includes(query.toLowerCase()) || chatRoom.friend.GoSipID.includes(query.toUpperCase())))
    
  }

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar userProp={user} friendRequestsProp={loaderData.friendRequests}/>

        <ChatsList chatRooms={chatRooms} searchBarValue={query} handleSearchBarChange={handleSearch}/>

        {chatId ? <Outlet /> : <GoSipLogoBox />}
    </div>
  )
}

export default Chats