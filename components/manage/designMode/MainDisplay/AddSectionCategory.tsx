import React, { useEffect } from 'react';
import styled from '@emotion/styled';

// store
import { useUserStore } from '@/store/user';

type Props = {
  open: boolean;
  onClick: (value: string) => void;
  onClose?: () => void;
  idx?: number;
};

const SectionItems = [
  {
    label: 'Banner',
    value: 'Banner',
  },
  {
    label: 'Video',
    value: 'Video',
  },
  {
    label: 'Blank',
    value: 'Blank',
  },
  {
    label: 'Group Exhibition',
    value: 'GroupExhibition',
  },
];

function AddSectionCategory({ open, onClick, onClose, idx }: Props) {
  const superAdmin = useUserStore().status;

  const handleClickOutside = (e: any) => {
    if (e.target.closest('.add-section-category') === null) {
      onClose && onClose();
    }
  };
  useEffect(() => {
    if (open) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  if (!open) return <></>;
  return (
    <Container className="add-section-category">
      {SectionItems.map((item, index) => (
        <Item
          key={index}
          onClick={() => {
            onClick(item.value);
          }}
        >
          {item.label}
        </Item>
      ))}
    </Container>
  );
}

export default AddSectionCategory;

const Container = styled.div`
  width: 200px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
`;

const Item = styled.div`
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid #bababa;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;
