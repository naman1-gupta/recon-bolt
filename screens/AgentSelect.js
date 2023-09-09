import {StatusBar, FlatList, Image, Text, View, Pressable, StyleSheet, Button, Dimensions} from 'react-native';
import {agentData} from "../data/agent-data";
import {lockAgent, hoverAgent} from "../utils/game";
import {useState} from "react";
import {useNavigation} from "@react-navigation/native";

function AgentSelect({route, navigation}) {
    const playableCharacters = agentData.filter(agent => agent.isPlayableCharacter)
    const [agent, selectAgent] = useState(null)

    const matchId = route.params?.matchId
    const onAgentSelected = (agentId) => {
        console.log("Selected agent id", agentId, matchId);
        selectAgent(agentId)
        hoverAgent(agentId, matchId)
            .then(response => {
                console.log("agent select", response)
            })
            .catch(err => console.log("Error selecting agent", err))
    }

    const onAgentLocked = () => {
        console.log("agent selected", agent, matchId)
        lockAgent(agent, matchId).then(response => {
            console.log("Agent lock response", response)
        }).catch(err => {
            console.log("Agent lock error", err)
        })
    }

    const cols = Math.floor((Dimensions.get("screen").width - 32) / 54)

    return (
        <View style={styles.mainScreen}>
            <View>
                <FlatList extraData={agent} style={styles.agentList} numColumns={cols} data={playableCharacters} renderItem={(item) => {
                    return (
                        <Pressable onPress={() => onAgentSelected(item.item.uuid)}>
                            <View style={[styles.agent, item.item.uuid === agent ? styles.agentSelected : null]}>
                                <Image style={styles.agentIcon} source={{uri: item.item.displayIconSmall}} resizeMode={"contain"}/>
                            </View>
                        </Pressable>
                    )
                }} />
            </View>
            <View>
                <Button title={"Confirm"} onPress={onAgentLocked} disabled={!agent}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    agentList: {
        maxHeight: 350
    },
    agent: {
        margin: 2,
        width: 50,
        height: 50,
        borderColor: 'black',
    },
    agentIcon: {
        flex: 1,
    },
    agentSelected: {
        borderColor: 'red',
        borderWidth: 1,
    },
    agentText: {
        textAlign: 'center',
        fontSize: 24
    }
})

export default AgentSelect

