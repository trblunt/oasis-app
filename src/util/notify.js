import * as Notifications from 'expo-notifications';

export async function allowsNotificationsAsync() {
    const settings = await Notifications.getPermissionsAsync();
    return (
        settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
}

export let CHECK_IN_FREQUENCY = 10; // Minutes

export function scheduleRecurringCheckin() {
    // Maybe switch this to scheduling many single notifications instead of one recurring notification for sessions that have time goals
    cancelRecurringCheckin();
    Notifications.scheduleNotificationAsync({
        identifier: "check-in",
        content: {
            title: "Oasis Check-in",
            body: "Check in on your goals for this session."
        },
        trigger: {
            seconds: 60 * CHECK_IN_FREQUENCY,
            repeats: true,
        },
    });
    Notifications.setNotificationCategoryAsync("check-in", [], {
        allowAnnouncement: true,
        previewPlaceholder: "Check-In",
    });

}

const reminder_times = {
    30: "Remember: you should end your session in the next 30 minutes to stick to your time goal.",
    15: "Remember: you should end your session in the next 15 minutes to stick to your time goal.",
    10: "Remember: you should end your session in the next 10 minutes to stick to your time goal.",
    5: "Five minutes left! To stick to your time goal, you should end your session soon.",
    2: "Two minute warning! Make sure to check in with Oasis and end your session soon.",
    1: "One minute left! You can still make it to your time goal if you end your session now.",
    0: "Time's up! If you've already ended your session, remember to check in with Oasis and record your results.",
    '-5': "It's 5 minutes past your time goal. If you've already ended your session, remember to check in with Oasis and record your results.",
    '-10': "It's 10 minutes past your time goal. If you've already ended your session, remember to check in with Oasis and record your results.",
    '-15': "It's 15 minutes past your time goal. If you've already ended your session, remember to check in with Oasis and record your results.",
    '-30': "It's 30 minutes past your time goal. If you've already ended your session, remember to check in with Oasis and record your results.",
    '-60': "It's one hour past your time goal. If you've already ended your session, remember to check in with Oasis and record your results.",
    '-120': "If you've already ended your session, remember to check in with Oasis and record your results."
}

export function scheduleSessionReminders(session) {
    var { time } = session.goals;
    if (time) {
        for (let [minutes_before_end, message] of Object.entries(reminder_times)) {
            let time_before_end = parseInt(minutes_before_end) * 60 * 1000;
            let time_to_remind = time - time_before_end;
            if ((time_to_remind - new Date().getTime()) > (60 * 1000)) {
                Notifications.scheduleNotificationAsync({
                    identifier: `reminder-${minutes_before_end}`,
                    content: {
                        title: "Time Goal Reminder",
                        body: message,
                        summaryArgument: "Time Goal Reminders",
                    },
                    trigger: {
                        seconds: (time_to_remind - new Date().getTime()) / 1000,
                        repeats: false,
                    },
                });
                Notifications.setNotificationCategoryAsync(`reminder-${minutes_before_end}`, [], {
                    allowAnnouncement: true,
                    previewPlaceholder: "Reminder",
                });
            }
        }
    }
    console.log("Scheduled session reminders")
    Notifications.getAllScheduledNotificationsAsync().then(console.log);
}

export function cancelRecurringCheckin() {
    Notifications.cancelScheduledNotificationAsync("check-in");
}

export function cancelSessionReminders() {
    for (let minutes_before_end of Object.keys(reminder_times)) {
        Notifications.cancelScheduledNotificationAsync(`reminder-${minutes_before_end}`);
    }
}