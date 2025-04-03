import Navbar from "components/Navbar";
import Footer from "components/Footer";
import { json, redirect } from "@remix-run/node"
import { getUser } from "utils/getUser";

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

  if (user) {
    return redirect('/chats', { headers: responseHeaders })
  }

  return json({})

}

export default function Index() {
  return (
    <>
        <Navbar />

        <section className="hero-section flex flex-col items-center gap-5 lg:gap-0 lg:flex-row w-full mt-40 px-4 md:px-6">
            <div className="flex flex-col w-full lg:w-[50%] xl:w-[60%] justify-center text-center lg:text-left">
              <span className="text-themeBlack font-black text-[60px] leading-[70px] md:text-[80px] md:leading-[90px] xl:text-[100px] xl:leading-[110px]">Welcome To</span>
              <span className="text-themeBlue font-black text-[60px] leading-[70px] md:text-[80px] md:leading-[90px] xl:text-[100px] xl:leading-[110px]">GoSip</span>
              <span className="text-base md:text-lg xl:text-xl text-themeBlack font-bold mt-5">Stay connected like never before with GoSip – the modern chat app built for effortless, secure, and real-time communication. Whether it's casual conversations or important discussions, GoSip makes chatting seamless and stylish. <span className="text-themeBlue"><a href="/register">Register</a> / <a href="/login
              ">Log in</a></span> and start your journey towards futuristic messaging today!</span>
            </div>

            <div className="w-full lg:w-[50%] xl:w-[40%] flex justify-center lg:justify-end">
                <img src="/homepage.svg" alt="herosection-image" className="w-[400px] h-[400px] md:w-[500px] md:h-[500px]"/>
            </div>
        </section>

        <div className="w-full mt-16 mb-5">
          <Footer />
        </div>
    </>
  );
}
