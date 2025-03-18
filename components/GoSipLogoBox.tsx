import Footer from "./Footer"

const GoSipLogoBox = () => {
  return (
    <div className="w-[50%] bg-themeBgGray rounded-2xl hidden xl:flex flex-col gap-2 items-center justify-center relative">
        <div className="logo">
            <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-52 h-52"/>
        </div>

        <span className="text-themeBlue font-black text-[100px]">GoSip</span>

        <div className="w-full absolute bottom-4">
            <Footer />
        </div>
    </div>
  )
}

export default GoSipLogoBox