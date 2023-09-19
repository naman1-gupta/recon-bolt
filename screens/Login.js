import {useContext, useState} from "react";
import {AuthContext} from "../store/Auth";
import {getEntitlementsToken, getGeoInfo, getUserInfo, login} from "../utils/login";
import {Alert, KeyboardAvoidingView, StyleSheet, View} from "react-native";
import Colors from "../constants/Colors";
import {Button, Image, TextField} from 'react-native-ui-lib'
import {useHeaderHeight} from '@react-navigation/elements';
import {head} from "axios";

function Login() {
    const authContext = useContext(AuthContext)
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const height = useHeaderHeight()

    async function performLogin() {
        console.log("performing login...")
        try {
            let res = await login(email, password)
            console.log("getting user info")
            let userinfo = await getUserInfo(res.access_token)
            let entitlements_token = await getEntitlementsToken(res.access_token)
            let geoInfo = await getGeoInfo(res.access_token, res.id_token)

            console.log("USERINFO", userinfo)

            authContext.authenticate({
                access_token: res.access_token,
                id_token: res.id_token,
                entitlements_token: entitlements_token,
                identity: {
                    sub: userinfo.sub,
                    game_name: userinfo.acct.game_name,
                    tag_line: userinfo.acct.tag_line,
                }

            })

            authContext.setGeo(geoInfo)
        } catch (err) {
            console.log("Error logging in", err)
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
            <Image
                source={{uri: 'https://w7.pngwing.com/pngs/708/311/png-transparent-icon-logo-twitter-logo-twitter-logo-blue-social-media-area.png'}}
                resizeMode={'cover'} width={100} height={100}/>
            <View style={{width: '100%'}}>
                <View style={{height: 50, width: '100%', borderRadius: 100}}>
                    <TextField placeholder={'Enter your email'}
                               placeholderTextColor={'#ccc'}
                               color={Colors.activeGoldTint}
                               autoCapitalize={"none"}
                               style={{
                                   padding: 16,
                                   height: '100%',
                                   borderColor: '#ccc',
                                   borderWidth: 1,
                                   borderRadius: 100
                               }}
                               onChangeText={onChangeText.bind(this, "email")}
                               enableErrors
                               validate={['required', 'email', (value) => value.length > 6]}
                               validationMessage={['Field is required', 'Email is invalid', 'Password is too short']}
                    />
                </View>
                <View style={{height: 50, width: '100%', borderRadius: 100, marginVertical: 24}}>
                    <TextField placeholder={'Enter your password'}
                               color={Colors.activeGoldTint}
                               onChangeText={onChangeText.bind(this, "password")}
                               placeholderTextColor={'#ccc'}
                               autoCapitalize={"none"}
                               secureTextEntry
                               style={{
                                   padding: 16,
                                   height: '100%',
                                   borderColor: '#ccc',
                                   borderWidth: 1,
                                   borderRadius: 100
                               }}
                               enableErrors
                               textContentType={"password"}
                               validate={['required', (value) => value.length > 6]}
                               validationMessage={['Field is required', 'Password is too short']}
                    />
                </View>

                <Button style={{marginTop: 8, width: '100%'}} label={"Login"} onPress={performLogin}
                        disabled={!email || !password}/>
            </View>

        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        backgroundColor: Colors.darkBlueBg,
        flex: 1,
        justifyContent: "space-evenly",
        alignItems: 'center',
        padding: 16,
    }
})

export default Login