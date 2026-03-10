import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import cardsRaw from '@/data/cards.json';
import transactionsRaw from '@/data/transactions.json';
import type { Card, Transaction } from '@/types';

const CARD_COLORS: Record<string, string> = {
  'lkmfkl-mlfkm-dlkfm': '#2c3e50',
  'elek-n3lk-4m3lk4': '#1e6f5c',
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cardsApi = createApi({
  reducerPath: 'cardsApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getCards: builder.query<Card[], void>({
      queryFn: async () => {
        await pause(300);
        const cards: Card[] = cardsRaw.map((card) => ({
          ...card,
          color: CARD_COLORS[card.id] ?? '#555',
        }));
        return { data: cards };
      },
    }),

    getTransactions: builder.query<Transaction[], string>({
      queryFn: async (cardId) => {
        await pause(200);
        const all = transactionsRaw as Record<string, Transaction[]>;
        return { data: all[cardId] ?? [] };
      },
    }),
  }),
});

export const { useGetCardsQuery, useGetTransactionsQuery } = cardsApi;
