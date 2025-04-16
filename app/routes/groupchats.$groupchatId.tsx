import { useState, useEffect } from "react";
import GroupchatArea from "@components/GroupchatArea"
import socket from "~/socket";
import { getUser } from "utils/getUser";
import { getFriends } from "utils/getFriends";
import { getGroupChatMessages } from "utils/getGroupChatMessages";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";

import { userType } from "types/user";
import { messageType } from "types/message";

// Loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {

  const responseHeaders = new Headers()

  const response = await getUser(request, responseHeaders)

  const user = response.user

  // Fetch Messages
  const groupChatRoomID = params.groupchatId || ''

  const groupChatData = await getGroupChatMessages(request, groupChatRoomID)

  if (!groupChatData) {
    return redirect('/groupchats')
  }

  const friendsData = await getFriends(request)

  return json({ user, friends: friendsData?.friends, groupChatRoomID, groupName: groupChatData.groupName, groupAvatar: groupChatData.groupAvatar, groupAdmin: groupChatData.groupAdmin, messages: groupChatData.messages, users: groupChatData.users })

}

const ChatAreaLayout = () => {

  const loaderData = useLoaderData<{ user: userType, friends: { name: string, GoSipID: string, profilePic: string }[], groupChatRoomID: string, groupName: string, groupAvatar: string, groupAdmin: string, messages: messageType[], users: { name: string, GoSipID: string, profilePic: string, color: string }[] }>()
  const [groupName, setGroupName] = useState('')
  const [groupAvatar, setGroupAvatar] = useState('')
  const [groupAdmin, setGroupAdmin] = useState('')
  const [user, setUser] = useState<userType | null>(null)
  const [friends, setFriends] = useState<{ name: string, GoSipID: string, profilePic: string }[] | null>(null)
  const [messages, setMessages] = useState<messageType[] | null>(null)
  const [members, setMembers] = useState<{ name: string, GoSipID: string, profilePic: string, color: string }[] | null>(null)

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }
    if (!friends) {
      setFriends(loaderData.friends)
    }
    if (!messages) {
      setMessages(loaderData.messages)
    }
    if (!members) {
      setMembers(loaderData.users)
    }
    if (!groupName) {
      setGroupName(loaderData.groupName)
    }
    if (!groupAvatar) {
      setGroupAvatar(loaderData.groupAvatar)
    }
    if (!groupAdmin) {
      setGroupAdmin(loaderData.groupAdmin)
    }
  }, [loaderData])

  useEffect(() => {

    const groupUpdatedHandler = ({ groupChatRoomID, groupName, groupAvatar }: { groupChatRoomID: string, groupName: string, groupAvatar: string }) => {
      if (groupChatRoomID === loaderData.groupChatRoomID) {
        setGroupName(groupName)
        setGroupAvatar(groupAvatar)
      }
    }

    const adminLeftGroupHandler = ({ groupChatRoomID, GoSipID, newAdmin }: { groupChatRoomID: string, GoSipID: string, newAdmin: string }) => {
      if (groupChatRoomID === loaderData.groupChatRoomID) {
        setMembers((prev) => {
          if (!prev) return prev

          return prev.filter((member) => member.GoSipID !== GoSipID)
        })

        setGroupAdmin(newAdmin)
      }
    }

    const leftGroupHandler = ({ GoSipID, groupChatRoomID }: { GoSipID: string, groupChatRoomID: string }) => {
      if (groupChatRoomID === loaderData.groupChatRoomID) {
        setMembers((prev) => {
          if (!prev) return prev

          return prev.filter((member) => member.GoSipID !== GoSipID)
        })
      }
    }

    const membersAddedHandler = ({ groupChatRoomID, membersAdded }: { groupChatRoomID: string, membersAdded: { name: string, GoSipID: string, profilePic: string, color: string }[] }) => {
      if (groupChatRoomID === loaderData.groupChatRoomID) {
        setMembers((prev) => {
          if (!prev) return prev

          return [...prev, ...membersAdded]
        })
      }
    }

    const groupDeletedHandler = (groupChatRoomID: string) => {
      if (groupChatRoomID === loaderData.groupChatRoomID) {
        window.location.href = '/groupchats'
      }
    }

    socket.on('groupUpdated', groupUpdatedHandler)
    socket.on('adminLeftGroup', adminLeftGroupHandler)
    socket.on('leftGroup', leftGroupHandler)
    socket.on('membersAdded', membersAddedHandler)
    socket.on('groupDeleted', groupDeletedHandler)

    return () => {
      socket.off('groupUpdated', groupUpdatedHandler)
      socket.off('adminLeftGroup', adminLeftGroupHandler)
      socket.off('leftGroup', leftGroupHandler)
      socket.off('membersAdded', membersAddedHandler)
      socket.off('groupDeleted', groupDeletedHandler)
    }

  }, [])

  return (
    <GroupchatArea friends={friends} groupChatRoomID={loaderData.groupChatRoomID} groupName={groupName} groupAvatar={groupAvatar} groupAdmin={groupAdmin} user={user} messagesProp={messages} members={members}/>
  )
}

export default ChatAreaLayout