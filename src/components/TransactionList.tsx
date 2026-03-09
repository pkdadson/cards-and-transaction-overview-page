import styled from 'styled-components';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  cardColor: string;
  filterAmount: string;
}

export function TransactionList({ transactions, cardColor, filterAmount }: Props) {
  const minAmount = filterAmount !== '' ? parseFloat(filterAmount) : null;

  const visible =
    minAmount !== null
      ? transactions.filter((t) => t.amount >= minAmount)
      : transactions;

  if (visible.length === 0) {
    return <Empty>No transactions match the current filter.</Empty>;
  }

  return (
    <List>
      {visible.map((tx) => (
        <Item key={tx.id} $accent={cardColor}>
          <span>{tx.description}</span>
          <Amount $negative={tx.amount < 0}>{formatAmount(tx.amount)}</Amount>
        </Item>
      ))}
    </List>
  );
}

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `−${abs}€` : `${abs}€`;
}

const List = styled.ul`
  list-style: none;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

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

const Amount = styled.span<{ $negative: boolean }>`
  font-weight: 600;
  color: ${({ $negative }) => ($negative ? '#c0392b' : 'inherit')};
`;

const Empty = styled.p`
  color: #aaa;
  font-size: 14px;
`;
