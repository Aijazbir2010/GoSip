import { useState, useEffect, useRef } from "react"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import BigSpinner from "./BigSpinner"
import Modal from 'react-modal'

import type { userType } from "types/user"
import type { chatAreaFriendType } from "types/chatAreaFriend"
import type { messageType } from "types/message"

const ChatArea = ({ user, friend, messages }: { user: userType | null, friend: chatAreaFriendType | null, messages: messageType[] | null }) => {

  const [isClient, setIsClient] = useState(false)
  const [message, setMessage] = useState("")
  const [isCopied, setIsCopied] = useState(false)
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

  const handleCopy = (GoSipID: string) => {
    navigator.clipboard.writeText(GoSipID).then(() => {
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 2000)
    })
  }

  const [isFriendProfileModalOpen, setIsFriendProfileModalOpen] = useState(false)
  const [isDeleteAllMessagesModalOpen, setIsDeleteAllMessagesModalOpen] = useState(false)
  const [isRemoveFriendWarningModalOpen, setIsRemoveFriendWarningModalOpen] = useState(false)

  const openFriendProfileModal = () => {
    setIsFriendProfileModalOpen(true)
  }

  const closeFriendProfileModal = () => {
    setIsFriendProfileModalOpen(false)
  }

  const openDeleteAllMessagesModal = () => {
    setIsDeleteAllMessagesModalOpen(true)
  }

  const closeDeleteAllMessagesModal = () => {
    setIsDeleteAllMessagesModalOpen(false)
  }

  const openRemoveFriendWarningModal = () => {
    setIsFriendProfileModalOpen(false)
    setIsRemoveFriendWarningModalOpen(true)
  }

  const closeRemoveFriendWarningModal = () => {
    setIsRemoveFriendWarningModalOpen(false)
  }

  useEffect(() => {
    if (isFriendProfileModalOpen || isDeleteAllMessagesModalOpen || isRemoveFriendWarningModalOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
    return () => document.body.classList.remove('no-scroll')
  }, [isFriendProfileModalOpen, isDeleteAllMessagesModalOpen, isRemoveFriendWarningModalOpen]);

  const [friendProfileModalCustomStyles, setFriendProfileModalCustomStyles] = useState({
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
      if (window.innerWidth <= 1280) {
        setFriendProfileModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '90%',
          },
        }));
      }
      else {
        setFriendProfileModalCustomStyles((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            width: '50%',
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
        {!user || !friend || !messages && <div className="w-full h-full flex justify-center items-center">
          <BigSpinner />
        </div>}
        
        {user && friend && messages && <div className="header flex flex-row items-center justify-between px-3 md:px-5 w-full h-28">
            <div className="flex flex-row items-center gap-3 md:gap-5">
                <div className="profile-pic rounded-full relative">
                    <img src={friend.profilePic} alt="Profile Pic" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                    {friend.isOnline && <div className="w-3 h-3 absolute z-10 bg-themeGreen rounded-full right-3 bottom-1 md:bottom-2"/>}
                </div>
                <span className="text-themeBlack text-2xl md:text-3xl">{friend.name}</span>
            </div>

            <div className="icons flex flex-row items-center gap-5 md:gap-10">
                <div className="user-profile-icon" onClick={openFriendProfileModal}>
                    <i className={`fa-solid fa-user fa-2xl ${isFriendProfileModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                </div>
                <div className="delete-chat-icon" onClick={openDeleteAllMessagesModal}>
                    <i className={`fa-solid fa-trash fa-2xl ${isDeleteAllMessagesModalOpen ? 'text-themeRed' : 'text-themeBlack'} hover:text-themeRed transition-colors duration-300 cursor-pointer`}></i>
                </div>
            </div>
        </div>}

        {user && friend && messages && <div className="main-chat-area w-full h-full max-h-full overflow-y-auto no-scrollbar flex flex-col gap-4 px-3 md:px-5">
            {messages.map((message, index) => (<div key={index} className={`message-container w-full flex ${message.senderGoSipID === user.GoSipID ? 'justify-end' : 'justify-start'}`}>
                <div className={`message flex flex-col gap-1 w-full ${message.senderGoSipID === user.GoSipID ? 'items-end' : 'items-start'}`}>
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-themeTextGray text-xs">{message.senderGoSipID === user.GoSipID ? 'Me' : friend.name}</span>
                        {message.senderGoSipID === user.GoSipID && <div className={`w-2 h-2 rounded-full ${message.readBy.includes(friend.GoSipID) ? 'bg-themeBlue' : 'bg-themeTextGray'}`}/>}
                    </div>
                    <div className={`${message.senderGoSipID === user.GoSipID ? 'bg-themeBlue text-white' : 'bg-themeInputBg text-themeBlack'} px-4 py-4 w-fit max-w-[80%] rounded-xl text-xl xl:text-2xl`}>
                        {message.text}
                    </div>
                </div>
            </div>))}
        </div>}

        {user && friend && messages && <div className="message-input-area w-full flex flex-row gap-2 xl:gap-5 px-3 md:px-5 relative">
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
        </div>}

        <Modal isOpen={isFriendProfileModalOpen} onRequestClose={closeFriendProfileModal} contentLabel="Friend Profile Modal" style={friendProfileModalCustomStyles}>
            <div className="flex h-full w-full justify-center items-center">
                <div className="w-full flex flex-col items-center gap-5">
                    <div className="profile-pic rounded-full">
                        <img src={friend?.profilePic} alt="Profile Pic" className="w-28 h-28 md:h-32 md:w-32 rounded-full"/>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-center text-themeBlack text-4xl">{friend?.name}</span>

                        <div className="flex flex-row items-center gap-3">
                            <span className="text-2xl text-themeBlue">{friend?.GoSipID}</span>
                            {isCopied ? <i className="fa-solid fa-check fa-xl text-themeBlue"></i> : <i className="fa-regular fa-clone fa-xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => handleCopy(friend?.GoSipID || '')}></i>}
                        </div>
                    </div>

                    <div className="w-[95%] md:w-[w-90%]">
                        <button className="w-full h-16 rounded-2xl text-white font-bold bg-themeBlack border-none outline-none hover:bg-themeRed transition-colors duration-300" onClick={openRemoveFriendWarningModal}>Remove Friend</button>
                    </div>
                </div>
            </div>

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeFriendProfileModal}></i>
            </div>
        </Modal>

        <Modal isOpen={isDeleteAllMessagesModalOpen} onRequestClose={closeDeleteAllMessagesModal} contentLabel="Delete All Messages Modal" style={deleteWarningModalsCustomStyles}>
            <div className="flex w-full h-full justify-center items-center">
                <div className="flex flex-col w-[90%] items-center gap-7">
                    <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete all the messages ?</span>

                    <div className="flex flex-row gap-5">
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={closeDeleteAllMessagesModal}>Yes</button>
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeDeleteAllMessagesModal}>No</button>
                    </div>
                </div>        
            </div>
        </Modal>

        <Modal isOpen={isRemoveFriendWarningModalOpen} onRequestClose={closeRemoveFriendWarningModal} contentLabel="Remove Friend Warning Modal" style={deleteWarningModalsCustomStyles}>
            <div className="flex w-full h-full justify-center items-center">
                <div className="flex flex-col w-[90%] items-center gap-7">
                    <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to remove this friend ?</span>

                    <div className="flex flex-row gap-5">
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={closeRemoveFriendWarningModal}>Yes</button>
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeRemoveFriendWarningModal}>No</button>
                    </div>
                </div>        
            </div>
        </Modal>
    </div>
  )
}

export default ChatArea