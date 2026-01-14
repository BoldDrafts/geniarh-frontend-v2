// components/form/SalaryRange.tsx
import React from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { FORM_OPTIONS } from '../../constants/formConstants';

interface SalaryRangeProps {
  defaultMin?: number;
  defaultMax?: number;
  defaultCurrency?: string;
}

const SalaryRange: React.FC<SalaryRangeProps> = ({
  defaultMin,
  defaultMax,
  defaultCurrency = 'PEN'
}) => (
  <div className="flex space-x-2">
    <FormInput
      type="number"
      name="salaryMin"
      placeholder="Min"
      required
      defaultValue={defaultMin}
    />
    <FormInput
      type="number"
      name="salaryMax"
      placeholder="Max"
      required
      defaultValue={defaultMax}
    />
    <FormSelect
      name="salaryCurrency"
      defaultValue={defaultCurrency}
      options={FORM_OPTIONS.currencies}
      className="w-24"
    />
  </div>
);

export default SalaryRange;