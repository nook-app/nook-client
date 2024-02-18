import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import drawerReducer from "./drawer";
import contentReducer from "./content";
import userReducer from "./user";
import entityReducer from "./entity";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    drawer: drawerReducer,
    content: contentReducer,
    entities: entityReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: api,
      },
      serializableCheck: false,
    }).concat(api.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
