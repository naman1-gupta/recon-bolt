import {ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, View} from "react-native";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import {useCallback, useContext, useState} from "react";
import {getPlayerCompetitveUpdates} from "../utils/game";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";
import Colors from "../constants/Colors";
import Match from "../components/match";

const deviceWidth = Dimensions.get("window").width

export default function PlayerCareer() {
    const route = useRoute();
    const {auth} = useContext(AuthContext);
    const [competitiveUpdates, setCompetitiveUpdates] = useState(null)
    const navigation = useNavigation();


    useFocusEffect(
        useCallback(() => {
            const playerId = route.params?.playerId

            // navigation.reset({playerId: null})

            console.log("Recieved", playerId)

            setCompetitiveUpdates(null)
            if (!playerId) {
                console.log("No player iD")
                return
            }

            getPlayerCompetitveUpdates(auth, playerId).then((response) => {
                setCompetitiveUpdates(response)
            }).catch(err => Alert.alert("Error getting player details",
                "Please try again later.."))
        }, [route])
    );

    const getRankBadge = () => {
        if (competitiveUpdates?.Matches.length !== 0)
            return rankData.tiers.find(tier =>
                tier.tier === competitiveUpdates.Matches[0].TierAfterUpdate)
        else
            return rankData.tiers.find(tier => tier.tier === 0)
    }

    if (competitiveUpdates) {
        return (
            <View style={styles.screen}>
                <View style={styles.rankBadgeContainer}>
                    <Image style={styles.rankBadge} source={{uri: getRankBadge().largeIcon}}/>
                    <Text style={styles.rankText}>{getRankBadge().tierName}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.matchesContainer}>
                    {
                        competitiveUpdates.Matches.map((match, index) => {
                            return (
                                <Match key={`match_${index}`} matchDetails={match}/>
                            )
                        })
                    }
                </ScrollView>
            </View>
        )
    } else {
        return <View style={styles.screen}>
            <ActivityIndicator size="large" color={Colors.inactiveGoldTint}/>
        </View>
    }

}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.darkBlueBg
    },
    rankBadgeContainer: {
        alignItems: "center",
        width: "100%",
    },
    matchesContainer: {
        alignItems: "center",
        width: deviceWidth,
        justifyContent: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "white",
    },
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