import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectSessions, addSession, removeSession } from '../store/reducers/sessionsSlice';

import * as Notifications from 'expo-notifications';

/*
    * This is the Sessions screen.
This screen will display a list of gambling sessions that the user has recorded.
It will display their "grade" for each session, which is a standard letter grade corresponding to how they did in accomplishing their goals.
It will also display the date and time of each session.
The user will be able to click on a session to view more details about it.
*/

function SessionRow({ session }) {
    return (
        <View>
            <Text>{session.start}</Text>
        </View>
    );
}

export default function SessionsScreen() {
    const sessions = useSelector(selectSessions);
    const dispatch = useDispatch();
    var nextId = sessions.length + 1;
    return (
        <View style={styles.container}>
            <Text>Sessions</Text>
            <Text>{sessions.length}</Text>
            <TouchableOpacity onPress={() => {
                Notifications.cancelScheduledNotificationAsync("check-in");
                console.log("Cancelled check-in notification");
            }}>
                <Text>Add Session</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                dispatch(removeSession(sessions[0].id))
            }}>
                <Text>Remove Session</Text>
            </TouchableOpacity>
            {sessions.map((session) => (
                <SessionRow key={session.id} session={session} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});