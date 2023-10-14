import {RefreshControl, ScrollView, StyleSheet, View} from 'react-native'
import {getCoreGamePlayerStatus, getCurrentGameDetails, getPlayerNames} from "../utils/game";
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
    const [players, setPlayers] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const {auth} = useContext(AuthContext)
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [playerIdentities, setPlayerIdentities] = useState(null)

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
        // console.log("MatchDetails", matchDetails)
        if (!matchDetails || Object.keys(matchDetails).length === 0) {
            return
        }

        const playerIds = matchDetails['Players'].map(player => player['Subject'])
        getPlayerNames(auth, playerIds).then(response => {
            const details = {}
            const players = matchDetails["Players"]
            response.forEach(player => {
                details[player["Subject"]] = player
                // players.forEach(pl => {
                //     if (pl["Subject"] === player["Subject"]) {
                //         pl["Identity"] = player
                //     }
                // })
            })

            setPlayerIdentities(details)
            setPlayers(players)
            setIsLoading(false)
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
                            {players.map(
                                (player, index) => (
                                    <Agent
                                        playerIdentity={playerIdentities[player["Subject"]]}
                                        showRank={true}
                                        agentKey={`agent_${index}`}
                                        player={player}
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