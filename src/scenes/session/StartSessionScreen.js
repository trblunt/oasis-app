import {
    Button,
    StyleSheet,
    Text,
    TextInput,
    Switch,
    TouchableOpacity,
    View,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
    useSelector,
    useDispatch
} from 'react-redux';

import {
    useState,
    useRef
} from 'react';

import { FontAwesome } from '@expo/vector-icons'; 

import uuid from 'react-native-uuid';

import { newSession, selectCurrentSession } from '../../store/reducers/sessionsSlice';

import { scheduleRecurringCheckin, CHECK_IN_FREQUENCY, scheduleSessionReminders } from '../../util/notify';

const plusOneDay = (date) => {
    let newDate = new Date(date);
    newDate.setTime(newDate.getTime() + 24 * 60 * 60 * 1000);
    return newDate;
};


export default function StartSessionScreen({ navigation }) {

    const dispatch = useDispatch();

    const initialTimeGoal = () => {
        let goal = new Date();
        goal.setTime(goal.getTime() + 60 * 60 * 1000);
        return goal;
    };

    const [budgetText, setBudget] = useState(null);
    const budget = () => {
        let num = parseFloat(budgetText);
        if (isNaN(num)) {
            return null;
        }   
        return num;
    };

    const [time, setTime] = useState(initialTimeGoal());

    const timeToday = () => {
        let today = new Date();
        today.setHours(time.getHours());
        today.setMinutes(time.getMinutes());
        today.setSeconds(time.getSeconds());
        today.setMilliseconds(time.getMilliseconds());
        return today;
    };


    const [budgetEnabled, setBudgetEnabledImpl] = useState(true);
    const setBudgetEnabled = (value) => {
        if (!value) {
            setBudget(null);
        }
        setBudgetEnabledImpl(value);
    };
    
    const [timeEnabled, setTimeEnabled] = useState(true);

    const sessionGoals = () => {
        console.log("goals")
        console.log(time.getTime())
        console.log(new Date().getTime())
        let goals = {
            time: timeEnabled ? ((timeToday().getTime() > new Date().getTime()) ? timeToday().getTime() : plusOneDay(timeToday()).getTime()) + (60 * 1000) - 1 : null,
            budget: (budgetEnabled && budget()) ? budget() : null
        }
        console.log(goals)
        return goals
    };

    // Each goal should have a header, description, enable toggle, and a value input

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Let's set some goals for your session.</Text>
                <View style={styles.goal_container}>
                    <View style={styles.goal_top}>
                        <Text style={budgetEnabled ? styles.goal_header : styles.goal_header_disabled}>Budget Goal</Text>
                        <Switch
                            style={styles.goal_enable}
                            value={budgetEnabled}
                            onValueChange={() => setBudgetEnabled(!budgetEnabled)}
                        />
                    </View>
                    <View style={styles.goal_input}>
                        <FontAwesome name="dollar" size={24} color={budgetEnabled ? "black" : "#ccc"} style={{
                            marginRight: 15
                        }}/>
                        <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={budgetText}
                            onChangeText={setBudget}
                            style={{
                                fontSize: 24,
                            }}
                            editable={budgetEnabled}
                        />
                    </View>
                    <Text style={budgetEnabled ? styles.goal_description : styles.goal_description_disabled}>How much money you are willing to gamble with today?</Text>
                </View>
                <View style={styles.goal_container}>
                    <View style={styles.goal_top}>
                        <Text style={timeEnabled ? styles.goal_header : styles.goal_header_disabled}>Time Goal</Text>
                        <Switch
                            style={styles.goal_enable}
                            value={timeEnabled}
                            onValueChange={() => setTimeEnabled(!timeEnabled)}
                        />
                    </View>
                    <View style={styles.goal_input}>
                        <FontAwesome name="clock-o" size={24} color={timeEnabled ? "black" : "#ccc"} style={{
                            marginRight: 10
                        }} />
                        <DateTimePicker
                            value={time}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={(event, selectedDate) => {
                                const currentDate = selectedDate || time;
                                setTime(currentDate);
                            }}
                            disabled={!timeEnabled}
                        />
                    </View>
                    <Text style={timeEnabled ? styles.goal_description : styles.goal_description_disabled}>What time would you like to stop gambling by today?</Text>
                </View> 
                <Button
                    title="Start Session" 
                    disabled = {(sessionGoals().time === null || budgetEnabled) && sessionGoals().budget === null}
                    onPress={() => {
                        console.log(sessionGoals());
                        scheduleRecurringCheckin();
                        dispatch(
                            newSession({
                                goals: sessionGoals(),
                            })
                        )
                    }}
                />
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    goal_container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        width: '90%',
        borderRadius: 10,
        marginVertical: 10,
    },
    goal_top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    goal_header: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    goal_header_disabled: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ccc',
    },  
    goal_description: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '300',
    },
    goal_description_disabled: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '300',
        color: '#ccc',
    },
    goal_input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginVertical: 10,

    },
    goal_enable: {
        marginHorizontal: 10,
    }
});