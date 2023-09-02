import axios from 'axios';
import {Alert} from "react-native";
import {authApiClient} from "./axios";


const RIOT_AUTH = 'https://auth.riotgames.com/api/v1/authorization'
export async function login(){
  // let token = {
  //   "access_token": "",
  //   "id_token": ""
  // }
  // let response = null;
  let response = authApiClient.post('/', {
    "client_id": "play-valorant-web-prod",
    "redirect_uri": "https://playvalorant.com/",
    "response_type": "token id_token",
    "scope": "account openid"
  }).then(response => {
    console.log("First call response", response.data)
    authApiClient.put("/", {
      "password": "gogetyourownpassword",
      "remember": true,
      "type": "auth",
      "username": "v0gonpoet"
    }, {withCredentials: true}).then(response => console.log("Second call response", response.data)).catch(err=> console.log("Second API error: ", err.response.status))
  }).catch(err =>
    Alert.alert("Something went wrong", `${err.response.status}`)
  )
}
