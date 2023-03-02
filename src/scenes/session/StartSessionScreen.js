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

import { newSession } from '../../store/reducers/sessionsSlice';

export default function NewSessionScreen({ navigation }) {

    const dispatch = useDispatch();

    const initialTimeGoal = new Date();
    initialTimeGoal.setTime(initialTimeGoal.getTime() + 60 * 60 * 1000);

    const [budget, setBudget] = useState(null);
    const [time, setTime] = useState(initialTimeGoal);

    const [budgetEnabled, setBudgetEnabled] = useState(true);
    const [timeEnabled, setTimeEnabled] = useState(true);

    const sessionGoals = () => ({
        time: timeEnabled ? time.getTime() : null,
        budget: budgetEnabled ? budget : null
    });

    // Each goal should have a header, description, enable toggle, and a value input

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.title}>Let's set some goals for your session.</Text>
                <View style={styles.goal_container}>
                    <View style={styles.goal_top}>
                        <Text style={styles.goal_header}>Budget</Text>
                        <Switch
                            style={styles.goal_enable}
                            value={budgetEnabled}
                            onValueChange={() => setBudgetEnabled(!budgetEnabled)}
                        />
                    </View>
                    <View style={styles.goal_input}>
                        <FontAwesome name="dollar" size={24} color="black" style={{
                            marginRight: 10
                        }}/>
                        <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={budget}
                            onChangeText={setBudget}
                            style={{
                                fontSize: 24,
                            }}
                        />
                    </View>
                    <Text style={styles.goal_description}>Set a limit on how much money you are willing to gamble with today.</Text>
                </View>
                <View style={styles.goal_container}>
                    <View style={styles.goal_top}>
                        <Text style={styles.goal_header}>Time</Text>
                        <Switch
                            style={styles.goal_enable}
                            value={timeEnabled}
                            onValueChange={() => setTimeEnabled(!timeEnabled)}
                        />
                    </View>
                    <View style={styles.goal_input}>
                        <FontAwesome name="clock-o" size={24} color="black" style={{
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
                        />
                    </View>
                    <Text style={styles.goal_description}>Set a limit on how much time you are willing to spend gambling today.</Text>
                </View> 
                <Button
                    title="Start Session" 
                    onPress={() => {
                        console.log(sessionGoals());
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
    goal_description: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '300',
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