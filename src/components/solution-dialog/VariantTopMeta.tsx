'use client';

import React from 'react';
import { CostInfoTooltip } from './FixedInfoTooltip';
import { ValueWithTooltip } from '@/components/ui/tooltip';
import { StarsWithText } from '@/components/ui/stars';

function stripAsterisks(text?: string) {
  if (!text) return '';
  return text.replace(/\*/g, '').trim();
}

interface Props {
  variant: any;
}

export function VariantTopMeta({ variant }: Props) {
  return (
    <section className="text-sm bg-blue-100 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variant.geschatteJaarlijkseKosten && (
          <div>
            <div className="font-semibold text-gray-900 flex items-center">Geschatte jaarlijkse kosten:<CostInfoTooltip /></div>
            <div className="text-gray-800 mt-0.5">{variant.geschatteJaarlijkseKosten}</div>
          </div>
        )}
        {variant.geschatteKostenPerKmPp && (
          <div>
            <div className="font-semibold text-gray-900 flex items-center">Geschatte kosten per km per persoon:<CostInfoTooltip /></div>
            <div className="text-gray-800 mt-0.5"><ValueWithTooltip value={variant.geschatteKostenPerKmPp} /></div>
          </div>
        )}
        {variant.geschatteKostenPerRit && (
          <div>
            <div className="font-semibold text-gray-900 flex items-center">Geschatte kosten per rit:<CostInfoTooltip /></div>
            <div className="text-gray-800 mt-0.5"><ValueWithTooltip value={variant.geschatteKostenPerRit} /></div>
          </div>
        )}
        {variant.controleEnFlexibiliteit && (
          <div>
            <div className="font-semibold text-gray-900">Controle en flexibiliteit:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.controleEnFlexibiliteit)}</div>
          </div>
        )}
        {variant.maatwerk && (
          <div>
            <div className="font-semibold text-gray-900">Maatwerk:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.maatwerk)}</div>
          </div>
        )}
        {variant.kostenEnSchaalvoordelen && (
          <div>
            <div className="font-semibold text-gray-900">Kosten en schaalvoordelen:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.kostenEnSchaalvoordelen)}</div>
          </div>
        )}
        {variant.operationeleComplexiteit && (
          <div>
            <div className="font-semibold text-gray-900">Operationele complexiteit:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.operationeleComplexiteit)}</div>
          </div>
        )}
        {variant.juridischeEnComplianceRisicos && (
          <div>
            <div className="font-semibold text-gray-900">Juridische en compliance-risico’s:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.juridischeEnComplianceRisicos)}</div>
          </div>
        )}
        {variant.risicoVanOnvoldoendeGebruik && (
          <div>
            <div className="font-semibold text-gray-900">Risico van onvoldoende gebruik:</div>
            <div className="text-gray-800 mt-0.5">{stripAsterisks(variant.risicoVanOnvoldoendeGebruik)}</div>
          </div>
        )}
      </div>
      <div className="mt-4 border-b border-gray-200" />
    </section>
  );
}


