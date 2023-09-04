import {StyleSheet, View} from "react-native";

const Home = () => {
    return (
        <View style={styles.screen}>
            <Text>
                "Hi! Welcome"
            </Text>
        </View>
    )
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
    },
})

export default Home;