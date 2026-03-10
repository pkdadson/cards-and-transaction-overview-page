import { useEffect } from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { PATHS } from '@/routes/paths';
import { CardList } from '@/components/CardList';
import { CardListSkeleton } from '@/components/ui/Skeleton';
import { useGetCardsQuery } from '@/api/cardsApi';
import { useAuth } from '@/auth/AuthContext';

export function HomePage() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data: cards = [], isLoading: cardsLoading } = useGetCardsQuery();

  useEffect(() => {
    if (cards.length > 0 && !cardId) {
      navigate(PATHS.card.to(cards[0].id), { replace: true });
    }
  }, [cards, cardId, navigate]);

  function handleCardSelect(id: string) {
    navigate(PATHS.card.to(id));
  }

  function handleLogout() {
    logout();
    navigate(PATHS.login, { replace: true });
  }

  return (
    <Page>
      <Header>
        <h1>Cards & Transactions</h1>
        <LogoutButton type="button" onClick={handleLogout}>Sign out</LogoutButton>
      </Header>

      <Section>
        {cardsLoading ? (
          <CardListSkeleton />
        ) : (
          <CardList cards={cards} selectedCardId={cardId ?? null} onSelect={handleCardSelect} />
        )}
      </Section>

      <Outlet />

      {!cardId && !cardsLoading && (
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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoutButton = styled.button`
  font-size: 12px;
  color: #888;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;

  &:hover {
    color: #333;
    border-color: #aaa;
  }
`;

const Section = styled.section`
  margin-top: 24px;
`;

const Hint = styled.p`
  color: #bbb;
  margin-top: 40px;
  text-align: center;
`;
