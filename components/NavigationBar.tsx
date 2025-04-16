import { useState, useEffect, useRef } from "react"
import { useLocation, useParams } from "@remix-run/react"
import Modal from 'react-modal'
import SearchBar from "./SearchBar"
import BigSpinner from "./BigSpinner"
import Spinner from "./Spinner"
import { fetchWithAuth } from "utils/fetchWithAuth"
import socket from "~/socket"

import type { userType } from "types/user"

const NavigationBar = ({ userProp, friendRequestsProp }: { userProp: userType | null, friendRequestsProp: { name: string, GoSipID: string, profilePic: string }[] }) => {

  const location = useLocation()  
  const { chatId, groupchatId } = useParams()

  const [users, setUsers] = useState<{ name: string, GoSipID: string, profilePic: string, inFriendRequests: boolean }[]>([])
  const [friendRequests, setFriendRequests] = useState<{ name: string, GoSipID: string, profilePic: string }[] | null>(null)
  const [query, setQuery] = useState("")
  const searchTimeoutRef = useRef<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [sendingRequestsTo, setSendingRequestsTo] = useState<string[]>([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [acceptingRequestsOfUsers, setAcceptingRequestsOfUsers] = useState<string[]>([])
  const [rejectingRequestsOfUsers, setRejectingRequestsOfUsers] = useState<string[]>([])

  useEffect(() => {
    if (location.pathname === '/profile') {
      socket.emit('join')
    }

    const friendRequestReceivedHandler = ({ name, GoSipID, profilePic }: { name: string, GoSipID: string, profilePic: string }) => {
      setUnreadNotificationsCount((prev) => prev + 1)

      setFriendRequests((prev) => {
        if (!prev) return prev
        
        return [...prev, { name, GoSipID, profilePic }]
      })
    }

    socket.on('friendRequestReceived', friendRequestReceivedHandler)

    return () => {
      socket.off('friendRequestReceived', friendRequestReceivedHandler)
    }

  }, [])

  useEffect(() => {
    if (userProp) {
      setUnreadNotificationsCount(userProp.unreadNotifications)
    }
  }, [userProp])

  useEffect(() => {
    if (!friendRequests) {
      setFriendRequests(friendRequestsProp)
    }
  }, [friendRequestsProp])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    const query = e.target.value

    if (query.trim() === '') {
      setUsers([])
      return
    }

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearching(true)

      const response = await fetchWithAuth(`/user/getusers?identifier=${query}`, { method: 'GET', isServer: false })

      setIsSearching(false)

      setUsers(response.users)
    }, 300)
  }

  const sendFriendRequest = async (GoSipID: string) => {
    setSendingRequestsTo((prev) => [...prev, GoSipID])

    socket.emit('sendFriendRequest', { GoSipID })

    setUsers((prev) => prev.map((user) => {
      if (user.GoSipID === GoSipID) {
        return {...user, inFriendRequests: true}
      }

      return user
    }))

    setSendingRequestsTo((prev) => prev.filter(id => id !== GoSipID))
  }

  const acceptRequest = async (GoSipID: string) => {
    setAcceptingRequestsOfUsers((prev) => [...prev, GoSipID])

    socket.emit('acceptRequest', GoSipID)

    setFriendRequests((prev) => {
      if (!prev) return prev

      return prev.filter((user) => user.GoSipID !== GoSipID)
    })

    setAcceptingRequestsOfUsers((prev) => prev.filter(id => id !== GoSipID))
  }

  const rejectRequest = async (GoSipID: string) => {
    setRejectingRequestsOfUsers((prev) => [...prev, GoSipID])

    const response = await fetchWithAuth('/user/rejectrequest', { method: 'POST', data: { GoSipID }, isServer: false })

    setFriendRequests((prev) => {
      if (!prev) return prev

      return prev.filter((user) => user.GoSipID !== GoSipID)
    })

    setRejectingRequestsOfUsers((prev) => prev.filter(id => id !== GoSipID))
  }

  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  
  const openAddFriendsModal = () => {
    setIsAddFriendsModalOpen(true)
  }

  const closeAddFriendsModal = () => {
    setIsAddFriendsModalOpen(false)
    setQuery("")
  }

  const openInboxModal = async () => {
    setIsInboxModalOpen(true)
    setUnreadNotificationsCount(0)
    const response = await fetchWithAuth('/user/readNotifications', { method: 'GET', isServer: false })
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
            <a href={'/chats'} className="logo">
                <img src="/GoSipLogo.svg" alt="Logo" className="h-14 w-14 hover:scale-110 transition-transform duration-300"/>
            </a>
            <a href={'/chats'} className="chats-icon">
                <i className={`fa-solid fa-message fa-2xl ${(location.pathname === '/chats' || location.pathname === '/chats/') ? 'text-themeBlue' : chatId ? 'xl:text-themeBlue text-themeBlack' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
            </a>
            <a href={'/groupchats'} className="groupchats-icon">
                <i className={`fa-solid fa-users fa-2xl ${(location.pathname === '/groupchats' || location.pathname === '/groupchats/') ? 'text-themeBlue' : groupchatId ? 'xl:text-themeBlue text-themeBlack' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
            </a>
            <div className="addfriends-icon" onClick={openAddFriendsModal}>
                <i className={`fa-solid fa-user-plus fa-2xl ${isAddFriendsModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
            </div>
            <div className="inbox-icon relative" onClick={openInboxModal}>
                <i className={`fa-solid fa-envelope fa-2xl ${isInboxModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                {unreadNotificationsCount > 0 && <div className="w-3 h-3 rounded-full bg-themeBlue absolute top-[-4px] right-[-4px]"/>}
            </div>
            <a href={'/profile'} className={`profile-icon`}>
                <img src={userProp ? userProp.profilePic : '/GoSipDefaultProfilePic.jpg'} alt="Profile-Picture" className="h-14 w-14 rounded-full hover:scale-110 transition-transform duration-300"/>
            </a>
        </div>

        <div className="w-full h-20 bg-themeBgGray rounded-2xl block md:hidden overflow-x-auto no-scrollbar">
            <div className="mx-auto flex flex-row items-center justify-around gap-5 w-[700px] h-full rounded-2xl">
                <a href={'/chats'} className="logo">
                    <img src="/GoSipLogo.svg" alt="Logo" className="h-14 w-14 hover:scale-110 transition-transform duration-300"/>
                </a>
                <a href={'/chats'} className="chats-icon">
                    <i className={`fa-solid fa-message fa-2xl ${(location.pathname === '/chats' || location.pathname === '/chats/') ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300`}></i>
                </a>
                <a href={'/groupchats'} className="groupchats-icon">
                    <i className={`fa-solid fa-users fa-2xl ${(location.pathname === '/groupchats' || location.pathname === '/groupchats/') ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                </a>
                <div className="addfriends-icon" onClick={openAddFriendsModal}>
                    <i className={`fa-solid fa-user-plus fa-2xl ${isAddFriendsModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                </div>
                <div className="inbox-icon relative" onClick={openInboxModal}>
                    <i className={`fa-solid fa-envelope fa-2xl ${isInboxModalOpen ? 'text-themeBlue' : 'text-themeBlack'} hover:text-themeBlue transition-colors duration-300 cursor-pointer`}></i>
                    {unreadNotificationsCount > 0 && <div className="w-3 h-3 rounded-full bg-themeBlue absolute top-[-4px] right-[-4px]"/>}
                </div>
                <a href={'/profile'} className={`profile-icon`}>
                    <img src={userProp ? userProp.profilePic : '/GoSipDefaultProfilePic.jpg'} alt="Profile-Picture" className="h-14 w-14 rounded-full hover:scale-110 transition-transform duration-300"/>
                </a>
            </div>
        </div>

        <Modal isOpen={isAddFriendsModalOpen} onRequestClose={closeAddFriendsModal} contentLabel="Add Friends Modal" style={addFriendsModalCustomStyles}>
            <div className="w-full flex justify-center text-center">
                <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Friends</span>
            </div>

            <div className="w-full flex justify-center mt-5">
                <SearchBar placeholder="Search User by Name or GoSip ID" value={query} handleChange={handleSearch}/>
            </div>

            {!isSearching && query && users.length > 0 && <div className="w-full flex justify-center mt-5">
                <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                    {users.map((user, index) => (<li key={index} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src={user.profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">{user.name}</span> 
                                <span className="text-sm md:text-xl text-themeBlue">{user.GoSipID}</span>
                            </div>
                        </div>

                        {!userProp?.friends.includes(user.GoSipID) && !user.inFriendRequests && !sendingRequestsTo.includes(user.GoSipID) && <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={() => sendFriendRequest(user.GoSipID)}>
                            <i className="fa-solid fa-user-plus fa-xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-user-plus text-white block md:hidden"></i>
                        </div>}

                        {(userProp?.friends.includes(user.GoSipID) || user.inFriendRequests) && <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center ${sendingRequestsTo.includes(user.GoSipID) ? 'bg-themeBlack' : 'bg-themeBlue'}`}>
                            {!sendingRequestsTo.includes(user.GoSipID) && <i className={`fa-solid ${userProp?.friends.includes(user.GoSipID) ? 'fa-user-group' : 'fa-check'} fa-xl text-white hidden md:block`}></i>}
                            {!sendingRequestsTo.includes(user.GoSipID) && <i className={`fa-solid ${userProp?.friends.includes(user.GoSipID) ? 'fa-user-group' : 'fa-check'} text-white block md:hidden`}></i>}
                            {sendingRequestsTo.includes(user.GoSipID) && <Spinner />}
                        </div>}
                    </li>))}
                </ul>
            </div>}

            {!isSearching && users.length === 0 && query && <div className="w-full h-[260px] flex justify-center items-center">
              <span className="text-3xl text-themeBlue font-black">No Users Found !</span>
            </div>}

            {!isSearching && !query && <div className="w-full h-[260px] flex justify-center items-center">
              <span className="text-3xl text-themeBlue text-center font-black max-w-[90%]">Search Users To Add Them !</span>
            </div>}

            {isSearching && <div className="w-full h-[260px] flex justify-center items-center">
              <BigSpinner />
            </div>}

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeAddFriendsModal}></i>
            </div>
        </Modal>

        <Modal isOpen={isInboxModalOpen} onRequestClose={closeInboxModal} contentLabel="Inbox Modal" style={inboxModalCustomStyles}>
            <div className="w-full flex justify-center text-center">
                <span className="text-4xl md:text-5xl font-black text-themeBlue">Inbox</span>
            </div>

            {friendRequests && friendRequests.length > 1 && <div className="w-full flex justify-center mt-5 md:mt-10">
                <ul className="w-[95%] md:w-[90%] max-h-[250px] space-y-5 overflow-y-auto no-scrollbar">
                    {friendRequests.map((user, index) => (<li key={index} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-2 md:px-5">
                        <div className="flex flex-row gap-3 md:gap-5 items-center">
                            <div className="profile-pic rounded-full">
                                <img src={user.profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                                <span className="text-themeBlack text-lg md:text-2xl">{user.name}</span> 
                                <span className="text-xs md:text-xl text-themeBlue">{user.GoSipID}</span>
                            </div>
                        </div>

                        <div className="flex flex-row gap-2 md:gap-3">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeGreen transition-colors duration-300 cursor-pointer" onClick={() => acceptRequest(user.GoSipID)}>
                                {!acceptingRequestsOfUsers.includes(user.GoSipID) && <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>}
                                {!acceptingRequestsOfUsers.includes(user.GoSipID) && <i className="fa-solid fa-check text-white block md:hidden"></i>}
                                {acceptingRequestsOfUsers.includes(user.GoSipID) && <Spinner />}
                            </div>
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack ${!rejectingRequestsOfUsers.includes(user.GoSipID) ? 'hover:bg-themeRed transition-colors duration-300 cursor-pointer' : ''}`} onClick={() => rejectRequest(user.GoSipID)}>
                                {!rejectingRequestsOfUsers.includes(user.GoSipID) && <i className="fa-solid fa-xmark fa-2xl text-white hidden md:block"></i>}
                                {!rejectingRequestsOfUsers.includes(user.GoSipID) && <i className="fa-solid fa-xmark text-white block md:hidden"></i>}
                                {rejectingRequestsOfUsers.includes(user.GoSipID) && <Spinner />}
                            </div>
                        </div>
                    </li>))}
                </ul>
            </div>}

            {friendRequests && friendRequests.length === 1 && <div className="w-full h-[250px] md:h-[300px] flex justify-center items-center">
                <div className="min-h-20 md:min-h-28 w-[95%] md:w-[90%] rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-2 md:px-5">
                    <div className="flex flex-row gap-3 md:gap-5 items-center">
                        <div className="profile-pic rounded-full">
                          <img src={friendRequests[0].profilePic} alt="Profile Pic" className="w-16 h-16 md:w-24 md:h-24 rounded-full"/>
                        </div>
                        <div className="flex flex-col h-16 md:h-24 justify-center gap-1 md:gap-3">
                            <span className="text-themeBlack text-lg md:text-2xl">{friendRequests[0].name}</span> 
                            <span className="text-xs md:text-xl text-themeBlue">{friendRequests[0].GoSipID}</span>
                        </div>
                    </div>

                    <div className="flex flex-row gap-2 md:gap-3">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeGreen transition-colors duration-300 cursor-pointer" onClick={() => acceptRequest(friendRequests[0].GoSipID)}>
                            <i className="fa-solid fa-check fa-2xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-check text-white block md:hidden"></i>
                        </div>
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center items-center bg-themeBlack hover:bg-themeRed transition-colors duration-300 cursor-pointer" onClick={() => rejectRequest(friendRequests[0].GoSipID)}>
                            <i className="fa-solid fa-xmark fa-2xl text-white hidden md:block"></i>
                            <i className="fa-solid fa-xmark text-white block md:hidden"></i>
                        </div>
                    </div>
                </div>
            </div>}

            {!friendRequests && <div className="w-full h-[250px] md:h-[300px] flex justify-center items-center">
              <BigSpinner />
            </div>}

            {friendRequests && friendRequests.length === 0 && <div className="w-full h-[250px] md:h-[300px] flex justify-center items-center">
              <span className="text-3xl text-themeBlue text-center font-black max-w-[90%]">No Friend Requests Yet !</span>
            </div>}

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeInboxModal}></i>
            </div>
        </Modal>
    </>
    
  )
}

export default NavigationBar