import { useState, useEffect } from "react"
import { Link, useLocation, useParams } from "@remix-run/react"
import Modal from 'react-modal'
import SearchBar from "./SearchBar"

const NaviagtionBar = ({ profilePic }: { profilePic: string }) => {

  const location = useLocation()  
  const { chatId, groupchatId } = useParams()

  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  
  const openAddFriendsModal = () => {
    setIsAddFriendsModalOpen(true)
  }

  const closeAddFriendsModal = () => {
    setIsAddFriendsModalOpen(false)
  }

  const openInboxModal = () => {
    setIsInboxModalOpen(true)
  }

  const closeInboxModal = () => {
    setIsInboxModalOpen(false)
  }

  useEffect(() => {
    if (isAddFriendsModalOpen || isInboxModalOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
    return () => document.body.classList.remove('no-scroll')
  }, [isAddFriendsModalOpen, isInboxModalOpen]); 

  const [addFriendsModalCustomStyles, setAddFriendsModalCustomStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '700px',
      height: '450px',
      backgroundColor: '#F3F4F4',
      borderRadius: '24px',
      position: 'relative' as 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(27, 32, 33, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 1280) {
        setAddFriendsModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%',
          },
        }));
      }
      else {
        setAddFriendsModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '55%',
          },
        }));
      }
    };

    updateStyles();
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  const [inboxModalCustomStyles, setInboxModalCustomStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '700px',
      height: '400px',
      backgroundColor: '#F3F4F4',
      borderRadius: '24px',
      position: 'relative' as 'relative',
      zIndex: 50,
      border: 'none',
    },
    overlay: {
      backgroundColor: 'rgba(27, 32, 33, 0.7)',
      zIndex: 40,
    },
  });

  useEffect(() => {
    const updateStyles = () => {
      if (window.innerWidth <= 768) {
        setInboxModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%',
            height: '350px',
          },
        }));
      } else if (window.innerWidth <= 1280) {
        setInboxModalCustomStyles((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              width: '90%',
              height: '400px',
            },
          }));
      }
      else {
        setInboxModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '55%',
            height: '400px',
          },
        }));
      }
    };

    updateStyles();
    window.addEventListener('resize', updateStyles);

    return () => window.removeEventListener('resize', updateStyles);
  }, []);

  return (
    <>
        <div className="w-full h-20 xl:h-auto xl:w-20 bg-themeBgGray rounded-2xl hidden md:flex flex-row xl:flex-col gap-10 justify-around xl:justify-start items-center py-4">
            <Link to={'/chats'} className="logo">
                <img src="/GoSipLogo.svg" alt="Logo" className="h-14 w-14 hover:scale-110 transition-transform duration-300"/>
            </Link>
            <Link to={'/chats'} className="chats-icon">
                <i className={`fa-solid fa-message fa-2xl ${(location.pathname === '/chats' || location.pathname === '/chats/') ? 'text-themeBlue' : chatId ? 'xl:text-themeBlue text-themeBlack' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
            </Link>
            <Link to={'/groupchats'} className="groupchats-icon">
                <i className={`fa-solid fa-users fa-2xl ${(location.pathname === '/groupchats' || location.pathname === '/groupchats/') ? 'text-themeBlue' : groupchatId ? 'xl:text-themeBlue text-themeBlack' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
            </Link>
            <div className="addfriends-icon" onClick={openAddFriendsModal}>
                <i className={`fa-solid fa-user-plus fa-2xl ${isAddFriendsModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
            </div>
            <div className="inbox-icon relative" onClick={openInboxModal}>
                <i className={`fa-solid fa-envelope fa-2xl ${isInboxModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                <div className={`w-3 h-3 rounded-full bg-themeBlue absolute top-[-4px] right-[-4px] ${isInboxModalOpen ? 'hidden' : 'block'}`}/>
            </div>
            <Link to={'/profile'} className={`profile-icon`}>
                <img src={profilePic} alt="Profile-Picture" className="h-14 w-14 rounded-full hover:scale-110 transition-transform duration-300"/>
            </Link>
        </div>

        <div className="w-full h-20 bg-themeBgGray rounded-2xl block md:hidden overflow-x-auto no-scrollbar">
            <div className="mx-auto flex flex-row items-center justify-around gap-5 w-[700px] h-full rounded-2xl">
                <Link to={'/chats'} className="logo">
                    <img src="/GoSipLogo.svg" alt="Logo" className="h-14 w-14 hover:scale-110 transition-transform duration-300"/>
                </Link>
                <Link to={'/chats'} className="chats-icon">
                    <i className={`fa-solid fa-message fa-2xl ${(location.pathname === '/chats' || location.pathname === '/chats/') ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
                </Link>
                <Link to={'/groupchats'} className="groupchats-icon">
                    <i className={`fa-solid fa-users fa-2xl ${(location.pathname === '/groupchats' || location.pathname === '/groupchats/') ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                </Link>
                <div className="addfriends-icon" onClick={openAddFriendsModal}>
                    <i className={`fa-solid fa-user-plus fa-2xl ${isAddFriendsModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                </div>
                <div className="inbox-icon relative" onClick={openInboxModal}>
                    <i className={`fa-solid fa-envelope fa-2xl ${isInboxModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                    <div className={`w-3 h-3 rounded-full bg-themeBlue absolute top-[-4px] right-[-4px] ${isInboxModalOpen ? 'hidden' : 'block'}`}/>
                </div>
                <Link to={'/profile'} className={`profile-icon`}>
                    <img src={profilePic} alt="Profile-Picture" className="h-14 w-14 rounded-full hover:scale-110 transition-transform duration-300"/>
                </Link>
            </div>
        </div>

        <Modal isOpen={isAddFriendsModalOpen} onRequestClose={closeAddFriendsModal} contentLabel="Add Friends Modal" style={addFriendsModalCustomStyles}>
            <div className="w-full flex justify-center text-center">
                <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Friends</span>
            </div>

            <div className="w-full flex justify-center mt-5">
                <SearchBar placeholder="Search User by Name or GoSip ID"/>
            </div>

            <div className="w-full flex justify-center mt-5">
                <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/vansh-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Vansh</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-PB5911</span>
                            </div>
                        </div>

                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
                            <i className="fa-solid fa-user-plus fa-xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-user-plus text-white block md:hidden"></i>
                        </div>
                    </li>

                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/manav-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Manav</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-PB4041</span>
                            </div>
                        </div>

                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlue hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
                            <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-check fa-lg text-white block md:hidden"></i>
                        </div>
                    </li>

                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/jaskaran-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Jaskaran</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-E050FF</span>
                            </div>
                        </div>

                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
                            <i className="fa-solid fa-user-plus fa-xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-user-plus text-white block md:hidden"></i>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAddFriendsModal}></i>
            </div>
        </Modal>

        <Modal isOpen={isInboxModalOpen} onRequestClose={closeInboxModal} contentLabel="Inbox Modal" style={inboxModalCustomStyles}>
            <div className="w-full flex justify-center text-center">
                <span className="text-4xl md:text-5xl font-black text-themeBlue">Inbox</span>
            </div>

            <div className="w-full flex justify-center mt-5 md:mt-10">
                <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/vansh-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Vansh</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-PB5911</span>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeGreen transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-check text-white block md:hidden"></i>
                            </div>
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeRed transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-xmark fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-xmark text-white block md:hidden"></i>
                            </div>
                        </div>
                    </li>

                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/manav-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Manav</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-PB4041</span>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeGreen transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-check text-white block md:hidden"></i>
                            </div>
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeRed transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-xmark fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-xmark text-white block md:hidden"></i>
                            </div>
                        </div>
                    </li>

                    <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src="/temporary/jaskaran-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">Jaskaran</span> 
                                <span className="text-sm md:text-xl text-themeBlue">GS-E050FF</span>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeGreen transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-check text-white block md:hidden"></i>
                            </div>
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeRed transition-colors duration-300 cursor-pointer">
                                <i className="fa-solid fa-xmark fa-2xl text-white hidden md:block"></i>
                                <i className="fa-solid fa-xmark text-white block md:hidden"></i>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeInboxModal}></i>
            </div>
        </Modal>
    </>
    
  )
}

export default NaviagtionBar