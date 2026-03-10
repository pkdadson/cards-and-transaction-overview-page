import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import { TransactionItem } from '@/components/ui/TransactionItem';
import type { Transaction } from '@/types';

const ITEM_HEIGHT = 60;
const ITEM_GAP = 16;
const ESTIMATED_SIZE = ITEM_HEIGHT + ITEM_GAP;
const SCROLL_CONTAINER_HEIGHT = 480;

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

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_SIZE,
    overscan: 5,
  });

  if (visible.length === 0) {
    return <Empty>No transactions match the current filter.</Empty>;
  }

  return (
    <ScrollContainer ref={scrollRef}>
      <VirtualTrack style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const tx = visible[virtualItem.index];
          return (
            <VirtualRow
              key={tx.id}
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <TransactionItem
                description={tx.description}
                amount={tx.amount}
                accentColor={cardColor}
              />
            </VirtualRow>
          );
        })}
      </VirtualTrack>
    </ScrollContainer>
  );
}

const Empty = styled.p`
  color: #aaa;
  font-size: 14px;
`;

const ScrollContainer = styled.div`
  height: ${SCROLL_CONTAINER_HEIGHT}px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const VirtualTrack = styled.div`
  position: relative;
  width: 100%;
`;

const VirtualRow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-bottom: ${ITEM_GAP}px;
  box-sizing: border-box;
`;
