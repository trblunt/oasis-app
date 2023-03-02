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
    Notifications.cancelScheduledNotificationAsync("check-in");
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
}

export function cancelRecurringCheckin() {
    Notifications.cancelScheduledNotificationAsync("check-in");
}