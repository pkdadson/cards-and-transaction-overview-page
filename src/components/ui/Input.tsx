import styled from 'styled-components';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  min?: string;
  step?: string;
}

export function Input({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  min,
  step,
}: Props) {
  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      <StyledInput
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  padding: 10px;
`;

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  max-width: 680px;
  height: 40px;
  padding: 6px 24px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;
