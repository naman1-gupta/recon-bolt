import {StatusBar} from 'expo-status-bar';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useContext, useEffect, useState} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from '@react-navigation/native';
import {AuthContext, AuthContextProvider} from "./store/Auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Home from "./screens/Home";
import {Ionicons} from '@expo/vector-icons';
import AgentSelect from "./screens/AgentSelect";
import LiveMatch from "./screens/LiveMatch";
import Colors from "./constants/Colors";
import Login from './screens/Login';
import {getCookies, getEntitlementsToken, getGeoInfo, getUserInfo} from "./utils/login";
import PlayerCareer from "./screens/PlayerCareer";
import {screens} from "./constants/Screens";
import {getConfig} from "./utils/game";


const Tab = createBottomTabNavigator();
export default function App() {
    return (
        <>
            <StatusBar style={"light"}/>
            <AuthContextProvider>
                <Root/>
            </AuthContextProvider>
        </>
    );
}

const Root = () => {
    const authContext = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        async function getToken() {
            try {
                console.log("Silent refresh")
                let storedToken = await AsyncStorage.getItem("auth")

                console.log("Stored token", storedToken)

                let authToken = await getCookies({}, false)
                if (!authToken) {
                    console.log("Silent login failed, logging out")
                    authContext.logout()
                    setLoading(false)
                    return
                }


                const entitlementsToken = await getEntitlementsToken(authToken.access_token)
                const userInfo = await getUserInfo(authToken.access_token)
                await getGeoInfo(authToken.access_token, authToken.id_token)
                const storedGeoInfo = await AsyncStorage.getItem("geo")


                console.log("Stored old token", storedToken)

                storedToken = JSON.stringify({
                    access_token: authToken.access_token,
                    id_token: authToken.id_token,
                    entitlements_token: entitlementsToken,
                    identity: {
                        sub: userInfo.sub,
                        game_name: userInfo.acct.game_name,
                        tag_line: userInfo.acct.tag_line,
                    }
                })

                console.log("Stored refreshed token", storedToken)

                if (storedToken && storedGeoInfo) {
                    authContext.authenticate(JSON.parse(storedToken));
                    authContext.setGeo(JSON.parse(storedGeoInfo));
                }

                setLoading(false)
            } catch (err) {
                console.log("Error while perfomingLogin", err)
            }

        }

        getToken()
    }, []);

    if (loading) {
        return <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.activeGoldTint} />
        </View>
    }

    return (
        <NavigationContainer>
            {authContext.auth.access_token && <AuthenticatedStack/>}
            {!authContext.auth.access_token && <UnAuthenticatedStack/>}
        </NavigationContainer>
    )
}

const commonNavigatorStyles = {
    headerRightContainerStyle: {
        paddingHorizontal: 8,
    },
    headerLeftContainerStyle: {
        paddingHorizontal: 8,
    },
    tabBarActiveTintColor: '#f5bf0d',
    tabBarInactiveTintColor: '#6b5303',
    headerTitleStyle: {
        color: '#ccc'
    },
    headerStyle: {
        backgroundColor: Colors.darkBlueBg,
    },
    headerTintColor: '#ccc',
    tabBarStyle: {
        backgroundColor: Colors.darkBlueBg,
        borderColor: 'yellow'
    }
}

const UnAuthenticatedStack = () => {
    return <Tab.Navigator screenOptions={{...commonNavigatorStyles}}>
        <Tab.Screen name={"Login"} component={Login} options={{
            tabBarIcon: ({color}) => <Ionicons name={'log-in'} color={color} size={24}/>
        }}/>
    </Tab.Navigator>
}

const AuthenticatedStack = () => {
    const authContext = useContext(AuthContext)
    return <Tab.Navigator screenOptions={{
        ...commonNavigatorStyles,
        headerRight: ({tintColor}) => <Ionicons name={'log-out'} color={tintColor} size={24}
                                                onPress={authContext.logout}/>
    }}>
        <Tab.Screen name={screens.PARTY_HOME} component={Home} options={{
            tabBarIcon: ({color}) => <Ionicons name={'home'} color={color} size={24}/>
        }}/>
        <Tab.Screen name={screens.AGENT_SELECT}
                    component={AgentSelect}
                    options={{tabBarButton: () => null}}/>
        <Tab.Screen name={screens.LIVE_MATCH}
                    component={LiveMatch}
                    options={{
                        tabBarIcon: ({color}) =>
                            <Ionicons name={"game-controller"}
                                      size={24}
                                      color={color}/>
                    }}/>
        <Tab.Screen name={screens.PLAYER_CAREER}
                    component={PlayerCareer}
                    options={{
                        tabBarIcon: ({color}) =>
                            <Ionicons name={"game-controller"}
                                      size={24}
                                      color={color}/>
                    }}
        />
    </Tab.Navigator>
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
