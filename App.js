import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {login} from "./utils/login";
import {useEffect, useState} from "react";
import "react-native-url-polyfill/auto";

export default function App() {
  const [loginToken, setLoginToken] = useState("")
  useEffect(() => {
    async function performLogin() {
      console.log("performing login...")
      let res =  await login()
      console.log(res)
      // setLoginToken(res.access_token)

      // console.log("Set token..". res.acc/*/ess_token)
    }
    performLogin()
  }, [setLoginToken]);

  return (
    <View style={styles.container}>
      <Text>
        test
      </Text>
      <Text>{loginToken}</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
