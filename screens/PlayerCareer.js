import {ActivityIndicator, Image, StyleSheet, Text, View, ScrollView, Dimensions, ImageBackground} from "react-native";
import {useRoute} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import {getPlayerCompetitveUpdates} from "../utils/game";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";
import mapData from '../data/map-data';
import Colors from "../constants/Colors";

const deviceWidth = Dimensions.get("window").width

export default function PlayerCareer() {
    const route = useRoute();
    const {auth} = useContext(AuthContext);
    const [competitiveUpdates, setCompetitiveUpdates] = useState(null)


    const playerId = route.params?.playerId

    useEffect(() => {
        getPlayerCompetitveUpdates(auth, playerId).then((response) => {
            console.log(response)
            setCompetitiveUpdates(response)
        })
    }, []);

    const getRankBadge = () => {
        return rankData.tiers.find(tier =>
            tier.tier === competitiveUpdates.Matches[0].TierAfterUpdate)
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
                        competitiveUpdates.Matches.map(match => {
                            const mapDetails = mapData.find(map => map.mapUrl === match.MapID)
                            return (
                                <>
                                    <View style={styles.matchContainer}>
                                        <ImageBackground style={styles.matchMapBackgroundImage} source={{uri: mapDetails.listViewIcon}} >
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
                                </>
                            )
                        })
                    }
                </ScrollView>
            </View>
        )
    } else {
        return <View style={styles.screen}>
            <ActivityIndicator size="small" color="#0000ff"/>
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