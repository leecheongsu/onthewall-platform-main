import React, { use, useEffect, useState } from 'react';

// lib
import { useLanguageStore } from '@/store/language';

// styled
import styled from '@emotion/styled';

type Props = {};

const menuList: any = [
  {
    title_kr: '신규 채널',
    title_en: 'New Channel',
    link: '/recent-channel',
  },
  {
    title_kr: '신규 전시',
    title_en: 'New exhibition',
    link: '/recent-exhibition',
  },
  {
    title_kr: '이 달의 인기 전시',
    title_en: 'Popular Exhibition',
    link: '/popular-exhibition?dueDate=monthly',
  },
  {
    title_kr: '플랜',
    title_en: 'Plan',
    link: 'https://onthewallservice.io/price',
  },
  {
    title_kr: '문의하기',
    title_en: 'Contact',
    link: 'https://onthewallservice.io/31',
  },
];

const Nav = (props: Props) => {
  const [menu, setMenu] = useState([]);
  const { language } = useLanguageStore();
  useEffect(() => {
    setMenu(menuList);
  }, []);
  return (
    <Container>
      {menu.map((item: any, index: number) => {
        return (
          <a href={item.link} key={index} target="_blank">
            {language === 'kr' ? item.title_kr : item.title_en}
          </a>
        );
      })}
    </Container>
  );
};

export default Nav;

const Container = styled.nav`
  display: none;
  a {
    color: #333;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    &:hover {
      color: #000;
    }
  }
`;
