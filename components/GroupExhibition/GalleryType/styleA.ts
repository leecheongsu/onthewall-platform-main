import styled from '@emotion/styled';

export const CardImage = styled.div<{ mobileView?: boolean }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 0;
  padding-bottom: 70%;
  margin-bottom: ${(props) => (props.mobileView ? '10px' : '15px')};
  border-radius: 5px;
  cursor: pointer;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const CardThumb = styled.div`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s;
  & img.back_image {
    background-size: cover;
    background-position: center;
    filter: blur(5px);
    transform: scale(1.05);
    position: absolute;
    object-fit: cover;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  & img.front_image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(1);
    width: 100%;
    z-index: 1;
    &:hover {
      transform: translate(-50%, -50%) scale(1.05);
      transition: all 0.3s;
    }
    &.EmptyImage {
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const CardTit = styled.div<{ mobileView?: boolean }>`
  letter-spacing: -1px;
  font-weight: 700;
  color: #212121;
  font-size: ${(props) => (props.mobileView ? '1rem' : '1.25rem')};
  max-width: 270px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

export const CardCount = styled.div`
  display: flex;
  align-items: center;
  & svg {
    color: #64748b;
    width: 14px;
    line-height: 1.2;
  }
`;

export const CardNum = styled.span`
  margin-left: 5px;
  color: #64748b;
  font-size: 14px;
`;

export const CardCountBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  margin-bottom: 15px;
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

export const ShareButton = styled.div<{ mobileView?: boolean }>`
  min-width: ${(props) => (props.mobileView ? 'auto' : '65px')};
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: ${(props) => (props.mobileView ? '5px' : '3px 10px')};
  gap: 5px;
  cursor: pointer;
  & span {
    font-size: 14px;
    color: #64748b;
    word-break: keep-all;
  }
  & img {
    width: 14px;
  }
  /* @media (max-width: 768px) {
    & span {
      font-size: 12px;
      color: #64748b;
    }
    & img {
      width: 12px;
      margin-left: -5px;
    }
  } */
  @media (max-width: 768px) {
    gap: 0px;
    width: 20px;
    min-width: 30px;
    padding: 5px;
    & span {
      font-size: 10px;
      color: #64748b;
      display: none;
    }
    & img {
      width: 18px;
      height: 18px;
      /* margin-left: -5px; */
      margin-left: -1px;
    }
  }
`;

export const CardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 10px;
`;
