import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectSessions, addSession, removeSession, reset, SessionsState } from '../../store/reducers/sessionsSlice';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { grade, gradeEmoji } from '../../util/sessionStats';
import { timeStr, dateStr, shortDateStr } from '../../util/format';
import { Decorator, Gradient } from '../../util/graph';

import { LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import seedrandom from 'seedrandom';

function timeRow(session) {
    if (session.end) {
        return `${timeStr(session.start)} - ${timeStr(session.end)}`;
    }
    return `${timeStr(session.start)} - Ongoing`;
}

function overviewBlurb() {
    let blurbs = [
        "Take control of your gambling habits and stay on track with Oasis.",
        "Don't let gambling control you - use Oasis to keep yourself in check.",
        "Moderation is key - let Oasis help you keep your gambling under control.",
        "Remember to be honest with yourself - acceptance paves the road to progress.",
        "Take charge of your gambling habits and stay accountable with Oasis.",
        "Small steps lead to big progress - let Oasis help you stay on track.",
        "Stay in control of your gambling and stay focused on your goals with Oasis.",
        "Keep your gambling in check and stay accountable to yourself with Oasis.",
        "Freedom from harmful gambling is possible with Oasis - let us help you get there.",
        "When emotions rise, take a deep breath and stay present in the moment.",
        "Make time for self-care and wellness alongside your gambling goals.",
        "Remember to take breaks and stay refreshed.",
        "Prioritize your mental health and well-being.",
        "Try to avoid gambling when you're feeling stressed or anxious."
    ];
    // Use the date as a seed for the random number generator

    const currentDate = new Date();
    var seed = currentDate.getTime();

    // Every 2 hours, the blurb will change
    seed = seed / 1000 / 60 / 60 / 2;
    seed = Math.floor(seed);
    let rng = seedrandom(seed);
    let index = Math.floor(rng() * blurbs.length);

    return blurbs[index];
}

function SessionRow({ session, navigation }) {
    console.log(session)
    var color = '#999'
    return (
        <TouchableOpacity 
            style={styles.sessionRow} 
            onPress={() => {
                if (session.item.state == SessionsState.Ended) {
                    navigation.navigate('Past Session', { id: session.item.id })
                } else {
                    navigation.navigate('Session')
                }
            }}
        >
            <FontAwesome5 name="dice" size={24} color={color} />
            <View style={styles.sessionRowDetails}>
                <Text style={styles.sessionRowDate}>{dateStr(session.item.start)}</Text>
                <Text style={styles.sessionRowTime}>{timeRow(session.item)}</Text>
            </View>
            <View style={{flex: 1}}></View>
            <Text style={styles.sessionRowEmoji}>{gradeEmoji(session.item)}</Text>
        </TouchableOpacity>
    );
}

function SessionRowSeparator() {
    return (
        <View style={styles.sessionRowSeparator} />
    );
}

function PerformanceGraph({sessions}) {
    const data = sessions
        .filter(session => session.state == SessionsState.Ended)
        .map((session, index) => ({
            index: index,
            time: session.start,
            value: grade(session),
        }))
    // Only show the last 8 sessions in the list
    data.splice(0, data.length - 8)
    const contentInset = { top: 10, bottom: 10, left: 10, right: 10 }
    const xAxisHeight = 30
    const xLabel = (index) => {
        let time = data[index].time
        let label = shortDateStr(time)
        return label
    }
    const yLabel = (grade) => {
        if (Math.round(grade * 10) % 2 == 1) {
            return gradeEmoji(grade)
        }
        return ''
    }

    const {height, width} = useWindowDimensions();

    return (
        <View style={{ width: width * 0.7, height: 150, flexDirection: 'row' }}>
            <YAxis
                data={ data }
                contentInset={ contentInset }
                style={{ marginBottom: xAxisHeight }}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
                numberOfTicks={ 10 }
                formatLabel={value => `${yLabel(value)}` }
                yAccessor={({ item }) => item.value}
                min={0}
                max={1}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <LineChart
                    style={{ flex: 1 }}
                    data={ data }
                    svg={{ strokeWidth: 2, stroke: 'url(#gradient)' }}
                    contentInset={ contentInset }
                    numberOfTicks={5}
                    xAccessor={({ item }) => item.index}
                    yAccessor={({ item }) => item.value}
                    yMin={0}
                    yMax={1}
                >
                    <Grid/>
                    <Gradient/>
                    <Decorator/>
                </LineChart>
                <XAxis
                    style={{ marginHorizontal: -10, height: xAxisHeight }}
                    labelStyle={styles.performanceXAxisLabel}
                    data={data}
                    formatLabel={xLabel}
                    contentInset={{ ...contentInset, left: contentInset.left + 10, right: contentInset.right + 10 }}
                    svg={{ fontSize: 8, fill: 'black' }}
                    xAccessor={({ item }) => item.index}
                />
            </View>

        </View>
    )
}

export default function HistoryScreen({navigation}) {
    const sessions = useSelector(selectSessions);
    const dispatch = useDispatch();

    const shouldShowGraph = () => {
        return sessions.filter(session => session.state == SessionsState.Ended).length > 0
    }

    const shouldShowPastSessions = () => {
        return sessions.length > 0
    }

    return (
        <View style={styles.container}>
            <View style={styles.overviewCard}>
                <Text style={styles.overviewCardHeader}>Progress</Text>
                <View style={styles.generalGradeGraph}>
                    {shouldShowGraph() ? (
                        <PerformanceGraph sessions={sessions} /> 
                    ) : (
                        <Text style={styles.noSessionsText}>Record a session to see your progress over time.</Text>
                    )}
                </View>
                <Text style={styles.overviewBlurb}>{overviewBlurb()}</Text>
            </View>
            {shouldShowPastSessions() && (
                <View style={styles.pastSessionsContainer}>
                    <Text style={styles.pastSessionsHeader}>Past Sessions</Text>
                    <FlatList 
                        data={sessions.slice().reverse()} 
                        style={styles.pastSessionsList}
                        renderItem={( session ) => SessionRow({ session, navigation })}
                        keyExtractor={session => session.id}
                        ItemSeparatorComponent={SessionRowSeparator}
                    />
                    <Text style={styles.pastSessionsFooter}>View details of previous sessions.</Text>
                </View>
            )}
            <View style={{flex: 1}}></View>
            <Button color="#FF0000" title="Reset All Data (Debug)" onPress={() => dispatch(reset())} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'start',
        paddingVertical: 20,
    },
    overviewCard: {
        width: '85%',
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewCardHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    innerOverview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    overviewBlurb: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    pastSessionsContainer: {
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
    },
    pastSessionsHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    pastSessionsFooter: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
    },
    pastSessionsList: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    sessionRow: {
        padding: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    sessionRowDetails: {
        marginLeft: 20,
    },
    sessionRowDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sessionRowTime: {
        fontSize: 12,
        color: '#999',
    },
    sessionRowSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: '#eee',
    },
    sessionRowEmoji: {
        fontSize: 24,
    },
    noSessionsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        fontWeight: 'light',
        marginBottom: 30,
    },
    generalGradeGraph: {
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
    },

});

