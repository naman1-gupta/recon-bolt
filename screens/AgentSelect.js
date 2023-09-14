import {StatusBar, FlatList, Image, View, Pressable, StyleSheet, Dimensions} from 'react-native';
import {agentData} from "../data/agent-data";
import {lockAgent, hoverAgent, getCoreGamePlayerStatus, getPlayerEntitlements} from "../utils/game";
import {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import Button from 'react-native-ui-lib/button'
import {getEntitlementsToken} from "../utils/login";

function AgentSelect({route, navigation}) {
    const playableCharacters = agentData.filter(agent => agent.isPlayableCharacter)
    const [agent, selectAgent] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const DEFAULT_CHARACTERS = [
        "320b2a48-4d9b-a075-30f1-1f93a9b638fa", //sova
        "add6443a-41bd-e414-f6ad-e58d267f4e95", //jett
        "569fdd95-4d10-43ab-ca70-79becc718b46", //sage
        "9f0d8ba9-4140-b941-57d3-a7ad57c6b417", //brimstone
        "eb93336a-449b-9c1b-0a54-a891f7921d69", //phoenix
    ]
    const [unlockedCharacters, setUnlockedCharacters] = useState([])
    const PLAYER_ITEM_TYPE_ID = '01bb38e1-da47-4e6a-9b3d-945fe4655707'
    const [playableAgents, setPlayableAgents] = useState([])



    const matchId = route.params?.matchId

    useEffect(() => {
        getPlayerEntitlements().then(response => {
            const playerUnlockedCharacters = response['EntitlementsByTypes']
                .filter(entitlementType => entitlementType["ItemTypeID"] === PLAYER_ITEM_TYPE_ID)[0].Entitlements
                .map(entitlement => entitlement.ItemID)
            const unlockedCharacterIDs = playerUnlockedCharacters.concat(DEFAULT_CHARACTERS)
            setUnlockedCharacters(unlockedCharacterIDs)

            const unlockedAgents = agentData.filter(agent => unlockedCharacterIDs.includes(agent.uuid))
            const sortedUnlockedAgents = unlockedAgents.sort((a, b) => a.displayName.localeCompare(b.displayName))
            const unlockedPlayableAgents = [...sortedUnlockedAgents, ...agentData.filter(a => a.isPlayableCharacter).filter(a => !unlockedCharacterIDs.includes(a.uuid))]

            setPlayableAgents(unlockedPlayableAgents)
            setIsLoading(false)
        })
    }, []);

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
            const timer = setInterval(() => {
                getCoreGamePlayerStatus().then(response => {
                    clearInterval(timer)

                    navigation.navigate("LiveMatch", {matchId: matchId})
                })
            }, 2000)
            console.log("Agent lock response", response)
        }).catch(err => {
            console.log("Agent lock error", err)
        })
    }

    const cols = Math.floor((Dimensions.get("screen").width - 32) / 54)

    return (
        <View style={styles.mainScreen}>
            <View>
                <FlatList extraData={agent} style={styles.agentList} numColumns={cols} data={playableAgents}
                          renderItem={(item) => {
                              return (
                                  unlockedCharacters.includes(item.item.uuid) ?
                                      <Pressable onPress={() => onAgentSelected(item.item.uuid)}>
                                          <View
                                              style={[styles.agent, item.item.uuid === agent ? styles.agentSelected : null]}>
                                              <Image style={styles.agentIcon}
                                                     source={item.item.imageSource}/>
                                          </View>
                                      </Pressable> :
                                      <View
                                          style={[styles.agent, styles.agentDisabled, item.item.uuid === agent ? styles.agentSelected : null]}>
                                          <Image style={styles.agentIcon}
                                                 source={item.item.imageSource}/>
                                      </View>
                              )
                          }}/>
            </View>
            <View>
                <Button label={"Confirm"} onPress={onAgentLocked} disabled={!agent}/>
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
        flexDirection: 'column',
        margin: 2,
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: 'black',
    },
    agentIcon: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
        flex: 1,
    },
    agentDisabled: {
        backgroundColor: 'black',
        opacity: 0.5,
    },
    agentSelected: {
        borderColor: 'red',
        borderWidth: 2,
    },
    agentText: {
        textAlign: 'center',
        fontSize: 24
    }
})

export default AgentSelect

