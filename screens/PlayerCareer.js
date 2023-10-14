import {ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, View} from "react-native";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import {useCallback, useContext, useEffect, useState} from "react";
import {getMatchHistory, getPlayerCompetitveUpdates, getPlayerMMR, getPlayerNames} from "../utils/game";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";
import Colors from "../constants/Colors";
import Match from "../components/match";

const deviceWidth = Dimensions.get("window").width

export default function PlayerCareer() {
    const route = useRoute();
    const {auth} = useContext(AuthContext);
    const [competitiveUpdates, setCompetitiveUpdates] = useState(null)
    const [playerId, setPlayerId] = useState(null)
    const [playerIdentity, setPlayerIdentity] = useState(null)
    const [playerTier, setPlayerTier] = useState(null)

    useFocusEffect(
        useCallback(() => {
            const playerId = route.params?.playerId

            setPlayerId(playerId)
            console.log("Recieved", playerId)

            setCompetitiveUpdates(null)
            if (!playerId) {
                console.log("No player iD")
                return
            }

            if (playerId !== auth.identity.sub) {
                getPlayerNames(auth, [playerId]).then(response => {
                    console.log(response[0])
                    setPlayerIdentity(response[0])
                })
            } else {
                setPlayerIdentity(auth.identity)
            }

            // getPlayerMMR(auth, playerId).then(response => {
            //     console.log("MMR", response)
            //     const tierInfo = rankData.tiers.find(rank => rank.tier === response?.LatestCompetitiveUpdate?.TierAfterUpdate)
            //
            //     setPlayerTier(tierInfo)
            // }).catch(err => {
            //     console.log("Error fetching MMR")
            // })


            getPlayerCompetitveUpdates(auth, playerId, 0, 10, "competitive").then((response) => {
                setCompetitiveUpdates(response)
            }).catch(err => Alert.alert("Error getting player details",
                "Please try again later.."))

        }, [route])
    );

    useEffect(() => {
        if (!competitiveUpdates) {
            return
        }

        let tierInfo;

        if(competitiveUpdates.Matches.length === 0){
            tierInfo = rankData.tiers.find(tier => tier.tier === 0)
        }
        else {
            let flag = -1
            for(let m of competitiveUpdates.Matches){
                if(m.RankedRatingEarned !== 0){
                    tierInfo = rankData.tiers.find(rank => rank.tier === m.TierAfterUpdate)
                    flag = 0
                }
            }

            if(flag !== 0){
                tierInfo = rankData.tiers.find(tier => tier.tier === 0)
            }
        }

        setPlayerTier(tierInfo)
    }, [competitiveUpdates]);


    if (competitiveUpdates && playerTier) {
        return (
            <View style={styles.screen}>
                <View style={styles.rankBadgeContainer}>
                    <Image style={styles.rankBadge} source={{uri: playerTier.largeIcon}}/>
                    <Text style={styles.rankText}>{playerTier.tierName}</Text>
                </View>
                <View style={styles.rankBadgeContainer}>
                    <Text
                        style={styles.playerNameText}>{`${playerIdentity.game_name} #${playerIdentity.tag_line}`}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.matchesContainer}>
                    {
                        competitiveUpdates.Matches.map((match, index) => {
                            return (
                                <Match logMatchData={false} showDetails={true} playerId={playerId}
                                       matchDetails={match}/>
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
        marginBottom: 12,
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
    playerNameText: {
        fontWeight: "900",
        color: "white",
        fontSize: 24
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