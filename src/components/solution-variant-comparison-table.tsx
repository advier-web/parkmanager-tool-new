'use client';

import React from 'react';
import { ImplementationVariation } from '@/domain/models';
import { StarsWithText } from '@/components/ui/stars';
import { stripSolutionPrefixFromVariantTitle, orderImplementationVariations } from '@/utils/wizard-helpers';

interface Props {
  variations: ImplementationVariation[];
}

export default function SolutionVariantComparisonTable({ variations }: Props) {
  if (!variations || variations.length === 0) return null;

  const variationsForTable = orderImplementationVariations(variations);

  return (
    <section className="bg-white rounded-lg py-4">
      <h1 className="text-3xl font-bold mb-1">Vergelijk implementatievarianten</h1>
      <p className="text-sm text-gray-600 mb-3">Voor elk van de inkoopvormen is in de onderstaande tabel samengevat in hoeverre elke inkoopvorm scoort op verschillende criteria. De sterren geven aan hoe de implementatievariant zich verhoudt tot de andere varianten, waarbij 1 ster negatief is en 5 sterren positief.</p>
      <div className="overflow-x-auto">
        <div className="grid rounded-lg min-w-[640px] md:min-w-0" style={{ gridTemplateColumns: `160px repeat(${variationsForTable.length}, minmax(180px, 1fr))` }}>
          {/* Header row */}
          <div className="contents">
            <div className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">Categorie</div>
            {variationsForTable.map((v, idx) => {
              const title = stripSolutionPrefixFromVariantTitle(v.title);
              return (
                <div key={`vh-${v.id || idx}`} className="bg-gray-50 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900">{title}</div>
              );
            })}
          </div>

          {/* Controle en flexibiliteit */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Controle en flexibiliteit</div>
            {variationsForTable.map((v, idx) => (
              <div key={`cf-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                <StarsWithText raw={v.controleEnFlexibiliteit || '-'} />
              </div>
            ))}
          </div>

          {/* Maatwerk */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Maatwerk</div>
            {variationsForTable.map((v, idx) => (
              <div key={`mw-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                <StarsWithText raw={v.maatwerk || '-'} />
              </div>
            ))}
          </div>

          {/* Kosten en schaalvoordelen */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Kosten en schaalvoordelen</div>
            {variationsForTable.map((v, idx) => (
              <div key={`ks-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                <StarsWithText raw={v.kostenEnSchaalvoordelen || '-'} />
              </div>
            ))}
          </div>

          {/* Operationele complexiteit */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Operationele complexiteit</div>
            {variationsForTable.map((v, idx) => (
              <div key={`oc-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                <StarsWithText raw={v.operationeleComplexiteit || '-'} />
              </div>
            ))}
          </div>

          {/* Juridische en compliance risico's */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium">Juridische en compliance risico's</div>
            {variationsForTable.map((v, idx) => (
              <div key={`jr-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700">
                <StarsWithText raw={v.juridischeEnComplianceRisicos || '-'} />
              </div>
            ))}
          </div>

          {/* Risico van onvoldoende gebruik */}
          <div className="contents">
            <div className="border-l border-b border-r border-gray-200 px-3 py-3 text-sm font-medium bg-gray-50">Risico van onvoldoende gebruik</div>
            {variationsForTable.map((v, idx) => (
              <div key={`rg-${v.id || idx}`} className="border-b border-r border-gray-200 px-3 py-3 text-sm text-gray-700 bg-gray-50">
                <StarsWithText raw={v.risicoVanOnvoldoendeGebruik || '-'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


