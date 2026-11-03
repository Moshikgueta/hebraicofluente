import { PLAN_LABEL } from '@/lib/labels';

export function PlanOptions() {
  return (
    <>
      {Object.entries(PLAN_LABEL).map(([id, label]) => (
        <option key={id} value={id}>
          {label}
        </option>
      ))}
    </>
  );
}
