import { useState, useEffect } from "react";
import ChatArea from "@components/ChatArea"
import { getUser } from "utils/getUser"
import { getMessages } from "utils/getMessages";
import { useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";

import type { userType } from "types/user";
import type { chatAreaFriendType } from "types/chatAreaFriend";
import type { messageType } from "types/message";

// Loader
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Fetch User
  const responseHeaders = new Headers()

  const response = await getUser(request, responseHeaders)

  const user = response.user

  // Fetch Messages
  const chatRoomID = params.chatId || ''

  const data = await getMessages(request, chatRoomID)

  if (!data) {
    return redirect('/chats')
  }

  return json({ user, data })
}

const ChatAreaLayout = () => {

  const loaderData = useLoaderData<{
    user: userType,
    data: {
      friend: chatAreaFriendType,
      messages: messageType[],
    }
  }>()

  const [user, setUser] = useState<userType | null>(null)
  const [friend, setFriend] = useState<chatAreaFriendType | null>(null)
  const [messages, setMessages] = useState<messageType[] | null>(null)

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }

    if (!friend) {
      setFriend(loaderData.data.friend)
    }

    if (!messages) {
      setMessages(loaderData.data.messages)
    }
  }, [loaderData])

  return (
    <ChatArea user={user} friend={friend} messages={messages}/>
  )
}

export default ChatAreaLayout