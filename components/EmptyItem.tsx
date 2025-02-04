// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// icons
import EmptyIcon from '@/images/icons/Empty';

type Props = {
  text?: string[];
};

export function EmptyItem({ text }: Props) {
  const { i18n, t } = useTranslation();

  const defaultText = [t('My exhibition list does not exist,'), t('Please create a new exhibition.')];

  const displayText = text || defaultText;

  return (
    <EmptyBox>
      <EmptyIcon />
      <EmptyTxt>
        {displayText.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </EmptyTxt>
    </EmptyBox>
  );
}

const EmptyBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  text-align: center;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 5px;

  & svg {
    margin-bottom: 20px;
  }
`;

const EmptyTxt = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & p {
    font-size: 18px;
    font-weight: 500;
    color: #757575;
  }
`;
