import styled from 'styled-components';

interface Props {
  description: string;
  amount: number;
  accentColor: string;
}

export function TransactionItem({ description, amount, accentColor }: Props) {
  return (
    <Item $accent={accentColor}>
      <Description>{description}</Description>
      <Amount $negative={amount < 0}>{formatAmount(amount)}</Amount>
    </Item>
  );
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `−${abs}€` : `${abs}€`;
}

const Item = styled.li<{ $accent: string }>`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  align-items: center;
  padding: 16px;
  border-left: 3px solid ${({ $accent }) => $accent};
  background: #fafafa;
  border-radius: 4px;
`;

const Description = styled.span`
  font-size: 15px;
  color: #333;
`;

const Amount = styled.span<{ $negative: boolean }>`
  font-weight: 600;
  color: ${({ $negative }) => ($negative ? '#c0392b' : 'inherit')};
`;
