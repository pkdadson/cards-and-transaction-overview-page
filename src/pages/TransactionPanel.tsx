import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AmountFilter } from '@/components/AmountFilter';
import { TransactionList } from '@/components/TransactionList';
import { TransactionListSkeleton } from '@/components/ui/Skeleton';
import { useGetCardsQuery, useGetTransactionsQuery } from '@/api/cardsApi';

export function TransactionPanel() {
  const { cardId } = useParams<{ cardId: string }>();
  const [filterAmount, setFilterAmount] = useState('');

  const { data: cards = [] } = useGetCardsQuery();
  const {
    data: transactions = [],
    isFetching: txFetching,
    isError: txError,
    refetch: retryTx,
  } = useGetTransactionsQuery(cardId ?? '', { skip: !cardId });

  const selectedCard = cards.find((c) => c.id === cardId) ?? null;

  if (!selectedCard) return null;

  return (
    <>
      <Section>
        <AmountFilter value={filterAmount} onChange={setFilterAmount} />
      </Section>

      <Section aria-live="polite" aria-label={`Transactions for ${selectedCard.description}`}>
        <SectionHeading $color={selectedCard.color}>
          {selectedCard.description}
        </SectionHeading>
        {txFetching ? (
          <TransactionListSkeleton />
        ) : txError ? (
          <TxErrorState>
            <p>Failed to load transactions.</p>
            <RetryButton type="button" onClick={retryTx}>Try again</RetryButton>
          </TxErrorState>
        ) : (
          <TransactionList
            transactions={transactions}
            cardColor={selectedCard.color}
            filterAmount={filterAmount}
          />
        )}
      </Section>
    </>
  );
}

const Section = styled.section`
  margin-top: 24px;
`;

const SectionHeading = styled.h2<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ $color }) => $color};
  margin: 0 0 12px;
`;

const TxErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  color: #c0392b;
  font-size: 14px;
`;

const RetryButton = styled.button`
  font-size: 13px;
  color: #555;
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;
