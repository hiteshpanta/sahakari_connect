import { configureStore } from "@reduxjs/toolkit";
import { mainApi } from "./mainApi";
import authReducer from "./authSlice";



export const store = configureStore({

    reducer: {
        auth: authReducer,

        [mainApi.reducerPath]: mainApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat([
            mainApi.middleware,
        ])

})