import { useState, useEffect } from "react";
import NaviagtionBar from "@components/NaviagtionBar"
import GroupchatsList from "@components/GroupchatsList";
import GoSipLogoBox from "@components/GoSipLogoBox";
import { getUser } from "utils/getUser";
import { json, redirect } from "@remix-run/node";

import { Outlet, useParams, useLoaderData } from "@remix-run/react";

import type { user } from "types/user";
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

  return json({ user }, { headers: responseHeaders })

}

const GroupChats = () => {

  const { groupchatId } = useParams()
  const loaderData = useLoaderData<{ user: user }>()
  const [user, setUser] = useState<user | null>(null)

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }
  }, [loaderData])

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar profilePic={user?.profilePic || '/GoSipDefaultProfilePic.jpg'}/>

        <GroupchatsList />

        {groupchatId ? <Outlet /> : <GoSipLogoBox />}
    </div>
  )
}

export default GroupChats