import {createContext, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
    auth: {
        access_token: "",
        id_token: "",
        entitlements_token: "",
        identity: {
            sub: '',
            game_name: '',
            tag_line: '',
        }
    },
    authenticate: (token) => {},
    logout: () => {},
    geo: {
        affinities: {
            live: "",
            pbe: ""
        },
        token: ""
    },
    setGeo: () => {}
});


export function AuthContextProvider({children}) {
    const [accessToken, setAccessToken] = useState('')
    const [idToken, setIdToken] = useState('')
    const [entitlementsToken, setEntitlementsToken] = useState('')
    const [geoToken, setGeoToken] = useState({})
    const [playerIdentity, setPlayerIdentity] = useState({})

    const authenticate = async (token) => {
        setIdToken(token.id_token)
        setAccessToken(token.access_token)
        setEntitlementsToken(token.entitlements_token)
        setPlayerIdentity(token.identity)

        console.log("TOKEN", token)

        const storedToken = {
            access_token: token.access_token,
            id_token: token.id_token,
            entitlements_token: token.entitlements_token,
            identity: {
                sub: token.identity.sub,
                game_name: token.identity.game_name,
                tag_line: token.identity.tag_line,
            }
        }

        console.log("STORED_TOKEN", storedToken)

        await AsyncStorage.setItem("auth", JSON.stringify(storedToken))
    }

    const setGeo = (geo) => {
        console.log("GEO TOKEN", geo)
        setGeoToken(geo)
        AsyncStorage.setItem("geo", JSON.stringify(geo))
    }

    const setEntitlements = (token) => {
        setEntitlementsToken(token)
    }

    const logout = () => {
        setIdToken('')
        setAccessToken('')
        setEntitlementsToken('')

        AsyncStorage.removeItem("auth")
    }

    const value = {
        auth: {
            access_token: accessToken,
            id_token: idToken,
            entitlements_token: entitlementsToken,
            identity: playerIdentity
        },
        authenticate: authenticate,
        logout: logout,
        geo: geoToken,
        setGeo: setGeo,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}