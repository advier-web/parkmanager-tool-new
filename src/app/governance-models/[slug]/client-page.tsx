'use client';

import { GovernanceModel } from '@/domain/models';
import { ItemWithMarkdown } from '@/components/item-with-markdown';
import PdfDownloadButtonContentful from '@/components/pdf-download-button-contentful';
import Link from 'next/link';

interface GovernanceModelClientPageProps {
  model: GovernanceModel | null;
}

export default function GovernanceModelClientPage({ model }: GovernanceModelClientPageProps) {
  if (!model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Dit bestuursmodel kon niet worden gevonden.</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Terug naar overzicht
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{model.title}</h1>
          
          {model.description && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Beschrijving</h2>
              <ItemWithMarkdown content={model.description} />
            </div>
          )}

          {model.aansprakelijkheid && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Aansprakelijkheid</h2>
              <ItemWithMarkdown content={model.aansprakelijkheid} />
            </div>
          )}

          {model.advantages && Array.isArray(model.advantages) && model.advantages.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Voordelen</h2>
              <ItemWithMarkdown content={model.advantages.map(adv => `- ${adv}`).join('\n')} />
            </div>
          )}

          {model.disadvantages && Array.isArray(model.disadvantages) && model.disadvantages.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Nadelen</h2>
              <ItemWithMarkdown content={model.disadvantages.map(disadv => `- ${disadv}`).join('\n')} />
            </div>
          )}

          {model.benodigdhedenOprichting && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Benodigdheden voor oprichting</h2>
              <ItemWithMarkdown content={typeof model.benodigdhedenOprichting === 'string' 
                ? model.benodigdhedenOprichting 
                : Array.isArray(model.benodigdhedenOprichting) 
                  ? model.benodigdhedenOprichting.join('\n- ') 
                  : ''} 
              />
            </div>
          )}

          {model.links && Array.isArray(model.links) && model.links.length > 0 && (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Relevante links</h2>
              <ul className="list-disc pl-5 space-y-1">
                {model.links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-teal-600 hover:underline"
                    >
                      {link.title || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {model.doorlooptijdLang || model.doorlooptijd ? (
            <div className="border-b pb-6 mb-6">
              <h2 className="font-semibold text-xl mb-3">Doorlooptijd</h2>
              <ItemWithMarkdown content={model.doorlooptijdLang || model.doorlooptijd || ''} />
            </div>
          ) : null}
          
          <div className="pb-6">
            <h2 className="font-semibold text-xl mb-3">PDF Informatie</h2>
            <p className="text-gray-700 mb-4">
              Download meer informatie over dit bestuursmodel via onderstaande PDF. In deze PDF staat meer informatie over de benodigdheden voor oprichting en stappen die genomen moeten worden voor het implementeren van dit bestuursmodel.
            </p>
            <PdfDownloadButtonContentful
              mobilityServiceId={model.id}
              fileName={`${model.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`}
              contentType="governanceModel"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 