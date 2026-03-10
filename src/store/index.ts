import { configureStore } from '@reduxjs/toolkit';
import { cardsApi } from '../api/cardsApi';

export function makeStore() {
  return configureStore({
    reducer: {
      [cardsApi.reducerPath]: cardsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(cardsApi.middleware),
  });
}

export const store = makeStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
