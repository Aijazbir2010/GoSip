import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  Link
} from "@remix-run/react";
import { useEffect } from "react";
import Modal from "react-modal";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import "./globals.css";
import Footer from "@components/Footer";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white no-scrollbar">
        <div id="app">
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {

  useEffect(() => {
    Modal.setAppElement('#app')
  }, [])

  return <Outlet />;
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <>
        <title>GoSip - Page Not Found</title>

        <div className="w-full h-20 px-4 md:px-6 flex items-center">
          <Link to={'/'} className="logo">
              <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16 hover:scale-110 transition-transform duration-300"/>
          </Link>
        </div>

        <div className="w-full flex flex-col items-center gap-5 text-center mt-5">
          <span className="text-4xl md:text-5xl text-themeBlue font-black">Page Not Found !</span>
          <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">Oops ! The Page You Were Looking For Was Not Found !</span>
        </div>

        <div className="w-full flex justify-center mt-5">
          <a href={'/'} className="bg-themeBlack rounded-2xl w-36 h-16 text-white font-bold flex flex-row gap-2 justify-center items-center hover:bg-themeBlue transition-colors duration-300">
              <i className="fa-solid fa-home fa-lg text-white"></i>
              <span>Home</span>
          </a>
        </div>

        <div className="w-full flex justify-center mt-10 xl:mt-5">
          <img src="/notfound.svg" alt="404 Not Found" className="h-[300px] xl:h-[450px]"/>
        </div>

        <div className="w-full mt-10">
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <title>GoSip - Unexpected Error</title>

      <div className="w-full h-20 px-4 md:px-6 flex items-center">
        <Link to={'/'} className="logo">
            <img src="/GoSipLogo.svg" alt="GoSip Logo" className="w-20 h-16 hover:scale-110 transition-transform duration-300"/>
        </Link>
      </div>

      <div className="w-full flex flex-col items-center gap-5 text-center mt-5">
        <span className="text-5xl text-themeBlue font-black">Error !</span>
        <div className="flex flex-col gap-2 w-full items-center text-center">
          <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">We are Sorry, but an Unexpected Error Occured !</span>
          <span className="text-themeBlack font-black text-xl w-[95%] lg:w-[60%]">Try Reloading the Page or Try Again Later !</span>
        </div>
      </div>

      <div className="w-full flex flex-row gap-5 justify-center mt-5">
        <a href={'/'} className="bg-themeBlack rounded-2xl w-36 h-16 text-white font-bold flex flex-row gap-2 justify-center items-center hover:bg-themeBlue transition-colors duration-300">
            <i className="fa-solid fa-home fa-lg text-white"></i>
            <span>Home</span>
        </a>
        <div className="bg-themeBlack rounded-2xl w-36 h-16 text-white font-bold flex flex-row gap-2 justify-center items-center hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => window.location.reload()}>
            <i className="fa-solid fa-rotate-right fa-lg text-white"></i>
            <span>Reload</span>
        </div>
      </div>

      <div className="w-full flex justify-center mt-20">
        <img src="/unexpectederror.svg" alt="Unexpected Error" className="h-[200px] md:h-[300px] xl:h-[450px]"/>
      </div>

      <div className="w-full mt-10 mb-2">
        <Footer />
      </div>
    </>
  )
}