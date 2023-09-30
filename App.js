import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text} from 'react-native';
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
import {getCookies, getEntitlementsToken, getUserInfo} from "./utils/login";
import PlayerCareer from "./screens/PlayerCareer";


const Tab = createBottomTabNavigator();
export default function App() {
  return (
      <>
          <StatusBar style={"light"}/>
          <AuthContextProvider>
              <Root />
          </AuthContextProvider>
      </>
  );
}

const Root = () => {
    const authContext = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        async function getToken() {
            let storedToken = await AsyncStorage.getItem("auth")
            const storedGeoInfo = await AsyncStorage.getItem("geo")

            const authToken = await getCookies({}, false)
            const entitlementsToken = await getEntitlementsToken(authToken.access_token)
            const userInfo = await getUserInfo(authToken.access_token)

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
        }

        getToken()
    }, []);

    if (loading) {
        return <Text>Loading, please wait.. </Text>
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
    tabBarStyle:  {
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
        headerLeft: ({tintColor}) => <Ionicons name={'document'} size={24} color={tintColor}
                                               onPress={() => {
                                                   console.log(authContext.geo);
                                                   console.log(authContext.auth)
                                               }}/>,
        headerRight: ({tintColor}) => <Ionicons name={'log-out'} color={tintColor} size={24}
                                                onPress={authContext.logout}/>
    }}>
        <Tab.Screen name={"Home"} component={Home} options={{
            tabBarIcon: ({color}) => <Ionicons name={'home'} color={color} size={24} />
        }}/>
        <Tab.Screen name={"AgentSelect"}
                    component={AgentSelect}
                    options={{ tabBarButton: () => null }} />
        <Tab.Screen name={"LiveMatch"}
                    component={LiveMatch}
                    options={{
                        tabBarIcon: ({color}) =>
                            <Ionicons name={"game-controller"}
                                      size={24}
                                      color={color}/>
                    }} />
        <Tab.Screen name={"PlayerCareer"}
                    component={PlayerCareer}
                    options={{
                        tabBarIcon: ({color}) =>
                            <Ionicons name={"game-controller"}
                                      size={24}
                                      color={color}/>
                    }} />
    </Tab.Navigator>
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.darkBlueBg,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
