import { useState, useEffect, useRef } from "react";
import NaviagtionBar from "@components/NaviagtionBar"
import Spinner from "@components/Spinner";
import axiosInstance from "~/axios";
import { fetchWithAuth } from "utils/fetchWithAuth";
import { getUser } from "utils/getUser";
import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import type { userType } from "types/user";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { 
      title: "GoSip - Profile" },
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

const nameValidationSchema = Yup.object().shape({
    name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(16, 'Name cannot exceed 16 characters')
    .required('Name is required !')
    .matches(/^[a-zA-Z]*$/, 'Only Letters are allowed !')
});

const Profile = () => {

  const {
        register: nameFormRegister,
        handleSubmit: handleNameSubmit,
        formState: { errors: nameErrors },
      } = useForm({
        resolver: yupResolver(nameValidationSchema),
        mode: 'onChange',
  });

  const loaderData = useLoaderData<{ user: userType }>()
  const GoSipIDInputRef = useRef<HTMLInputElement>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [user, setUser] = useState<userType | null>(null)
  const [isLoggingOutUser, setIsLoggingOutUser] = useState(false)
  const [isChangingName, setIsChangingName] = useState(false)
  const [isProfilePicUploading, setIsProfilePicUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      setUser(loaderData.user)
    }
  }, [loaderData])

  const changeName = async ({ name }: {name: string}) => {
    try {
      setIsChangingName(true)

      const response = await fetchWithAuth('/user/changename', { method: 'POST', isServer: false, data: { name } })

      setUser((prev) => response.user || prev)

      setIsChangingName(false)
    } catch (error) {
      setIsChangingName(false)
      console.log('Error changing name !', error)
    }
  }

  const logoutUser = async () => {
    setIsLoggingOutUser(true)

    await axiosInstance.get('/user/logout')

    setIsLoggingOutUser(false)

    window.location.href = '/'
  }

  const handleCopy = () => {
    if (GoSipIDInputRef.current) {
      navigator.clipboard.writeText(GoSipIDInputRef.current.value).then(() => {
        setIsCopied(true)
        window.setTimeout(() => setIsCopied(false), 2000)
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files || e.target.files.length === 0) {
      console.log('Inside if statement')
      return
    }

    const newFile = e.target.files[0]
    const formData = new FormData()
    formData.append('profilePic', newFile)

    try {
      setIsProfilePicUploading(true)

      const data = await fetchWithAuth('/user/updateprofilepic', { data: formData, isServer: false, method: 'POST' })

      const updatedUser = data?.user || null

      setUser((prev) => updatedUser ? updatedUser : prev)

      setIsProfilePicUploading(false)
    } catch (error) {
      setIsProfilePicUploading(false)
      console.log('Cannot Update Profile Pic !', error)
    }
  }

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar profilePic={user?.profilePic || '/GoSipDefaultProfilePic.jpg'}/>

        <div className="w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl flex justify-center items-center py-4">
            <div className="w-full max-h-[95%] flex flex-col items-center gap-5 overflow-y-auto no-scrollbar">
                <div className="flex w-full justify-center text-center">
                    <span className="text-themeBlue font-black text-5xl">Profile</span>
                </div>

                <div className="profile-pic relative flex justify-center items-center group">
                    <img src={user?.profilePic || '/GoSipDefaultProfilePic.jpg'} alt="profile-pic" className="md:w-40 w-28 md:h-40 h-28 rounded-full"/>
                    <input type="file" accept="image/jpeg, image/png" name="profile-pic-input" id="profile-pic-input" className="hidden" onChange={handleFileChange}/>
                    {!isProfilePicUploading && <label htmlFor="profile-pic-input" className="md:h-40 h-28 md:w-40 w-28 bg-black/60 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="md:w-12 w-8 md:h-12 h-8"/>
                    </label>}
                    {isProfilePicUploading && <div className="md:h-40 h-28 md:w-40 w-28 bg-black/60 rounded-full absolute z-10 flex justify-center items-center">
                      <Spinner />
                    </div>}
                </div>

                <form className="flex flex-col gap-2 w-[90%] xl:w-[60%]" onSubmit={handleNameSubmit(changeName)}>
                    <span className="text-lg text-themeBlue font-bold px-4">Name</span>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${nameErrors.name ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-user fa-xl text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Name" defaultValue={user?.name || ''} {...nameFormRegister('name')}/>
                    </div>
                    {nameErrors.name && <p className="text-red-500 text-xs px-4">{nameErrors.name.message}</p>}

                    <button className="w-full h-16 rounded-2xl flex justify-center items-center bg-themeBlue text-white font-bold outline-none border-none hover:scale-95 transition-transform duration-300" type="submit">{isChangingName ? <Spinner /> : 'Save'}</button>
                </form>

                <div className="flex flex-col gap-2 w-[90%] xl:w-[60%]">
                    <span className="text-lg text-themeBlue font-bold px-4">GoSip ID</span>
                    <div className="flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl bg-themeInputBg">
                        <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-9 h-9"/>
                        <input ref={GoSipIDInputRef} type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="GoSip ID" value={user?.GoSipID || ''} readOnly={true}/>
                        {isCopied ? <i className="fa-solid fa-check fa-xl text-themeBlue"></i> : <i className="fa-regular fa-clone fa-xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300" onClick={handleCopy}></i>}
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-[90%] xl:w-[60%]">
                    <span className="text-lg text-themeBlue font-bold px-4">E-mail</span>
                    <div className="flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl bg-themeInputBg">
                        <i className="fa-solid fa-envelope fa-xl text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="E-mail" value={user?.email || ''} readOnly={true}/>
                    </div>
                </div>

                <div className="w-[90%] xl:w-[60%]">
                    <button className="w-full h-16 rounded-2xl flex justify-center items-center text-white font-bold bg-themeBlack border-none outline-none hover:bg-themeRed transition-colors duration-300" onClick={logoutUser}>{isLoggingOutUser ? <Spinner /> : 'Logout'}</button>
                </div>       
            </div>
        </div>    
    </div>    
  )
}

export default Profile