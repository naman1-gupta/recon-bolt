import axios from 'axios';
import {PASSWORD} from "../secrets";
import {access} from "@babel/core/lib/config/validation/option-assertions";
import AsyncStorage from "@react-native-async-storage/async-storage";
const RIOT_AUTH = 'https://auth.riotgames.com/api/v1/authorization'
const USERINFO = 'https://auth.riotgames.com/userinfo'
const ENTITLEMENTS_API = 'https://entitlements.auth.riotgames.com/api/token/v1'
const GEO_API = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant'

axios.defaults.proxy = {
    host: '192.168.1.3',
    port: '8080'
}

axios.interceptors.request.use((config) => {
    console.log(config)
    return config
},  (error) => {
    // Do something with request error
    return Promise.reject(error);
})

export async function testProxy() {
    return new Promise((resolve, reject) => {
      axios.get("https://google.com").then(response => resolve(response.status)).catch(err => {
          console.log("Error getting page", err)
          reject(err)
      })
    })
}

export async function login(){
  return new Promise((resolve, reject) => {
    let data = JSON.stringify({
      "client_id": "play-valorant-web-prod",
      "nonce": 1,
      "redirect_uri": "https://playvalorant.com/",
      "scope": "account openid",
      "response_type": "token id_token"
    });


    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: RIOT_AUTH,
      headers: {
        'accept': '*/*',
        'content-type': 'application/json',
        'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
        'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8'
      },
      data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            if (response.data.type === "response") {
                const required_tokens = ['access_token', 'id_token']
                let credentials = {}
                const token = response.data.response.parameters.uri
                const token_params = token.split('#')[1].split('&')
                token_params.forEach((t) => {
                    let token_type = t.split('=')[0]
                    let token_value = t.split('=')[1]
                    if(required_tokens.includes(token_type)){
                        credentials[token_type] = token_value
                    }
                })

                console.log("Resolving after first request", credentials)
                return resolve(credentials)
            }

             data = JSON.stringify({
                "username": "v0gonpoet",
                "password": PASSWORD,
                "remember": true,
                "type": "auth"
             });

             config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: RIOT_AUTH,
                headers: {
                  'accept': '*/*',
                  'content-type': 'application/json',
                  'user-agent': 'Recon%20Bolt/2 CFNetwork/1390 Darwin/22.0.0',
                  'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8'
                },
                data: data
            };

            axios.request(config)
              .then((response) => {
                  console.log('Second request response', response)
                return resolve(JSON.parse(response.data))
              })
              .catch((error) => {
                console.log("Second request failed", error);
                return reject(error);
              });
            })
            .catch((error) => {
              console.log("First request failed", error);
              return reject(error);
            });
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