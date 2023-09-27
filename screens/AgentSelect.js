import {Dimensions, FlatList, Image, Pressable, StyleSheet, View} from 'react-native';
import {agentData} from "../data/agent-data";
import {getCoreGamePlayerStatus, getPlayerEntitlements, hoverAgent, lockAgent} from "../utils/game";
import {useContext, useEffect, useState} from "react";
import Button from 'react-native-ui-lib/button'
import Colors from "../constants/Colors";
import {AuthContext} from "../store/Auth";

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
    const PLAYER_ITEM_TYPE_ID = '01bb38e1-da47-4e6a-9b3d-945fe4655707'
    const [playableAgents, setPlayableAgents] = useState([])
    const [unlockedCharacterIDs, setUnlockedCharacterIDs] = useState([])
    const [agentLocked, setAgentLocked] = useState(false)
    const {auth} = useContext(AuthContext)

    const matchId = route.params?.matchId

    useEffect(() => {
        getPlayerEntitlements(auth).then(response => {
            const charsUnlockedWithContracts = response['EntitlementsByTypes']
                .filter(entitlementType => entitlementType["ItemTypeID"] === PLAYER_ITEM_TYPE_ID)[0].Entitlements
                .map(entitlement => entitlement.ItemID)
            const unlockedCharacterIDs = charsUnlockedWithContracts.concat(DEFAULT_CHARACTERS)
            setUnlockedCharacterIDs(unlockedCharacterIDs)

            const unlockedAgents = agentData.filter(agent => agent.isPlayableCharacter && unlockedCharacterIDs.includes(agent.uuid))
            const sortedUnlockedAgents = unlockedAgents.sort((a, b) => a.displayName.localeCompare(b.displayName))
            const unlockedPlayableAgents = [...sortedUnlockedAgents, ...playableCharacters.filter(a => !unlockedCharacterIDs.includes(a.uuid))]

            setPlayableAgents(unlockedPlayableAgents)
            setIsLoading(false)
        })
    }, []);

    const onAgentSelected = (agentId) => {
        if (!unlockedCharacterIDs.includes(agentId)) {
            return
        }
        console.log("Selected agent id", agentId, matchId);
        selectAgent(agentId)
        hoverAgent(auth, agentId, matchId)
            .then(response => {
                console.log("agent select", response)
            })
            .catch(err => console.log("Error selecting agent", err))
    }

    const onAgentLocked = () => {
        lockAgent(auth, agent, matchId).then(response => {
            setAgentLocked(true)
            const timer = setInterval(() => {
                getCoreGamePlayerStatus(auth).then(response => {
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
                          renderItem={({item}) => {
                              return (
                                  <Pressable onPress={onAgentSelected.bind(this, item.uuid)}>
                                      <View
                                          style={[
                                              styles.agent,
                                              unlockedCharacterIDs.includes(item.uuid) ? null : styles.agentDisabled,
                                              item.uuid === agent ? styles.agentSelected : null
                                          ]}>
                                          <Image style={styles.agentIcon}
                                                 source={item.imageSource}/>
                                      </View>
                                  </Pressable>
                              )
                          }}/>
            </View>
            <View>
                <Button label={"Confirm"} onPress={onAgentLocked} disabled={agentLocked}/>
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
        backgroundColor: Colors.darkBlueBg,
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

