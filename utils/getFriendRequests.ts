import { fetchWithAuth } from "./fetchWithAuth";

export const getFriendRequests = async (request: Request) => {
    const cookieHeader = request.headers.get('Cookie')

    if (!cookieHeader) return null

    // Parse Coookies
    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')))

    const { accessToken } = cookies
    const { refreshToken } = cookies

    if (!accessToken && !refreshToken) return null

    try {
        const data = await fetchWithAuth('/user/friendrequests', { method: 'GET', headers: { Cookie: cookieHeader }, isServer: true })

        return data
    } catch (error) {
        console.log('Unable to Fetch Friend Requests !', error)
    }   
}