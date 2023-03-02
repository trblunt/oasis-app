import { SessionsState } from "../store/reducers/sessionsSlice";
import { CHECK_IN_FREQUENCY } from "./notify";

export function isBudgetMet(session) {
    // Returns true if the user's budget was met, false otherwise, null if the session is still in progress
    if (session.state != SessionsState.Ended) {
        return null;
    }
    return session.goals.budget ? session.goals.budget >= session.results.budget : true;
}

export function isTimeMet(session) {
    // Returns true if the user's time was met, false otherwise, null if the session is still in progress
    if (session.state != SessionsState.Ended) {
        return null;
    }
    return session.goals.time ? session.goals.time >= session.results.time : true;
}

export function checkInConfidence(session) {
    const checkIns = session.checkIns.slice();
    checkIns.sort((a, b) => a.time - b.time);

    let weightedSum = 0;
    let weightSum = 0;

    // Calculate the weighted average confidence rating
    for (let i = 0; i < checkIns.length; i++) {
        const weight = i + 1; // Weight increases as check-ins get closer to the end
        weightedSum += checkIns[i].rating * weight;
        weightSum += weight;
    }

    const averageRating = weightedSum / weightSum;
    return averageRating / 5; // Normalize to range from 0 to 1
}

export function grade(session) {
    // Session's grade is based on the user's confidence in each check-in, as well as if they met their goals.

    if (session.state != SessionsState.Ended) {
        return null;
    }

    // Calculate the number of check-ins that should have occured along the session's duration
    const expectedCheckIns = Math.ceil((session.end - session.start) / ((CHECK_IN_FREQUENCY + 0.5) * 60 * 1000));

    console.log("expectedCheckIns: " + expectedCheckIns)

    // Calculate the number of check-ins that actually occured
    const actualCheckIns = session.checkIns.length;

    console.log("actualCheckIns: " + actualCheckIns)

    const checkInPercentage = Math.min(1.0, actualCheckIns / expectedCheckIns);

    console.log("checkInPercentage: " + checkInPercentage)

    // Calculate the average confidence rating of the check-ins, weighted towards the last occuring check-ins
    // Should be a number between 0 and 1
    // If there are no check-ins, the confidence rating is 0
    const theCheckInConfidence = checkInConfidence(session);

    console.log("theCheckInConfidence: " + theCheckInConfidence)
        
    // Calculate the percentage of goals that were met
    const wasBudgetMet = isBudgetMet(session);
    const wasTimeMet = isTimeMet(session);

    const goalPercentage = (wasBudgetMet + wasTimeMet) / 2;

    console.log("goalPercentage: " + goalPercentage)

    // Calculate the final grade
    const rawGrade = (checkInPercentage + theCheckInConfidence + goalPercentage) / 3;

    return rawGrade;

}

export function gradeEmoji(x) {
    // Grades are in the form of emojis, with the following meanings:

    // 1. Neutral face (🫤)
    // 2. Happy face (🙂)
    // 3. Grinning face (😀) 
    // 4. Grinning face with smiling eyes (😁)
    // 5. Trophy (🏆)
    let emojis = ["😕", "🙂", "😀", "😁", "🏆"];

    // If x is a number, treat it as a grade

    let theGrade;
    if (typeof x == "number") {
        theGrade = x;
    } else {
        theGrade = grade(x);
    }

    console.log(theGrade)

    if (theGrade == null) {
        // Return an emoji that represents the session being in progress (not part of the grade system)
        return "🤔";
    }

    // Calculate the index of the emoji to return
    const emojiIndex = Math.floor(theGrade * emojis.length);

    console.log(emojiIndex)

    return emojis[emojiIndex];
}
