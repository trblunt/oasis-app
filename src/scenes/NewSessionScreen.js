import {
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    useSelector,
    useDispatch
} from 'react-redux';
import {
    selectSessions,
    addSession,
    removeSession
} from '../store/reducers/sessionsSlice';

import * as Notifications from 'expo-notifications';

function scheduleRecurringCheckin() {
    Notifications.cancelScheduledNotificationAsync("check-in");
    Notifications.scheduleNotificationAsync({
        identifier: "check-in",
        content: {
            title: "Check-in",
            body: "Check in on your goals for this session."
        },
        trigger: {
            seconds: 60 * CHECK_IN_FREQUENCY,
            repeats: true,
        },
    });
}

export default function NewSessionScreen() {
    const dispatch = useDispatch();
    return (
        <View style={styles.container}>
            <Text>Record Session</Text>
            <Button onPress={scheduleRecurringCheckin} title="Start Session" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});