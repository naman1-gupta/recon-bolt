import {StyleSheet, View, Text, Pressable} from "react-native";
import {useEffect, useState} from "react";
import {
    getConfig,
    getPartyDetails,
    getPlayerPartyId,
    getPreGameMatchStatus,
    getPreGamePlayerStatus, leaveMatchmaking, startMatchmaking,
    switchQueue
} from "../utils/game";
import {useNavigation} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import {Picker, Button} from 'react-native-ui-lib';
import Animated, {
    interpolate,
    RotateInDownLeft,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue, withTiming
} from 'react-native-reanimated';

import Colors from "../constants/Colors";

const QUEUE_TYPES = {
    'swiftplay': 'Swiftplay',
    'competitive': 'Competitive',
    'unrated': 'Unrated',
    'spikerush': 'Spike Rush',
    'ggteam': 'Escalation',
    'hurm': 'Team Deathmatch',
    'deathmatch' : 'Deathmatch'
}

const Home = () => {

    const [loading, setLoading] = useState(true)
    const [config, setConfig] = useState('')
    const [selectedQueue, changeSelectedQueue] = useState('')
    const [partyId, setPartyId] = useState('')
    const [matchId, setMatchId] = useState('')
    const [partyDetails, setPartyDetails] = useState({})

    const navigation = useNavigation()

    useEffect(() => {
        getConfig().then((response) => {
            getPlayerPartyId().then(partyId => {
                console.log("PartyId", partyId)
                setPartyId(partyId)
            }).catch(err => {
                console.log("Error getting party id")
            })

        }).catch((err) => {
            // Alert.alert("Something went wrong", err?.response?.status)
        }).finally(() => setLoading(false))


    }, []);


    useEffect(() => {
        console.log("Running after updating")
        // const timer = setInterval(() => {
        console.log("Running inside setINterval", partyId)
        getPartyDetails(partyId)
            .then(details => {
                setPartyDetails(details)
            })
            .catch(_ => {
                // Alert.alert("Error", "Error fetching party details")
            })
        // }, 10000)

        // return () => clearInterval(timer)
    }, [partyId]);


    useEffect(() => {
        if (partyDetails.state === "DEFAULT" && partyDetails.previousState === "MATCHMADE_GAME_STARTING") {
            getPreGamePlayerStatus().then(({matchId}) => setMatchId(matchId))
        }
    }, [partyDetails]);


    useEffect(() => {
        console.log("Getting pregame status")
        getPreGameMatchStatus(matchId).then(response => {
            console.log("pregame status, navigating", response, matchId)
            if ("AllyTeam" in response) {
                navigation.navigate("AgentSelect", {
                    matchId: matchId
                })
            }
        })
    }, [matchId]);

    const refresh = () => {
        getPlayerPartyId().then(partyId => {
            console.log("PartyId", partyId)
            setPartyId(partyId)
        }).catch(err => {
            console.log("Error getting party id")
        })
    }

    const changeQueue = (queueId) => {
        switchQueue(queueId, partyId).then(response => setPartyDetails(response))
            .catch(err => console.log("Change queue err", err))
    }

    const queueMatch = () => {
        startMatchmaking(partyId).then(response => {
            setPartyDetails(response)
            const timer = setInterval(() => {
                getPreGamePlayerStatus().then(response => {
                    if(response.matchId) {
                        console.log("Setting matchId", response.matchId)
                        setMatchId(response.matchId)
                        clearInterval(timer)
                    }
                }).catch(err => console.log("Error getting player party status", err))
            }, 5000)
        }).catch(err => {
            console.log("Error starting match")
        })
    }

    const leaveMatchmakingQueue = () => {
        leaveMatchmaking(partyId).then(response => {
            setPartyDetails(response)
        })
    }

    // const animation = useSharedValue(0)
    // const rotation = useDerivedValue(() => {
    //     return interpolate(animation.value,
    //         [0,360],
    //         [0,360])
    // })
    // const animationStyle = useAnimatedStyle(() => {
    //     return {
    //         transform: [
    //             {
    //                 rotate: rotation.value + 'deg'
    //             }
    //         ]
    //     }
    // })
    //
    // const startAnimation = () => {
    //     animation.value = withTiming(0, {
    //         duration: 1000
    //     })
    // }

    return (
        <View style={styles.screen}>
            <View style={styles.partyContainer}>
                <Text style={styles.partyTitleText}>Party</Text>
                <Pressable onPress={refresh} style={({pressed}) => [pressed && styles.reduceOpacity]}>
                    <Animated.View style={[]}>
                        <Ionicons name={"refresh"} size={24} color={'white'} entering={RotateInDownLeft.duration(3000)}/>
                    </Animated.View>
                </Pressable>
            </View>
            <View>
                <View style={styles.queueContainer}>
                    <Picker
                        containerStyle={{
                            backgroundColor: !partyDetails?.queueId ? '#f6d9d9' : '#ccc',
                            borderColor: '#ccc',
                            borderRadius: 6,
                            borderWidth: 1,
                            flexDirection: 'row',
                            marginVertical: 16,
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                        }}
                        editable={!!partyDetails?.queueId}
                        placeholder={partyDetails?.queueId ? "Select an option" : "Start your game"}
                        useSafeArea={true}
                        onChange={(queue) => changeQueue(queue)}
                        value={partyDetails?.queueId}
                        >
                        {
                            Object.keys(QUEUE_TYPES)
                            .map(queue => <Picker.Item
                                value={queue}
                                label={QUEUE_TYPES[queue]}
                                key={queue}
                            />)
                        }
                    </Picker>
                    <View style={{minHeight: 40, flexDirection: 'row', alignItems: 'center'}}>
                        {
                            partyDetails.queueId !== null ? (
                                <>
                                    <Text style={[styles.currentQueueLabel]}>Current</Text>
                                    <Text style={[styles.currentQueueText]}>{QUEUE_TYPES[partyDetails.queueId]}</Text>
                                </>
                            ): null
                        }
                    </View>

                </View>
                {
                    partyDetails.state !== "MATCHMAKING" && <Button label={`Start matchmaking`} onPress={queueMatch}/>
                }
                {
                    partyDetails.state === "MATCHMAKING" && <Button label={`Cancel matchmaking`} onPress={leaveMatchmakingQueue}/>
                }

            </View>


        </View>
    )
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.darkBlueBg,
        alignContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
    },
    partyContainer: {
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    partyTitleText: {
        color: '#ccc',
        fontSize: 36,
        fontWeight: "bold",
    },
    queueContainer: {
        paddingTop: 12
    },
    currentQueueLabel: {
        color: '#ccc',
        marginRight: 24,
        fontSize: 16,
        fontWeight: 200,
        minHeight: 10
    },
    currentQueueText: {
        color: '#ccc',
        fontSize: 24,
        fontWeight: 600,
    },
    reduceOpacity: {
        opacity: 0.7
    }
})

export default Home;