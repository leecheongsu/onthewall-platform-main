import React, { ChangeEvent, KeyboardEvent } from 'react';
import styled from '@emotion/styled';
import { useDesignStore } from '@/store/design';
import hexToRgba from '@/utils/hexToRgba';

interface FormInputProps {
  value: string;
  width?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  name: string;
  className?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  readonly?: boolean;
  help?: string;
  errText?: string;
  valid?: boolean;
  required?: boolean;
  customStyles?: string;
  maxLength?: number;
  disabled?: boolean;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  value,
  width,
  onChange,
  onBlur,
  onKeyDown,
  name,
  className,
  label,
  type,
  placeholder,
  readonly,
  required,
  customStyles,
  maxLength,
  disabled,
  helperText,
}) => {
  const { theme } = useDesignStore((state) => state);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <Container width={width} hasLabel={!!label}>
      {label && (
        <>
          <Label>
            {label}
            {required && <RedAsterisk>*</RedAsterisk>}
          </Label>
          {helperText && <Helper>{helperText}</Helper>}
        </>
      )}
      <StyledInput
        type={type || 'text'}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className || 'default'}
        readOnly={readonly}
        required={required}
        autoComplete={type !== 'password' ? undefined : 'true'}
        customStyles={customStyles}
        maxLength={maxLength}
        theme={theme}
        disabled={disabled}
      />
    </Container>
  );
};
export default React.memo(FormInput);

const Container = styled.div<{ width?: string; hasLabel?: boolean }>`
  width: ${({ width }) => width || '100%'};
  margin-bottom: ${({ hasLabel }) => (hasLabel ? '20px' : 0)};
  //margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const RedAsterisk = styled.span`
  color: red;
  margin-left: 2px;
`;

const StyledInput = styled.input<{ customStyles?: string; theme: any; disabled?: boolean }>`
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  border-radius: 5px;
  box-sizing: border-box;

  &.default {
    border: 1px solid transparent;
    background: #f1f4f9;
    color: #cbd4e1;
  }

  &.default::placeholder {
    color: #cbd4e1;
  }

  &.default:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => hexToRgba(theme.primary, 0.2)};
    background: white;
    color: black;
  }

  &.outlined {
    border: 1px solid #cbd4e1;
    background: white;
    color: ${({ disabled }) => (disabled ? '#cbd4e1' : 'black')};
  }

  &.outlined::placeholder {
    color: #cbd4e1;
  }

  &.outlined:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => hexToRgba(theme.primary, 0.2)};
  }

  &.error {
    border: 1px solid red;
    background-color: white;
    color: black;
  }

  &.no-margin {
    margin: 0;
  }

  ${(props) => props.customStyles}
`;

const Helper = styled.p`
  font-size: 12px;
  color: #7a7a7a;
  word-break: keep-all;
  word-wrap: break-word;
`;
