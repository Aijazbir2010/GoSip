import { Link } from "@remix-run/react"

const Navbar = () => {
  return (
    <div className="w-full h-20 px-4 md:px-6 flex flex-row items-center justify-between">
        <div className="logo">
            <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16"/>
        </div>

        <div className="buttons flex flex-row gap-2 md:gap-5">
            <Link to={'/register'} className="bg-themeBlack rounded-2xl w-28 md:w-36 h-16 text-white font-bold flex justify-center items-center hover:bg-themeBlue transition-colors duration-300">
                Register
            </Link>
            <Link to={'/login'} className="bg-themeBlack rounded-2xl w-28 md:w-36 h-16 text-white font-bold flex justify-center items-center hover:bg-themeBlue transition-colors duration-300">
                Log in
            </Link>
        </div>
    </div>
  )
}

export default Navbar