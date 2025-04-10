export type messageType = {
    _id?: string,
    chatRoomID: string,
    senderGoSipID: string,
    text: string,
    readBy: string[],
    deletedFor?: string[],
    createdAt?: string | Date,
}