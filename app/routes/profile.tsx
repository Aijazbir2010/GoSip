import { useState, useEffect } from "react";
import NaviagtionBar from "@components/NaviagtionBar"
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

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

  const changeName = async (data: {name: string}) => {
    console.log(data)
  }

  return (
    <div className="w-full h-[100vh] bg-white flex flex-col-reverse xl:flex-row p-2 gap-2">
        <NaviagtionBar />

        <div className="w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl flex justify-center items-center py-4">
            <div className="w-full max-h-[95%] flex flex-col items-center gap-5 overflow-y-auto no-scrollbar">
                <div className="flex w-full justify-center text-center">
                    <span className="text-themeBlue font-black text-5xl">Profile</span>
                </div>

                <div className="profile-pic relative flex justify-center items-center group">
                    <img src="/temporary/aijazbir-profile.jpg" alt="profile-pic" className="w-40 h-40 rounded-full"/>
                    <input type="file" accept="image/jpeg, image/png" name="profile-pic-input" id="profile-pic-input" className="hidden"/>
                    <label htmlFor="profile-pic-input" className="h-40 w-40 bg-black/40 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="w-12 h-12"/>
                    </label>
                </div>

                <form className="flex flex-col gap-2 w-[90%] xl:w-[60%]" onSubmit={handleNameSubmit(changeName)}>
                    <span className="text-lg text-themeBlue font-bold px-4">Name</span>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl bg-themeInputBg ${nameErrors.name ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-user fa-xl text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Name" defaultValue={"Aijazbir"} {...nameFormRegister('name')}/>
                    </div>
                    {nameErrors.name && <p className="text-red-500 text-xs px-4">{nameErrors.name.message}</p>}
                    <button className="w-full h-16 rounded-2xl bg-themeBlue text-white font-bold outline-none border-none hover:scale-95 transition-transform duration-300" type="submit">Save</button>
                </form>

                <div className="flex flex-col gap-2 w-[90%] xl:w-[60%]">
                    <span className="text-lg text-themeBlue font-bold px-4">GoSip ID</span>
                    <div className="flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl bg-themeInputBg">
                        <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-9 h-9"/>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="GoSip ID" value={"GS-93C572-93C572"} readOnly={true}/>
                        <i className="fa-regular fa-clone fa-xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300"></i>
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-[90%] xl:w-[60%]">
                    <span className="text-lg text-themeBlue font-bold px-4">E-mail</span>
                    <div className="flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl bg-themeInputBg">
                        <i className="fa-solid fa-envelope fa-xl text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="E-mail" value={"aijazbirsfun@gmail.com"} readOnly={true}/>
                    </div>
                </div>

                <div className="w-[90%] xl:w-[60%]">
                    <button className="w-full h-16 rounded-2xl text-white font-bold bg-themeBlack border-none outline-none hover:bg-themeRed transition-colors duration-300">Logout</button>
                </div>       
            </div>
        </div>    
    </div>    
  )
}

export default Profile