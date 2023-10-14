import {Image, Pressable, StyleSheet, View} from "react-native";
import Colors from "../constants/Colors";


const AgentIcon = ({item, onPress, disabled, selected}) => {
    return (<Pressable onPress={onPress.bind(this, item.uuid)}>
        <View
            style={[
                styles.agent,
                disabled ? styles.agentDisabled : null,
                selected ? styles.agentSelected : null
            ]}>
            <Image style={styles.agentIcon}
                   source={item.imageSource}/>
        </View>
    </Pressable>)
}

const styles = StyleSheet.create({
    agent: {
        backgroundColor: Colors.inactiveGoldTint,
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
        backgroundColor: Colors.inactiveGoldTint,
        opacity: 0.5,
    },
    agentSelected: {
        borderColor: 'red',
        borderWidth: 2,
    },
})

export default AgentIcon;