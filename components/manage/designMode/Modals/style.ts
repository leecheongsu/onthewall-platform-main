import styled from '@emotion/styled';

export const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 700px;
  max-height: 95vh;
  overflow-y: auto;
  background-color: #fff;
  padding: 40px;
  border-radius: 5px;
  &.Exhibition {
    min-width: 80vw;
  }
  &.External {
    min-width: 30vw;
  }
`;

export const Title = styled.h2`
  font-size: 1.55rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  flex: 1;
  &.column {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    flex: 2;
  }
  & img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  gap: 10px;
  &.Buttons {
    padding: 0;
    margin-top: 30px;
  }
  &.list {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Label = styled.span`
  width: 100px;
  line-height: 1;
  font-size: 0.9rem;
  & span {
    color: red;
  }
`;

export const Value = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
  & .MuiInputBase-root {
    height: 100%;
  }
  &.list {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    min-height: 90px;
    max-height: 125px;
    overflow-y: auto;
    flex-direction: column;
  }
  &.channel {
    max-height: 300px;
    overflow-y: auto;
    padding: 10px 0;
  }
  &.channel .MuiFormGroup-root {
    gap: 7px;
  }
  &.channel .MuiFormControlLabel-root {
    border: 1px solid #ccc;
    margin: 0;
    padding-right: 16px;
    border-radius: 4px;
  }
`;

export const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

export const Check = styled.div`
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;
