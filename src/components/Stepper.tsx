import { Link, useLocation } from 'react-router-dom';
import './Stepper.css';

interface Step {
  id: string;
  label: string;
  path: string;
  disabled?: boolean;
}

interface StepperProps {
  steps: Step[];
}

export const Stepper = ({ steps }: StepperProps) => {
  const location = useLocation();

  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isActive = location.pathname === step.path;
        const isCompleted = !step.disabled && !isActive;

        return (
          <div key={step.id} className="stepper-item">
            {step.disabled ? (
              <div className={`stepper-link disabled ${isActive ? 'active' : ''}`}>
                <div className="stepper-number">{index + 1}</div>
                <span className="stepper-label">{step.label}</span>
              </div>
            ) : (
              <Link
                to={step.path}
                className={`stepper-link ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="stepper-number">
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className="stepper-label">{step.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};
