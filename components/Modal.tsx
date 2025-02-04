import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import CloseIcon from '@/images/icons/Close';
import Button from '@/components/Button';
import { useDesignStore } from '@/store/design';

interface ButtonProps {
  type?: string;
  title: string;
  className?: string;
  onClick: () => void;
  variant?: string;
}

interface ModalConfig {
  title?: string;
  content?: string;
  blindFilter?: boolean;
  backdropClick?: boolean;
  handleCenterButton?: ButtonProps;
  handleLeftButton?: ButtonProps;
  handleRightButton?: ButtonProps;
  customStyles?: string;
}

interface Props {
  state: boolean;
  size?: string;
  setState: () => void;
  modalConf: ModalConfig;
  children?: ReactNode;
}

const ModalBox: React.FC<Props> = ({ state = false, size, setState, modalConf, children }) => {
  const {
    title,
    content,
    blindFilter,
    backdropClick,
    handleCenterButton,
    handleLeftButton,
    handleRightButton,
    customStyles,
  } = modalConf;

  const color = useDesignStore((state) => state.theme);

  const renderButton = (buttonProps?: ButtonProps) => {
    if (!buttonProps) return null;
    const { title, onClick, type, className, variant } = buttonProps;
    return (
      <Button type={type} className={className} onClick={onClick} variant={variant ?? 'contained'}>
        {title}
      </Button>
    );
  };

  const renderCloseButton = () => (
    <CloseButton type="button" onClick={setState}>
      <CloseIcon />
    </CloseButton>
  );

  return (
    <>
      {state && (
        <>
          {blindFilter && <BlindFilter onClick={backdropClick ? setState : () => {}} />}
          <ModalContainer className={size ? size : 'lg'}>
            {renderCloseButton()}
            <ModalContentBox customStyles={customStyles ?? ''}>
              <ModalTitle>{title}</ModalTitle>
              <ModalContent dangerouslySetInnerHTML={{ __html: content || '' }} />
              <ModalChild>{children}</ModalChild>
              <ModalButtonBox className={handleCenterButton ? 'single' : 'multi'} color={color.primary}>
                {renderButton(handleCenterButton)}
                {renderButton(handleLeftButton)}
                {renderButton(handleRightButton)}
              </ModalButtonBox>
            </ModalContentBox>
          </ModalContainer>
        </>
      )}
    </>
  );
};

export default ModalBox;

const ModalContainer = styled.div`
  min-height: 360px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  z-index: 2000;

  &.md {
    width: 400px;
  }

  &.lg {
    width: 560px;
  }
`;

const BlindFilter = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1999;
`;

const ModalContentBox = styled.div<{ customStyles: string }>`
  width: 100%;
  height: 100%;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  ${(props) => props.customStyles};
`;

const ModalTitle = styled.p`
  color: #1e2a3b;
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  padding-top: 0.25rem;
  padding-bottom: 1.25rem;
`;

const ModalContent = styled.p`
  text-align: center;
`;

const ModalChild = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalButtonBox = styled.div<{ color?: any }>`
  display: flex;
  width: 100%;

  &.single {
    justify-content: center;
    max-width: 350px;
  }

  &.multi {
    justify-content: center;
    gap: 10px;
  }

  button {
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    background-color: ${(props) => props.color};
    border: 1px solid ${(props) => props.color};
    color: #fff;
    &:hover {
      background-color: ${(props) => props.color};
      border: 1px solid ${(props) => props.color};
      color: #fff;
      filter: brightness(0.9);
    }
  }
`;

const CloseButton = styled.button`
  width: 25px;
  height: 25px;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1001;
  background: none;
  border: none;
  cursor: pointer;
`;
