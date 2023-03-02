import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    current_session: {
        budget: null,
        time_limit: null,
        win_threshold: null,
    },
    past_sessions: [],
    overall: {
        frequency: null,
        learning: null,
    },
    progress: {
        consistency: null,
        budget: null,
        time_limit: null,
        win_threshold: null,
        frequency: null,
        learning: null,
    }
}

export const goalsSlice = createSlice({
    name: "goals",
    initialState,
    reducers: {
        setSessionGoals: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state.current_session[key] = value;
            }
        },
        setFrequency: (state, action) => {
            state.overall.frequency = action.payload;
        },
        setLearning: (state, action) => {
            state.overall.learning = action.payload;
        },
        recordSession: (state, action) => {
            // TODO: Record session data in the progress object
        },
        reset: (state) => initialState
    }
});

export const { setSessionGoals, setFrequency, setLearning, recordSession, reset } = goalsSlice.actions;

export const selectPastSessions = (state) => state.goals.past_sessions;
export const selectSessionGoals = (state) => state.goals.current_session;
export const selectOverallGoals = (state) => state.goals.overall;
export const selectProgress = (state) => state.goals.progress;

export default goalsSlice.reducer;