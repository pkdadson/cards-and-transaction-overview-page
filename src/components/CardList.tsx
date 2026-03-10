import styled from 'styled-components';
import { PaymentCard } from '@/components/ui/PaymentCard';
import type { Card } from '@/types';

interface Props {
  cards: Card[];
  selectedCardId: string | null;
  onSelect: (cardId: string) => void;
}

export function CardList({ cards, selectedCardId, onSelect }: Props) {
  return (
    <List>
      {cards.map((card) => (
        <li key={card.id}>
          <PaymentCard
            name={card.description}
            cardId={card.id}
            color={card.color}
            selected={card.id === selectedCardId}
            onSelect={() => onSelect(card.id)}
          />
        </li>
      ))}
    </List>
  );
}

const List = styled.ul`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
`;
