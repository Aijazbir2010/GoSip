export type chatRoomType = {
    chatRoomID: string,
    friend: {
        name: string,
        profilePic: string,
        isOnline: boolean,
    },
    unreadCount: number,
}