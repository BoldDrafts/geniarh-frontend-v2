// components/sections/SalarySection.tsx
import React from 'react';
import FormField from '../form/FormField';
import SalaryRange from '../form/SalaryRange';
import { Requirement } from '../../types/requirement';

interface SalarySectionProps {
  initialData?: Requirement;
}

const SalarySection: React.FC<SalarySectionProps> = ({ initialData }) => {
  return (
    <div className="col-span-full">
      <FormField label="Budget Range" required>
        <SalaryRange
          defaultMin={initialData?.salaryMin}
          defaultMax={initialData?.salaryMax}
          defaultCurrency={initialData?.salaryCurrency}
        />
      </FormField>
    </div>
  );
};

export default SalarySection;