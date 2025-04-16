export type userType = {
  _id: string,
  name: string,
  email: string,
  password: string,
  profilePic: string,
  GoSipID: string,
  color: string,
  friends: string[],
  friendRequests: string[],
  unreadNotifications: number,
  __v: number,
}