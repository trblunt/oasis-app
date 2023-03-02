// store/index.js
// React Redux

import {
    configureStore
} from '@reduxjs/toolkit';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';

import { combineReducers } from '@reduxjs/toolkit';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
}

import { createReduxMiddleware } from '@karmaniverous/serify-deserify';

const store = configureStore({
    reducer: reducer(),
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            }
        }),
        createReduxMiddleware()
    ]
});

let persistor = persistStore(store);

function reducer() {
    const newRootReducer = combineReducers(require('./reducers').default);
    return persistReducer(persistConfig, (state, action) => {
        return newRootReducer(state, action);
    });
}

if (module.hot) {
    module.hot.accept(() => {
        store.replaceReducer(
            reducer()
        );
    });
}

export {
    store,
    persistor
};