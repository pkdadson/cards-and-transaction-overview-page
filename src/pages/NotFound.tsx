import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { PATHS } from '@/routes/paths';

export function NotFound() {
  return (
    <Wrapper>
      <Code>404</Code>
      <Message>Page not found</Message>
      <HomeLink to={PATHS.home}>Go back home</HomeLink>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: sans-serif;
  gap: 12px;
`;

const Code = styled.h1`
  font-size: 72px;
  font-weight: 700;
  color: #ddd;
  margin: 0;
`;

const Message = styled.p`
  font-size: 18px;
  color: #999;
  margin: 0;
`;

const HomeLink = styled(Link)`
  font-size: 14px;
  color: #555;
  margin-top: 8px;
`;
