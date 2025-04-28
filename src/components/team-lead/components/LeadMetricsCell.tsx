
interface LeadMetricsProps {
  income: string;
  debt: string;
  creditScore: string;
}

export const LeadMetricsCell = ({ income, debt, creditScore }: LeadMetricsProps) => {
  return (
    <div className="text-sm">
      <div>Income: {income}</div>
      <div>Debt: {debt}</div>
      <div>Credit: {creditScore}</div>
    </div>
  );
};
