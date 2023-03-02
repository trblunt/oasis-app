import sessionsSlice from "./sessionsSlice";
import goalsSlice from "./goalsSlice";

const rootReducer = {
    sessions: sessionsSlice,
    goals: goalsSlice
};

const reset = (state) => {
    sessionsSlice.reset(state.sessions);
    goalsSlice.reset(state.goals);
}

export default rootReducer;

export { reset };