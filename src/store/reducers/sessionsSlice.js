import { createSlice } from '@reduxjs/toolkit';
import uuid from 'react-native-uuid';

const initialState = {
    history: [],
};

export const SessionsState = {
    Started: 'Started',
    Ending: 'Ending',
    Ended: 'Ended',
}

export const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        newSession: (state, action) => {
            state.history.push({
                id: uuid.v4(),
                goals: action.payload.goals || {},
                start: new Date().getTime(),
                end: null,
                checkIns: [],
                state: SessionsState.Started
            });
        },
        removeSession: (state, action) => {
            state.history = state.history.filter((session) => session.id !== action.payload);
        },
        updateSession: (state, action) => {
            state.history = state.history.map((session) => {
                if (session.id === action.payload.id) {
                    return action.payload;
                }
                return session;
            });
        },
        reset : (state) => initialState
    }
});

export const { newSession, removeSession, updateSession, reset } = sessionsSlice.actions;

export const selectSessions = (state) => state.sessions.history;

export const selectCurrentSession = (state) => {
    if (state.sessions.history.length > 0) {
        const lastSession = state.sessions.history[state.sessions.history.length - 1];
        if (lastSession.state != SessionsState.Ended) {
            return lastSession;
        }
    }
}

export default sessionsSlice.reducer;