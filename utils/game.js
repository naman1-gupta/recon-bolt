import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CurrentGame from "../mocks/CurrentGame";
import {mockPlayerCareer} from '../mocks/PlayerCareer'
import AgentSelectMock from "../mocks/AgentSelectMock";

const PROXY_URL = 'https://flash.namang.me/proxy?url='
const RIOTCLIENT_PLATFORM = 'eyJwbGF0Zm9ybVR5cGUiOiJQQyIsInBsYXRmb3JtT1NWZXJzaW9uIjoiMTAuMC4xOTA0Mi4xLjI1Ni42NGJpdCIsInBsYXRmb3JtT1MiOiJXaW5kb3dzIiwicGxhdGZvcm1DaGlwc2V0IjoiVW5rbm93biJ9'

const riotClient = axios.create({
    headers: {
        'x-riot-clientplatform': RIOTCLIENT_PLATFORM,
        'x-riot-clientversion': 'release-07.05-shipping-4-974204',
        'accept': '*/*',
        'accept-language': 'en-IN,en-GB;q=0.9,en;q=0.8'
    },
})

riotClient.interceptors.request.use((config) => {
    const encodedURL = encodeURIComponent(config.url)
    config.url = `${PROXY_URL}${encodedURL}`
    return config
}, (error) => {
    console.log("Error creating request", error)
})


riotClient.interceptors.response.use((response) => {
    return response
}, (error) => {
    if(error.response.status !== 404) {
        console.log("ERROR ===> ", JSON.stringify(error.config.url), error.response.data)
    }
    return Promise.reject(error)
})


const SERVICE_URLS = [
    "SERVICEURL_MATCHDETAILS",
    "SERVICEURL_NAME",
    "SERVICEURL_PREGAME",
    "SERVICEURL_RESTRICTIONS",
    "SERVICEURL_CONTRACTS",
    "SERVICEURL_MATCHHISTORY",
    "SERVICEURL_PLAYERFEEDBACK",
    "SERVICEURL_DAILY_TICKET",
    "SERVICEURL_SESSION",
    "SERVICEURL_PARTY",
    "SERVICEURL_PREMIER",
    "SERVICEURL_STORE",
    "SERVICEURL_MATCHMAKING",
    "SERVICEURL_CONTENT",
    "SERVICEURL_MASS_REWARDS",
    "geo",
    "SERVICEURL_AVS",
    "SERVICEURL_ACCOUNT_XP",
    "SERVICEURL_REPLAY_CATALOG",
    "SERVICEURL_FAVORITES",
    "SERVICEURL_MMR",
    "SERVICEURL_AGGSTATS",
    "SERVICEURL_PATCHNOTES",
    "SERVICEURL_PROGRESSION",
    "SERVICEURL_PURCHASEMERCHANT",
    "SERVICEURL_LOGINQUEUE",
    "SERVICEURL_PERSONALIZATION",
    "SERVICEURL_LATENCY",
    "SERVICEURL_CONTRACT_DEFINITIONS",
    "auth",
    "SERVICEURL_TOURNAMENTS",
    "SERVICEURL_GALBS_QUERY",
    "SERVICEURL_COREGAME",
    "SERVICEURL_ESPORTS"
]

export async function getConfig(auth, geo) {
    return new Promise(async (resolve, reject) => {
        // const auth = JSON.parse(await AsyncStorage.getItem("auth"))
        // const geo = JSON.parse(await AsyncStorage.getItem("geo"))
        console.log("Geo", geo)
        console.log("Shard", geo.affinities.live)

        const config = {
            url: `https://shared.${geo.affinities.live}.a.pvp.net/v1/config/ap`,
            method: 'get',
            headers: {}
        }

        axios.request(config).then((response) => {

            const promises = []
            Object.keys(response.data['Collapsed']).forEach((k) => {
                if (k.startsWith("SERVICEURL")) {
                    // console.log(k)
                    promises.push(AsyncStorage.setItem(k, response.data['Collapsed'][k]))
                }
            })

            Promise.all(promises).then(() => resolve()).catch((err) => reject(err))
        }).catch((err) => {
            console.log("Error getting config", err)
            reject(err)
        })
    })
}

