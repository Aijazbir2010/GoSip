import { useState, useEffect } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import Footer from "components/Footer";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@components/ui/select"

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

const registerValidationSchema = Yup.object().shape({
    phoneNumber: Yup.string()
      .matches(/^[0-9]+$/, 'Phone number must contain only digits')
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 digits')
      .required('Phone number is required !'),
    code: Yup.string()
      .length(6, 'Code must be exactly 6 characters')
      .required('Code is required !')  
});

export const loader = async () => {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/info?returns=flag,dialCode,')
        const responseData = await response.json()

        const countries = responseData.data.map((country: any) => ({flag: country.flag, name: country.name, countryCode: country.dialCode?.includes('+') ? `${country.dialCode}` : `+${country.dialCode}`})).sort((a: any, b: any) => a.name.localeCompare(b.name))

        return json(countries) 
    } catch (err) {
        console.log(err)
        return redirect('/')
    }
}

const register = () => {

  const countriesData = useLoaderData<typeof loader>()  

  const [selectedCountry, setSelectedCountry] = useState<{name: string, flag?: string | undefined, countryCode: string} | null>(null)
  const [countries, setCountries] = useState<any[] | null>(null)

  useEffect(() => {
    if (countriesData) {
        setCountries(countriesData)
        setSelectedCountry({name: countriesData[100].name, countryCode: countriesData[100].countryCode, flag: countriesData[100].flag})
    }
  }, [countriesData])  

  const handleCountryChange = (countryName: string) => {
    const country = countries?.find((country) => country.name === countryName)
    setSelectedCountry(country)
  }

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

  const phoneNumber = registerWatch('phoneNumber')

  const registerUser = async (data: {phoneNumber: string, code: string}) => {
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
            <span className="text-themeBlue font-black text-5xl">Register</span>
            <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">You’re just one step away from unlocking the ultimate chat experience! Register now to dive into seamless, secure, and stylish conversations with GoSip.</span>
        </div>

        <div className="main bg-themeBgGray w-[95%] lg:w-[60%] h-[500px] rounded-3xl mx-auto mt-10 drop-shadow-customDropShadow flex justify-center items-center">
            <div className="flex flex-col gap-2">
                {countries?.length && countries.length > 0 && selectedCountry && <Select onValueChange={handleCountryChange}>
                    <SelectTrigger>
                        <SelectValue placeholder={
                            <div className="flex items-center">
                                <img src={selectedCountry.flag} alt="flag" className="w-10 rounded-sm" />
                                <span className="ml-3">{selectedCountry.name}</span>
                                <span className="ml-3">{selectedCountry.countryCode}</span>
                            </div>
                        }>
                            <div className="flex items-center">
                                <img src={selectedCountry.flag} alt="flag" className="w-10 rounded-sm" />
                                <span className="ml-3">{selectedCountry.name}</span>
                                <span className="ml-3">{selectedCountry.countryCode}</span>
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country, index) => (<SelectItem key={index} value={country.name}>
                            <img src={country.flag} alt="flag" className="w-10 rounded-sm inline-block"/>
                            <span className="ml-3">{country.name}</span>
                            <span className="ml-3">{country.countryCode}</span>
                        </SelectItem>))}
                    </SelectContent>
                </Select>}
                <form className="flex flex-col gap-2" onSubmit={handleRegisterSubmit(registerUser)}>
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${registerErrors.phoneNumber ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-phone fa-lg text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Phone Number" {...registerFormRegister('phoneNumber')}/>
                    </div>
                    {registerErrors.phoneNumber && <p className="text-red-500 text-xs px-4">{registerErrors.phoneNumber.message}</p>}
                    <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[340px] md:w-[400px] rounded-2xl bg-themeInputBg ${registerErrors.code ? 'border-[2px] border-red-500' : ''}`}>
                        <i className="fa-solid fa-key fa-lg text-themeTextGray"></i>
                        <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Verification Code" {...registerFormRegister('code')}/>
                    </div>
                    {registerErrors.code && <p className="text-red-500 text-xs px-4">{registerErrors.code.message}</p>}
                    <button className="h-16 w-[340px] md:w-[400px] rounded-2xl border-none outline-none bg-themeBlue text-white font-bold hover:scale-95 transition-transform duration-300" type="submit">Send Code</button>
                </form>

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