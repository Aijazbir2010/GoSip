import { useState, useEffect, useRef } from "react"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import Modal from 'react-modal'

const GroupchatArea = () => {

    const messages = [
      {sender: 'me', time: '16:00', message: 'Hlooo'},
      {sender: 'me', time: '16:00', message: 'Till what time you are awake ??'},
      {sender: 'jaskaran', time: '16:01', message: '1'},
      {sender: 'me', time: '16:02', message: 'Ok'},
      {sender: 'me', time: '16:02', message: 'Nice'},
      {sender: 'jaskaran', time: '16:02', message: 'Hmm'},
      {sender: 'me', time: '16:04', message: 'What is the progress of TeenTalks ?'},
    ]
    
    const [isClient, setIsClient] = useState(false)
    const [message, setMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current?.contains(event.target as Node) === false) {
                setShowEmojiPicker(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }    
    })

    const handleEmojiSelect = (emoji: any) => {
        setMessage((prev) => prev + emoji.native)
    }
  
    const [isGroupProfileModalOpen, setIsGroupProfileModalOpen] = useState(false)
    const [isAssignAdminBeforeLeavingGroupModalOpen, setIsAssignAdminBeforeLeavingGroupModalOpen] = useState(false)
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false)
    const [isLeaveTheGroupWarningModalOpen, setIsLeaveTheGroupWarningModalOpen] = useState(false)
    const [isDeleteGroupWarningModalOpen, setIsDeleteGroupWarningModalOpen] = useState(false)
    const [isDeleteAllMessagesWarningModalOpen, setIsDeleteAllMessagesWarningModalOpen] = useState(false)

    const openGroupProfileModal = () => {
        setIsGroupProfileModalOpen(true)
    }

    const closeGroupProfileModal = () => {
        setIsGroupProfileModalOpen(false)
    }

    const openAssignAdminBeforeLeavingGroupModal = () => {
        closeGroupProfileModal()
        setIsAssignAdminBeforeLeavingGroupModalOpen(true)
    }

    const closeAssignAdminBeforeLeavingGroupModal = () => {
        setIsAssignAdminBeforeLeavingGroupModalOpen(false)
    }

    const openAddMembersModal = () => {
        closeGroupProfileModal()
        setIsAddMembersModalOpen(true)
    }

    const closeAddMembersModal = () => {
        setIsAddMembersModalOpen(false)
    }

    const openLeaveTheGroupWarningModal = () => {
        closeAssignAdminBeforeLeavingGroupModal()
        setIsLeaveTheGroupWarningModalOpen(true)
    }

    const closeLeaveTheGroupWarningModal = () => {
        setIsLeaveTheGroupWarningModalOpen(false)
    }

    const openDeleteGroupWarningModal = () => {
        closeGroupProfileModal()
        setIsDeleteGroupWarningModalOpen(true)
    }

    const closeDeleteGroupWarningModal = () => {
        setIsDeleteGroupWarningModalOpen(false)
    }

    const openDeleteAllMessagesWarningModal = () => {
        setIsDeleteAllMessagesWarningModalOpen(true)
    }

    const closeDeleteAllMessagesWarningModal = () => {
        setIsDeleteAllMessagesWarningModalOpen(false)
    }

    useEffect(() => {
        if (isGroupProfileModalOpen || isAssignAdminBeforeLeavingGroupModalOpen || isAddMembersModalOpen || isLeaveTheGroupWarningModalOpen || isDeleteGroupWarningModalOpen || isDeleteAllMessagesWarningModalOpen) {
            document.body.classList.add('no-scroll')
        } else {
            document.body.classList.remove('no-scroll')
        }

        return () => document.body.classList.remove('no-scroll')
    }, [isGroupProfileModalOpen, isAssignAdminBeforeLeavingGroupModalOpen, isAddMembersModalOpen, isLeaveTheGroupWarningModalOpen, isDeleteGroupWarningModalOpen, isDeleteAllMessagesWarningModalOpen])

    const [groupProfileModalCustomStyles, setGroupProfileModalCustomStyles] = useState({
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          width: '700px',
          height: '650px',
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
            setGroupProfileModalCustomStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '90%',
                height: '700px'
              },
            }));
          } else if (window.innerWidth <= 1280) {
            setGroupProfileModalCustomStyles((prev) => ({
                ...prev,
                content: {
                  ...prev.content,
                  width: '90%',
                  height: '650px'
                },
            }));
          }
          else {
            setGroupProfileModalCustomStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '55%',
                height: '650px'
              },
            }));
          }
        };
    
        updateStyles();
        window.addEventListener('resize', updateStyles);
    
        return () => window.removeEventListener('resize', updateStyles);
      }, []);

    const [assignAdminBeforeLeavingGroupModalCustomStyles, setAssignAdminBeforeLeavingGroupModalCustomStyles] = useState({
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
            setAssignAdminBeforeLeavingGroupModalCustomStyles((prev) => ({
                ...prev,
                content: {
                  ...prev.content,
                  width: '90%',
                },
            }));
          }
          else {
            setAssignAdminBeforeLeavingGroupModalCustomStyles((prev) => ({
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

      const [addMembersModalCustomStyles, setAddMembersModalCustomStyles] = useState({
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
            setAddMembersModalCustomStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '90%',
              },
            }));
          }
          else {
            setAddMembersModalCustomStyles((prev) => ({
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

      const [deleteWarningModalsCustomStyles, setDeleteWarningModalsCustomStyles] = useState({
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          width: '700px',
          height: '300px',
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
            setDeleteWarningModalsCustomStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '90%',
              },
            }));
          }
          else {
            setDeleteWarningModalsCustomStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '60%',
              },
            }));
          }
        };
    
        updateStyles();
        window.addEventListener('resize', updateStyles);
    
        return () => window.removeEventListener('resize', updateStyles);
      }, []);

    return (
      <div className="xl:w-[50%] w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl flex flex-col gap-5 items-center py-4">
          <div className="header flex flex-row items-center justify-between px-3 md:px-5 w-full h-28">
              <div className="flex flex-row items-center gap-3 md:gap-5">
                  <div className="profile-pic rounded-full">
                      <img src="/GoSipDefaultProfilePic.jpg" alt="Profile Pic" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                  </div>
                  <span className="text-themeBlack text-2xl md:text-3xl">8th A Boyz</span>
              </div>
  
              <div className="icons flex flex-row items-center gap-5 md:gap-10">
                  <div className="group-profile-icon" onClick={openGroupProfileModal}>
                      <i className={`fa-solid fa-user-group fa-2xl ${isGroupProfileModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                  </div>
                  <div className="delete-chat-icon" onClick={openDeleteAllMessagesWarningModal}>
                      <i className="fa-solid fa-trash fa-2xl text-themeBlack hover:text-themeRed transition-colors duration-300 cursor-pointer"></i>
                  </div>
              </div>
          </div>
  
          <div className="main-chat-area w-full h-full max-h-full overflow-y-auto no-scrollbar flex flex-col gap-2 px-3 md:px-5">
              {messages.map((message, index) => (<div key={index} className={`message-container w-full flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`message flex flex-col gap-1 w-full ${message.sender === 'me' ? 'items-end' : 'items-start'}`}>
                      <div>
                          <span className={`${message.sender === 'me' ? 'text-themeTextGray' : 'text-[#E050FF]'} text-xs`}>{message.sender.charAt(0).toUpperCase() + message.sender.slice(1)}, {message.time}</span>
                      </div>
                      <div className={`${message.sender === 'me' ? 'bg-themeBlue text-white' : 'bg-themeInputBg text-themeBlack'} px-4 py-4 w-fit max-w-[50%] rounded-xl text-xl xl:text-2xl`}>
                          {message.message}
                      </div>
                  </div>
              </div>))}
          </div>
  
          <div className="message-input-area w-full flex flex-row gap-2 xl:gap-5 px-3 md:px-5 relative">
              <div className="emoji-box bg-themeBlack w-16 h-16 rounded-2xl flex justify-center items-center hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onMouseDown={() => setShowEmojiPicker((prev) => !prev)}>
                  <i className="fa-solid fa-face-laugh fa-xl text-white"></i>
              </div>
  
              <div className="flex flex-row w-full rounded-2xl">
                  <input type="text" className="bg-themeInputBg w-full rounded-l-2xl h-16 px-4 text-themeBlack placeholder:text-themeTextGray outline-none border-none" placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)}/>
                  <div className="h-16 w-20 rounded-r-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer">
                      <img src="/icons/sendicon.svg" alt="SendIcon" className="h-8"/>
                  </div>
              </div>

              {isClient && showEmojiPicker && (<div ref={emojiPickerRef} className="absolute z-10 bottom-0 translate-y-[-20%]">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </div>)} 
          </div>

          <Modal isOpen={isGroupProfileModalOpen} onRequestClose={closeGroupProfileModal} contentLabel="Group Profile Modal" style={groupProfileModalCustomStyles}>
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-full flex flex-col items-center gap-5">
                    <div className="group-profile-icon rounded-full relative flex justify-center items-center group">
                        <img src="/GoSipDefaultProfilePic.jpg" alt="Group Profile Pic" className="w-28 h-28 rounded-full"/>
                        <input type="file" id="group-profile-pic-input" name="group-profile-pic-input" accept="image/jpeg, image/png" className="hidden"/>
                        <label htmlFor="group-profile-pic-input" className="w-28 h-28 bg-black/40 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                            <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="w-9 h-9"/>
                        </label>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex flex-row items-center gap-4">
                            <span className="text-themeBlack text-3xl md:text-4xl text-center">8th A Boyz</span>
                            <i className="fa-solid fa-pen fa-xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer"></i>
                        </div>

                        <span className="text-xl md:text-2xl text-themeBlue text-center">Members: 10</span>
                    </div>

                    <div className="w-full flex justify-center">
                        <ul className="w-[95%] md:w-[90%] max-h-[200px] space-y-5 overflow-y-auto no-scrollbar">
                            <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeBlue flex flex-row items-center px-3 md:px-5">
                                <div className="flex flex-row gap-3 md:gap-5 items-center">
                                    <div className="profile-pic rounded-full">
                                        <img src="/temporary/aijazbir-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                    </div>
                                    <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                        <div className="flex flex-row gap-2">
                                            <span className="text-white text-lg md:text-2xl">Aijazbir</span>
                                            <span className="text-lg md:text-2xl text-white font-black">&#40;Admin&#41;</span>  
                                        </div>
                                        <span className="text-sm md:text-xl text-white">GS-93C572</span>
                                    </div>
                                </div>
                            </li>

                            <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center px-3 md:px-5">
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
                            </li>

                            <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center px-3 md:px-5">
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
                            </li>
                        </ul>
                    </div>

                    <div className="w-[95%] md:w-[90%] flex flex-col gap-2">
                        <div className="w-full flex flex-col md:flex-row gap-2">
                            <div className="w-full md:w-[50%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={openAddMembersModal}>
                                <i className="fa-solid fa-plus fa-xl text-white"></i>
                                <span className="text-white font-bold">Add Members</span>
                            </div>
                            <div className="w-full md:w-[50%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={openDeleteGroupWarningModal}>
                                <i className="fa-solid fa-trash fa-xl text-white"></i>
                                <span className="text-white font-bold">Delete Group</span>
                            </div>
                        </div>

                        <div className="w-full h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={openAssignAdminBeforeLeavingGroupModal}>
                            <i className="fa-solid fa-arrow-right-from-bracket fa-xl text-white"></i>
                            <span className="text-white font-bold">Leave Group</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeGroupProfileModal}></i>
            </div>
          </Modal>

          <Modal isOpen={isAssignAdminBeforeLeavingGroupModalOpen} onRequestClose={closeAssignAdminBeforeLeavingGroupModal} contentLabel="Assign Admin Before Leaving Group Modal" style={assignAdminBeforeLeavingGroupModalCustomStyles}>
            <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                <div className="w-[80%] text-center mx-auto">
                    <span className="text-themeBlack font-black text-base md:text-xl">As the admin, you must assign a new admin before leaving the group. Select any member from below:</span>
                </div>

                <div className="w-full flex justify-center">
                            <ul className="w-[95%] md:w-[90%] max-h-[200px] md:max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                                <li className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                                        <div className="profile-pic rounded-full">
                                            <img src="/temporary/aijazbir-profile.jpg" alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                        </div>
                                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                            <div className="flex flex-row gap-2">
                                                <span className="text-themeBlack text-lg md:text-2xl">Aijazbir</span>
                                                <span className="text-lg md:text-2xl text-white font-black hidden">&#40;Admin&#41;</span>  
                                            </div>
                                            <span className="text-sm md:text-xl text-themeBlue">GS-93C572</span>
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
                                        <i className="fa-regular fa-square fa-2xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300"></i>
                                    </div>
                                </li>
                            </ul>
                </div>

                <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={openLeaveTheGroupWarningModal}>
                    <i className="fa-solid fa-arrow-right-from-bracket fa-xl text-white"></i>
                    <span className="text-white font-bold">Leave Group</span>
                </div>    
            </div>

            <div className="absolute top-7 right-4 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAssignAdminBeforeLeavingGroupModal}></i>
            </div>
          </Modal>

          <Modal isOpen={isAddMembersModalOpen} onRequestClose={closeAddMembersModal} contentLabel="Add Members Modal" style={addMembersModalCustomStyles}>
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-full flex flex-col gap-5 items-center">
                    <div className="w-full flex justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Members</span>
                    </div>

                    <div className="w-full flex justify-center">
                                <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
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
                    
                    <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAddMembersModal}>
                        <i className="fa-solid fa-plus fa-2xl text-white"></i>
                        <span className="text-white font-bold">Add Members</span>
                    </div>
                </div>
            </div>
            <div className="absolute top-7 right-4 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeGroupProfileModal}></i>
            </div>
          </Modal>

          <Modal isOpen={isLeaveTheGroupWarningModalOpen} onRequestClose={closeLeaveTheGroupWarningModal} contentLabel="Leave Group Warning Modal" style={deleteWarningModalsCustomStyles}>
                      <div className="flex w-full h-full justify-center items-center">
                          <div className="flex flex-col w-[90%] items-center gap-7">
                              <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to leave the group ?</span>
          
                              <div className="flex flex-row gap-5">
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={closeLeaveTheGroupWarningModal}>Yes</button>
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeLeaveTheGroupWarningModal}>No</button>
                              </div>
                          </div>        
                      </div>
          </Modal>

          <Modal isOpen={isDeleteGroupWarningModalOpen} onRequestClose={closeDeleteGroupWarningModal} contentLabel="Delete Group Warning Modal" style={deleteWarningModalsCustomStyles}>
                      <div className="flex w-full h-full justify-center items-center">
                          <div className="flex flex-col w-[90%] items-center gap-7">
                              <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete the group ?</span>
          
                              <div className="flex flex-row gap-5">
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={closeDeleteGroupWarningModal}>Yes</button>
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeDeleteGroupWarningModal}>No</button>
                              </div>
                          </div>        
                      </div>
          </Modal>

          <Modal isOpen={isDeleteAllMessagesWarningModalOpen} onRequestClose={closeDeleteAllMessagesWarningModal} contentLabel="Delete All Messages Warning Modal" style={deleteWarningModalsCustomStyles}>
                      <div className="flex w-full h-full justify-center items-center">
                          <div className="flex flex-col w-[90%] items-center gap-7">
                              <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete all the messages ?</span>
          
                              <div className="flex flex-row gap-5">
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={closeDeleteAllMessagesWarningModal}>Yes</button>
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeDeleteAllMessagesWarningModal}>No</button>
                              </div>
                          </div>        
                      </div>
          </Modal>
      </div>
    )
  }
  
  export default GroupchatArea