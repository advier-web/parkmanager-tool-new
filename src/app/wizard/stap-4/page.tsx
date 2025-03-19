'use client';

import { useGovernanceModels, useMobilitySolutions } from '../../../hooks/use-domain-models';
import { useWizardStore } from '../../../lib/store';
import { WizardNavigation } from '../../../components/wizard-navigation';
import { BiTimeFive, BiLinkExternal, BiFile, BiCheckShield, BiListCheck, BiTask, BiInfoCircle } from 'react-icons/bi';
import ReactMarkdown from 'react-markdown';

// Helper function to safely render Contentful data
function safeRenderContentfulField(field: any): React.ReactNode {
  if (field === null || field === undefined) {
    return null;
  }
  
  if (typeof field === 'string') {
    return field;
  }
  
  if (Array.isArray(field)) {
    return field.map((item, index) => (
      <li key={index}>{safeRenderContentfulField(item)}</li>
    ));
  }
  
  if (typeof field === 'object') {
    // Handle Contentful reference
    if (field.sys && field.fields) {
      return field.fields.title || field.fields.name || JSON.stringify(field);
    }
    
    return JSON.stringify(field);
  }
  
  return String(field);
}

// Component to render markdown content
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-blue max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

// Helper to check if a field is a non-empty array
function isNonEmptyArray(field: any): boolean {
  return Array.isArray(field) && field.length > 0;
}

