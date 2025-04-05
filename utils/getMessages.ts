import { fetchWithAuth } from "./fetchWithAuth";

export const getMessages = async (request: Request, chatRoomID: string) => {
    const cookieHeader = request.headers.get('Cookie')

    if (!cookieHeader) return null

    // Parse Coookies
    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')))

    const { accessToken } = cookies
    const { refreshToken } = cookies

    if (!accessToken && !refreshToken) return null

    try {
        const data = await fetchWithAuth('/chats/messages', { method: 'POST', data: { chatRoomID }, headers: { Cookie: cookieHeader }, isServer: true })

        return data
    } catch (error) {
        console.log('Unable to Fetch Messages !', error)
    }   
}