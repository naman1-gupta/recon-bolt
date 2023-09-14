import {useContext, useState} from "react";
import {AuthContext} from "../store/Auth";
import {getEntitlementsToken, getGeoInfo, getUserInfo, login} from "../utils/login";
import {Alert, Button, KeyboardAvoidingView, StyleSheet, View} from "react-native";
import Colors from "../constants/Colors";
import {TextField} from 'react-native-ui-lib'

function Login() {
    const authContext = useContext(AuthContext)
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

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

    const onChangeText = (type, text) => {
        console.log(text, type)
        if (type === "password") {
            setPassword(text)
        } else {
            setEmail(text)
        }
    }


    return (
        <KeyboardAvoidingView style={styles.container}>
            <View>
                <TextField placeholder={'email'}
                           style={{borderColor: '#ccc', borderWidth: 1}}
                           onChangeText={onChangeText.bind(this, "email")}
                           enableErrors
                           validate={['required', 'email', (value) => value.length > 6]}
                           validationMessage={['Field is required', 'Email is invalid', 'Password is too short']}
                />
            </View>
            <View>
                <TextField placeholder={'password'}
                           onChangeText={onChangeText.bind(this, "password")}
                           style={{borderColor: '#ccc', borderWidth: 1}}
                           enableErrors
                           textContentType={"password"}
                           validate={['required', (value) => value.length > 6]}
                           validationMessage={['Field is required', 'Password is too short']}
                           />
            </View>

            <Button title={"Login"} onPress={performLogin}/>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.darkBlueBg,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

export default Login