import { fetchWithAuth } from "./fetchWithAuth"

export const getUser = async (request: Request, responseHeaders: Headers | Response) => {
    const cookieHeader = request.headers.get('Cookie')

    if (!cookieHeader) return null

    // Parse Coookies
    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => c.split('=')))

    const { accessToken } = cookies
    const { refreshToken } = cookies

    if (!accessToken && !refreshToken) return null

    try {
        const user = await fetchWithAuth('/user/getuser', { method: 'GET', headers: { Cookie: cookieHeader }, isServer: true, responseHeaders })

        return user
    } catch (error) {
        console.log('Unable to Fetch User !', error)
    }   
}