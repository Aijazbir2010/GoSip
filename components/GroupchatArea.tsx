import { useState, useEffect, useRef } from "react"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import Modal from 'react-modal'
import TextArea from "./TextArea"
import Spinner from "./Spinner"
import BigSpinner from "./BigSpinner"
import socket from "~/socket"
import { fetchWithAuth } from "utils/fetchWithAuth"
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { userType } from "types/user"
import { messageType } from "types/message"

const groupNameValidationSchema = Yup.object().shape({
    groupName: Yup.string()
      .matches(/^(?! )[^\s]+(?: [^\s]+)*$/, 'Group Name can include letters, numbers, emojis, and spaces (only between words)')  
      .min(3, 'Group Name must be atleast 3 characters !')
      .max(16, 'Group Name cannot exceed 16 characters !')
      .required('Group Name is required !')
});

const GroupchatArea = ({ user, friends, groupChatRoomID, groupName, groupAvatar, groupAdmin, messagesProp, members}: { user: userType | null, friends: { name: string, GoSipID: string, profilePic: string }[] | null, groupChatRoomID: string, groupName: string, groupAvatar: string, groupAdmin: string, messagesProp: messageType[] | null, members: { name: string, GoSipID: string, profilePic: string, color: string }[] | null }) => {

    const {
            register: groupNameRegister,
            handleSubmit: handleGroupNameSubmit,
            formState: { errors: groupNameErrors },
          } = useForm({
            resolver: yupResolver(groupNameValidationSchema),
            mode: 'onChange',
    });
    
    const [isClient, setIsClient] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState<messageType[] | null>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null)
    const [isChangingGroupName, setIsChangingGroupName] = useState(false)
    const [isChangingGroupAvatar, setIsChangingGroupAvatar] = useState(false)
    const [memberSelectedForAdmin, setMemberSelectedForAdmin] = useState('')
    const [isLeavingGroup, setIsLeavingGroup] = useState(false)
    const [friendsSelectedToAddInGroup, setFriendsSelectedToAddInGroup] = useState<string[]>([])
    const [isAddingMembers, setIsAddingMembers] = useState(false)
    const [isDeletingGroup, setIsDeletingGroup] = useState(false)
    const [isDeletingMessages, setIsDeletingMessages] = useState(false)
    const [friendTyping, setFriendTyping] = useState<{ name?: string, isTyping?: boolean }>({ isTyping: false })
    const typingTimeoutRef = useRef<number | null>(null)
    const [openSeenByBoxID, setOpenSeenByBoxID] = useState<number | null>(null)
    const openSeenByBoxRef = useRef<HTMLDivElement>(null)
    const openSeenByBoxButtonRef = useRef<HTMLElement>(null)
    const ulRef = useRef<HTMLUListElement>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [isNearBottom, setIsNearBottom] = useState(true)
    const isNearBottomRef = useRef(true)

    useEffect(() => {
        setIsClient(true)

        socket.emit('join')

    }, [])

    useEffect(() => {
        if (user && groupChatRoomID) {
            const receiveMessageHandler = (data: { from: string, message: string, chatRoomID: string, createdAt: Date }) => {
                if (data.chatRoomID === groupChatRoomID) {

                    const isNearBottom = isNearBottomRef.current

                    setMessages((prev) => {
                        if (!prev) {
                            if (!isNearBottom) {
                                setUnreadCount((prev) => prev + 1)
                            }
                            return [{ chatRoomID: data.chatRoomID, text: data.message, senderGoSipID: data.from, readBy: [data.from, user.GoSipID], createdAt: data.createdAt }]
                        }

                        if (!isNearBottom) {
                            setUnreadCount((prev) => prev + 1)
                        }
                        return [...prev, { chatRoomID: data.chatRoomID, text: data.message, senderGoSipID: data.from, readBy: [data.from, user.GoSipID], createdAt: data.createdAt }]
                    })

                    if (isNearBottom) {
                        socket.emit('groupMessagesMarkAsRead', groupChatRoomID)
                    }
                }
            }

            const groupMessagesReadHandler = ({ groupChatRoomID: id, reader }: { groupChatRoomID: string, reader: string }) => {
                if (id === groupChatRoomID) {
                    setMessages((prev) => {
                        if (!prev) return prev

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
            socket.on('groupMessagesRead', groupMessagesReadHandler)

            return () => {
                socket.off('receiveMessage', receiveMessageHandler)
                socket.off('groupMessagesReadHandler', groupMessagesReadHandler)
            }
        }
    }, [user, groupChatRoomID])

    useEffect(() => {
        if (user && groupChatRoomID && isNearBottom) {
            socket.emit('groupMessagesMarkAsRead', groupChatRoomID)
        }
    }, [user, groupChatRoomID, isNearBottom])

    useEffect(() => {
        const groupTypingHandler = ({ name, groupChatRoomID: incomingRoomID }: { name: string, groupChatRoomID: string }) => {
            if (incomingRoomID === groupChatRoomID) {
                setFriendTyping({ name, isTyping: true })
            }
        }

        const groupStopTypingHandler = (incomingRoomID: string) => {
            if (incomingRoomID === groupChatRoomID) {
                setFriendTyping({ isTyping: false })
            }
        }

        socket.on('groupTyping', groupTypingHandler)
        socket.on('groupStopTyping', groupStopTypingHandler)

        return () => {
            socket.off('groupTyping', groupTypingHandler)
            socket.off('groupStopTyping', groupStopTypingHandler)
        }

    }, [groupChatRoomID])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current?.contains(event.target as Node) === false) {
                setShowEmojiPicker(false)
            }
            const clickedInsideSeenBy = openSeenByBoxRef.current?.contains(event.target as Node)
            const clickedOpenSeenByBoxButton = openSeenByBoxButtonRef.current?.contains(event.target as Node)

            if (!clickedInsideSeenBy && !clickedOpenSeenByBoxButton) {
                setOpenSeenByBoxID(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }    
    })

    useEffect(() => {
        if (messagesProp && !messages) {
            setMessages(messagesProp)
        }
    }, [messagesProp])

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value)

        if (user) {
            socket.emit('groupTyping', { name: user.name, groupChatRoomID })

            if (typingTimeoutRef.current) {
                window.clearTimeout(typingTimeoutRef.current)
            }

            typingTimeoutRef.current = window.setTimeout(() => {
                socket.emit('groupStopTyping', groupChatRoomID)
            }, 1500)
        }
    }

    const sendMessage = () => {
        if (user) {
            if (!newMessage.trim()) return

            socket.emit('sendGroupMessage', { message: newMessage, groupChatRoomID })

            setMessages((prev) => {
                if (!prev) {
                    return [{ chatRoomID: groupChatRoomID, senderGoSipID: user.GoSipID, text: newMessage, readBy: [user.GoSipID], createdAt: new Date(Date.now()) }]
                }

                return [...prev, { chatRoomID: groupChatRoomID, senderGoSipID: user.GoSipID, text: newMessage, readBy: [user.GoSipID], createdAt: new Date(Date.now()) }]
            })

            setNewMessage("")
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const changeGroupName = ({ groupName }: { groupName: string }) => {
        setIsChangingGroupName(true)
        
        socket.emit('changeGroupName', { groupChatRoomID, newName: groupName }, () => {
            setIsEditGroupNameModalOpen(false)
            setIsChangingGroupName(false)
            setIsGroupProfileModalOpen(true)
        })
    }

    const changeGroupAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : ''
        if (!file) return

        const reader = new FileReader()

        reader.onload = () => {
            setIsChangingGroupAvatar(true)
            const base64 = reader.result
            socket.emit('changeGroupAvatar', { groupChatRoomID, fileType: file.type, fileData: base64 }, () => {
                setIsChangingGroupAvatar(false)
            })
        }

        reader.readAsDataURL(file)
    }

    const deleteAllMessagesForUser = async () => {
        setIsDeletingMessages(true)

        const response = await fetchWithAuth('/groupchats/deletemessagesforme', { method: 'POST', data: { groupChatRoomID }, isServer: false })

        setMessages([])

        setIsDeletingMessages(false)
    }

    const handleEmojiSelect = (emoji: any) => {
        setNewMessage((prev) => prev + emoji.native)
    }

    const addToSelectedFriends = (GoSipID: string) => {
        setFriendsSelectedToAddInGroup((prev) => [...prev, GoSipID])
    }

    const removeFromSelectedFriends = (GoSipID: string) => {
        setFriendsSelectedToAddInGroup((prev) => prev.filter(id => id !== GoSipID))
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
  
    const [isGroupProfileModalOpen, setIsGroupProfileModalOpen] = useState(false)
    const [isAssignAdminBeforeLeavingGroupModalOpen, setIsAssignAdminBeforeLeavingGroupModalOpen] = useState(false)
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false)
    const [isLeaveTheGroupWarningModalOpen, setIsLeaveTheGroupWarningModalOpen] = useState(false)
    const [isDeleteGroupWarningModalOpen, setIsDeleteGroupWarningModalOpen] = useState(false)
    const [isDeleteAllMessagesWarningModalOpen, setIsDeleteAllMessagesWarningModalOpen] = useState(false)
    const [isEditGroupNameModalOpen, setIsEditGroupNameModalOpen] = useState(false)

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
        setIsGroupProfileModalOpen(true)
    }

    const openAddMembersModal = () => {
        closeGroupProfileModal()
        setIsAddMembersModalOpen(true)
    }

    const closeAddMembersModal = () => {
        setIsAddMembersModalOpen(false)
        openGroupProfileModal()
    }

    const openEditGroupNameModal = () => {
        setIsGroupProfileModalOpen(false)
        setIsEditGroupNameModalOpen(true)
    }

    const closeEditGroupNameModal = () => {
        setIsEditGroupNameModalOpen(false)
        setIsGroupProfileModalOpen(true)
    }

    const openLeaveTheGroupWarningModal = () => {
        closeAssignAdminBeforeLeavingGroupModal()
        closeGroupProfileModal()
        setIsLeaveTheGroupWarningModalOpen(true)
    }

    const closeLeaveTheGroupWarningModal = () => {
        setIsLeaveTheGroupWarningModalOpen(false)
        setIsGroupProfileModalOpen(true)
        setMemberSelectedForAdmin('')
    }

    const openDeleteGroupWarningModal = () => {
        closeGroupProfileModal()
        setIsDeleteGroupWarningModalOpen(true)
    }

    const closeDeleteGroupWarningModal = () => {
        setIsDeleteGroupWarningModalOpen(false)
        openGroupProfileModal()
    }

    const openDeleteAllMessagesWarningModal = () => {
        setIsDeleteAllMessagesWarningModalOpen(true)
    }

    const closeDeleteAllMessagesWarningModal = () => {
        setIsDeleteAllMessagesWarningModalOpen(false)
    }

    const leaveGroup = () => {
        if (groupAdmin === user?.GoSipID && memberSelectedForAdmin) {
            setIsLeavingGroup(true)

            socket.emit('leaveGroupAdmin', { groupChatRoomID, newAdmin: memberSelectedForAdmin }, () => {
                setIsLeavingGroup(false)
                window.location.href = '/groupchats'
            })
        } else if (groupAdmin === user?.GoSipID && !memberSelectedForAdmin) {
            closeLeaveTheGroupWarningModal()
        } else {
            setIsLeavingGroup(true)

            socket.emit('leaveGroup', groupChatRoomID, () => {
                setIsLeavingGroup(false)
                window.location.href = '/groupchats'
            })
        }
    }

    const addMembers = () => {
        if (friendsSelectedToAddInGroup.length === 0) {
            closeAddMembersModal()
            return
        }

        setIsAddingMembers(true)

        socket.emit('addMembers', { groupChatRoomID, membersToAdded: friendsSelectedToAddInGroup }, () => {
            closeAddMembersModal()
            setIsAddingMembers(false)
        })
    }

    const deleteGroup = () => {
        if (groupAdmin !== user?.GoSipID) {
            closeDeleteGroupWarningModal()
            return
        }

        setIsDeletingGroup(true)

        socket.emit('deleteGroup', groupChatRoomID, () => {
            setIsDeletingGroup(false)
            window.location.href = '/groupchats'
        })
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

      const [customModalStyles, setCustomModalStyles] = useState({
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
            setCustomModalStyles((prev) => ({
              ...prev,
              content: {
                ...prev.content,
                width: '90%',
              },
            }));
          }
          else {
            setCustomModalStyles((prev) => ({
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

          {(!user || !friends || !members || !groupName || !groupAvatar || !messages || isDeletingMessages) && <div className="w-full h-full flex justify-center items-center">
            <BigSpinner />
          </div>}  

          {user && friends && members && groupName && groupAvatar && messages && !isDeletingMessages && <div className="header flex flex-row items-center justify-between px-3 md:px-5 w-full h-28">
              <div className="flex flex-row items-center gap-3 md:gap-5">
                  <div className="profile-pic rounded-full">
                      <img src={groupAvatar} alt="Group Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-themeBlack text-xl md:text-3xl">{groupName}</span>
                    {friendTyping.isTyping && <span className="text-themeBlue text-sm md:text-xl">{friendTyping.name} is typing...</span>}
                  </div>
              </div>
  
              <div className="icons flex flex-row items-center gap-3 md:gap-10">
                  <div className="group-profile-icon" onClick={openGroupProfileModal}>
                      <i className={`fa-solid fa-user-group fa-2xl ${isGroupProfileModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer hidden md:block`}></i>
                      <i className={`fa-solid fa-user-group fa-xl ${isGroupProfileModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer block md:hidden`}></i>
                  </div>
                  <div className="delete-chat-icon" onClick={openDeleteAllMessagesWarningModal}>
                      <i className={`fa-solid fa-trash fa-2xl ${isDeleteAllMessagesWarningModalOpen ? 'text-themeRed' : 'text-themeBlack'} hover:text-themeRed transition-colors duration-300 cursor-pointer hidden md:block`}></i>
                      <i className={`fa-solid fa-trash fa-xl ${isDeleteAllMessagesWarningModalOpen ? 'text-themeRed' : 'text-themeBlack'} hover:text-themeRed transition-colors duration-300 cursor-pointer block md:hidden`}></i>
                  </div>
              </div>
          </div>}
  
          {user && friends && members && groupName && groupAvatar && messages && messages.length > 0 && !isDeletingMessages && <ul ref={ulRef} onScroll={handleScroll} className="main-chat-area w-full flex-1 max-h-full overflow-y-auto no-scrollbar flex flex-col gap-4 px-3 md:px-5">
            {messages.map((message, index) => (<li key={index} className={`message-container w-full relative flex ${message.senderGoSipID === user.GoSipID ? 'justify-end' : 'justify-start'}`}>
                <div className={`message flex flex-col gap-1 w-full ${message.senderGoSipID === user.GoSipID ? 'items-end' : 'items-start'}`}>
                    <div className="flex flex-row gap-2 items-center">
                        <span style={{ color: message.senderGoSipID === user.GoSipID ? '#A6A6A6' : members[members.findIndex((member) => member.GoSipID === message.senderGoSipID)].color }} className="text-xs">{message.senderGoSipID === user.GoSipID ? 'Me' : members[members.findIndex((member) => member.GoSipID === message.senderGoSipID)].name}, {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        {message.senderGoSipID === user.GoSipID && <i ref={openSeenByBoxButtonRef} className={`fa-solid fa-chevron-down fa-sm ${openSeenByBoxID === index ? 'text-themeBlue rotate-180' : 'text-themeTextGray rotate-0'} hover:text-themeBlue transition-all duration-300 cursor-pointer`} onClick={() => setOpenSeenByBoxID((prev) => prev === index ? null : index)}></i>}
                    </div>

                    <div className={`${message.senderGoSipID === user.GoSipID ? 'bg-themeBlue text-white' : 'bg-themeInputBg text-themeBlack'} px-4 py-4 w-fit max-w-[80%] rounded-xl text-xl xl:text-2xl`}>
                        {message.text}
                    </div>
                </div>
                {message.senderGoSipID === user.GoSipID && openSeenByBoxID === index && <div ref={openSeenByBoxRef} className="absolute w-48 h-32 top-0 right-0 z-10 py-4 bg-themeInputBg drop-shadow-lg rounded-xl translate-x-[-50%]">
                    <div className="w-full flex justify-center text-center">
                        <span className="text-themeBlue text-xl font-black">Seen By</span>
                    </div>

                    <ul className="w-full h-[80%] max-h-[80%] flex flex-col items-center space-y-2 mt-2 overflow-y-auto no-scrollbar">
                        {message.readBy.length > 1 && message.readBy.map((GoSipID) => {
                            if (GoSipID !== user.GoSipID) {
                                return (<li className="text-themeBlack text-lg font-bold">{members[members.findIndex((member) => member.GoSipID === GoSipID)].name}</li>)
                            }
                        })}
                        {message.readBy.length < 2 && <li className="text-themeBlack text-lg font-bold">None</li>}
                    </ul>
                </div>}
            </li>))}
          </ul>}

          {user && friends && members && groupName && groupAvatar && messages && messages.length === 0 && !isDeletingMessages && <div className="w-full h-full flex flex-col gap-2 justify-center items-center">
            <span className="text-themeBlue text-3xl font-black">No Messages Yet !</span>
            <span className="text-themeBlue text-lg md:text-xl text-center font-black max-w-[90%]">&#40; Messages only stay for 24 hours in the Chat &#41;</span>
          </div>}
  
          {user && friends && members && groupName && groupAvatar && messages && !isDeletingMessages && <div className="message-input-area w-full h-16 relative">
            <div className="absolute w-full bottom-0 left-0">
                <div className="w-full flex flex-row items-end gap-2 xl:gap-5 px-3 md:px-5 relative">
                    <div className="emoji-box bg-themeBlack w-16 h-16 rounded-2xl flex justify-center items-center hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onMouseDown={() => setShowEmojiPicker((prev) => !prev)}>
                        <i className="fa-solid fa-face-laugh fa-xl text-white"></i>
                    </div>
        
                    <TextArea value={newMessage} placeholder="Type a message" handleChange={handleTyping} handleKeyDown={handleKeyDown}/>

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

          <Modal isOpen={isGroupProfileModalOpen} onRequestClose={closeGroupProfileModal} contentLabel="Group Profile Modal" style={groupProfileModalCustomStyles}>
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-full flex flex-col items-center gap-5">
                    <div className="group-profile-icon rounded-full relative flex justify-center items-center group">
                        <img src={groupAvatar} alt="Group Profile Pic" className="w-28 h-28 rounded-full"/>
                        {groupAdmin === user?.GoSipID && !isChangingGroupAvatar && <input type="file" id="group-profile-pic-input" name="group-profile-pic-input" accept="image/jpeg, image/png" className="hidden" onChange={changeGroupAvatar}/>}
                        {groupAdmin === user?.GoSipID && !isChangingGroupAvatar && <label htmlFor="group-profile-pic-input" className="w-28 h-28 bg-black/60 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                            <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="w-9 h-9"/>
                        </label>}
                        {groupAdmin === user?.GoSipID && isChangingGroupAvatar && <div className="w-28 h-28 bg-black/60 rounded-full absolute z-10 flex justify-center items-center">
                            <Spinner />
                        </div>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex flex-row items-center gap-4">
                            <span className="text-themeBlack text-3xl md:text-4xl text-center">{groupName}</span>
                            {groupAdmin === user?.GoSipID && <i className="fa-solid fa-pen fa-xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={openEditGroupNameModal}></i>}
                        </div>

                        <span className="text-xl md:text-2xl text-themeBlue text-center">Members: {members?.length}</span>
                    </div>

                    <div className="w-full flex justify-center">
                        {(members && user) ? <ul className="w-[95%] md:w-[90%] max-h-[200px] space-y-5 overflow-y-auto no-scrollbar">
                            {members.map((member, index) => (<li key={index} className={`min-h-20 md:min-h-28 w-full rounded-2xl ${user.GoSipID === member.GoSipID ? 'bg-themeBlue' : 'bg-themeInputBg'} flex flex-row items-center px-3 md:px-5`}>
                                <div className="flex flex-row gap-3 md:gap-5 items-center">
                                    <div className="profile-pic rounded-full">
                                        <img src={member.profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                    </div>
                                    <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                        <div className="flex flex-row gap-2">
                                            <span className={`${user.GoSipID === member.GoSipID ? 'text-white' : 'text-themeBlack'} text-lg md:text-2xl`}>{member.name}</span>
                                            {groupAdmin === member.GoSipID && <span className={`text-lg md:text-2xl ${user.GoSipID === member.GoSipID ? 'text-white' : 'text-themeBlue'} font-black`}>&#40;Admin&#41;</span>}  
                                        </div>
                                        <span className={`text-sm md:text-xl ${user.GoSipID === member.GoSipID ? 'text-white' : 'text-themeBlue'}`}>{member.GoSipID}</span>
                                    </div>
                                </div>
                            </li>))}
                        </ul> : <BigSpinner />}
                    </div>

                    <div className="w-[95%] md:w-[90%] flex flex-col gap-2">
                        <div className="w-full flex flex-col md:flex-row gap-2">
                            <div className={`w-full ${groupAdmin === user?.GoSipID ? 'md:w-[50%]' : ''} h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer`} onClick={openAddMembersModal}>
                                <i className="fa-solid fa-plus fa-xl text-white"></i>
                                <span className="text-white font-bold">Add Members</span>
                            </div>
                            {groupAdmin === user?.GoSipID && <div className="w-full md:w-[50%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={openDeleteGroupWarningModal}>
                                <i className="fa-solid fa-trash fa-xl text-white"></i>
                                <span className="text-white font-bold">Delete Group</span>
                            </div>}
                        </div>

                        {members && members.length > 1 && <div className="w-full h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={() => {groupAdmin === user?.GoSipID ? openAssignAdminBeforeLeavingGroupModal() : openLeaveTheGroupWarningModal()}}>
                            <i className="fa-solid fa-arrow-right-from-bracket fa-xl text-white"></i>
                            <span className="text-white font-bold">Leave Group</span>
                        </div>}
                    </div>
                </div>
            </div>
            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeGroupProfileModal}></i>
            </div>
          </Modal>

          {groupAdmin === user?.GoSipID && <Modal isOpen={isAssignAdminBeforeLeavingGroupModalOpen} onRequestClose={closeAssignAdminBeforeLeavingGroupModal} contentLabel="Assign Admin Before Leaving Group Modal" style={assignAdminBeforeLeavingGroupModalCustomStyles}>
            <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                <div className="w-[80%] text-center mx-auto">
                    <span className="text-themeBlack font-black text-base md:text-xl">As the admin, you must assign a new admin before leaving the group. Select any member from below:</span>
                </div>

                <div className="w-full flex justify-center">
                            {(members && user) ? <ul className="w-[95%] md:w-[90%] max-h-[200px] md:max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                                {members.map((member, index) => { if(member.GoSipID !== user.GoSipID) {return (<li key={index} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                                        <div className="profile-pic rounded-full">
                                            <img src={member.profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                        </div>
                                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                            <span className="text-themeBlack text-lg md:text-2xl">{member.name}</span>
                                            <span className="text-sm md:text-xl text-themeBlue">{member.GoSipID}</span>
                                        </div>
                                    </div>

                                    <div className="checkbox">
                                        {memberSelectedForAdmin === member.GoSipID ? <i className="fa-solid fa-square-check fa-2xl text-themeBlue cursor-pointer" onClick={() => setMemberSelectedForAdmin('')}></i> : <i className="fa-regular fa-square fa-2xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300" onClick={() => setMemberSelectedForAdmin(member.GoSipID)}></i>}
                                    </div>
                                </li>)}})}

                            </ul> : <BigSpinner />}
                </div>

                <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={openLeaveTheGroupWarningModal}>
                    <i className="fa-solid fa-arrow-right-from-bracket fa-xl text-white"></i>
                    <span className="text-white font-bold">Leave Group</span>
                </div>    
            </div>

            <div className="absolute top-7 right-4 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAssignAdminBeforeLeavingGroupModal}></i>
            </div>
          </Modal>}

          <Modal isOpen={isAddMembersModalOpen} onRequestClose={closeAddMembersModal} contentLabel="Add Members Modal" style={addMembersModalCustomStyles}>
            <div className="w-full h-full flex justify-center items-center">
                {!isAddingMembers ? (<div className="w-full flex flex-col gap-5 items-center">
                    <div className="w-full flex justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Members</span>
                    </div>

                    <div className="w-full flex justify-center">
                        {members && friends && friends.length > 0 && <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                            {friends.map((friend, index) => {if (members.findIndex((member) => member.GoSipID === friend.GoSipID) === -1) {return (<li key={index} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                                <div className="flex flex-row gap-3 md:gap-5 items-center">
                                    <div className="profile-pic rounded-full">
                                        <img src={friend.profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                                    </div>
                                    <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                        <span className="text-themeBlack text-lg md:text-2xl">{friend.name}</span>
                                        <span className="text-sm md:text-xl text-themeBlue">{friend.GoSipID}</span>
                                    </div>
                                </div>

                                <div className="checkbox">
                                    {friendsSelectedToAddInGroup.includes(friend.GoSipID) ? <i className="fa-solid fa-square-check fa-2xl text-themeBlue cursor-pointer" onClick={() => removeFromSelectedFriends(friend.GoSipID)}></i> : <i className="fa-regular fa-square fa-2xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300" onClick={() => addToSelectedFriends(friend.GoSipID)}></i>}
                                </div>
                            </li>)}})}
                        </ul>}

                        {members && friends && friends.length === 0 && <span className="text-3xl text-themeBlue font-black">No Friends !</span>}

                        {(!friends || !members) && <BigSpinner />}
                    </div>
                    
                    <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={addMembers}>
                        <i className="fa-solid fa-plus fa-2xl text-white"></i>
                        <span className="text-white font-bold">Add Members</span>
                    </div>
                </div>) : <BigSpinner />}
            </div>
            {!isAddingMembers && <div className="absolute top-7 right-4 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAddMembersModal}></i>
            </div>}
          </Modal>

          <Modal isOpen={isEditGroupNameModalOpen} onRequestClose={closeEditGroupNameModal} contentLabel="Edit Group Name Modal" style={customModalStyles}>
                <div className="w-full h-full flex flex-col justify-center items-center">    
                    <div className="w-full flex justify-center text-center">
                        <span className="text-3xl md:text-5xl font-black text-themeBlue text-center">Edit Group Name</span>
                    </div>

                    <div className="w-full mt-5 flex justify-center">
                        <form className="w-[95%] md:w-[90%] flex flex-col gap-2" onSubmit={handleGroupNameSubmit(changeGroupName)}>
                            <div className={`flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${groupNameErrors.groupName ? 'border-[2px] border-red-500' : ''}`}>
                                <i className="fa-solid fa-pen fa-xl text-themeTextGray"></i>
                                <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Group Name" defaultValue={groupName} {...groupNameRegister('groupName')}/>
                            </div>
                            {groupNameErrors.groupName && <p className="text-xs text-red-500 px-4">{groupNameErrors.groupName.message}</p>}

                            <button className="w-full h-16 rounded-2xl flex justify-center items-center bg-themeBlue text-white font-bold outline-none border-none hover:scale-95 transition-transform duration-300" type="submit">{isChangingGroupName ? <Spinner /> : 'Save'}</button>
                        </form>                
                    </div>                
                </div>

                <div className="absolute top-7 right-7 md:right-10">
                    <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeEditGroupNameModal}></i>
                </div>                
          </Modal>

          <Modal isOpen={isLeaveTheGroupWarningModalOpen} onRequestClose={closeLeaveTheGroupWarningModal} contentLabel="Leave Group Warning Modal" style={customModalStyles}>
                      <div className="flex w-full h-full justify-center items-center">
                          {!isLeavingGroup ? <div className="flex flex-col w-[90%] items-center gap-7">
                              <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to leave the group ?</span>
          
                              <div className="flex flex-row gap-5">
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={leaveGroup}>Yes</button>
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeLeaveTheGroupWarningModal}>No</button>
                              </div>
                          </div> : <BigSpinner />}        
                      </div>
          </Modal>

          <Modal isOpen={isDeleteGroupWarningModalOpen} onRequestClose={closeDeleteGroupWarningModal} contentLabel="Delete Group Warning Modal" style={customModalStyles}>
                      <div className="flex w-full h-full justify-center items-center">
                          {!isDeletingGroup ? <div className="flex flex-col w-[90%] items-center gap-7">
                              <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete the group ?</span>
          
                              <div className="flex flex-row gap-5">
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={deleteGroup}>Yes</button>
                                  <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeDeleteGroupWarningModal}>No</button>
                              </div>
                          </div> : <BigSpinner />}        
                      </div>
          </Modal>

          <Modal isOpen={isDeleteAllMessagesWarningModalOpen} onRequestClose={closeDeleteAllMessagesWarningModal} contentLabel="Delete All Messages Warning Modal" style={customModalStyles}>
                <div className="flex w-full h-full justify-center items-center">
                    <div className="flex flex-col w-[90%] items-center gap-7">
                        <span className="text-themeBlue font-black text-4xl md:text-5xl text-center">Are you sure you want to delete all the messages for you ?</span>
          
                        <div className="flex flex-row gap-5">
                            <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeBlue transition-colors duration-300" onClick={() => {closeDeleteAllMessagesWarningModal(); deleteAllMessagesForUser()}}>Yes</button>
                            <button className="h-16 w-20 rounded-2xl text-white font-bold outline-none border-none bg-themeBlack hover:bg-themeRed transition-colors duration-300" onClick={closeDeleteAllMessagesWarningModal}>No</button>
                        </div>
                    </div>      
                </div>
          </Modal>
      </div>
    )
  }
  
  export default GroupchatArea