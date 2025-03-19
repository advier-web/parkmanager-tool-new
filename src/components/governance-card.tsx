import { GovernanceModel } from '../domain/models';

interface GovernanceCardProps {
  model: GovernanceModel;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  isRecommended?: boolean;
  isCurrent?: boolean;
}

export function GovernanceCard({ model, isSelected, onSelect, isRecommended = false, isCurrent = false }: GovernanceCardProps) {
  return (
    <div
      className={`
        p-6 rounded-lg transition-all cursor-pointer relative
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
        ${isRecommended ? 'border-l-4 border-l-green-500' : ''}
        ${isCurrent ? 'border-r-4 border-r-purple-500' : ''}
      `}
      onClick={() => onSelect(model.id)}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Aanbevolen
          </span>
        </div>
      )}
      
      {isCurrent && (
        <div className="absolute top-0 right-0 mr-24">
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Huidige model
          </span>
        </div>
      )}
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="radio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            checked={isSelected}
            onChange={() => onSelect(model.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="ml-3 flex-grow">
          <h3 className="text-lg font-medium">{model.title}</h3>
          <p className="text-gray-600 mt-2 mb-4">{model.summary || model.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">Voordelen:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {model.advantages.map((advantage, index) => (
                  <li key={index}>{advantage}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Nadelen:</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {model.disadvantages.map((disadvantage, index) => (
                  <li key={index}>{disadvantage}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-1">Toepasselijke scenario&apos;s:</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {model.applicableScenarios.map((scenario, index) => (
                <li key={index}>{scenario}</li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {model.organizationalStructure && (
              <div>
                <span className="font-semibold">Organisatiestructuur:</span>{' '}
                <span className="text-gray-600">{model.organizationalStructure}</span>
              </div>
            )}
            
            {model.legalForm && (
              <div>
                <span className="font-semibold">Rechtsvorm:</span>{' '}
                <span className="text-gray-600">{model.legalForm}</span>
              </div>
            )}
          </div>
          
          {model.stakeholders && model.stakeholders.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-1">Belanghebbenden:</h4>
              <div className="flex flex-wrap gap-2">
                {model.stakeholders.map((stakeholder, index) => (
                  <span 
                    key={index}
                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 