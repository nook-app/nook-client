import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import drawerReducer from "./drawer";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    drawer: drawerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
