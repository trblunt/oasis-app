import { useSelector } from "react-redux";
import {
    Button,
    View,
    Text,
    StyleSheet,
    useWindowDimensions
} from "react-native";
import { timeStr } from "../../util/format";
import { Decorator, Gradient } from "../../util/graph";
import { Grid, XAxis, YAxis, LineChart } from "react-native-svg-charts";


function BudgetGoalResult({session}) {
    console.log("sussy session 2", session)
    const { budget } = session.goals;
    if (!budget) {
        return null;
    }
    let resultLabel;
    if (parseFloat(session.results.budget) > parseFloat(budget)) {
        resultLabel = <Text style={styles.goalResultNegative}>exceeded</Text>;
    } else {
        resultLabel = <Text style={styles.goalResultPositive}>met</Text>;
    }
    return (
        <Text style={styles.goalResultBody}>You {resultLabel} your budget goal, spending ${session.results.budget}.</Text>
    );
}

function TimeGoalResult({session}) {
    const { time } = session.goals;
    if (!time) {
        return null;
    }
    let resultLabel;
    if (session.results.time > time) {
        resultLabel = <Text style={styles.goalResultNegative}>exceeded</Text>;
    } else {
        resultLabel = <Text style={styles.goalResultPositive}>met</Text>;
    }
    return (
        <Text style={styles.goalResultBody}>You {resultLabel} your time goal, ending at {timeStr(session.results.time)}.</Text>
    );
}

export default function PastSessionScreen({route, navigation}) {
    const { id: sessionId } = route.params;
    const session = useSelector(state => state.sessions.history.find(session => session.id == sessionId));
    const {width, height} = useWindowDimensions();
    const data = session.checkIns.map(checkIn => ({
        index: checkIn.time,
        value: checkIn.rating
    }));
    console.log("data", data)
    const contentInset = { top: 10, bottom: 10, left: 10, right: 10 }
    const xAxisHeight = 30
    const xLabel = (time) => timeStr(time)
    const yLabel = (rating) => `${rating}⭐`

    console.log("sussy session", session)
    return (
        <View style={styles.container}>
            <View style={styles.sessionInfoCard}>
                <Text style={styles.sessionInfoBody}>This session started at {timeStr(session.start)}</Text>
                <Text style={styles.sessionInfoBody}>Your goals were:</Text>
                {session.goals.time && (
                    <Text style={styles.sessionInfoBody}>End your session by {timeStr(session.goals.time)}.</Text>
                )}
                {session.goals.budget && (
                    <Text style={styles.sessionInfoBody}>Avoid spending more than ${session.goals.budget}.</Text>
                )}
            </View>
            <Text style={styles.title}>Results</Text>
            <View style={styles.resultsCard}>
                <BudgetGoalResult session={session} />
                <TimeGoalResult session={session} />
                <View style={{ width: width * 0.7, height: 150, flexDirection: 'row' }}>
                    <YAxis
                        data={data}
                        contentInset={contentInset}
                        style={{ marginBottom: xAxisHeight }}
                        svg={{
                            fill: 'grey',
                            fontSize: 10,
                        }}
                        numberOfTicks={5}
                        formatLabel={yLabel}
                        yAccessor={({ item }) => item.value}
                        min={1}
                        max={5}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <LineChart
                            style={{ flex: 1 }}
                            data={data}
                            svg={{ strokeWidth: 2, stroke: 'url(#gradient)' }}
                            contentInset={contentInset}
                            numberOfTicks={5}
                            xAccessor={({ item }) => item.index}
                            yAccessor={({ item }) => item.value}
                            yMin={1}
                            yMax={5}
                        >
                            <Grid />
                            <Gradient />
                            <Decorator />
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
            </View>
            <Button title="Back to History" onPress={() => navigation.goBack()} />
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
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        marginBottom: 20,
    },
    sessionInfoCard: {
        width: '85%',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    sessionInfoBody: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 10,
        textAlign: 'center',
    },
    resultsCard: {
        width: '85%',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    goalResultBody: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 10,
        textAlign: 'center',
    },
    goalResultPositive: {
        fontSize: 16,
        color: '#00FF00',
        marginBottom: 10,
    },
    goalResultNegative: {
        fontSize: 16,
        color: '#FF0000',
        marginBottom: 10,
    },
});
