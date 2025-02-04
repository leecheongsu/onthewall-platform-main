import styled from '@emotion/styled';
export const Box = styled.div<{ mobileView?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? 'auto' : 'repeat(2, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 900px) {
    grid-template-columns: auto;
    gap: 10px;
  }
`;

export const Box2 = styled.div<{ mobileView?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 900px) {
    gap: 10px;
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const CardImage = styled.div<{ isHome?: boolean }>`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 0;
  padding-bottom: 70%;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  &:hover .share_btn,
  &:hover .card_txt {
    opacity: 1;
    transition: opacity 0.3s;
  }
  &:hover img.front_image {
    filter: ${(props) => (props.isHome ? 'brightness(0.7)' : 'brightness(0.4)')};
    transform: translate(-50%, -50%) scale(1.05);
    transition: transform 0.3s;
  }
  &.GalleryB_Big {
    padding-bottom: 71%;
  }
`;

export const CardThumb = styled.div<{ isHome?: boolean }>`
  & img.front_image {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(1);
    transition: transform 0.3s;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
    filter: ${(props) => (props.isHome ? 'brightness(0.7)' : 'brightness(1)')};
  }
`;

export const CardTitle = styled.div<{ mobileView?: boolean }>`
  color: #fff;
  max-width: 270px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${(props) => (props.mobileView ? '1rem' : '1.25rem')};
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const CardTxt = styled.div<{ isHome?: boolean }>`
  position: absolute;
  left: 15px;
  bottom: 15px;
  z-index: 1;
  width: calc(100% - 30px);
  opacity: ${(props) => (props.isHome ? '1' : '0')};
  @media (max-width: 768px) {
    left: 7px;
    bottom: 7px;
  }
`;

export const CardCountBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
  & img {
    filter: invert(1) brightness(300%);
  }
  @media (max-width: 768px) {
    & img {
      width: 12px;
      height: 12px;
    }
  }
`;

export const CardCount = styled.div`
  display: flex;
  align-items: center;
  & svg {
    color: #fff;
    width: 14px;
    line-height: 1.2;
  }
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

export const CardNum = styled.div`
  margin-left: 5px;
  color: #fff;
`;

export const ShareButton = styled.div<{ mobileView?: boolean; isHome?: boolean }>`
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 3;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 25px;
  border: 1px solid #fff;
  padding: ${(props) => (props.mobileView ? '5px' : '3px 10px')};
  opacity: ${(props) => (props.isHome ? '1' : '0')};
  gap: 5px;
  & span {
    color: #fff;
    font-size: 14px;
  }
  & img {
    width: 14px;
    filter: invert(1) brightness(300%);
  }
  @media (max-width: 768px) {
    right: 7px;
    top: 7px;
    padding: 3px;
    & img {
      width: 12px;
    }
    & span {
      display: none;
    }
  }
`;

export const InnerBox = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  @media (max-width: 768px) {
    gap: 10px;
  }
`;
