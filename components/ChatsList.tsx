import { Link, useParams } from "@remix-run/react"
import SearchBar from "./SearchBar"
import BigSpinner from "./BigSpinner"
import type { chatRoomType } from "types/chatRoom"

const ChatsList = ({ chatRooms }: { chatRooms: chatRoomType[] | null }) => {

  const { chatId } = useParams()  

  return (
    <div className={`xl:w-[50%] w-full h-[calc(100vh-6.5rem)] xl:h-auto bg-themeBgGray rounded-2xl ${chatId ? 'xl:flex hidden' : 'flex'} flex-col gap-10 items-center py-4`}>
        <div className="flex w-full justify-center text-center">
            <span className="text-themeBlue font-black text-5xl">Chats</span>
        </div>

        <SearchBar placeholder="Search by Name or GoSip ID"/>

        {chatRooms ? (<ul className="w-[95%] md:w-[90%] max-h-full space-y-5 overflow-y-auto no-scrollbar">
            {chatRooms.map((room) => (<li key={room.chatRoomID}>
                        <Link to={`/chats/${room.chatRoomID}`} className="min-h-20 md:min-h-28 w-full rounded-2xl bg-themeInputBg hover:bg-themeBlue transition-colors duration-300 flex flex-row items-center px-3 md:px-5 gap-5 group">
                            <div className="profile-pic rounded-full">
                                <img src={room.friend.profilePic} alt="Profile Pic" className="w-20 h-20 md:w-24 md:h-24 rounded-full"/>
                            </div>
                            <div className="flex flex-col h-24 justify-center gap-3">
                                <div className="flex flex-row items-center gap-2">
                                    <span className="text-themeBlack text-2xl group-hover:text-white transition-colors duration-300">{room.friend.name}</span>
                                    {room.friend.isOnline && <div className="w-3 h-3 rounded-full bg-[#35FF69]"/>}
                                </div>

                                {room.unreadCount > 0 && <div className="flex flex-row items-center gap-2">
                                    <i className="fa-solid fa-message fa-xl text-themeBlue group-hover:text-white transition-colors duration-300"></i>
                                    <span className="text-xl text-themeBlue group-hover:text-white transition-colors duration-300">{room.unreadCount > 1 ? `${room.unreadCount} New Messages` : 'New Message'}</span>
                                </div>}
                            </div>
                        </Link>
            </li>))}
        </ul>) : (
            <div className="w-full h-full flex justify-center items-center">
                <BigSpinner />
            </div>
        )}
        
    </div>
  )
}

export default ChatsList