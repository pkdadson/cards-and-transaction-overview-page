import styled from 'styled-components';
import type { Card } from '../types';

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
          <CardItem
            $color={card.color}
            $selected={card.id === selectedCardId}
            onClick={() => onSelect(card.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(card.id)}
            role="button"
            aria-pressed={card.id === selectedCardId}
            tabIndex={0}
          >
            <CardName>{card.description}</CardName>
            <CardId>{card.id}</CardId>
          </CardItem>
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

const CardItem = styled.div<{ $color: string; $selected: boolean }>`
  flex: 1;
  height: 160px;
  width: 240px;
  padding: 24px 36px;
  border-radius: 16px;
  background: ${({ $color }) => $color};
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: ${({ $selected }) => ($selected ? 1 : 0.75)};
  outline: none;

  &:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }
`;

const CardName = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const CardId = styled.span`
  font-size: 13px;
  opacity: 0.75;
`;
