import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CardList } from '@/components/CardList';
import { AmountFilter } from '@/components/AmountFilter';
import { TransactionList } from '@/components/TransactionList';
import { CardListSkeleton, TransactionListSkeleton } from '@/components/ui/Skeleton';
import { useGetCardsQuery, useGetTransactionsQuery } from '@/api/cardsApi';

export function HomePage() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [filterAmount, setFilterAmount] = useState('');

  const { data: cards = [], isLoading: cardsLoading } = useGetCardsQuery();
  const {
    data: transactions = [],
    isFetching: txFetching,
    isError: txError,
    refetch: retryTx,
  } = useGetTransactionsQuery(selectedCardId ?? '', { skip: !selectedCardId });

  useEffect(() => {
    if (cards.length > 0 && selectedCardId === null) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  function handleCardSelect(cardId: string) {
    setSelectedCardId(cardId);
    setFilterAmount('');
  }

  return (
    <Page>
      <h1>Cards & Transactions</h1>

      <Section>
        {cardsLoading ? (
          <CardListSkeleton />
        ) : (
          <CardList cards={cards} selectedCardId={selectedCardId} onSelect={handleCardSelect} />
        )}
      </Section>

      {selectedCard && (
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
      )}

      {!selectedCard && !cardsLoading && (
        <Hint>Select a card to view its transactions.</Hint>
      )}
    </Page>
  );
}

const Page = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: sans-serif;
`;

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

const Hint = styled.p`
  color: #bbb;
  margin-top: 40px;
  text-align: center;
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
