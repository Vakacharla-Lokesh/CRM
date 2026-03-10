interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all ${
            index === currentStep
              ? "w-8 bg-blue-600"
              : index < currentStep
                ? "w-2 bg-blue-400"
                : "w-2 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
};
