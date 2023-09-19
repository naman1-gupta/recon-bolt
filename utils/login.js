import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


const RIOT_AUTH = 'https://auth.riotgames.com/api/v1/authorization'
// const RIOT_AUTH = 'http://192.168.1.17:5000/'
const USERINFO = 'https://auth.riotgames.com/userinfo'
const ENTITLEMENTS_API = 'https://entitlements.auth.riotgames.com/api/token/v1'
const GEO_API = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant'

export async function login(username, password) {
    const auth = await AsyncStorage.getItem("auth")
    console.log("AUTH =>", auth);

    return new Promise(async (resolve, reject) => {
        let data = JSON.stringify({
            "client_id": "play-valorant-web-prod",
            "nonce": 1,
            "redirect_uri": "https://playvalorant.com/",
            "scope": "account openid",
            "response_type": "token id_token"
        });

        let config = {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
            },
            body: data
        }

        fetch(RIOT_AUTH, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
            },
            body: data,
            // credentials: "omit"
        }).then((response) => {
            const allowedCookies = ["tdid", "clid", "asid"]
            const validCookies = []

            const cookies = response.headers.get("set-cookie").split(' ')
            cookies.forEach(c => {
                let flag = -1
                allowedCookies.forEach(ac => {
                    if (c.startsWith(ac)) {
                        flag = 0;
                        console.log(c.substring(0, c.length - 1))
                    }
                })

                if (flag === 0) {
                    validCookies.push(c.substring(0, c.length - 1))
                }
            })

            const cookie = validCookies.join('; ')

            return new Promise((resolve, reject) => {
                response.json().then(data => resolve({
                    cookie: cookie,
                    data: data
                })).catch(err => console.log("error", err))
            })

        }).then(({data, cookie}) => {
            console.log("data", data)
            if (data.type === "auth") {
                data = JSON.stringify({
                    "username": username,
                    "password": password,
                    "remember": true,
                    "type": "auth"
                });

                fetch(RIOT_AUTH, {
                    method: 'PUT',
                    headers: {
                        'accept': '*/*',
                        'content-type': 'application/json',
                        'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                        'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
                        'cookie': cookie
                    },
                    body: data,
                }).then(response => response.json()).then(data => {
                    resolve(data.response.parameters.uri)
                })
            } else {
                console.log("DATA", data.response.parameters.uri);
                resolve(parseLoginResponse(data.response.parameters.uri))
            }
        });

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
    const promise = new Promise((resolve, reject) => {
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
            console.log("UserInfo", response.data);
            resolve(response.data)
        }).catch(err => {
            console.log("err getting userinfo", err.response, err.response.data)
            reject(err)
        })

    })

    return promise
}

export async function getEntitlementsToken(token) {
    const promise = new Promise((resolve, reject) => {
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
            console.log("Entitlements response", response.data);
            resolve(response.data.entitlements_token)
        }).catch(err => {
            console.log("err getting entitlements token", err.response.data)
            reject(err)
        })
    })

    return promise
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
            console.log("Geo data", response.data)
            await AsyncStorage.setItem("geo", JSON.stringify(response.data))
            resolve(response.data)
        }).catch(err => {
            console.log("Errored while getting geo info")
            reject(err.response.data)
        })
    })
}