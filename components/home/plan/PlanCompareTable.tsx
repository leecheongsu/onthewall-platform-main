import React, { useState } from 'react';
import Image from 'next/image';

// data
import TooltipData from '@/components/home/plan/Tooltip';

// style
import styled from '@emotion/styled';

// icons
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Info from '@/images/svg/Info.svg';
import CheckMark from '@/images/svg/Checkmark.svg';

// components
import Tooltip from '@/components/home/plan/Tooltip';

type Props = {
  category: string;
  items: {
    label: string;
    values: {
      Free: string | boolean;
      Personal: string | boolean;
      Business: string | boolean;
      Enterprise: string | boolean;
      API: string | boolean;
    };
  }[];
};

const CategoryTable = ({ category, items }: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isTooltip, setTooltip] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Tr>
        <Td colSpan={6} className="Category" onClick={handleToggle} isOpen={isOpen}>
          <div className="txt">
            {category}
            {category !== 'Exhibition' && category !== '전시' && (
              <TooltipBox
                onMouseEnter={() => setTooltip(true)}
                onMouseLeave={() => {
                  setTooltip(false);
                }}
              >
                <Image src={Info} alt="Info" />
                {isTooltip && <Tooltip category={category} />}
              </TooltipBox>
            )}

            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </div>
        </Td>
      </Tr>
      {isOpen &&
        items.map((item, index) => (
          <Tr key={index}>
            <Td className={`td-${index}`}>{item.label}</Td>
            <Td className={`td-${index}`}>
              {typeof item.values.Free === 'boolean' && item.values.Free ? (
                <Image src={CheckMark} alt="Check Mark" />
              ) : (
                item.values.Free
              )}
            </Td>
            <Td className={`td-${index}`}>
              {typeof item.values.Personal === 'boolean' && item.values.Personal ? (
                <Image src={CheckMark} alt="Check Mark" />
              ) : (
                item.values.Personal
              )}
            </Td>
            <Td className={`td-${index}`}>
              {typeof item.values.Business === 'boolean' && item.values.Business ? (
                <Image src={CheckMark} alt="Check Mark" />
              ) : (
                item.values.Business
              )}
            </Td>
            <Td className={`td-${index}`}>
              {typeof item.values.Enterprise === 'boolean' && item.values.Enterprise ? (
                <Image src={CheckMark} alt="Check Mark" />
              ) : (
                item.values.Enterprise
              )}
            </Td>
            <Td className={`td-${index}`}>
              {typeof item.values.API === 'boolean' && item.values.API ? (
                <Image src={CheckMark} alt="Check Mark" />
              ) : (
                item.values.API
              )}
            </Td>
          </Tr>
        ))}
    </>
  );
};

export default CategoryTable;

const Tr = styled.tr``;

const Td = styled.td<{ isOpen?: boolean }>`
  padding: 20px;
  text-align: center;
  border-top: 1px solid #94a3b8;
  & .txt {
    padding: 20px;
    margin-bottom: ${(props) => (props.isOpen ? '0' : '20px')};
    display: flex;
    align-items: flex-start;
    background: #dbe8ff;
    border-radius: 5px 5px 0 0;
    @media (max-width: 768px) {
      padding: 15px;
      font-size: 0.95rem;
    }
    & img {
      margin-left: 5px;
      cursor: pointer;
    }
    & svg {
      margin-left: auto;
      cursor: pointer;
    }
  }
  & > img {
    width: 28px;
    height: 28px;
    margin: auto;
  }
  &.Category {
    padding: 0;
    font-weight: 700;
    border-top: none;
    cursor: pointer;
  }
  &.td-0 {
    border-top: 0;
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
  &:first-child {
    text-align: left;
  }
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const TooltipBox = styled.span`
  position: relative;
`;
