import { useState, useEffect, useRef } from "react"
import socket from "~/socket"
import { fetchWithAuth } from "utils/fetchWithAuth"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import BigSpinner from "./BigSpinner"
import Spinner from "./Spinner"
import TextArea from "./TextArea"
import Modal from 'react-modal'

import type { userType } from "types/user"
import type { chatAreaFriendType } from "types/chatAreaFriend"
import type { messageType } from "types/message"

const ChatArea = ({ user, friend, messagesProp, chatRoomID }: { user: userType | null, friend: chatAreaFriendType | null, messagesProp: messageType[] | null, chatRoomID: string }) => {

  const [isClient, setIsClient] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<messageType[] | null>(null)
  const [onlineFriends, setOnlineFriends] = useState<string[]>([])
  const [isFriendTyping, setIsFriendTyping] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const ulRef = useRef<HTMLUListElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const isNearBottomRef = useRef(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isRemovingFriend, setIsRemovingFriend] = useState(false)
  const [isDeletingMessages, setIsDeletingMessages] = useState(false)

  // For Rendering Emoji Picker (To Prevent SSR Issues)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // For Emoji Picker
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

  // Setting Messages
  useEffect(() => {
    if (messagesProp && !messages) {
      setMessages(messagesProp)
    }
  }, [messagesProp])

  useEffect(() => {
    if (user && friend && chatRoomID) {

      socket.emit('join')

      const receiveMessageHandler = (data: { from: string, message: string, chatRoomID: string, createdAt: Date }) => {
        if (data.chatRoomID === chatRoomID) {

          const isNearBottom = isNearBottomRef.current

          setMessages((prev) => {
            if (!prev) {
              if (!isNearBottom) {
                setUnreadCount((prev) => prev + 1)
              }
              return [{ chatRoomID, senderGoSipID: data.from, text: data.message, readBy: [data.from, user.GoSipID], createdAt: data.createdAt }]
            }

            if (!isNearBottom) {
              setUnreadCount((prev) => prev + 1)
            }
            return [...prev, { chatRoomID, senderGoSipID: data.from, text: data.message, readBy: [data.from, user.GoSipID], createdAt: data.createdAt }]
          })

          if (isNearBottom) {
            socket.emit('markAsRead', { chatRoomID, GoSipID: friend.GoSipID })
          }
        }
      }

      const messagesReadHandler = ({ chatRoomID: id, reader }: { chatRoomID: string, reader: string }) => {
        if (id === chatRoomID) {
          setMessages((prev) => {
            if (!prev) return prev;

            return prev.map((msg) => {
              if (!msg.readBy.includes(reader)) {
                return { ...msg, readBy: [...msg.readBy, reader] }
              }

              return msg
            })

          })
        }
      }

      socket.on('receiveMessage', receiveMessageHandler)

      socket.on('messagesRead', messagesReadHandler)

      return () => {
        socket.off('receiveMessage', receiveMessageHandler)
        socket.off('messagesRead', messagesReadHandler)
      }
    }
  }, [user, friend, chatRoomID])

  useEffect(() => {
    if (isNearBottom && user && friend && chatRoomID) {
      socket.emit('markAsRead', { chatRoomID, GoSipID: friend.GoSipID })
    }
  }, [user, friend, chatRoomID, isNearBottom])

  useEffect(() => {

    const userOnlineHandler = (GoSipID: string) => {
      setOnlineFriends((prev) => [...prev, GoSipID])
    }

    const userOfflineHandler = (GoSipID: string) => {
      setOnlineFriends((prev) => prev.filter((id: string) => id !== GoSipID))
    }

    const onlineFriendsListHandler = (onlineFriendsList: string[]) => {
      setOnlineFriends(onlineFriendsList)
    }

    socket.on('userOnline', userOnlineHandler)

    socket.on('userOffline', userOfflineHandler)

    socket.on('onlineFriendsList', onlineFriendsListHandler)

    return () => {
      socket.off('userOnline', userOnlineHandler)
      socket.off('userOffline', userOfflineHandler)
      socket.off('onlineFriendsList', onlineFriendsListHandler)
    }
  }, [])

  useEffect(() => {

    const typingHandler = ({ chatRoomID: incomingRoomID }: { chatRoomID: string }) => {
      if (incomingRoomID === chatRoomID) {
        setIsFriendTyping(true)
      }
    }

    const stopTypingHandler = ({ chatRoomID: incomingRoomID }: { chatRoomID: string }) => {
      if (incomingRoomID === chatRoomID) {
        setIsFriendTyping(false)
      }
    }

    socket.on('typing', typingHandler)

    socket.on('stopTyping', stopTypingHandler)

    return () => {
      socket.off('typing', typingHandler)
      socket.off('stopTyping', stopTypingHandler)
    }

  }, [chatRoomID])

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)

    socket.emit('typing', { to: friend?.GoSipID, chatRoomID })

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit('stopTyping', { to: friend?.GoSipID, chatRoomID })
    }, 1500)
  }

  const sendMessage = () => {
    if (user) {
      if (!newMessage.trim()) return;
  
      socket.emit('sendMessage', {
        to: friend?.GoSipID,
        message: newMessage,
        chatRoomID,
      })
  
      setMessages((prev) => {
        if (!prev) {
          return [{ chatRoomID, senderGoSipID: user.GoSipID, text: newMessage, readBy: [user.GoSipID], createdAt: new Date(Date.now()) }]
        }

        return [...prev, { chatRoomID, senderGoSipID: user.GoSipID, text: newMessage, readBy: [user.GoSipID], createdAt: new Date(Date.now()) }]
      })

      setNewMessage("")
    }
  }

  const removeFriend = () => {
    setIsRemovingFriend(true)

    socket.emit('removeFriend', { GoSipID: friend?.GoSipID, chatRoomID })

    setIsRemovingFriend(false)

    window.location.href = '/chats'
  }

  const deleteAllMessagesForUser = async () => {
    setIsDeletingMessages(true)

    const response = await fetchWithAuth('/chats/deletemessagesforme', { method: 'POST', data: { chatRoomID }, isServer: false })

    setMessages([])

    setIsDeletingMessages(false)
  }

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native)
  }

  const handleScroll = () => {
    if (!ulRef.current) return

    const { scrollHeight, scrollTop, clientHeight } = ulRef.current

    const nearBottom = scrollHeight - scrollTop - clientHeight < 100

    isNearBottomRef.current = nearBottom

    setIsNearBottom(nearBottom)

    if (nearBottom) {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    if (!ulRef.current) return
    if (!messages) return

    if (isNearBottom) {
      ulRef.current.scrollTop = ulRef.current.scrollHeight
      setUnreadCount(0)
    }
  }, [messages])

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
    setIsFriendProfileModalOpen(true)
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
        {(!user || !friend || !messages || isDeletingMessages) && <div className="w-full h-full flex justify-center items-center">
          <BigSpinner />
        </div>}
        
        {user && friend && messages && !isDeletingMessages && <div className="header flex flex-row items-center justify-between px-3 md:px-5 w-full h-28">
            <div className="flex flex-row items-center gap-3 md:gap-5">
                <div className="profile-pic rounded-full">
                    <img src={friend.profilePic} alt="Profile Pic" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row items-center gap-3">
                    <span className="text-themeBlack text-2xl md:text-3xl">{friend.name}</span>
                    {onlineFriends.includes(friend.GoSipID) && <div className="w-3 h-3 bg-themeGreen rounded-full"/>}
                  </div>

                  {isFriendTyping && <span className="text-xl text-themeBlue">typing...</span>}
                </div>
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

        {user && friend && messages && messages.length > 0 && !isDeletingMessages && <ul ref={ulRef} onScroll={handleScroll} className="main-chat-area w-full flex-1 max-h-full overflow-y-auto no-scrollbar flex flex-col gap-4 px-3 md:px-5">
            {messages.map((message, index) => (<li key={index} className={`message-container w-full flex ${message.senderGoSipID === user.GoSipID ? 'justify-end' : 'justify-start'}`}>
                <div className={`message flex flex-col gap-1 w-full ${message.senderGoSipID === user.GoSipID ? 'items-end' : 'items-start'}`}>
                    <div className="flex flex-row gap-2 items-center">
                        <span className="text-themeTextGray text-xs">{message.senderGoSipID === user.GoSipID ? 'Me' : friend.name}, {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        {message.senderGoSipID === user.GoSipID && <div className={`w-2 h-2 rounded-full ${message.readBy.includes(friend.GoSipID) ? 'bg-themeBlue' : 'bg-themeTextGray'}`}/>}
                    </div>
                    <div className={`${message.senderGoSipID === user.GoSipID ? 'bg-themeBlue text-white' : 'bg-themeInputBg text-themeBlack'} px-4 py-4 w-fit max-w-[80%] rounded-xl text-xl xl:text-2xl`}>
                        {message.text}
                    </div>
                </div>
            </li>))}
        </ul>}

        {user && friend && messages && messages.length === 0 && !isDeletingMessages && <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
          <span className="text-themeBlue text-3xl font-black">No Messages Yet !</span>
          <span className="text-themeBlue text-lg md:text-xl text-center font-black max-w-[90%]">&#40; Messages only stay for 24 hours in the Chat &#41;</span>
        </div>}

        {user && friend && messages && !isDeletingMessages && <div className="message-input-area w-full h-16 relative">
          <div className="absolute w-full bottom-0 left-0">
              <div className="w-full flex flex-row items-end gap-2 xl:gap-4 px-3 md:px-5 relative">
                <div className="emoji-box bg-themeBlack w-16 h-16 rounded-2xl flex justify-center items-center hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onMouseDown={() => setShowEmojiPicker((prev) => !prev)}>
                    <i className="fa-solid fa-face-laugh fa-xl text-white"></i>
                </div>

                <TextArea value={newMessage} placeholder="Type a message" handleChange={handleTyping}/>

                <div className="h-16 w-16 rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={sendMessage}>
                    <img src="/icons/sendicon.svg" alt="SendIcon" className="h-8"/>
                </div>

                {isClient && showEmojiPicker && (<div ref={emojiPickerRef} className="absolute z-10 bottom-0 translate-y-[-20%]">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                </div>)}    

                {unreadCount > 0 && <div className="absolute z-20 top-0 translate-y-[-150%] left-[50%] translate-x-[-50%] px-4 py-2 rounded-2xl flex flex-row items-center gap-2 bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => {
                  ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight, behavior: 'smooth' })
                  setUnreadCount(0)
                }}>
                    <span className="text-white font-bold">{unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}</span>
                    <i className="fa-solid fa-chevron-down text-white"></i>
                </div>}
              </div>
          </div>
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
                        <button className={`w-full h-16 rounded-2xl flex justify-center items-center text-white font-bold bg-themeBlack border-none outline-none ${!isRemovingFriend ? 'hover:bg-themeRed transition-colors duration-300' : ''}`} disabled={isRemovingFriend} onClick={openRemoveFriendWarningModal}>{isRemovingFriend ? <Spinner /> : 'Remove Friend'}</button>
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
                    <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete all the messages for you ?</span>

                    <div className="flex flex-row gap-5">
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={() => {closeDeleteAllMessagesModal(); deleteAllMessagesForUser()}}>Yes</button>
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
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={() => {closeRemoveFriendWarningModal(); removeFriend()}}>Yes</button>
                        <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeRemoveFriendWarningModal}>No</button>
                    </div>
                </div>        
            </div>
        </Modal>
    </div>
  )
}

export default ChatArea