import axios from 'axios';
import {PASSWORD} from "../secrets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {validate} from "@babel/core/lib/config/validation/options";


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
        //
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



        // let config = {
        //     method: 'post',
        //     url: RIOT_AUTH,
        //     headers: {
        //         'accept': '*/*',
        //         'content-type': 'application/json',
        //         'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
        //         'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
        //     },
        //     withCredentials: true,
        //     data: data
        // };
        // if (!auth){
        //     console.log("No cookie")
        //     config = {
        //         method: 'post',
        //         maxBodyLength: Infinity,
        //         url: RIOT_AUTH,
        //         headers: {
        //             'accept': '*/*',
        //             'content-type': 'application/json',
        //             'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
        //             'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
        //         },
        //         withCredentials: false,
        //         data: data
        //     };
        // }

        // const pr = axios.request(config)
        fetch(RIOT_AUTH, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'content-type': 'application/json',
                'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
            },
            body: data,
            credentials: "omit"
        }).then((response) => {
            const allowedCookies = ["tdid", "clid", "asid"]
            const validCookies = []

            const cookies = response.headers.get("set-cookie").split(' ')
            cookies.forEach(c => {
                let flag = -1
                allowedCookies.forEach(ac => {
                    if(c.startsWith(ac)){
                        flag = 0;
                        console.log(c.substring(0, c.length - 1))
                    }
                })

                if(flag === 0){
                    validCookies.push(c.substring(0, c.length-1))
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
            if(data.type === "auth") {
                data = JSON.stringify({
                    "username": username,
                    "password": password,
                    "remember": true,
                    "type": "auth"
                });

                console.log("Cookie: ", cookie)

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
                    console.log("second fetch", data)
                    const required_tokens = ['access_token', 'id_token']
                    let credentials = {}

                    const token = data.response.parameters.uri
                    const token_params = token.split('#')[1].split('&')
                    token_params.forEach((t) => {
                        let token_type = t.split('=')[0]
                        let token_value = t.split('=')[1]
                        if (required_tokens.includes(token_type)) {
                            credentials[token_type] = token_value
                        }
                    })
                    resolve(credentials)
                })
            }

        });

        // axios.request(config).then((response) => {
        //         if (response.data.type === "response") {
        //             const required_tokens = ['access_token', 'id_token']
        //             let credentials = {}
        //             const token = response.data.response.parameters.uri
        //             const token_params = token.split('#')[1].split('&')
        //             token_params.forEach((t) => {
        //                 let token_type = t.split('=')[0]
        //                 let token_value = t.split('=')[1]
        //                 if (required_tokens.includes(token_type)) {
        //                     credentials[token_type] = token_value
        //                 }
        //             })
        //
        //             console.log("Resolving after first request", credentials)
        //             return resolve(credentials)
        //         }
        //
        //
        //         const allowedCookies = ["tdid", "clid", "asid", "__cf_bm"]
        //         let cookieString = ''
        //         response.headers.get('set-cookie')[0].split(' ').forEach(c => {
        //             let flag = -1
        //             allowedCookies.forEach(a => {
        //                 if (c.startsWith(a)) {
        //                     flag = 0
        //                 }
        //             })
        //
        //             if (flag === 0){
        //                 cookieString += `${c} `
        //             }
        //         })
        //         console.log(cookieString.substring(cookieString.length - 2))
        //         cookieString = cookieString.substring(0, cookieString.length - 2)
        //         console.log("Cookie string", cookieString)
        //
        //         data = JSON.stringify({
        //             "username": username,
        //             "password": password,
        //             "remember": true,
        //             "type": "auth"
        //         });
        //
        //
        //         config = {
        //             method: 'put',
        //             maxBodyLength: Infinity,
        //             url: RIOT_AUTH,
        //             headers: {
        //                 'accept': '*/*',
        //                 'content-type': 'application/json',
        //                 'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
        //                 'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8',
        //             },
        //             withCredentials: true,
        //             data: data
        //         };
        //
        //         axios.request(config)
        //             .then((response) => {
        //                 console.log('Second request response', response.data)
        //                 return resolve(response.data)
        //             })
        //             .catch((error) => {
        //                 console.log("Second request failed", error, error.response.data);
        //                 return reject(error);
        //             });
        //     })
        //     .catch((error) => {
        //         console.log("First request failed", error);
        //         return reject(error);
        //     });
    })

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
            resolve(response)
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