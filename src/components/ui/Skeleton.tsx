import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Base = styled.div`
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s infinite ease-in-out;
  border-radius: 8px;
`;

const CardRow = styled.div`
  display: flex;
  gap: 24px;
`;

const CardBlock = styled(Base)`
  flex: 1;
  height: 160px;
  border-radius: 16px;
`;

const TransactionRow = styled(Base)`
  width: 100%;
  height: 60px;
  border-radius: 4px;
`;

const TransactionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export function CardListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <CardRow aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, i) => (
        <CardBlock key={i} />
      ))}
    </CardRow>
  );
}

export function TransactionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <TransactionStack aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionRow key={i} />
      ))}
    </TransactionStack>
  );
}
