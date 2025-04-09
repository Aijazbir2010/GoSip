export type chatRoomType = {
    chatRoomID: string,
    friend: {
        name: string,
        profilePic: string,
        GoSipID: string,
    },
    unreadCount: number,
}