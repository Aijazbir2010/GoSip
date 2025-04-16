import { useState, useEffect, useRef } from "react";
import socket from "~/socket";
import NavigationBar from "@components/NavigationBar"
import GroupchatsList from "@components/GroupchatsList";
import GoSipLogoBox from "@components/GoSipLogoBox";
import { getUser } from "utils/getUser";
import { getFriendRequests } from "utils/getFriendRequests";
import { getFriends } from "utils/getFriends";
import { getGroupChatRooms } from "utils/getGroupChatRooms";
import { json, redirect, createCookie } from "@remix-run/node";

import { Outlet, useParams, useLoaderData } from "@remix-run/react";

import type { userType } from "types/user";
import type { groupChatRoomType } from "types/groupChatRoom";
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

  if (response === 'SessionExpired') {
      const refreshTokenCookie = createCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
  
      const headers = new Headers()
  
      headers.append("Set-Cookie", await refreshTokenCookie.serialize("", { maxAge: 0 }))
  
      return redirect('/login?msg=SessionExpired', { headers })
    }

  const user = response?.user || null

  if (!user) {
    return redirect('/login')
  }

  const friendRequests = await getFriendRequests(request)

  const friendsData = await getFriends(request)

  const groupChatRoomsData = await getGroupChatRooms(request)

  if (groupChatRoomsData.groupChatRooms) {
    return json({ user, friendRequests: friendRequests?.users, friends: friendsData?.friends, groupChatRooms: groupChatRoomsData.groupChatRooms }, { headers: responseHeaders })
  }

  return json({ user, friendRequests: friendRequests?.users, friends: friendsData?.friends, groupChatRooms: [] }, { headers: responseHeaders }) 
}

const GroupChats = () => {

  const { groupchatId } = useParams()
  const loaderData = useLoaderData<{ user: userType, friendRequests: { name: string, GoSipID: string, profilePic: string }[], friends: { name: string, GoSipID: string, profilePic: string }[], groupChatRooms: groupChatRoomType[] }>()
  const [user, setUser] = useState<userType | null>(null)
  const [groupChatRooms, setGroupChatRooms] = useState<groupChatRoomType[] | null>(null)
  const allGroupChatRoomsRef = useRef(loaderData.groupChatRooms)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }
    if (!groupChatRooms) {
      setGroupChatRooms(loaderData.groupChatRooms)
    }
  }, [loaderData])

  useEffect(() => {
    socket.emit('join')

    const groupCreatedHandler = ({ groupChatRoomID, groupName, groupAvatar, unreadCount }: groupChatRoomType) => {
      setGroupChatRooms((prev) => {
        if (!prev) return prev

        allGroupChatRoomsRef.current = [...allGroupChatRoomsRef.current, { groupChatRoomID, groupName, groupAvatar, unreadCount }]
        return [...prev, { groupChatRoomID, groupName, groupAvatar, unreadCount }]
      })
    }

    const groupUpdatedHandler = ({ groupChatRoomID, groupName, groupAvatar }: { groupChatRoomID: string, groupName: string, groupAvatar: string }) => {
      setGroupChatRooms((prev) => {
        if (!prev) return prev

        allGroupChatRoomsRef.current = allGroupChatRoomsRef.current.map((chatRoom) => {
          if (chatRoom.groupChatRoomID === groupChatRoomID) {
            return { ...chatRoom, groupName, groupAvatar }
          }

          return chatRoom
        })

        return prev.map((chatRoom) => {
          if (chatRoom.groupChatRoomID === groupChatRoomID) {
            return { ...chatRoom, groupName, groupAvatar }
          }

          return chatRoom
        })
      })
    }

    const leftGroupHandler = ({ GoSipID, groupChatRoomID }: { GoSipID: string, groupChatRoomID: string }) => {
      if (GoSipID === user?.GoSipID) {
        setGroupChatRooms((prev) => {
          if (!prev) return prev

          allGroupChatRoomsRef.current = allGroupChatRoomsRef.current.filter((room) => room.groupChatRoomID !== groupChatRoomID)
          return prev.filter((room) => room.groupChatRoomID !== groupChatRoomID)
        })
      }
    }

    const addedToNewGroupHandler = (groupChatRoom: { groupChatRoomID: string, groupName: string, groupAvatar: string, unreadCount: number }) => {
      setGroupChatRooms((prev) => {
        if (!prev) return prev

        allGroupChatRoomsRef.current = [...allGroupChatRoomsRef.current, groupChatRoom]
        return [...prev, groupChatRoom]
      })
    }

    const groupDeletedHandler = (groupChatRoomID: string) => {
      setGroupChatRooms((prev) => {
        if (!prev) return prev

        allGroupChatRoomsRef.current = allGroupChatRoomsRef.current.filter((room) => room.groupChatRoomID !== groupChatRoomID)
        return prev.filter((room) => room.groupChatRoomID !== groupChatRoomID)
      })
    }

    const unreadCountUpdateHandler = ({ chatRoomID, unreadCount }: { chatRoomID: string, unreadCount: number }) => {
      setGroupChatRooms((prev) => {
        if (!prev) return prev

        return prev.map((room) => room.groupChatRoomID === chatRoomID ? { ...room, unreadCount } : room)
      })
    }

    socket.on('groupCreated', groupCreatedHandler)
    socket.on('groupUpdated', groupUpdatedHandler)
    socket.on('leftGroup', leftGroupHandler)
    socket.on('addedToNewGroup', addedToNewGroupHandler)
    socket.on('groupDeleted', groupDeletedHandler)
    socket.on('unreadCountUpdate', unreadCountUpdateHandler)

    return () => {
      socket.off('groupCreated', groupCreatedHandler)
      socket.off('groupUpdated', groupUpdatedHandler)
      socket.off('leftGroup', leftGroupHandler)
      socket.off('addedToNewGroup', addedToNewGroupHandler)
      socket.off('groupDeleted', groupDeletedHandler)
      socket.off('unreadCountUpdate', unreadCountUpdateHandler)
    }

  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setQuery(query)

    if (query.trim() === '') {
      setGroupChatRooms(allGroupChatRoomsRef.current)
      return
    }

    setGroupChatRooms(allGroupChatRoomsRef.current.filter(chatRoom => chatRoom.groupName.toLowerCase().includes(query.toLowerCase())))
    
  }

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NavigationBar userProp={user} friendRequestsProp={loaderData.friendRequests}/>

        <GroupchatsList friends={loaderData.friends} groupChatRooms={groupChatRooms} searchBarValue={query} handleSearchBarChange={handleSearch}/>

        {groupchatId ? <Outlet /> : <GoSipLogoBox />}
    </div>
  )
}

export default GroupChats