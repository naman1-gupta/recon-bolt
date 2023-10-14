import {ImageBackground, StyleSheet, Text, View, Image} from "react-native";
import mapData from "../data/map-data";
import Colors from "../constants/Colors";
import {useContext, useEffect, useState} from "react";
import {getMatchDetails} from "../utils/game";
import {AuthContext} from "../store/Auth";
import {insertData} from "../utils/supabase";
import {agentData} from "../data/agent-data";

const match = (props) => {
    const {matchDetails, playerId} = props
    const mapDetails = mapData.find(map => map.mapUrl === matchDetails.MapID)
    const {auth} = useContext(AuthContext)

    const [playerStats, setPlayerStats] = useState(null)

    useEffect(() => {
        getMatchDetails(auth, matchDetails.MatchID).then(response => {
            // insertData(response).then(response => console.log(response))
            console.log(parseMatchData(response))
            // console.log("STATS", stats);
            setPlayerStats(parseMatchData(response))

        }).catch(err => {
            console.log(
                "error fetching match details", err
            )
        })
    }, []);

    const parseMatchData = (data) => {

        for(let player of data?.players){
            if(player.subject === playerId) {
                const stats = {
                    kills: player?.stats?.kills,
                    deaths: player?.stats?.deaths,
                    assists: player?.stats?.assists,
                    characterId: player?.characterId
                }

                return stats
            }
        }
    }

    console.log(matchDetails)

    if(!playerStats)
        return null

    return (
        <View key={matchDetails.MatchID} style={styles.matchContainer}>
            <ImageBackground style={styles.matchMapBackgroundImage}
                             source={{uri: mapDetails.listViewIcon}}>
                <View style={styles.matchDetailsOuterContainer}>
                    {
                        playerStats &&
                        <Image style={styles.matchAgentImage} source={{uri: agentData.find(agent => agent.uuid === playerStats.characterId).displayIconSmall}} />
                    }

                    <View style={styles.matchDetailsContainer}>
                        <Text style={styles.mapResultsText}>{playerStats ?  `${playerStats.kills} / ${playerStats.deaths} / ${playerStats.assists}` : 0 }</Text>
                        <Text style={[
                            styles.mapResultsText,
                            matchDetails.RankedRatingEarned >= 0 ? styles.greenText : styles.redText
                        ]}>
                            {matchDetails.RankedRatingEarned}
                        </Text>
                    </View>
                </View>



            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    matchMapBackgroundImage: {
        paddingBottom: 0,
        flex: 1,
        // opacity: 0.6
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
        width: "90%",
        marginVertical: 4,
        flexDirection: "row",
        height: 50,
        borderColor: 'white',
        borderWidth: 1,
    },
    matchDetailsContainer: {
        width: '80%',
        padding: 8,
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