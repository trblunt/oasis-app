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

import { cancelRecurringCheckin, cancelSessionReminders } from '../../util/notify';

import { timeStr } from '../../util/format';
import { useNavigation } from '@react-navigation/native';

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

const minusOneDay = (date) => {
    let newDate = new Date(date);
    newDate.setTime(newDate.getTime() - 24 * 60 * 60 * 1000);
    return newDate;
}

export default function EndSessionScreen() {
    const dispatch = useDispatch();
    const sessions = useSelector(selectSessions);
    const navigation = useNavigation();
    const currentSession = useSelector(selectCurrentSession);
    const [finalGoalRating, setFinalGoalRating] = useState(5);
    const [finalBudgetText, setFinalBudget] = useState(currentSession.goals.budget);
    const finalBudget = () => {
        let num = parseFloat(finalBudgetText);
        if (isNaN(num)) {
            return null;
        } else {
            return num;
        }
    }
    const [finalTime, setFinalTime] = useState(new Date());
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Session Retrospective</Text>
                <View style={styles.retrospective}>
                    <Text style={styles.retrospective_body}>Did you stick to your goals for this session?</Text>
                    <GoalRating goal={finalGoalRating} setGoal={setFinalGoalRating} />
                    {currentSession.goals.budget &&
                        (<View style={styles.goalContainer}><Text style={styles.retrospective_body}>How much money did you take out to gamble with this session?</Text>
                            <View style={styles.inline_input}>
                                <Text style={styles.retrospective_body}>$</Text>
                            <TextInput style={styles.input} onChangeText={setFinalBudget} value={finalBudgetText} keyboardType="numeric" />
                            </View></View>)
                    }
                    {currentSession.goals.time &&
                        (<View style={styles.goalContainer}><Text style={styles.retrospective_body}>What time did you stop gambling?</Text>
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
                        </View>)}
                </View>
                <View style={styles.buttonContainer}>
                    <Button title="Cancel" onPress={() => {
                        dispatch(updateSession({
                            ...currentSession,
                            state: SessionsState.Started
                        }));
                    }} />
                    <Button title="Confirm" onPress={() => {
                        cancelRecurringCheckin()
                        cancelSessionReminders()
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
                                budget: finalBudget(),
                                rating: finalGoalRating,
                            }
                        }));
                        navigation.navigate('History', {
                            screen: 'Past Session',
                            params: {
                                id: currentSession.id
                            }
                        });
                    }} disabled={
                        (finalBudget() == null && currentSession.goals.budget)
                    } />
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
    goalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    }
});
