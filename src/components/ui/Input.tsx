import styled from 'styled-components';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function Input({ id, label, value, onChange, ...rest }: Props) {
  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      <StyledInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
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
  margin-bottom: 4px;
`;

const StyledInput = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  padding: 6px 24px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`;
