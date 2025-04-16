import { useParams } from "@remix-run/react"
import { useState, useEffect, useRef } from "react"
import { fetchWithAuth } from "utils/fetchWithAuth"
import socket from "~/socket"
import SearchBar from "./SearchBar"
import Modal from "react-modal"
import Spinner from "./Spinner"
import BigSpinner from "./BigSpinner"
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import type { groupChatRoomType } from "types/groupChatRoom"

const groupNameValidationSchema = Yup.object().shape({
    groupName: Yup.string()
      .matches(/^(?! )[^\s]+(?: [^\s]+)*$/, 'Group Name can include letters, numbers, emojis, and spaces (only between words)')  
      .min(3, 'Group Name must be atleast 3 characters !')
      .max(16, 'Group Name cannot exceed 16 characters !')
      .required('Group Name is required !')
});

const GroupchatsList = ({ friends, groupChatRooms, searchBarValue, handleSearchBarChange }: { friends: { name: string, GoSipID: string, profilePic: string }[], groupChatRooms: groupChatRoomType[] | null, searchBarValue: string, handleSearchBarChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {

  const { groupchatId } = useParams()  

  const {
        register: groupNameRegister,
        handleSubmit: handleGroupNameSubmit,
        setValue: setGroupNameValue,
        formState: { errors: groupNameErrors },
      } = useForm({
        resolver: yupResolver(groupNameValidationSchema),
        mode: 'onChange',
  });

  const defaultGroupAvatar = "https://res.cloudinary.com/df63mjue3/image/upload/v1742656391/GoSipDefaultProfilePic_ugv59u.jpg"
  const [isGroupAvatarUploading, setIsGroupAvatarUploading] = useState(false)
  const groupAvatarRef = useRef<HTMLImageElement>(null)
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)


  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)  

  const openCreateGroupModal = () => {
    setIsCreateGroupModalOpen(true)
  }

  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false)
    if (groupAvatarRef.current) {
        groupAvatarRef.current.src = defaultGroupAvatar
    }
    setGroupNameValue('groupName', '')
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


  const addToSelectedFriends = (GoSipID: string) => {
    setSelectedFriends((prev) => [...prev, GoSipID])
  }

  const removeFromSelectedFriends = (GoSipID: string) => {
    setSelectedFriends((prev) => prev.filter(id => id !== GoSipID))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
        return
    }

    const newFile = e.target.files[0]
    const formData = new FormData()
    formData.append('groupAvatar', newFile)

    setIsGroupAvatarUploading(true)

    const response = await fetchWithAuth('/groupchats/uploadavatar', { method: 'POST', data: formData, isServer: false })

    if (groupAvatarRef.current) {
        groupAvatarRef.current.src = response.groupAvatar || defaultGroupAvatar
    }

    setIsGroupAvatarUploading(false)
  }

  const createGroup = async ({ groupName }: { groupName: string }) => {
    setIsCreatingGroup(true)

    socket.emit('createGroup', { groupName, groupAvatar: groupAvatarRef.current?.src, members: selectedFriends }, () => {
        setIsCreatingGroup(false)

        closeCreateGroupModal()
    })
  }

  return (
    <div className={`xl:w-[50%] w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl ${groupchatId ? 'xl:flex hidden' : 'flex'} flex-col gap-10 items-center py-4`}>
        <div className="flex w-full justify-center text-center">
            <span className="text-themeBlue font-black text-5xl">Group Chats</span>
        </div>

        {groupChatRooms && <SearchBar placeholder="Search by Name" value={searchBarValue} handleChange={handleSearchBarChange}/>}

        {groupChatRooms && <div className="w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 hover:bg-themeBlue transition-colors duration-300 cursor-pointer" onClick={openCreateGroupModal}>
            <i className="fa-solid fa-plus fa-xl text-white"></i>
            <span className="text-white font-bold">Create Group</span>
        </div>}

        {groupChatRooms && groupChatRooms.length > 0 && <ul className="w-[95%] md:w-[90%] max-h-full space-y-5 overflow-y-auto no-scrollbar">
            {groupChatRooms.map((room, index) => (<li key={index}>
                <a href={`/groupchats/${room.groupChatRoomID}`} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg hover:bg-themeBlue transition-colors duration-300 flex flex-row items-center px-3 md:px-5 gap-5 group">
                    <div className="profile-pic rounded-full">
                        <img src={room.groupAvatar} alt="Group Avatar" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                    </div>
                    <div className="flex flex-col h-24 justify-center gap-3">
                        <div>
                            <span className="text-themeBlack text-2xl group-hover:text-white transition-colors duration-300">{room.groupName}</span>
                        </div>

                        {room.unreadCount > 0 && <div className="flex flex-row items-center gap-2">
                            <i className="fa-solid fa-message fa-xl text-themeBlue group-hover:text-white transition-colors duration-300"></i>
                            <span className="text-xl text-themeBlue group-hover:text-white transition-colors duration-300">{room.unreadCount} New Message{room.unreadCount > 1 ? 's' : ''}</span>
                        </div>}
                    </div>
                </a>
            </li>))}
        </ul>}

        {groupChatRooms && groupChatRooms.length === 0 && <div className="flex-1 flex justify-center items-center">
            <span className="text-3xl md:text-4xl text-themeBlue font-black text-center">No Group Chats !</span>
        </div>}

        {!groupChatRooms && <div className="flex-1 flex justify-center items-center">
            <BigSpinner />    
        </div>}

        <Modal isOpen={isCreateGroupModalOpen} onRequestClose={closeCreateGroupModal} contentLabel="Create Group Modal" style={createGroupModalCustomStyles}>
            <div className="w-full h-full flex flex-col gap-5 items-center justify-center">
                <div className="w-full flex justify-center text-center">
                    <span className="text-4xl md:text-5xl font-black text-themeBlue">New Group</span>
                </div>

                <div className="profile-pic relative flex justify-center items-center group">
                    <img ref={groupAvatarRef} src={defaultGroupAvatar} alt="profile-pic" className="w-32 h-32 rounded-full"/>
                    <input type="file" accept="image/jpeg, image/png" name="profile-pic-input" id="profile-pic-input" className="hidden" onChange={handleFileChange}/>
                    {!isGroupAvatarUploading && <label htmlFor="profile-pic-input" className="h-32 w-32 bg-black/60 rounded-full absolute z-10 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <img src="/icons/add-a-photo.svg" alt="Add a Photo" className="w-12 h-12"/>
                    </label>}
                    {isGroupAvatarUploading && <div className="w-32 h-32 bg-black/60 rounded-full absolute z-10 flex justify-center items-center">
                        <Spinner />
                    </div>}
                </div>

                <div className="w-[95%] md:w-[90%] flex flex-col gap-2">
                    <form id="groupNameForm" className="w-full" onSubmit={handleGroupNameSubmit(createGroup)}>
                        <div className={`flex flex-row items-center gap-4 px-4 h-16 w-full rounded-2xl focus-within:border-[2px] focus-within:border-themeBlue bg-themeInputBg ${groupNameErrors.groupName ? 'border-[2px] border-red-500' : ''}`}>
                            <i className="fa-solid fa-pen fa-xl text-themeTextGray"></i>
                            <input type="text" className="w-full h-full border-none outline-none bg-transparent text-themeBlack placeholder:text-themeTextGray" placeholder="Group Name" {...groupNameRegister('groupName')}/>
                        </div>
                    </form>

                    {groupNameErrors.groupName && <p className="text-xs text-red-500 px-4">{groupNameErrors.groupName.message}</p>}
                </div>

                <div className="w-full flex justify-center text-center">
                    <span className="text-4xl md:text-5xl font-black text-themeBlue">Add Members</span>
                </div>

                <div className="w-full flex justify-center">
                            <ul className="w-[95%] md:w-[90%] max-h-[120px] space-y-5 overflow-y-auto no-scrollbar">
                                {friends.map((friend, index) => (<li key={index} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg flex flex-row items-center justify-between px-3 md:px-5">
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
                                        {selectedFriends.includes(friend.GoSipID) ? <i className="fa-solid fa-square-check fa-2xl text-themeBlue cursor-pointer" onClick={() => removeFromSelectedFriends(friend.GoSipID)}></i> : <i className="fa-regular fa-square fa-2xl text-themeBlack cursor-pointer hover:text-themeBlue transition-colors duration-300" onClick={() => addToSelectedFriends(friend.GoSipID)}></i>}
                                    </div>
                                </li>))}
                            </ul>
                </div>
                
                <button className={`w-[95%] md:w-[90%] h-16 bg-themeBlack rounded-2xl flex flex-row justify-center items-center gap-4 ${!isCreatingGroup ? 'hover:bg-themeBlue transition-colors duration-300' : 'cursor-default'}`} type="submit" form="groupNameForm">
                    {!isCreatingGroup && <i className="fa-solid fa-check fa-2xl text-white"></i>}
                    {!isCreatingGroup && <span className="text-white font-bold">Create Group</span>}
                    {isCreatingGroup && <Spinner />}
                </button>    
            </div>

            <div className="absolute top-7 right-7 md:right-10">
                <i className="fa-solid fa-xmark fa-2xl text-themeBlack hover:text-themeBlue transition-colors duration-300 cursor-pointer" onClick={closeCreateGroupModal}></i>
            </div>
        </Modal>
        
    </div>
  )
}

export default GroupchatsList