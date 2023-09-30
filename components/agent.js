import {StyleSheet, View} from "react-native";
import {Card} from "react-native-ui-lib";
import {agentData} from "../data/agent-data";
import Colors from "../constants/Colors";
import {getPlayerCompetitveUpdates} from "../utils/game";
import {useContext} from "react";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";

export default function Agent(props) {
    const {player, playerDetails, containerStyle} = props
    const {auth} = useContext(AuthContext);

    console.log("PLAYER_DETAILS", playerDetails)

    return (
        <Card style={[styles.playerContainer, containerStyle === "enemy" ? styles.enemyPlayerContainer : styles.allyPlayerContainer]} flex row
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

            <View style={styles.gameBoardAgentIconContainer}>
                <Card.Image style={styles.gameBoardAgentIcon}
                            source={{uri: rankData.find(rank => playerDetails[player["Subject"]]["Rank"] === rank.tier).smallIcon}}
                            key={player['Subject']}
                />
            </View>
    </Card>)
}


const styles = StyleSheet.create({
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