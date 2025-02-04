'use client';
import Plan from '@/components/home/plan/Plan';

// style
import styled from '@emotion/styled';

function Page() {
  return (
    <Container>
      <Plan />
    </Container>
  );
}

export default Page;

const Container = styled.div`
  padding: 50px 0;
`;
