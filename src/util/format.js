export function dateStr(time) {
    date = new Date();
    date.setTime(time)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function shortDateStr(time) {
    date = new Date();
    date.setTime(time)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeStr(time) {
    date = new Date();
    date.setTime(time)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}