import styled from 'styled-components';
import { TransactionItem } from './ui/TransactionItem';
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
        <TransactionItem
          key={tx.id}
          description={tx.description}
          amount={tx.amount}
          accentColor={cardColor}
        />
      ))}
    </List>
  );
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

const Empty = styled.p`
  color: #aaa;
  font-size: 14px;
`;
