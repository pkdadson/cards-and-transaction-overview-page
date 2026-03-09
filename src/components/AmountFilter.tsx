import styled from 'styled-components';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AmountFilter({ value, onChange }: Props) {
  return (
    <div>
      <Label htmlFor="amount-filter">Amount Filter</Label>
      <div>
        <Input
          id="amount-filter"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Amount"
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
}

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  padding: 10px;
`;

const Input = styled.input`
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
