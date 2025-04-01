import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import Footer from "components/Footer";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { 
      title: "GoSip - Log in" },
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

const loginValidationSchema = Yup.object().shape({
    identifier: Yup.string()
      .test(
        "is-email-or-GoSipID",
        "Enter a valid E-mail or GoSip ID !",
        (value) => {
          if (!value) return false;

          const isEmail = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          const isGoSipID = /^GS-[a-fA-F0-9]{6}-[a-fA-F0-9]{6}$/.test(value)

          return isEmail || isGoSipID
        }
      )
      .required('E-mail or GoSip ID is required !'),
    password: Yup.string()
      .matches(/^[a-zA-Z0-9]*$/, 'Only letters and numbers are allowed !')
      .min(6, 'Password must be atleast 6 characters !')
      .max(20, 'Password cannot exceed 20 characters !')
      .required('Password is required !')
});

const login = () => {

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const {
      register: loginFormRegister,
      handleSubmit: handleLoginSubmit,
      watch: loginWatch,
      setError: setLoginErrors,
      formState: { errors: loginErrors },
    } = useForm({
      resolver: yupResolver(loginValidationSchema),
      mode: 'onChange',
  });

  const loginUser = async (data: {identifier: string, password: string}) => {
    console.log(data)
  }

  return (
    <div className="w-full flex flex-col">
        <div className="nav w-full h-20 px-4 md:px-6 flex items-center">
            <Link to={'/'} className="logo">
                <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16 hover:scale-110 transition-transform duration-300"/>
            </Link>
        </div>

        <div className="w-full flex flex-col gap-5 text-center items-center mt-10">
            <span className="text-themeBlue font-black text-5xl">Log in</span>
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">You’re just one step away from unlocking the ultimate chat experience! Log in now to dive into seamless, secure, and stylish conversations with GoSip.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[500px] rounded-3xl mx-auto mt-10 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2 items-center">
                <form className="flex flex-col gap-2" onSubmit={handleLoginSubmit(loginUser)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${loginErrors.identifier ? 'border-[2px] border-red-500' : ''}`}>
                        <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-8 h-8"/>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="E-mail or GoSip ID" {...loginFormRegister('identifier')}/>
                    </div>
                    {loginErrors.identifier && <p className="text-red-500 text-xs px-4">{loginErrors.identifier.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${loginErrors.password ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isPasswordVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Password" {...loginFormRegister('password')}/>
                        {!isPasswordVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(false)}></i>)}
                    </div>
                    {loginErrors.password && <p className="text-red-500 text-xs px-4">{loginErrors.password.message}</p>}

                    <a href="/forgotpassword" className="px-4 text-themeBlack hover:text-themeBlue transition-colors duration-300">Forgot password ?</a>

                    <button className="h-16 w-[340px] md:w-[400px] rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">Send Code</button>
                </form>

                <div className="w-full flex justify-center mt-5">
                    <span className="text-themeBlack text-xl">Not a Member ? <Link to={'/register'} className="text-themeBlue">Register</Link></span>
                </div>
            </div>
        </div>

        <div className="w-full mt-12 mb-5">
          <Footer />
        </div>
    </div>
  )
}

export default login