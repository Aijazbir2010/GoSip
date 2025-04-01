import { Link, useParams } from "@remix-run/react"
import { useState, useEffect } from "react"
import SearchBar from "./SearchBar"
import Modal from "react-modal"

const GroupchatsList = () => {

  const { groupchatId } = useParams()  

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)  

  const openCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true)
  }

  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false)
  }

  useEffect(() => {
    if (isCreateGroupModalOpen) {
        document.body.classList.add('no-scroll')
    } else {
        document.body.classList.remove('no-scroll')
    }

    return () => document.body.classList.remove('no-scroll')
}, [isCreateGroupModalOpen])

const [createGroupModalCustomStyles, setCreateGroupModalCustomStyles] = useState({
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      width: '700px',
      height: '620px',
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
        setCreateGroupModalCustomStyles((prev) => ({
            ...prev,
            content: {
              ...prev.content,
              width: '90%',
            },
        }));
      }
      else {
        setCreateGroupModalCustomStyles((prev) => ({
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

  return (
    <div className={`xl:w-[50%] w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl ${groupchatId ? 'xl:flex hidden' : 'flex'} flex-col gap-10 items-center py-4`}>
        <div className="flex w-full justify-center text-center">
            <span className="text-themeBlue font-black text-5xl">Group Chats</span>
        </div>

        <SearchBar placeholder="Search by Name"/>

        <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={openCreateGroupModal}>
            <i className="fa-solid fa-plus fa-xl text-white"></i>
            <span className="text-white font-bold">Create Group</span>
        </div>

        <ul className="w-[95%] md:w-[90%] max-h-full space-y-5 overflow-y-auto no-scrollbar">
            <li>
                <Link to={'/groupchats/2f52-ba7w-g347-0g70'} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg hover:bg-themeBlue transition-colors duration-300 flex flex-row items-center px-3 md:px-5 gap-5 group">
                    <div className="profile-pic rounded-full">
                        <img src="/GoSipDefaultProfilePic.jpg" alt="Profile Pic" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                    </div>
                    <div className="flex flex-col h-24 justify-center gap-3">
                        <div>
                            <span className="text-themeBlack text-2xl group-hover:text-white transition-colors duration-300">8th A Boyz</span>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            <i className="fa-solid fa-message fa-xl text-themeBlue group-hover:text-white transition-colors duration-300"></i>
                            <span className="text-xl text-themeBlue group-hover:text-white transition-colors duration-300">New Message</span>
                        </div>
                    </div>
                </Link>
            </li>
        </ul>

        <Modal isOpen={isCreateGroupModalOpen} onRequestClose={closeCreateGroupModal} contentLabel="Create Group Modal" style={createGroupModalCustomStyles}>
            <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                <div className="w-full flex justify-center text-center">
                    <span className="text-4xl md:text-5xl font-black text-themeBlue">New Group</span>
                </div>

                <div className="profile-pic relative flex justify-center items-center group">
                    <img src="/GoSipDefaultProfilePic.jpg" alt="profile-pic" className="w-32 h-32 rounded-full"/>
                    <input type="file" accept="image/jpeg, image/png" name="profile-pic-input" id="profile-pic-input" className="hidden"/>
                    <label htmlFor="profile-pic-input" className="h-32 w-32 bg-black/40 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="w-12 h-12"/>
                    </label>
                </div>

                <div className={`flex flex-row items-center gap-4 px-4 h-16 w-[95%] md:w-[90%] rounded-2xl bg-themeInputBg`}>
                    <i className="fa-solid fa-pen fa-xl text-themeTextGray"></i>
                    <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Group Name"/>
                </div>

                <div className="w-full flex justify-center text-center">
                    <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Members</span>
                </div>

                <div className="w-full flex justify-center">
                            <ul className="w-[95%] md:w-[90%] max-h-[120px] space-y-5 overflow-y-auto no-scrollbar">
                                <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                                        <div className="profile-pic rounded-full">
                                            <img src="/temporary/jaskaran-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                        </div>
                                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-themeBlack text-lg md:text-2xl">Jaskaran</span>
                                                <span className="text-lg md:text-2xl text-white font-black hidden">&#40;Admin&#41;</span>  
                                            </div>
                                            <span className="text-sm md:text-xl text-themeBlue">GS-E050FF</span>
                                        </div>
                                    </div>

                                    <div className="checkbox">
                                        <i className="fa-regular fa-square fa-2xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300"></i>
                                    </div>
                                </li>

                                <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                                        <div className="profile-pic rounded-full">
                                            <img src="/temporary/vansh-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                        </div>
                                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-themeBlack text-lg md:text-2xl">Vansh</span>
                                                <span className="text-lg md:text-2xl text-themeBlue font-black hidden">&#40;Admin&#41;</span>  
                                            </div>
                                            <span className="text-sm md:text-xl text-themeBlue">GS-PB5911</span>
                                        </div>
                                    </div>

                                    <div className="checkbox">
                                        <i className="fa-solid fa-square-check fa-2xl text-themeBlue cursor-pointer hover:text-themeBlue transition-colors duration-300"></i>
                                    </div>
                                </li>

                                <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                                        <div className="profile-pic rounded-full">
                                            <img src="/temporary/manav-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                        </div>
                                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-themeBlack text-lg md:text-2xl">Manav</span>
                                                <span className="text-lg md:text-2xl text-themeBlue font-black hidden">&#40;Admin&#41;</span>  
                                            </div>
                                            <span className="text-sm md:text-xl text-themeBlue">GS-PB4041</span>
                                        </div>
                                    </div>

                                    <div className="checkbox">
                                        <i className="fa-solid fa-square-check fa-2xl text-themeBlue cursor-pointer hover:text-themeBlue transition-colors duration-300"></i>
                                    </div>
                                </li>
                            </ul>
                </div>
                
                <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeCreateGroupModal}>
                    <i className="fa-solid fa-check fa-2xl text-white"></i>
                    <span className="text-white font-bold">Create Group</span>
                </div>    
            </div>

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeCreateGroupModal}></i>
            </div>
        </Modal>
        
    </div>
  )
}

export default GroupchatsList