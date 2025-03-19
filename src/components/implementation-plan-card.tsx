import { ImplementationPlan } from '../domain/models';

interface ImplementationPlanCardProps {
  plan: ImplementationPlan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
}

export function ImplementationPlanCard({ plan, isSelected, onSelect }: ImplementationPlanCardProps) {
  return (
    <div
      className={`
        p-6 rounded-lg transition-all cursor-pointer 
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
      `}
      onClick={() => onSelect(plan.id)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="radio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            checked={isSelected}
            onChange={() => onSelect(plan.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="ml-3 flex-grow">
          <h3 className="text-lg font-medium">{plan.title}</h3>
          <p className="text-gray-600 mt-2 mb-4">{plan.description}</p>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Geschatte doorlooptijd:</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {plan.estimatedDuration}
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-2">Fasen:</h4>
            <div className="space-y-4">
              {plan.phases.map((phase, index) => (
                <div key={phase.id} className="border-l-2 border-blue-400 pl-4">
                  <div className="flex justify-between">
                    <h5 className="font-medium">
                      {index + 1}. {phase.title}
                    </h5>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                      {phase.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                  
                  {phase.tasks.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Belangrijkste taken:</span>
                      <ul className="text-xs text-gray-600 mt-1 list-disc pl-4">
                        {phase.tasks.slice(0, 2).map(task => (
                          <li key={task.id}>{task.title}</li>
                        ))}
                        {phase.tasks.length > 2 && (
                          <li className="text-gray-500 italic">
                            En {phase.tasks.length - 2} andere taken...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Benodigde middelen:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {plan.requiredResources.map((resource, index) => (
                  <li key={index}>{resource}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Succesfactoren:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {plan.keySuccessFactors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 