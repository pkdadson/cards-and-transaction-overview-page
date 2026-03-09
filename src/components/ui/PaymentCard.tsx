import styled from 'styled-components';

interface Props {
  name: string;
  cardId: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentCard({ name, cardId, color, selected, onSelect }: Props) {
  return (
    <Card
      $color={color}
      $selected={selected}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      role="button"
      aria-pressed={selected}
      tabIndex={0}
    >
      <Name>{name}</Name>
      <Id>{cardId}</Id>
    </Card>
  );
}

const Card = styled.div<{ $color: string; $selected: boolean }>`
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

const Name = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const Id = styled.span`
  font-size: 13px;
  opacity: 0.75;
`;
