import {createContext, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
    auth: {
        access_token: "",
        id_token: "",
        entitlements_token: "",
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

    const authenticate = (token) => {
        setIdToken(token.id_token)
        setAccessToken(token.access_token)
        setEntitlementsToken(token.entitlements_token)

        AsyncStorage.setItem("auth", JSON.stringify({
            access_token: token.access_token,
            id_token: token.id_token,
            entitlements_token: token.entitlements_token,
        }))
    }

    const setGeo = (geo) => {
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
            entitlementsToken: entitlementsToken,
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