export async function getPlayerPartyId(auth) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PARTY")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))
    console.log("identity", auth)
    const PLAYER_ID = auth.identity.sub;

    return new Promise((resolve, reject) => {
        let url = `${SERVICE_URL}/parties/v1/players/${PLAYER_ID}`
        // url = encodeURIComponent(url)
        const config = {
            url: `${url}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            console.log("resolved", response.status)
            console.log("Got party id", response.data)
            resolve(response.data["CurrentPartyID"])
        }).catch((err) => {
            console.log("Error fetching party details", err)
            if (err.response.status === 404) {
                console.log("resolving with empty value")
                resolve('')
            } else {
                reject(err.response.status)
            }
        })
    })
}


export async function getPartyDetails(auth, partyId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PARTY")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/parties/v1/parties/${partyId}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            }
        }

        riotClient.request(config).then((response) => {
            const partyDetails = {}
            partyDetails.id = response.data["ID"]
            partyDetails.queueId = response.data["MatchmakingData"]["QueueID"]
            partyDetails.state = response.data["State"]
            partyDetails.previousState = response.data["PreviousState"]

            console.log("PartyDetails", partyDetails)

            resolve(partyDetails)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function switchQueue(auth, queueType, partyId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PARTY")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/parties/v1/parties/${partyId}/queue`,
            method: 'post',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
            data: JSON.stringify({
                "queueID": queueType
            })
        }

        riotClient.request(config).then((response) => {
            console.log("switchQueue res", response.data)
            const partyDetails = {}
            partyDetails.id = response.data["ID"]
            partyDetails.queueId = response.data["MatchmakingData"]["QueueID"]
            partyDetails.state = response.data["State"]
            partyDetails.previousState = response.data["PreviousState"]

            resolve(partyDetails)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}


export async function startMatchmaking(auth, partyId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PARTY")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/parties/v1/parties/${partyId}/matchmaking/join`,
            method: 'post',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
            data: JSON.stringify({})
        }

        riotClient.request(config).then((response) => {
            console.log("startmatchmaking res", response.data)
            const partyDetails = {}
            partyDetails.id = response.data["ID"]
            partyDetails.queueId = response.data["MatchmakingData"]["QueueID"]
            partyDetails.state = response.data["State"]
            partyDetails.previousState = response.data["PreviousState"]

            resolve(partyDetails)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function getPreGamePlayerStatus(auth) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    const PLAYER_ID = auth.identity.sub;


    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/pregame/v1/players/${PLAYER_ID}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            }
        }

        // console.log(config)

        riotClient.request(config).then((response) => {
            const matchDetails = {}
            matchDetails.matchId = response.data["MatchID"]
            resolve(matchDetails)
        }).catch((err) => {
            console.log("Error getting pregame status", err)
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}


export async function getCoreGamePlayerStatus(auth) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_COREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))
    const PLAYER_ID = auth.identity.sub;


    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/core-game/v1/players/${PLAYER_ID}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
            data: JSON.stringify({})
        }

        riotClient.request(config).then((response) => {
            const matchDetails = {}
            matchDetails.matchId = response.data["MatchID"]
            resolve(matchDetails)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve(null)
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function getPreGameMatchStatus(auth, matchId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/pregame/v1/matches/${matchId}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            }
        }

        // resolve(AgentSelectMock)
        // return

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function hoverAgent(auth, agentId, matchId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/pregame/v1/matches/${matchId}/select/${agentId}`,
            method: 'post',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                console.log("Error selecting agent", err)
                reject(err.response.status)
            }
        })
    })
}

export async function lockAgent(auth, agentId, matchId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/pregame/v1/matches/${matchId}/lock/${agentId}`,
            method: 'post',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                console.log("Error locking agent", err)
                reject(err.response.status)
            }
        })
    })
}

export async function leaveMatchmaking(auth, partyId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_PARTY")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/parties/v1/parties/${partyId}/matchmaking/leave`,
            method: 'post',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
            data: JSON.stringify({})
        }

        riotClient.request(config).then((response) => {
            console.log("leave matchmaking res", response.data)
            const partyDetails = {}
            partyDetails.id = response.data["ID"]
            partyDetails.queueId = response.data["MatchmakingData"]["QueueID"]
            partyDetails.state = response.data["State"]
            partyDetails.previousState = response.data["PreviousState"]

            resolve(partyDetails)
        }).catch((err) => {
            console.log("leave matchmaking err", err)
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function getCurrentGameDetails(auth, matchId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_COREGAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/core-game/v1/matches/${matchId}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            }
        }
        //
        // resolve(CurrentGame)
        // return

        riotClient.request(config).then(async (response) => {
            resolve(response.data)
        }).catch((err) => {
            // resolve(CurrentGame)
            if (err.response.status === 404) {
                resolve({})
            } else {

                reject(err.response.status)
            }
        })
    })
}

export async function getPlayerEntitlements(auth) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_STORE")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))
    const PLAYER_ID = auth.identity.sub;


    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/store/v1/entitlements/${PLAYER_ID}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            }
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function getPlayerNames(auth, playerIds) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_NAME")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/name-service/v2/players`,
            method: 'put',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
            data: JSON.stringify(playerIds)
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve({})
            } else {
                reject(err.response.status)
            }
        })
    })
}

export async function getPlayerCompetitveUpdates(auth, playerId, startIndex = 0, endIndex = 10, queue = 'competitive') {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_MMR")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    // playerId = "610ee2b8-0ad2-5fff-a819-defc284b519d"

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/mmr/v1/players/${playerId}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}&queue=${queue}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        // setTimeout(() => {
        //     resolve(mockPlayerCareer)
        // }, 1000)
        // return

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve(null)
            } else {
                reject(err.response.status)
            }
        })
    })
}
export async function getPlayerMMR(auth, playerId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_MMR")
    // const auth = JSON.parse(await AsyncStorage.getItem("auth"))

    playerId = "610ee2b8-0ad2-5fff-a819-defc284b519d"
    console.log(auth.identity.sub, SERVICE_URL)

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/mmr/v1/players/${auth.identity.sub}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            console.log("PLAYER_MMR ==> ")
            console.log(JSON.stringify(response.data, null, 4))
            resolve(response.data)
        }).catch((err) => {
            console.log("Error", err)
            if (err.response.status === 404) {
                resolve(null)
            } else {
                reject(err.response.status)
            }
        })
    })
}
export async function getMatchDetails(auth, matchId) {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_MATCHDETAILS")

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/match-details/v1/matches/${matchId}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve(null)
            } else {
                reject(err.response.status)
            }
        })
    })
}


export async function getMatchHistory(auth, playerId, startIndex = 0, endIndex = 10, queue = "competitive") {
    const SERVICE_URL = await AsyncStorage.getItem("SERVICEURL_MATCHHISTORY")

    return new Promise((resolve, reject) => {
        const config = {
            url: `${SERVICE_URL}/match-history/v1/history/${playerId}?startIndex=${startIndex}&endIndex=${endIndex}&queue=${queue}`,
            method: 'get',
            headers: {
                'authorization': `Bearer ${auth.access_token}`,
                'x-riot-entitlements-jwt': auth.entitlements_token,
            },
        }

        riotClient.request(config).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            if (err.response.status === 404) {
                resolve(null)
            } else {
                reject(err.response.status)
            }
        })
    })
}
