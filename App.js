import { StatusBar } from 'expo-status-bar';
import {Button, StyleSheet, Text, View, Alert} from 'react-native';
import {login} from "./utils/login";
import {useContext, useEffect, useState} from "react";
import "react-native-url-polyfill/auto";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {NavigationContainer} from '@react-navigation/native';
import {AuthContext, AuthContextProvider} from "./store/Auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Home from "./screens/Home";


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
    return <Tab.Navigator>
        <Tab.Screen name={"Home"} component={Home}/>
    </Tab.Navigator>
}

function Login() {
    const [loginToken, setLoginToken] = useState("")
    const authContext = useContext(AuthContext)
    async function performLogin() {
        console.log("performing login...")
        try {
            let res = await login()
            setLoginToken(res)
            authContext.authenticate({
                access_token: res,
                id_token: res,
                entitlements_token: res,
            })
        } catch {
            Alert.alert("There was an error logging in...")
        }
    }


    return (
        <View style={styles.container}>
            <Button title={"Login"} onPress={performLogin} />
            <Text>{loginToken}</Text>
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
