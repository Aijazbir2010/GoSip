import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { json, redirect } from "@remix-run/node"
import Footer from "components/Footer";
import Spinner from "@components/Spinner";
import axiosInstance from "~/axios";
import { getUser } from "utils/getUser";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { 
      title: "GoSip - Register" },
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

const registerValidationSchema = Yup.object().shape({
    name: Yup.string()
      .matches(/^[a-zA-Z]*$/, "Only letters are allowed !")
      .min(3, 'Name must be atleast 3 characters')
      .max(16, 'Name cannot exceed 16 characters')
      .required('Name is required !'),  
    email: Yup.string()
      .email('Enter a Valid E-mail !')
      .required('E-mail is required !'),
    password: Yup.string()
      .matches(/^[a-zA-Z0-9]*$/, 'Only letters and numbers are allowed !')
      .min(6, 'Password must be atleast 6 characters !')
      .max(20, 'Password cannot exceed 20 characters !')
      .required('Password is required !'),  
    code: Yup.string()
      .length(6, 'Code must be exactly 6 characters')
      .required('Code is required !')  
});

const register = () => {

  const {
    register: registerFormRegister,
    handleSubmit: handleRegisterSubmit,
    watch: registerWatch,
    setError: setRegisterErrors,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: yupResolver(registerValidationSchema),
    mode: 'onChange',
  });

  const email = registerWatch('email')

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isRegisteringUser, setIsRegisteringUser] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(false)

  const sendCode = async () => {
    try {
      if (!email) {
        setRegisterErrors('email', { type: 'manual', message: 'Please enter a Valid E-mail before proceeding !' })
        return
      }

      setIsSendingCode(true)

      await axiosInstance.post('/verificationcode/send', { email, register: 'true' })

      setIsCodeSent(true)
      setIsSendingCode(false)
      setIsResendDisabled(true)
      setTimeLeft(60)
      toast.success('Verification Code Sent Successfully !', { duration: 2000, style: { background: '#4BB3FD', color: '#FFF', fontWeight: 'bold', borderRadius: '12px', fontSize: '20px' } })

    } catch (error) {
      setIsSendingCode(false)
      toast('Failed To Send Verification Code !', { duration: 2000, style: { background: '#FF5353', color: '#FFF', fontWeight: 'bold', borderRadius: '12px', fontSize: '20px' } })
    }
  }

  const registerUser = async (data: {name: string, email: string, password: string, code: string}) => {
    try {
      setIsRegisteringUser(true)

      await axiosInstance.post('/user/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        code: data.code,
      })

      setIsRegisteringUser(false)

      window.location.href = '/chats?msg=RegisterSuccessful'

    } catch (error: any) {
      setIsRegisteringUser(false)
      if (error.response && error.response.data.error === 'Verification Code Expired !') {
        toast('Verification Code Expired !', { duration: 2000, style: { background: '#FF5353', color: '#FFF', fontWeight: 'bold', borderRadius: '12px', fontSize: '20px' } })
      } else if (error.response && error.response.data.error === 'Invalid Verification Code !') {
        toast('Invalid Verification Code !', { duration: 2000, style: { background: '#FF5353', color: '#FFF', fontWeight: 'bold', borderRadius: '12px', fontSize: '20px' } })
      } else if (error.response && error.response.data.error === 'User already exists with this E-mail !') {
        toast('User already exists with this E-mail !', { duration: 2000, style: { background: '#FF5353', color: '#FFF', fontWeight: 'bold', borderRadius: '12px', fontSize: '20px' } })
      }
    }
  }

  useEffect(() => {
    let timer: number;

    if (isResendDisabled && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsResendDisabled(false)
    }

    return () => window.clearInterval(timer)
    
  }, [timeLeft, isResendDisabled])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes < 10 ? `0${minutes}` : `${minutes}`}:${remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`}`
  }

  return (
    <div className="w-full flex flex-col">
        <div className="nav w-full h-20 px-4 md:px-6 flex items-center">
            <Link to={'/'} className="logo">
                <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16 hover:scale-110 transition-transform duration-300"/>
            </Link>
        </div>

        <div className="w-full flex flex-col gap-5 text-center items-center mt-10">
            <span className="text-themeBlue font-black text-5xl">Register</span>
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">You’re just one step away from unlocking the ultimate chat experience! Register now to dive into seamless, secure, and stylish conversations with GoSip.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[600px] rounded-3xl mx-auto mt-10 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2">
                <form className="flex flex-col gap-2" onSubmit={handleRegisterSubmit(registerUser)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${registerErrors.name ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-user fa-lg text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Name" {...registerFormRegister('name')}/>
                    </div>
                    {registerErrors.name && <p className="text-red-500 text-xs px-4">{registerErrors.name.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${registerErrors.email ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-envelope fa-lg text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="E-mail" {...registerFormRegister('email')}/>
                    </div>
                    {registerErrors.email && <p className="text-red-500 text-xs px-4">{registerErrors.email.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${registerErrors.password ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={`${isPasswordVisible ? 'text' : 'password'}`} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Password" {...registerFormRegister('password')}/>
                        {isPasswordVisible ? <i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue cursor-pointer transition-colors duration-300" onClick={() => setIsPasswordVisible(false)}></i> : <i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue cursor-pointer transition-colors duration-300" onClick={() => setIsPasswordVisible(true)}></i>}
                    </div>
                    {registerErrors.password && <p className="text-red-500 text-xs px-4">{registerErrors.password.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${registerErrors.code ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-key fa-lg text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Verification Code" {...registerFormRegister('code')}/>
                    </div>
                    {registerErrors.code && <p className="text-red-500 text-xs px-4">{registerErrors.code.message}</p>}

                    {!isCodeSent && <button className="h-16 w-[340px] md:w-[400px] flex justify-center items-center rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" onClick={(e) => {e.preventDefault(); sendCode()}}>{isSendingCode ? <Spinner /> : <span>Send Code</span>}</button>}
                    {isCodeSent && <button className="h-16 w-[340px] md:w-[400px] flex justify-center items-center rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">{isRegisteringUser || isSendingCode ? <Spinner /> : <span>Register</span>}</button>}
                </form>

                {isCodeSent && <button className="w-full flex justify-center mt-2" disabled={isResendDisabled} onClick={sendCode}>
                    <span className={`text-themeBlack text-lg ${isResendDisabled ? '' : 'cursor-pointer hover:text-themeBlue'} transition-colors duration-300`}>{isResendDisabled ? `Resend Code in ${formatTime(timeLeft)}` : 'Resend Code'}</span>
                </button>}

                <div className="w-full flex justify-center mt-5">
                    <span className="text-themeBlack text-xl">Already a Member ? <Link to={'/login'} className="text-themeBlue">Log in</Link></span>
                </div>
            </div>
        </div>

        <div className="w-full mt-12 mb-5">
          <Footer />
        </div>
    </div>
  )
}

export default register