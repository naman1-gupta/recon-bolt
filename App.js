import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View, Alert} from 'react-native';
import {getEntitlementsToken, getGeoInfo, getUserInfo, login, testProxy} from "./utils/login";
import {useContext, useEffect, useState} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from '@react-navigation/native';
import {AuthContext, AuthContextProvider} from "./store/Auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Home from "./screens/Home";
import {Ionicons} from '@expo/vector-icons';
import AgentSelect from "./screens/AgentSelect";


const Tab = createBottomTabNavigator();
export default function App() {
  return (
      <>
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
            const storedToken = await AsyncStorage.getItem("auth")
            if(storedToken) {
                console.log("Stored Token", storedToken)
                authContext.authenticate(JSON.parse(storedToken));
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
            {authContext.auth.access_token && <AuthenticatedStack />}
            {!authContext.auth.access_token && <UnAuthenticatedStack />}
        </NavigationContainer>
    )
}

const UnAuthenticatedStack = () => {
    return <Tab.Navigator>
        <Tab.Screen name={"Login"} component={Login} />
    </Tab.Navigator>
}

const AuthenticatedStack = () => {
    const authContext = useContext(AuthContext)
    return <Tab.Navigator screenOptions={{
        headerRightContainerStyle: {
            paddingHorizontal: 8,
        },
        headerLeftContainerStyle: {
            paddingHorizontal: 8,
        },
        headerLeft: ({tintColor}) => <Ionicons  name={'document'} size={24} color={tintColor}
                                                       onPress={() => {
                                                           console.log(authContext.geo);
                                                           console.log(authContext.auth)
                                                       }}/>,
        headerRight: ({tintColor}) => <Ionicons name={'log-out'} color={tintColor} size={24} onPress={authContext.logout}/>
    }}>
        <Tab.Screen name={"Home"} component={Home} />
        <Tab.Screen name={"AgentSelect"}
                    component={AgentSelect}
                    options={{ tabBarButton: (props) => null }} />
    </Tab.Navigator>
}

function Login() {
    const authContext = useContext(AuthContext)
    async function performLogin() {
        console.log("performing login...")
        try {
            let res = await login()
            console.log("getting user info")
            let userinfo = await getUserInfo(res.access_token)
            let entitlements_token = await getEntitlementsToken(res.access_token)
            let geoInfo = await getGeoInfo(res.access_token, res.id_token)

            console.log(entitlements_token)

            authContext.authenticate({
                access_token: res.access_token,
                id_token: res.id_token,
                entitlements_token: entitlements_token,
            })

            authContext.setGeo(geoInfo)
        } catch {
            Alert.alert("There was an error logging in...")
        }
    }

    const akmsdkmasm = () => {
        testProxy()
            .then(response => console.log("page response", response))
            .catch(err => console.log("errorrrr getting page", err))
    }


    return (
        <View style={styles.container}>
            {/*<Button title={"Login"} onPress={performLogin} />*/}
            <Button title={"Login"} onPress={akmsdkmasm} />
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
