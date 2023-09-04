import axios from 'axios';


const config = {
  BASE_URL : "https://auth.riotgames.com/api/v1/authorization"
}
export const authApiClient = axios.create({
  baseURL: config.BASE_URL,
  timeout: 30000,
})

authApiClient.interceptors.request.use((req) => {
  console.log(req.baseURL, req.headers)
  return req
})

authApiClient.interceptors.response.use((response) => {
  console.log("Success Response", response)
}, (error) => {
  console.log("Error fetching request", error, error.response.status, error.response.headers)
})

