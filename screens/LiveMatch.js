import {Button, ScrollView, StyleSheet, Text, View} from 'react-native'
import {getCoreGamePlayerStatus, getCurrentGameDetails, getPlayerNames} from "../utils/game";
import {useRoute} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import {Card} from "react-native-ui-lib";
import {agentData} from "../data/agent-data";
import Colors from "../constants/Colors";
import {AuthContext} from "../store/Auth";


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

    const getGameDetails = () => {
        console.log("ASking for details", currentMatchId)
        getCurrentGameDetails(auth, currentMatchId).then(response => {
            console.log("matchdetails livematch", response)
            setMatchDetails(response)
        })
    }

    useEffect(() => {
        console.log("route matchid", matchId)
        if (matchId) {
            setCurrentMatchId(matchId)
        } else {
            getCoreGamePlayerStatus(auth).then(response => {
                console.log("cuurent matchid", response)
                setCurrentMatchId(response.matchId)
            })
        }
    }, []);

    useEffect(() => {
        console.log("MatchDetails", matchDetails)
        if (!matchDetails) {
            return
        }

        const playerIds = matchDetails['Players'].map(player => player['Subject'])
        getPlayerNames(auth, playerIds).then(response => {
            const details = {}
            response.forEach(player => {
                details[player['Subject']] = player
            })

            console.log("Details", details)

            setPlayerDetails(details)

            const blueTeamPlayers = matchDetails['Players'].filter(player => player['TeamID'] === "Blue")
            setBlueTeamPlayers(blueTeamPlayers)

            const redTeamPlayers = matchDetails['Players'].filter(player => player['TeamID'] === "Red")
            setRedTeamPlayers(redTeamPlayers)
            setIsLoading(false)
        }).catch(err => console.log("Error fetching player details"))

    }, [matchDetails]);


    return (
        <View style={styles.screen}>
            <Button title={"Get Match Details"} onPress={getGameDetails}/>
            <Text>Live Match</Text>
            {
                !isLoading &&
                <ScrollView style={styles.scrollViewContainer}>
                    <View>

                        {blueTeamPlayers.map(
                            player => (

                                <Card style={[styles.playerContainer, styles.allyPlayerContainer]} flex row
                                      onPress={() => console.log('pressed')}>
                                    <View style={styles.gameBoardAgentIconContainer}>
                                        <Card.Image style={styles.gameBoardAgentIcon}
                                                    source={{uri: agentData.find(agent => player['CharacterID'] === agent.uuid).displayIconSmall}}
                                                    key={player['Subject']}
                                        />
                                    </View>
                                    <View style={styles.gameBoardAgentInfoContainer}>
                                        <Card.Section content={[{
                                            text: playerDetails[player['Subject']]['GameName'],
                                            text70: true,
                                            grey10: true
                                        }]}/>
                                        <Card.Section content={[{
                                            text: agentData.find(agent => agent.uuid === player['CharacterID']).displayName,
                                            text70: true,
                                            grey10: true
                                        }]}/>
                                    </View>

                                </Card>
                            )
                        )}
                    </View>
                    <View>

                        {redTeamPlayers.map(
                            player => (
                                <Card style={[styles.playerContainer, styles.enemyPlayerContainer]} flex row
                                      onPress={() => console.log('pressed')}>
                                    <View style={styles.gameBoardAgentIconContainer}>
                                        <Card.Image style={styles.gameBoardAgentIcon}
                                                    source={{uri: agentData.find(agent => player['CharacterID'] === agent.uuid).displayIconSmall}}
                                                    key={player['Subject']}
                                        />
                                    </View>
                                    <View style={styles.gameBoardAgentInfoContainer}>
                                        <Card.Section content={[{
                                            text: playerDetails[player['Subject']]['GameName'],
                                            text70: true,
                                            grey10: true
                                        }]}/>
                                        <Card.Section content={[{
                                            text: agentData.find(agent => agent.uuid === player['CharacterID']).displayName,
                                            text70: true,
                                            grey10: true
                                        }]}/>
                                    </View>

                                </Card>
                            ))}
                    </View>
                </ScrollView>
            }

        </View>
    );
}

export default LiveMatch;


const styles = StyleSheet.create({
    screen: {
        backgroundColor: 'blue',
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