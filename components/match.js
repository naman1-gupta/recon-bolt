import {ImageBackground, StyleSheet, Text, View, Image, ActivityIndicator} from "react-native";
import mapData from "../data/map-data";
import Colors from "../constants/Colors";
import {useContext, useEffect, useState} from "react";
import {getMatchDetails} from "../utils/game";
import {AuthContext} from "../store/Auth";
import {agentData} from "../data/agent-data";
import rankData from "../data/rank-data";

const match = (props) => {
    const {matchDetails, playerId, showDetails, logMatchData} = props
    const mapDetails = mapData.find(map => map.mapUrl === matchDetails.MapID)
    const {auth} = useContext(AuthContext)

    const [matchStats, setMatchStats] = useState(null)
    const [playerStats, setPlayerStats] = useState(null)
    const [loading, isLoading] = useState(false)

    useEffect(() => {
        if (!showDetails) {
            return
        }


        isLoading(true)
        getMatchDetails(auth, matchDetails.MatchID).then(response => {
            if (response) {
                setMatchStats(response)
            }
        }).catch(err => {
            console.log(
                "error fetching match details", err
            )
        }).finally(() => {
            isLoading(false)
        })
    }, []);


    useEffect(() => {
        if (!matchStats) {
            return
        }

        for (let player of matchStats?.players) {
            if (player.subject === playerId) {
                const stats = {
                    kills: player?.stats?.kills,
                    deaths: player?.stats?.deaths,
                    assists: player?.stats?.assists,
                    characterId: player?.characterId
                }

                setPlayerStats(stats)
                return
            }
        }

    }, [matchStats]);


    // if(!playerStats)
    //     return null

    return (
        <View key={matchDetails.MatchID} style={styles.matchContainer}>
            <ImageBackground source={{uri: mapDetails.splash}}
                             imageStyle={styles.matchMapBackgroundImage}
                             resizeMode={'cover'}
                             style={styles.matchMapBackgroundImageContainer}>

                {
                    loading ? <View><ActivityIndicator size={"small"} color={Colors.activeGoldTint}/></View> :
                        <View style={styles.matchDetailsOuterContainer}>
                            {
                                playerStats &&
                                <Image style={styles.matchAgentImage}
                                       source={{uri: agentData.find(agent => agent.uuid === playerStats.characterId).displayIconSmall}}/>
                            }

                            <View style={styles.matchDetailsContainer}>
                                <Text
                                    style={styles.mapResultsText}>{playerStats ? `${playerStats.kills} / ${playerStats.deaths} / ${playerStats.assists}` : null}</Text>
                                {
                                    matchStats?.matchInfo?.isRanked &&
                                    <View style={styles.rankedInfoContainer}>
                                        <Text style={[
                                            styles.mapResultsText,
                                            matchDetails.RankedRatingEarned >= 0 ? styles.greenText : styles.redText
                                        ]}>
                                            {`${matchDetails.RankedRatingEarned > 0 ? '+' : null}${matchDetails.RankedRatingEarned}`}
                                        </Text>
                                        <Image
                                            resizeMode={'center'}
                                            source={{uri: rankData.tiers.find(rank => rank.tier === matchDetails.TierBeforeUpdate).largeIcon}}
                                            style={styles.rankedInfoBadge}/>
                                    </View>

                                }

                            </View>
                        </View>
                }


            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    rankedInfoBadge: {
        width: 40,
        height: 40,
        flex: 1
    },
    rankedInfoContainer: {
        width: '30%',
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
    },
    matchMapBackgroundImage: {
        opacity: 0.6
    },
    matchMapBackgroundImageContainer: {
        flex: 1,
        width: '100%',
    },
    matchDetailsOuterContainer: {
        height: '100%',
        flexDirection: "row",
    },
    matchAgentImage: {
        height: '100%',
        width: '20%',
        minWidth: '20%',
    },
    matchContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "90%",
        marginVertical: 4,
        flexDirection: "row",
        height: 50,
        borderColor: 'red',
        borderWidth: 1,
    },
    matchDetailsContainer: {
        width: '80%',
        padding: 8,
        paddingRight: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center'
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