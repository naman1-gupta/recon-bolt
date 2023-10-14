import {ImageBackground, StyleSheet, Text, View} from "react-native";
import mapData from "../data/map-data";
import Colors from "../constants/Colors";
import {useContext, useEffect} from "react";
import {getMatchDetails} from "../utils/game";
import {AuthContext} from "../store/Auth";

const match = (props) => {
    const {matchDetails} = props
    const mapDetails = mapData.find(map => map.mapUrl === matchDetails.MapID)
    const {auth} = useContext(AuthContext)

    useEffect(() => {
        getMatchDetails(auth, matchDetails.MatchID).then(response => {
            console.log("MATCH_DETAILS ===")
            console.log(JSON.stringify(response, null, 4))
        }).catch(err => {
            console.log(
                "error fetching match details", err
            )
        })
    }, []);

    return (
        <View key={matchDetails.MatchID} style={styles.matchContainer}>
            <ImageBackground style={styles.matchMapBackgroundImage}
                             source={{uri: mapDetails.listViewIcon}}>
                <View style={styles.matchDetailsContainer}>
                    <Text style={styles.mapResultsText}>{mapDetails.displayName}</Text>
                    <Text style={[
                        styles.mapResultsText,
                        match.RankedRatingEarned >= 0 ? styles.greenText : styles.redText
                    ]}>
                        {match.RankedRatingEarned}
                    </Text>
                </View>

            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    matchMapBackgroundImage: {
        flex: 1,
        opacity: 0.6
    },
    matchContainer: {
        width: "80%",
        marginVertical: 4,
        flexDirection: "row",
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
    },
    matchDetailsContainer: {
        padding: 8,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    rankBadge: {
        height: 100,
        width: 100,
        marginVertical: 4
    },
    rankText: {
        fontWeight: "700",
        color: 'white',
    },
    mapResultsText: {
        fontWeight: "900",
        color: "white",
        elevation: 1,
    },
    greenText: {
        color: Colors.positiveGreen
    },
    redText: {
        color: Colors.negativeRed
    }
})

export default match;