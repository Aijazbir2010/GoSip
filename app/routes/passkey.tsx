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
      title: "GoSip - Create a Passkey" },
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

const passkeyValidationSchema = Yup.object().shape({
    passkey: Yup.string()
      .min(6, 'Passkey must be atleast 6 characters')
      .max(20, 'Passkey cannot exceed 20 characters')
      .required('Passkey is required !')  
});

const passkey = () => {

  const [isPasskeyVisible, setIsPasskeyVisible] = useState(false)  

  const {
      register: passkeyFormRegister,
      handleSubmit: handlePasskeySubmit,
      formState: { errors: passkeyErrors },
    } = useForm({
      resolver: yupResolver(passkeyValidationSchema),
      mode: 'onChange',
  });  

  const createPasskey = async (data: {passkey: string}) => {
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
            <span className="text-themeBlue font-black text-5xl max-w-[90%]">Create a Passkey</span>
            <span className="text-themeBlue font-black text-xl">&#40;Optional&#41;</span>
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">Create a unique passkey and unlock the power of instant access to your GoSip account. Say goodbye to mobile number verifications and enjoy seamless, secure logins with just your passkey! Once created, your passkey cannot be changed, so choose wisely and keep it safe.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[400px] rounded-3xl mx-auto mt-10 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2">
                <form className="flex flex-col gap-2" onSubmit={handlePasskeySubmit(createPasskey)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${passkeyErrors.passkey ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-lock fa-lg text-themeTextGray"></i>
                        <input type={isPasskeyVisible ? 'text' : 'password'} className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Passkey" {...passkeyFormRegister('passkey')}/>
                        {!isPasskeyVisible ? (<i className="fa-solid fa-eye fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasskeyVisible(true)}></i>) : (<i className="fa-solid fa-eye-slash fa-lg text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => setIsPasskeyVisible(false)}></i>)}
                    </div>
                    {passkeyErrors.passkey && <p className="text-red-500 text-xs px-4">{passkeyErrors.passkey.message}</p>}
                    <button className="h-16 w-[340px] md:w-[400px] rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">Create Passkey</button>
                </form>

                <div className="w-full flex justify-center mt-5">
                    <Link to={'/'} className="text-themeBlue text-xl">Skip for now</Link>
                </div>
            </div>
        </div>

        <div className="w-full mt-12 mb-5">
          <Footer />
        </div>
    </div>
  )
}

export default passkey