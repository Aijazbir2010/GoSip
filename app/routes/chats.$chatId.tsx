import ChatArea from "@components/ChatArea"
import { getUser } from "utils/getUser"
import { json } from "@remix-run/node";

// Loader
export const loader = async ({ request }: { request: Request }) => {
  const responseHeaders = new Headers()

  const response = await getUser(request, responseHeaders)

  const user = response.user

  // Chat fetching logic will come here

  return json({ user })
}

const ChatAreaLayout = () => {
  return (
    <ChatArea />
  )
}

export default ChatAreaLayout