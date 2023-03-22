import React, { useEffect, useState } from 'react';
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
    selectCurrentSession,
    addSession,
    removeSession,
    updateSession,
    SessionsState
} from '../../store/reducers/sessionsSlice';

import { AirbnbRating } from 'react-native-ratings';

import * as Notifications from 'expo-notifications';

import { timeStr } from '../../util/format';

import { scheduleRecurringCheckin, CHECK_IN_FREQUENCY } from '../../util/notify';

function GoalRating({ goal, setGoal }) {
    return (
        <View style={styles.goalSlider}>
            <AirbnbRating
                count={5}
                reviews={["Not at all", "A little", "Somewhat", "Mostly", "Completely"]}
                defaultRating={5}
                onFinishRating={(rating) => setGoal(rating)}
            />
        </View>
    )
}

export default function MidSessionScreen({ navigation }) {
    const dispatch = useDispatch();
    const sessions = useSelector(selectSessions);
    const [showCheckin, setShowCheckin] = useState(false);
    const [goalRating, setGoalRating] = useState(5);
    const currentSession = useSelector(selectCurrentSession);
    // budgetGoal is currentSession.goals.budget
    const budgetGoal = currentSession.goals.budget;
    const timeGoal = currentSession.goals.time;

    const lastCheckinTime = () => {
        if (currentSession.checkIns.length > 0) {
            return currentSession.checkIns[currentSession.checkIns.length - 1].time;
        }
        return currentSession.start;
    }

    useEffect(() => {
        const id = setInterval(() => {
            if (new Date().getTime() - lastCheckinTime() >= 1000 * 60 * CHECK_IN_FREQUENCY) {
                setShowCheckin(true);
            }
        }, 1000 * 5);
        return () => clearInterval(id);
    }, [currentSession]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Session in Progress</Text>

            <View style={styles.sessionInfoCard}>
                <Text style={styles.sessionInfoBody}>Your session started at {timeStr(currentSession.start)}</Text>
                {lastCheckinTime() !== currentSession.start && ( 
                <Text style={styles.sessionInfoBody}>Your last check-in was at {timeStr(lastCheckinTime())}</Text>
                )}
                <Text style={styles.sessionInfoBody}>Your goals are:</Text>
                {budgetGoal && (
                    <Text style={styles.sessionInfoBody}>Avoid spending more than ${budgetGoal}.</Text>
                )}
                {timeGoal && (
                    <Text style={styles.sessionInfoBody}>End your session by {timeStr(timeGoal)}.</Text>
                )}
            </View>

            {showCheckin && (
                <View style={styles.checkInCard}>
                    <Text style={styles.checkInTitle}>Check In</Text>
                    <Text style={styles.checkInDescription}>Take a second to reflect on how you're sticking to your goals:</Text>

                    <View style={styles.rating}>
                        <GoalRating goal={goalRating} setGoal={(rating) => setGoalRating(rating)} />
                    </View>
                    <Button title="Submit" onPress={() => {
                        const newSession = {
                            ...currentSession,
                            checkIns: [
                                ...currentSession.checkIns,
                                {
                                    time: new Date().getTime(),
                                    rating: goalRating,
                                }
                            ]
                        };
                        setShowCheckin(false);
                        scheduleRecurringCheckin();
                        dispatch(updateSession(newSession));
                    }} />
                </View>)}

            <Button title="End Session" onPress={() => {
                const newSession = {
                    ...currentSession,
                    state: SessionsState.Ending
                };
                dispatch(updateSession(newSession));
            }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    checkInCard: {
        width: '85%',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkInTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    checkInDescription: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '300',
        marginBottom: 10,
    },
    rating: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalSlider: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalSliderText: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sessionInfoCard: {
        width: '85%',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sessionInfoBody: {
        fontSize: 16,
        marginBottom: 10,
    },
    
});