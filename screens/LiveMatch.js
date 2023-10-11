import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'
import {
    getCoreGamePlayerStatus,
    getCurrentGameDetails,
    getPlayerCompetitveUpdates,
    getPlayerNames
} from "../utils/game";
import {useFocusEffect, useNavigation, useRoute} from "@react-navigation/native";
import {useCallback, useContext, useEffect, useState} from "react";
import Colors from "../constants/Colors";
import {AuthContext} from "../store/Auth";
import Agent from "../components/agent";
import {screens} from "../constants/Screens";


const LiveMatch = () => {
    const route = useRoute();
    const [matchDetails, setMatchDetails] = useState(null)
    const matchId = route.params?.matchId;
    const [currentMatchId, setCurrentMatchId] = useState('')
    const [redTeamPlayers, setRedTeamPlayers] = useState([])
    const [blueTeamPlayers, setBlueTeamPlayers] = useState([])
    const [playerDetails, setPlayerDetails] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const {auth} = useContext(AuthContext)
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);

    const getGameDetails = () => {
        setRefreshing(true)
        console.log(currentMatchId)
        if (!currentMatchId) {
            setRefreshing(false)
            return
        }

        console.log("Requesting match details for matchId:", currentMatchId)
        getCurrentGameDetails(auth, currentMatchId).then(response => {
            setMatchDetails(response)
            setRefreshing(false)
        }).catch(err => setRefreshing(false))
    }

    useEffect(() => {
        console.log("Changed matchId, getting details")
        getGameDetails()
    }, [currentMatchId]);

    useFocusEffect(
        useCallback(() => {
            console.log("Route matchID: ", matchId)
            if (matchId) {
                setCurrentMatchId(matchId)
            } else {
                getCoreGamePlayerStatus(auth).then(response => {
                    console.log("Current MatchID: ", response)
                    setCurrentMatchId(response.matchId)
                })
            }
        }, [])
    );


    useEffect(() => {
        console.log("MatchDetails", matchDetails)
        if (!matchDetails || Object.keys(matchDetails).length === 0) {
            return
        }

        const playerIds = matchDetails['Players'].map(player => player['Subject'])
        getPlayerNames(auth, playerIds).then(response => {
            const details = {}

            response.forEach(player => {
                details[player['Subject']] = player
            })

            new Promise.all(playerIds.map(playerId => getPlayerCompetitveUpdates(auth, playerId, 0, 1))).then(
                response => {
                    response.forEach(res => {
                        details[res['Subject']]["Rank"] = res["Matches"].length !== 0 ? res["Matches"][0]["TierAfterUpdate"] : 0
                    })

                    setPlayerDetails(details)

                    const blueTeamPlayers = matchDetails['Players'].filter(player => player['TeamID'] === "Blue")
                    console.log("BLUE_TEAM_PLAYERS", blueTeamPlayers)
                    setBlueTeamPlayers(blueTeamPlayers)

                    const redTeamPlayers = matchDetails['Players'].filter(player => player['TeamID'] === "Red")
                    setRedTeamPlayers(redTeamPlayers)
                }
            ).catch(err => console.log(err)).finally(() => {
                setIsLoading(false)
                setRefreshing(false)
            })


        }).catch(err => console.log("Error fetching player details", err))

    }, [matchDetails]);

    const getPlayerCareer = (subject) => {
        navigation.navigate(screens.PLAYER_CAREER, {
            playerId: subject
        })
    }

    return (
        <View style={styles.screen}>
            <ScrollView style={styles.scrollViewContainer}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={getGameDetails}/>
                        }>
                {
                    !isLoading &&
                    <>
                        <View>
                            {blueTeamPlayers.map(
                                (player, index) => (
                                    <Agent showRank={true}
                                           agentKey={`blue_${index}`}
                                           player={player}
                                           playerDetails={playerDetails}
                                           containerStyle={"ally"}
                                           onPress={getPlayerCareer}
                                    />
                                )
                            )}
                        </View>
                        <View>

                            {redTeamPlayers.map(
                                (player, index) => (
                                    <Agent showRank={true}
                                           agentKey={`red_${index}`}
                                           player={player}
                                           playerDetails={playerDetails}
                                           containerStyle={"enemy"}
                                           onPress={getPlayerCareer}
                                    />
                                )
                            )}
                        </View>
                    </>

                }

            </ScrollView>

        </View>
    );
}

export default LiveMatch;


const styles = StyleSheet.create({
    screen: {
        backgroundColor: Colors.darkBlueBg,
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    gameBoardAgentIcon: {
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    gameBoardAgentIconContainer: {
        overflow: "hidden",
        borderRadius: 100,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
    },
    scrollViewContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 16
    },
    playerContainer: {
        borderRadius: 100,
        marginVertical: 4,
    },
    allyPlayerContainer: {
        backgroundColor: Colors.allyTeam,
    },
    enemyPlayerContainer: {
        backgroundColor: Colors.enemyTeam,
    },
    gameBoardAgentInfoContainer: {
        paddingLeft: 4,
    }
})