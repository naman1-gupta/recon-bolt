import {StyleSheet, View} from "react-native";
import {Card} from "react-native-ui-lib";
import {agentData} from "../data/agent-data";
import Colors from "../constants/Colors";
import {useContext} from "react";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";

export default function Agent(props) {
    const {player, playerDetails, containerStyle, onPress, agentKey, showRank} = props
    const {auth} = useContext(AuthContext);

    console.log("PLAYER_details", player)



    return (
        <Card key={agentKey}
            style={[styles.playerContainer, containerStyle === "enemy" ? styles.enemyPlayerContainer : styles.allyPlayerContainer]}
            flex row
            onPress={onPress.bind(this, player["Subject"])}>
            <View style={styles.gameBoardRow}>

                <View style={styles.gameBoardAgentDetails}>
                    <View style={styles.gameBoardAgentIconContainer}>
                        <Card.Image style={styles.gameBoardAgentIcon}
                                    source={{uri: agentData.find(agent => player['CharacterID'].toLowerCase() === agent.uuid)?.displayIconSmall}}
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
                            text: agentData.find(agent => agent.uuid === player['CharacterID'].toLowerCase())?.displayName,
                            text70: true,
                            grey10: true
                        }]}/>
                    </View>

                </View>

                {
                    showRank && <View style={styles.gameBoardAgentIconContainer}>
                        <Card.Image style={styles.gameBoardAgentIcon}
                                    source={{uri: rankData.tiers.find(rank => playerDetails[player["Subject"]]["Rank"] === rank.tier).smallIcon}}
                                    key={player['Subject']}
                        />
                    </View>
                }

            </View>
        </Card>
    )
}


const styles = StyleSheet.create({
    gameBoardRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    gameBoardAgentDetails: {
        flexDirection: "row"
    },
    gameBoardAgentIcon: {
        width: 50,
        height: 50,
        borderRadius: 100,
    },
    gameBoardAgentIconContainer: {
        flexDirection: 'row',
        overflow: "hidden",
        borderRadius: 100,
        borderWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
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