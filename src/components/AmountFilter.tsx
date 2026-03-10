import { Input } from '@/components/ui/Input';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AmountFilter({ value, onChange }: Props) {
  return (
    <Input
      id="amount-filter"
      label="Amount Filter"
      value={value}
      onChange={onChange}
      placeholder="Amount"
      type="number"
      inputMode="decimal"
      min="0"
      step="0.01"
    />
  );
}
