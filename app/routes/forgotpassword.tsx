import { useState } from "react";
import { Link } from "@remix-run/react";
import Footer from "components/Footer";
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

const passkey = () => {

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)  

  const {
      register: resetPasswordFormRegister,
      handleSubmit: handleResetPasswordSubmit,
      formState: { errors: resetPasswordErrors },
    } = useForm({
      resolver: yupResolver(resetPasswordValidationSchema),
      mode: 'onChange',
  });  

  const resetPassword = async (data: {code: string, password: string, confirmPassword: string}) => {
    console.log(data)
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
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">A code has been sent to <span className="text-themeBlue">aij****fun@gmail.com</span> which contains the code to be entered to reset the password.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[450px] rounded-3xl mx-auto mt-16 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2">
                <form className="flex flex-col gap-2" onSubmit={handleResetPasswordSubmit(resetPassword)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${resetPasswordErrors.code ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-key fa-lg text-themeTextGray"></i>
                        <input type='text' className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Verification Code" {...resetPasswordFormRegister('code')}/>
                    </div>
                    {resetPasswordErrors.code && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.code.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${resetPasswordErrors.password ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isPasswordVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Password" {...resetPasswordFormRegister('password')}/>
                        {!isPasswordVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasswordVisible(false)}></i>)}
                    </div>
                    {resetPasswordErrors.password && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.password.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${resetPasswordErrors.confirmPassword ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isConfirmPasswordVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Confirm Password" {...resetPasswordFormRegister('confirmPassword')}/>
                        {!isConfirmPasswordVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsConfirmPasswordVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsConfirmPasswordVisible(false)}></i>)}
                    </div>
                    {resetPasswordErrors.confirmPassword && <p className="text-red-500 text-xs px-4">{resetPasswordErrors.confirmPassword.message}</p>}

                    <button className="h-16 w-[340px] md:w-[400px] rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">Reset Password</button>
                </form>
            </div>
        </div>

        <div className="w-full mt-12 mb-5">
          <Footer />
        </div>
    </div>
  )
}

export default passkey