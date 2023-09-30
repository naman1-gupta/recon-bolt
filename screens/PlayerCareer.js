import {View, StyleSheet, Image, Text} from "react-native";
import {useRoute} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import {getPlayerCompetitveUpdates, getPlayerMMR} from "../utils/game";
import {AuthContext} from "../store/Auth";
import {Button} from 'react-native-ui-lib';
import rankData from "../data/rank-data";
import mapData from '../data/map-data';

export default function PlayerCareer() {
    const route = useRoute();
    const {auth} = useContext(AuthContext);
    const [competitiveUpdates, setCompetitiveUpdates] = useState(null)


    const playerId = route.params?.playerId

    useEffect(() => {
        getPlayerCompetitveUpdates(auth, playerId).then((response) => {
            setCompetitiveUpdates(response)
        })
    }, []);

    const getMMR = () => {
        getPlayerMMR(auth, playerId).then((response) => {
            console.log("Success", response)
        })
    }


    const getRankBadge = () => {
        const competitveTier = rankData.tiers.find(tier =>
            tier.tier === competitiveUpdates.Matches[0].TierAfterUpdate)

        return competitveTier
    }

    if (competitiveUpdates) {
        return (
            <View style={styles.screen}>
                <View style={styles.rankBadgeContainer}>
                    <Image style={{height: 100, width: 100}} source={{uri: getRankBadge().largeIcon}}/>
                    <Text>{getRankBadge().tierName}</Text>

                    <Button label={"GetMMR"} onPress={getMMR} />
                </View>

                <View>
                    {
                        competitiveUpdates.Matches.map(match => {
                            const mapDetails = mapData.find(map => map.mapUrl === match.MapID)
                            return (
                                <>
                                    <View style={styles.matchContainer}>
                                        <Text>{mapDetails.displayName}</Text>
                                        <Text>{match.RankedRatingEarned}</Text>
                                    </View>
                                </>
                            )
                        })
                    }
                </View>
            </View>
        )
    } else {
        return <View style={styles.screen}>

        </View>
    }

}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center'
    },
    rankBadgeContainer: {
        flex: 1,
        alignItems: "center",
    },
    matchContainer: {
        backgroundColor: 'red',
        flexDirection: "row"
    }
})