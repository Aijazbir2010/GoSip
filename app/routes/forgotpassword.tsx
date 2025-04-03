import { useState, useEffect } from "react";
import { Link, useSearchParams, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import Footer from "components/Footer";
import Spinner from "@components/Spinner";
import { getUser } from "utils/getUser";
import axiosInstance from "~/axios";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { 
      title: "GoSip - Reset Password" },
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

  // Protect Authenticated User From Accessing This Page
  const responseHeaders = new Headers()

  const response = await getUser(request, responseHeaders)

  const user = response?.user || null

  if (user) {
    return redirect('/chats', { headers: responseHeaders })
  }

  // Send E-mail To Reset Password
  const url = new URL(request.url)

  const identifier = url.searchParams.get('identifier')
  const isEmailSent = url.searchParams.get('isEmailSent') || 'false'

  if (!identifier) {
    return redirect('/login?msg=NoIdentifier')
  }

  try {

    const emailResponse: any = await axiosInstance.post('/user/getemail', { identifier: decodeURIComponent(identifier) })

    const email: string = emailResponse.data.email
    
    if (isEmailSent === 'false') {
      await axiosInstance.post('/verificationcode/send', { email, register: 'false' })
    }
    
    return json({ email, identifier: decodeURIComponent(identifier) })
    
  } catch (error: any) {
    
      if (error.response && error.response.status === 500) {
        return redirect('/login')
      } else if (error.response && error.response.status === 404) {
        return redirect('/login')
      }
    
      return redirect('/login')
    
  }
}

const resetPasswordValidationSchema = Yup.object().shape({
    code: Yup.string()
      .length(6, 'Code must be exactly 6 characters')
      .required('Code is required !'),
    password: Yup.string()
      .matches(/^[a-zA-Z0-9]*$/, 'Only letters and numbers are allowed !')
      .min(6, 'Password must be atleast 6 characters !')
      .max(20, 'Password cannot exceed 20 characters !')
      .required('Password is required !'),
    confirmPassword: Yup.string()
      .matches(/^[a-zA-Z0-9]*$/, 'Only letters and numbers are allowed !')
      .min(6, 'Password must be atleast 6 characters !')
      .max(20, 'Password cannot exceed 20 characters !')
      .required('Password is required !')  
});

const ForgotPassword = () => {

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)  

  const {
      register: resetPasswordFormRegister,
      handleSubmit: handleResetPasswordSubmit,
      setError: setResetPasswordError,
      formState: { errors: resetPasswordErrors },
    } = useForm({
      resolver: yupResolver(resetPasswordValidationSchema),
      mode: 'onChange',
  });  

  const loaderData = useLoaderData<{ email?: string, identifier?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  useEffect(() => {
    if (loaderData.identifier && searchParams.get('isEmailSent') === 'false') {
      setSearchParams({identifier: loaderData.identifier, isEmailSent: 'true'})
    }
    if (loaderData.email) {
      console.log('Setting E-mail')
      setEmail(loaderData.email)
    }
  }, [loaderData, searchParams])

  useEffect(() => {
    setTimeLeft(60)
    setIsResendDisabled(true)
  }, [])

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

  }, [isResendDisabled, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes < 10 ? `0${minutes}` : `${minutes}`}:${remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`}`
  }

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@')

    if (username.length <= 4) {
      return `${username}**@${domain}`
    }

    const visibleStart = username.slice(0, 3)
    const visibleEnd = username.slice(-2)

    return `${visibleStart}****${visibleEnd}@${domain}`
  }

  const resendCode = async () => {
    const email = loaderData.email

    if (!email) {
      console.log('No E-mail Provided !')
      return
    }

    try {
      setIsSendingCode(true)

      await axiosInstance.post('/verificationcode/send', { email, register: 'false' })

      setIsSendingCode(false)
      setTimeLeft(60)
      setIsResendDisabled(true)
    } catch (error: any) {
      console.log('Cannot Send E-mail !', error)
      setIsSendingCode(false)
      setTimeLeft(0)
      setIsResendDisabled(false)
      if (error.response && error.response.status === 500) {
        console.log('Cannot Send E-mail ! Server Error !')
      }
    }
  }

  const resetPassword = async (data: {code: string, password: string, confirmPassword: string}) => {
    const email = loaderData.email

    if (!email) {
      console.log('No E-mail Provided !')
      return
    }

    if (data.password !== data.confirmPassword) {
      setResetPasswordError('confirmPassword', { type: 'manual', message: 'Passwords do not match ! Please make sure both the fields are identical.' })
      return
    }

    try {
      setIsResettingPassword(true)

      await axiosInstance.post('/user/resetpassword', { email, code: data.code, password: data.password })

      setIsResettingPassword(false)

      window.location.href = '/login'
    } catch (error) {
      setIsResettingPassword(false)
      console.log('Unable to reset Password !', error)
    }
  }

  return (
    <div className="w-full flex flex-col">
        <div className="nav w-full h-20 px-4 md:px-6 flex items-center">
            <Link to={'/'} className="logo">
                <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16 hover:scale-110 transition-transform duration-300"/>
            </Link>
        </div>

        <div className="w-full flex flex-col gap-2 text-center items-center mt-10">
            <span className="text-themeBlue font-black text-5xl max-w-[90%]">Enter Code</span>
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">A code has been sent to <span className="text-themeBlue">{email ? maskEmail(email) : '****'}</span> which contains the code to be entered to reset the password.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[450px] rounded-3xl mx-auto mt-16 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2">
                <form className="flex flex-col gap-2" onSubmit={handleResetPasswordSubmit(resetPassword)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${resetPasswordErrors.code ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-key fa-lg text-themeTextGray"></i>
                        <input type='text' className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Verification Code" {...resetPasswordFormRegister('code')}/>
                    </div>
                    {resetPasswordErrors.code && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.code.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${resetPasswordErrors.password ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isPasswordVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Password" {...resetPasswordFormRegister('password')}/>
                        {!isPasswordVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(false)}></i>)}
                    </div>
                    {resetPasswordErrors.password && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.password.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${resetPasswordErrors.confirmPassword ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isConfirmPasswordVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Confirm Password" {...resetPasswordFormRegister('confirmPassword')}/>
                        {!isConfirmPasswordVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsConfirmPasswordVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsConfirmPasswordVisible(false)}></i>)}
                    </div>
                    {resetPasswordErrors.confirmPassword && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.confirmPassword.message}</p>}

                    <button className="h-16 w-[340px] md:w-[400px] flex justify-center items-center rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">{isResettingPassword || isSendingCode ? <Spinner /> : 'Reset Password'}</button>
                </form>

                <button className="w-full flex justify-center mt-2" disabled={isResendDisabled} onClick={resendCode}>
                    <span className={`text-themeBlack text-lg ${isResendDisabled ? '' : 'cursor-pointer hover:text-themeBlue'} transition-colors duration-300`}>{isResendDisabled ? `Resend Code in ${formatTime(timeLeft)}` : 'Resend Code'}</span>
                </button>
            </div>
        </div>

        <div className="w-full mt-12 mb-5">
          <Footer />
        </div>
    </div>
  )
}

export default ForgotPassword