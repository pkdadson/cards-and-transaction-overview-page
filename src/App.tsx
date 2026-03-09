import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CardList } from './components/CardList';
import { AmountFilter } from './components/AmountFilter';
import { TransactionList } from './components/TransactionList';
import { useGetCardsQuery, useGetTransactionsQuery } from './api/cardsApi';

function App() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [filterAmount, setFilterAmount] = useState('');

  const { data: cards = [], isLoading: cardsLoading } = useGetCardsQuery();
  const { data: transactions = [], isFetching: transactionsFetching } =
    useGetTransactionsQuery(selectedCardId ?? '', { skip: selectedCardId === null });

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
          <p aria-live="polite">Loading cards…</p>
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
            {transactionsFetching ? (
              <p>Loading transactions…</p>
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

export default App;
