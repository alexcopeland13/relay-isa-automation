
interface ScoreCellProps {
  score: number;
}

export const QualificationScoreCell = ({ score }: ScoreCellProps) => {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-10 h-2 rounded-full ${
          score >= 70 ? 'bg-green-500' : 
          score >= 50 ? 'bg-yellow-500' : 
          'bg-red-500'
        }`} 
      />
      <span>{score}</span>
    </div>
  );
};
