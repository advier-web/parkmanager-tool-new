import { GovernanceModel } from '../domain/models';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { MarkdownContent, processMarkdownText } from './markdown-content';

interface GovernanceCardProps {
  model: GovernanceModel;
  isSelected: boolean;
  onSelect: (modelId: string) => void;
  isRecommended?: boolean;
  isConditionalRecommended?: boolean;
  isCurrent?: boolean;
  onMoreInfo?: (model: GovernanceModel) => void;
}

export function GovernanceCard({ 
  model, 
  isSelected, 
  onSelect, 
  isRecommended = false,
  isConditionalRecommended = false,
  isCurrent = false,
  onMoreInfo
}: GovernanceCardProps) {
  // Debug logging
  console.log(`[GOVERNANCE CARD] Rendering model: ${model.title} (ID: ${model.id})`);
  console.log('[GOVERNANCE CARD] Model properties:', {
    geenRechtsvorm: model.geenRechtsvorm,
    vereniging: model.vereniging,
    stichting: model.stichting,
    ondernemersBiz: model.ondernemersBiz,
    vastgoedBiz: model.vastgoedBiz,
    gemengdeBiz: model.gemengdeBiz,
    cooperatieUa: model.cooperatieUa,
    bv: model.bv,
    ondernemersfonds: model.ondernemersfonds
  });

  // Helper functie om de juiste rechtsvorm tekst te bepalen voor dit specifieke governance model
  const getRechtsvormText = () => {
    let matchSource = '';
    let matchValue = '';
    
    // Eerst controleren of er een expliciete legalForm in het model staat
    if (model.legalForm) {
      const legalForm = model.legalForm.toLowerCase();
      matchSource = 'legalForm';
      matchValue = model.legalForm;
      
      if (legalForm.includes('vereniging')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor vereniging`);
        return model.vereniging;
      } else if (legalForm.includes('stichting')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor stichting`);
        return model.stichting;
      } else if (legalForm.includes('ondernemers biz') || legalForm.includes('ondernemersbiz')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor ondernemersBiz`);
        return model.ondernemersBiz;
      } else if (legalForm.includes('vastgoed biz') || legalForm.includes('vastgoedbiz')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor vastgoedBiz`);
        return model.vastgoedBiz;
      } else if (legalForm.includes('gemengde biz') || legalForm.includes('gemengdebiz')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor gemengdeBiz`);
        return model.gemengdeBiz;
      } else if (legalForm.includes('coöperatie') || legalForm.includes('cooperatie')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor cooperatieUa`);
        return model.cooperatieUa;
      } else if (legalForm.includes('bv') || legalForm.includes('besloten vennootschap')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor bv`);
        return model.bv;
      } else if (legalForm.includes('ondernemersfonds')) {
        console.log(`[RECHTSVORM] Match gevonden in legalForm '${model.legalForm}' voor ondernemersfonds`);
        return model.ondernemersfonds;
      }
    }
    
    // Als er geen match is op legalForm, dan matchen op titel
    const title = model.title.toLowerCase();
    matchSource = 'title';
    matchValue = model.title;
    
    // Match op basis van de titel van het governance model
    if (title.includes('vereniging')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor vereniging`);
      return model.vereniging;
    } else if (title.includes('stichting')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor stichting`);
      return model.stichting;
    } else if (title.includes('ondernemers biz') || title.includes('ondernemersbiz')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor ondernemersBiz`);
      return model.ondernemersBiz;
    } else if (title.includes('vastgoed biz') || title.includes('vastgoedbiz')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor vastgoedBiz`);
      return model.vastgoedBiz;
    } else if (title.includes('gemengde biz') || title.includes('gemengdebiz')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor gemengdeBiz`);
      return model.gemengdeBiz;
    } else if (title.includes('coöperatie') || title.includes('cooperatie')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor cooperatieUa`);
      return model.cooperatieUa;
    } else if (title.includes('bv') || title.includes('besloten vennootschap')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor bv`);
      return model.bv;
    } else if (title.includes('ondernemersfonds')) {
      console.log(`[RECHTSVORM] Match gevonden in titel '${model.title}' voor ondernemersfonds`);
      return model.ondernemersfonds;
    } else {
      // Als er geen match is, toon dan de generieke "geen rechtsvorm" tekst
      console.log(`[RECHTSVORM] Geen match gevonden in ${matchSource} '${matchValue}', gebruik geenRechtsvorm`);
      return model.geenRechtsvorm;
    }
  };

  const rechtsvormText = getRechtsvormText();
  console.log(`[GOVERNANCE CARD] Rechtsvorm text voor ${model.title}: ${rechtsvormText || 'none'}`);

  return (
    <div
      className={`
        p-6 rounded-lg transition-all relative
        ${isSelected 
          ? 'bg-blue-50 border-2 border-blue-500 shadow-md' 
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
        }
        ${isRecommended ? 'border-l-4 border-l-green-500' : ''}
        ${isConditionalRecommended ? 'border-l-4 border-l-blue-500' : ''}
        ${isCurrent ? 'border-r-4 border-r-purple-500' : ''}
      `}
    >
      <div className="absolute top-0 right-0 flex">
        {isRecommended && !isConditionalRecommended && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md mr-1">
            Aanbevolen
          </span>
        )}
        
        {isConditionalRecommended && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md mr-1">
            Aanbevolen, mits...
          </span>
        )}
        
        {isCurrent && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-bl-md rounded-tr-md">
            Huidige model
          </span>
        )}
      </div>
      
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="radio"
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
            checked={isSelected}
            onChange={() => onSelect(model.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="ml-3 flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{model.title}</h3>
            
            {/* Select button for smaller screens */}
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className="md:hidden inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
          
          <div className="text-gray-600 mt-2 mb-4">
            <MarkdownContent content={processMarkdownText(model.summary || model.description)} />
            
            {rechtsvormText && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Details rechtsvorm</h4>
                <p className="text-sm text-gray-700">{rechtsvormText}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-3 border-t">
            {/* More info button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onMoreInfo) onMoreInfo(model);
              }}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Meer informatie
            </button>
            
            {/* Select button for larger screens */}
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className="hidden md:inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
            >
              {isSelected ? 'Geselecteerd' : 'Selecteren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 