import {StyleSheet, View} from "react-native";
import {Card} from "react-native-ui-lib";
import {agentData} from "../data/agent-data";
import Colors from "../constants/Colors";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../store/Auth";
import rankData from "../data/rank-data";
import {getPlayerCompetitveUpdates} from "../utils/game";

export default function Agent(props) {
    const {player, onPress, agentKey, showRank} = props
    const {auth} = useContext(AuthContext);

    const [playerTier, setPlayerTier] = useState(0)

    console.log(player)
    useEffect(() => {
        if(!showRank){
            return
        }

        const subject = player["Subject"]
        getPlayerCompetitveUpdates(auth, subject, 0, 1, "competitive").then(response => {
            if(response["Matches"].length !== 0) {
                setPlayerTier(response["Matches"][0]["TierAfterUpdate"])
            }
        })
    }, []);

    const agent = agentData.find(agent => player['CharacterID'].toLowerCase() === agent.uuid)

    return (
        <Card key={agentKey}
            style={[
                styles.playerContainer,
                player["TeamID"] === "Red" ? styles.enemyPlayerContainer : styles.allyPlayerContainer,
                auth.identity.sub === player["Subject"] ? styles.selfPlayerContainer : null
            ]}
            flex row
            onPress={onPress.bind(this, player["Subject"])}>
            <View style={styles.gameBoardRow}>

                <View style={styles.gameBoardAgentDetails}>
                    <View style={styles.gameBoardAgentIconContainer}>
                        <Card.Image style={styles.gameBoardAgentIcon}
                                    source={{uri: player["CharacterID"] ? agent?.displayIconSmall : "https://media.valorant-api.com/competitivetiers/564d8e28-c226-3180-6285-e48a390db8b1/0/smallicon.png"}}
                                    key={player['Subject']}
                        />
                    </View>
                    <View style={styles.gameBoardAgentInfoContainer}>
                        <Card.Section content={[{
                            text: player.Identity?.GameName || "....",
                            text70: true,
                            grey10: true
                        }]}/>
                        <Card.Section content={[{
                            text: ["selected", ""].includes(player["CharacterSelectionState"]) ? "Picking..." : agent?.displayName,
                            text70: true,
                            grey10: true
                        }]}/>
                    </View>

                </View>

                {
                    showRank && <View style={styles.gameBoardAgentIconContainer}>
                        <Card.Image style={styles.gameBoardAgentIcon}
                                    source={{uri: rankData.tiers.find(rank => playerTier === rank.tier).smallIcon}}
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
    selfPlayerContainer: {
      backgroundColor: Colors.selfColor,
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