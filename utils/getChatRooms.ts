import { fetchWithAuth } from "./fetchWithAuth";

export const getChatRooms = async (request: Request) => {
    const cookieHeader = request.headers.get('Cookie')

    if (!cookieHeader) return null

    // Parse Coookies
    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')))

    const { accessToken } = cookies
    const { refreshToken } = cookies

    if (!accessToken && !refreshToken) return null

    try {
        const chatRooms = await fetchWithAuth('/chats', { method: 'GET', headers: { Cookie: cookieHeader }, isServer: true })

        return chatRooms
    } catch (error) {
        console.log('Unable to Fetch Chat Rooms !', error)
    }   
}