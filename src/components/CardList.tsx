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
        <CardItem
          key={card.id}
          $color={card.color}
          $selected={card.id === selectedCardId}
          onClick={() => onSelect(card.id)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(card.id)}
          role="button"
          aria-pressed={card.id === selectedCardId}
          tabIndex={0}
        >
          <CardName>{card.description}</CardName>
          <CardId>{card.id}</CardId>
        </CardItem>
      ))}
    </List>
  );
}

const List = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  `;
  
  const CardItem = styled.div<{ $color: string; $selected: boolean }>`
  flex: 1;
  height: 160px;
  padding: 24px 36px;
  border-radius: 16px;
  background: ${({ $color }) => $color};
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: ${({ $selected }) => ($selected ? 1 : 0.55)};
  outline: none;

  &:focus-visible {
    outline: 2px solid ${({ $color }) => $color};
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
