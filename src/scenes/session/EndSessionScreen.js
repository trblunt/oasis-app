import React, { useEffect, useState } from 'react';
import {
    Button,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
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

import DateTimePicker from '@react-native-community/datetimepicker';

import { AirbnbRating } from 'react-native-ratings';

import * as Notifications from 'expo-notifications';

import { cancelRecurringCheckin } from '../../util/notify';

import { timeStr } from '../../util/format';

function GoalRating({ goal, setGoal }) {
    return (
        <View style={styles.goalSlider}>
            <AirbnbRating
                count={5}
                reviews={["Not at all", "A little", "Somewhat", "Mostly", "Completely"]}
                defaultRating={3}
                onFinishRating={(rating) => setGoal(rating)}
            />
        </View>
    )
}

export default function EndSessionScreen({ navigation }) {
    const dispatch = useDispatch();
    const sessions = useSelector(selectSessions);
    const currentSession = useSelector(selectCurrentSession);
    const [finalGoalRating, setFinalGoalRating] = useState(3);
    const [finalBudget, setFinalBudget] = useState(currentSession.goals.budget);
    const [finalTime, setFinalTime] = useState(new Date());
    useEffect(() => {
        cancelRecurringCheckin();
    }, []);
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Session Retrospective</Text>
                <View style={styles.retrospective}>
                    <Text style={styles.retrospective_body}>How well do you think you did at sticking to your goals overall?</Text>
                    <GoalRating goal={finalGoalRating} setGoal={setFinalGoalRating} />
                    <Text style={styles.retrospective_body}>How much money did you take out to gamble with this session?</Text>
                    <View style={styles.inline_input}>
                        <Text style={styles.retrospective_body}>$</Text>
                        <TextInput style={styles.input} onChangeText={setFinalBudget} value={finalBudget} keyboardType="numeric" />
                    </View>
                    <Text style={styles.retrospective_body}>What time did you stop gambling?</Text>
                    <DateTimePicker
                        value={finalTime}
                        mode="time"
                        style={styles.timePicker}
                        is24Hour={false}
                        display="default"
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || finalTime;
                            setFinalTime(currentDate);
                        }}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <Button title="Cancel" onPress={() => {
                        dispatch(updateSession({
                            ...currentSession,
                            state: SessionsState.Started
                        }));
                    }} />
                    <Button title="Confirm" onPress={() => {
                        dispatch(updateSession({
                            ...currentSession,
                            state: SessionsState.Ended,
                            end: finalTime.getTime(),
                            checkIns: [
                                ...currentSession.checkIns,
                                {
                                    time: finalTime.getTime(),
                                    rating: finalGoalRating,
                                }
                            ],
                            results: {
                                time: finalTime.getTime(),
                                budget: finalBudget,
                                rating: finalGoalRating,
                            }
                        }));
                    }} />
                </View>
            </View>
        </TouchableWithoutFeedback>
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
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    retrospective: {
        width: '80%',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retrospective_body: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    goalSlider: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    inline_input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timePicker: {
        marginBottom: 20,
    },
    buttonContainer: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
