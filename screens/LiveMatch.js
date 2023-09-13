import {Button, ScrollView, StyleSheet, Text, View} from 'react-native'
import {getCurrentGameDetails, getMatchDetails} from "../utils/game";
import {useRoute} from "@react-navigation/native";
import {useState} from "react";


const LiveMatch = () => {
    const route = useRoute();
    const [matchDetails, setMatchDetails] = useState({})
    const matchId = route.params?.matchId;
    const getGameDetails = () => {
        getMatchDetails(matchId).then(response => setMatchDetails(response))
    }

    return (
        <View style={styles.screen}>
            <Button title={"Get Match Details"} onPress={getGameDetails} />
            <Text>Live Match</Text>
            <ScrollView>
                <Text>{JSON.stringify(matchDetails, null, 4)}</Text>
            </ScrollView>
        </View>
    )
}

export default LiveMatch;


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    }
})