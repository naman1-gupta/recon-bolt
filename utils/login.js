import axios from 'axios';
// import 'password';
import {Secrets} from "../secrets";
// const RIOT_AUTH = 'http://192.168.1.5:8000/api/v1/authorization'
const RIOT_AUTH = 'https://auth.riotgames.com/api/v1/authorization'


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
                let access_token = response.data.response.parameters.uri.split('=')[1].split('&')[0]

                resolve(access_token)
            }

            data = JSON.stringify({
              "username": "v0gonpoet",
                "password": process.env.PASSWORD,
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
                resolve(JSON.parse(response.data))
              })
              .catch((error) => {
                console.log(error);
                reject(error);
              });
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
  })

}
