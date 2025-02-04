import React from 'react';
import Image from 'next/image';

// style
import styled from '@emotion/styled';

// mui
import Modal from '@mui/material/Modal';

// icons
import Close from '@mui/icons-material/Close';

// components
import Plan from '@/components/home/plan/Plan';

type Props = {
  open: boolean;
  onClose: () => void;
};

const PlanModal = ({ open, onClose }: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Box>
          <Close className="close_btn" onClick={onClose} />
          <Plan isModal={true} />
        </Box>
      </>
    </Modal>
  );
};

export default PlanModal;

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 90vh;
  max-width: 1200px;
  padding: 35px;
  margin: auto;
  border-radius: 10px;
  background-color: white;
  & svg.close_btn {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
  }
`;
