import axiosInstance from "~/axios";

type optionsType = {
    method?: string,
    data?: {[key: string]: string},
    headers?: {[key: string]: string},
    isServer?: boolean,
    responseHeaders?: Headers | Response
}

export const fetchWithAuth = async (url: string, options: optionsType = {}) => {
    try {

        const response = await axiosInstance({
            url,
            method: options.method || "GET",
            data: options.data || undefined,
            headers: options.headers || {},
        })

        return response.data
    } catch (error: any) {
        if (error.response && error.response.status === 401) { // If Access Token Is Not Available In Cookies
            try {
                const refreshRessponse = await axiosInstance('/user/refresh', { headers: options.headers }) // Try To Refresh The Token If Access Token Is Expired

                const newCookies = refreshRessponse.headers['set-cookie'] || []

                if (!newCookies) {
                    console.log('No new cookies received !')
                }

                if (options.isServer && options.responseHeaders) {

                    const responseHeadersObj = options.responseHeaders

                    // Check if it's a Response object by checking for presence of the 'headers' property
                    if ('headers' in responseHeadersObj && responseHeadersObj.headers instanceof Headers) {
                        // If we are given a Response object
                        newCookies.forEach((cookie) => {
                            responseHeadersObj.headers.append('Set-Cookie', cookie)
                        })
                    } else if (responseHeadersObj instanceof Headers) {
                        // If we are given a Headers object
                        newCookies.forEach((cookie) => {
                            responseHeadersObj.append('Set-Cookie', cookie)
                        })
                    }
                }

                const existingCookies = options.headers?.Cookie || ''

                const mergedCookies = [...newCookies, existingCookies].join('; ')

                const response = await axiosInstance({ // Retry The Original Request
                    url,
                    method: options.method || "GET",
                    data: options.data || undefined,
                    headers: {
                        ...options.headers,
                        Cookie: mergedCookies,
                    }
                })

                return response.data

            } catch (refreshError) {
                console.log('Cannot Refresh Token !', refreshError)
            }
        }

        console.log(`Error while fetching at ${url}.`)
    }
}