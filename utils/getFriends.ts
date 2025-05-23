import { fetchWithAuth } from "./fetchWithAuth";

export const getFriends = async (request: Request) => {
    const cookieHeader = request.headers.get('Cookie')

    if (!cookieHeader) return null

    // Parse Coookies
    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')))

    const { accessToken } = cookies
    const { refreshToken } = cookies

    if (!accessToken && !refreshToken) return null

    try {
        const data = await fetchWithAuth('/user/friends', { method: 'GET', headers: { Cookie: cookieHeader }, isServer: true })

        return data
    } catch (error) {
        console.log('Unable to Fetch Friends !', error)
    }   
}