export default function ImplementationPlanPage() {
  const { data: governanceModels, isLoading: isLoadingModels, error: modelsError } = useGovernanceModels();
  const { data: mobilitySolutions, isLoading: isLoadingSolutions, error: solutionsError } = useMobilitySolutions();
  
  const { 
    selectedGovernanceModel,
    selectedSolutions
  } = useWizardStore();
  
  // Get selected governance model data
  const selectedGovernanceModelData = governanceModels && selectedGovernanceModel
    ? governanceModels.find(model => model.id === selectedGovernanceModel)
    : null;
    
  // Get selected solutions data
  const selectedSolutionsData = mobilitySolutions
    ? mobilitySolutions.filter(solution => selectedSolutions.includes(solution.id))
    : [];
    
  const isLoading = isLoadingModels || isLoadingSolutions;
  const error = modelsError || solutionsError;
  
  // Function to safely render links
  const renderLink = (link: any, index: number) => {
    let url = '#';
    let text = 'Link';
    
    console.log('Processing link:', link);

    if (typeof link === 'string') {
      url = link;
      text = link;
    } else if (link && typeof link === 'object') {
      // Case 1: Standard Contentful entry with fields
      if (link.fields) {
        text = link.fields.title || link.fields.name || 'Link';
        
        // Check if it's a file asset
        if (link.fields.file && link.fields.file.url) {
          // Contentful assets need https: prepended to URLs if they don't have it
          const fileUrl = link.fields.file.url;
          url = fileUrl.startsWith('//') ? `https:${fileUrl}` : fileUrl;
          console.log('File asset URL:', url);
        } else if (link.fields.url) {
          // Regular URL field
          url = link.fields.url;
          console.log('URL field:', url);
        } else if (link.fields.uri) {
          // Try URI field as fallback
          url = link.fields.uri;
          console.log('URI field:', url);
        }
      } 
      // Case 2: It's a direct reference without fields expanded
      else if (link.sys && link.sys.id) {
        text = link.sys.id;
        url = '#';
        console.log('Reference ID found:', link.sys.id);
      }
      // Case 3: It might be a rich text node with a URL
      else if (link.data && link.data.uri) {
        url = link.data.uri;
        text = link.content?.[0]?.value || url;
      }
      // Case 4: It might be an embedded asset
      else if (link.data && link.data.target && link.data.target.sys && link.data.target.sys.linkType === 'Asset') {
        text = 'Embedded Asset';
        url = `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/assets/${link.data.target.sys.id}`;
      }
    }
    
    console.log('Link processed:', { processedUrl: url, displayText: text });
    
    return (
      <li key={index}>
        <a href={url} 
           target="_blank" 
           rel="noopener noreferrer" 
           className="text-blue-600 hover:underline">
          {text}
        </a>
      </li>
    );
  };
  
  // Function to safely render benodigdhedenOprichting
  const renderBenodigdheid = (item: any, index: number) => {
    let text = '';
    
    console.log('Rendering benodigdheid item:', item);

    if (typeof item === 'string') {
      text = item;
    } else if (item && typeof item === 'object') {
      if (item.fields) {
        text = item.fields.title || item.fields.name || item.fields.value || JSON.stringify(item);
      } else if (item.content) {
        // Handle rich text content format
        text = item.content?.map((c: any) => c.content?.[0]?.value || '').join(' ');
      } else if (item.nodeType === 'document' && Array.isArray(item.content)) {
        // Another rich text format
        text = 'Rich text content'; // Use a placeholder for rich text
      } else {
        text = JSON.stringify(item);
      }
    } else {
      text = String(item);
    }
    
    return <li key={index}>{text}</li>;
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Stap 4: Implementatieplan</h2>
        <p className="mb-6">
          Op basis van uw gekozen mobiliteitsoplossingen en governance model is een implementatieplan opgesteld.
          Dit plan biedt richtlijnen voor het implementeren van de gekozen oplossingen en bestuursmodel.
        </p>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Implementatieplan wordt geladen...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600">Er is een fout opgetreden bij het laden van het implementatieplan.</p>
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="space-y-8">
            {/* Context van eerdere keuzes */}
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="text-md font-semibold mb-2">Uw keuzes</h3>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium">Governance model:</h4>
                {selectedGovernanceModelData ? (
                  <p className="text-blue-800">{selectedGovernanceModelData.title}</p>
                ) : (
                  <p className="text-gray-500 italic">Geen governance model geselecteerd</p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Geselecteerde mobiliteitsoplossingen:</h4>
                {selectedSolutionsData.length > 0 ? (
                  <ul className="list-disc pl-5 text-blue-800">
                    {selectedSolutionsData.map(solution => (
                      <li key={solution.id}>{solution.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">Geen mobiliteitsoplossingen geselecteerd</p>
                )}
              </div>
            </div>
            
            {/* Implementatieplan voor bestuursmodel */}
            {selectedGovernanceModelData && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Implementatieplan bestuursmodel</h3>
                
                {/* Debug info - remove in production */}
                <div className="mb-4 bg-gray-100 p-4 rounded text-xs" style={{ display: true ? 'block' : 'none' }}>
                  <h5 className="font-bold">Debug Info (always visible for troubleshooting)</h5>
                  <p>Links:</p>
                  <pre>{JSON.stringify({ 
                    hasLinks: !!selectedGovernanceModelData.links,
                    linksType: selectedGovernanceModelData.links ? typeof selectedGovernanceModelData.links : 'undefined',
                    isArray: Array.isArray(selectedGovernanceModelData.links),
                    length: selectedGovernanceModelData.links ? selectedGovernanceModelData.links.length : 0,
                    linksData: selectedGovernanceModelData.links
                  }, null, 2)}</pre>
                  
                  <p className="mt-2">Benodigdheden:</p>
                  <pre>{JSON.stringify({ 
                    hasBenodigdheden: !!selectedGovernanceModelData.benodigdhedenOprichting,
                    benodigdhedenType: selectedGovernanceModelData.benodigdhedenOprichting 
                      ? typeof selectedGovernanceModelData.benodigdhedenOprichting 
                      : 'undefined',
                    isArray: Array.isArray(selectedGovernanceModelData.benodigdhedenOprichting),
                    length: selectedGovernanceModelData.benodigdhedenOprichting 
                      ? (Array.isArray(selectedGovernanceModelData.benodigdhedenOprichting) 
                        ? selectedGovernanceModelData.benodigdhedenOprichting.length 
                        : 'not an array') 
                      : 0,
                    benodigdhedenData: selectedGovernanceModelData.benodigdhedenOprichting
                  }, null, 2)}</pre>
                </div>
                
                {/* Samenvatting */}
                {selectedGovernanceModelData.samenvatting && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiInfoCircle className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Samenvatting</h4>
                    </div>
                    <div className="text-gray-700 pl-7">
                      <MarkdownContent content={selectedGovernanceModelData.samenvatting} />
                    </div>
                  </div>
                )}
                
                {/* Aansprakelijkheid */}
                {selectedGovernanceModelData.aansprakelijkheid && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiCheckShield className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Aansprakelijkheid</h4>
                    </div>
                    <div className="text-gray-700 pl-7">
                      <MarkdownContent content={selectedGovernanceModelData.aansprakelijkheid} />
                    </div>
                  </div>
                )}
                
                {/* Benodigdheden Oprichting */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <BiListCheck className="text-blue-600 text-xl mr-2" />
                    <h4 className="text-lg font-semibold">Benodigdheden voor oprichting</h4>
                  </div>
                  
                  {/* Direct rendering for rich text content */}
                  {selectedGovernanceModelData.benodigdhedenOprichting ? (
                    typeof selectedGovernanceModelData.benodigdhedenOprichting === 'string' ? (
                      <div className="text-gray-700 pl-7">
                        <MarkdownContent content={selectedGovernanceModelData.benodigdhedenOprichting} />
                      </div>
                    ) : (
                      <div className="text-gray-700 pl-7">
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(selectedGovernanceModelData.benodigdhedenOprichting, null, 2)}
                        </pre>
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 italic pl-7">Geen benodigdheden beschikbaar</p>
                  )}
                </div>
                
                {/* Doorlooptijd */}
                {selectedGovernanceModelData.doorlooptijd && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiTimeFive className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Doorlooptijd</h4>
                    </div>
                    <div className="text-gray-700 pl-7">
                      <MarkdownContent content={selectedGovernanceModelData.doorlooptijd} />
                    </div>
                  </div>
                )}
                
                {/* Implementatie */}
                {selectedGovernanceModelData.implementatie && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <BiTask className="text-blue-600 text-xl mr-2" />
                      <h4 className="text-lg font-semibold">Implementatie</h4>
                    </div>
                    <div className="text-gray-700 pl-7">
                      <MarkdownContent content={selectedGovernanceModelData.implementatie} />
                    </div>
                  </div>
                )}
                
                {/* Links - Always show this section */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <BiLinkExternal className="text-blue-600 text-xl mr-2" />
                    <h4 className="text-lg font-semibold">Links</h4>
                  </div>
                  
                  {selectedGovernanceModelData.links ? (
                    typeof selectedGovernanceModelData.links === 'string' ? (
                      <div className="text-gray-700 pl-7">
                        <MarkdownContent content={selectedGovernanceModelData.links} />
                      </div>
                    ) : (
                      <div className="text-gray-700 pl-7">
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(selectedGovernanceModelData.links, null, 2)}
                        </pre>
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 italic pl-7">Geen links beschikbaar</p>
                  )}
                </div>
                
                {/* Voorbeeld Contracten */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <BiFile className="text-blue-600 text-xl mr-2" />
                    <h4 className="text-lg font-semibold">Voorbeeld Contracten</h4>
                  </div>
                  {selectedGovernanceModelData.voorbeeldContracten ? (
                    typeof selectedGovernanceModelData.voorbeeldContracten === 'string' ? (
                      <div className="text-gray-700 pl-7">
                        <MarkdownContent content={selectedGovernanceModelData.voorbeeldContracten} />
                      </div>
                    ) : (
                      <div className="text-gray-700 pl-7">
                        <pre className="whitespace-pre-wrap text-sm">
                          {JSON.stringify(selectedGovernanceModelData.voorbeeldContracten, null, 2)}
                        </pre>
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 italic pl-7">Geen voorbeeldcontracten beschikbaar</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Implementatieplan voor mobiliteitsoplossingen */}
            {selectedSolutionsData.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 mt-8">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Implementatieplan mobiliteitsoplossingen</h3>
                
                {selectedSolutionsData.map(solution => (
                  <div key={solution.id} className="mb-6 border-l-4 border-blue-200 pl-4">
                    <h4 className="text-lg font-medium mb-2">{solution.title}</h4>
                    
                    {solution.implementatie ? (
                      <div>
                        <div className="flex items-center mb-2">
                          <BiTask className="text-blue-600 text-xl mr-2" />
                          <h5 className="font-semibold">Implementatie</h5>
                        </div>
                        <div className="text-gray-700 pl-7">
                          <MarkdownContent content={solution.implementatie} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Geen implementatiedetails beschikbaar</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Let op:</span> Dit implementatieplan is een richtlijn gebaseerd op uw gekozen 
                oplossingen en governance model. De specifieke invulling kan per situatie verschillen.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <WizardNavigation
        previousStep="/wizard/stap-3"
        nextStep="/wizard/samenvatting"
      />
    </div>
  );
} 