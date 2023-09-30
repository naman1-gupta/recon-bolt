import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";


const RIOT_AUTH = 'https://auth.riotgames.com/api/v1/authorization'
// const RIOT_AUTH = 'http://192.168.1.17:5000/'
const USERINFO = 'https://auth.riotgames.com/userinfo'
const ENTITLEMENTS_API = 'https://entitlements.auth.riotgames.com/api/token/v1'
const GEO_API = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant'

export async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            "username": username,
            "password": password,
            "remember": true,
            "type": "auth"
        });

        axios.put(RIOT_AUTH, data, {
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                // Cookie: cookie
            },
            withCredentials: true,
        }).then(response => {
            resolve(parseLoginResponse(response.data.response.parameters.uri))
        }).catch(err => {
            reject(err)
        })
    })
}


export async function getCookies(auth, omitCredentials = false) {
    return new Promise(async (resolve, reject) => {
        let data = JSON.stringify({
            "client_id": "play-valorant-web-prod",
            "nonce": 1,
            "redirect_uri": "https://playvalorant.com/",
            "scope": "account openid",
            "response_type": "token id_token"
        });

        axios.post(RIOT_AUTH, data, {
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
            },
            withCredentials: !omitCredentials,
        }).then(async response => {

            if (omitCredentials) {
                const required_cookies = ["tdid", "asid", "clid", "__cf"]
                const cookies = []


                response.headers["set-cookie"].forEach(cookie =>
                    cookie.split(', ').forEach(c => {
                        if (required_cookies.includes(c.substring(0, 4))) {
                            cookies.push(c.split('; ')[0])
                        }
                    })
                )

                await CookieManager.clearAll()
                for (const cookie of cookies) {
                    let cookie_fields = cookie.split("=")
                    await CookieManager.set(RIOT_AUTH, {
                        name: cookie_fields[0],
                        value: cookie_fields[1],
                    })
                }
            } else {
                resolve(parseLoginResponse(response.data.response.parameters.uri))
            }

        }).catch((err) => {
            console.log("Error fetching cookies", err)
        })

    })
}

const parseLoginResponse = (data) => {
    const credentials = {}
    const required_tokens = ['access_token', 'id_token']
    const token_params = data.split('#')[1].split('&')
    token_params.forEach((t) => {
        let token_type = t.split('=')[0]
        let token_value = t.split('=')[1]
        if (required_tokens.includes(token_type)) {
            credentials[token_type] = token_value
        }
    })

    return credentials
}


export async function getUserInfo(token) {
    return new Promise((resolve, reject) => {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: USERINFO,
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                'authorization': `Bearer ${token}`
            },
            withCredentials: true,
        }
        axios.request(config).then(response => {
            resolve(response.data)
        }).catch(err => {
            console.log("err getting userinfo", err.response, err.response.data)
            reject(err)
        })

    })
}

export async function getEntitlementsToken(token) {
    return new Promise((resolve, reject) => {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: ENTITLEMENTS_API,
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                'authorization': `Bearer ${token}`
            },
            withCredentials: true,
            data: JSON.stringify({})
        }

        axios.request(config).then(response => {
            // console.log("Entitlements response", response.data);
            resolve(response.data.entitlements_token)
        }).catch(err => {
            console.log("err getting entitlements token", err.response.data)
            reject(err)
        })
    })
}


export async function getGeoInfo(access_token, id_token) {
    return new Promise((resolve, reject) => {
        const config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: GEO_API,
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                'authorization': `Bearer ${access_token}`
            },
            withCredentials: true,
            data: JSON.stringify({
                "id_token": id_token
            })
        }

        axios.request(config).then(async (response) => {
            await AsyncStorage.setItem("geo", JSON.stringify(response.data))
            resolve(response.data)
        }).catch(err => {
            console.log("Errored while getting geo info")
            reject(err.response.data)
        })
    })
}