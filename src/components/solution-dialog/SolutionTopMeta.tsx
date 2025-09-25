'use client';

import React from 'react';
import { CostInfoTooltip } from './FixedInfoTooltip';

interface Props {
  wanneerRelevant?: string;
  minimaleInvestering?: string;
  bandbreedteKosten?: string;
  minimumAantalPersonen?: string;
  schaalbaarheid?: string;
  moeilijkheidsgraad?: string;
  impact?: string;
  ruimtebeslag?: string;
  afhankelijkheidExternePartijen?: string;
  dekkingsmogelijkheid?: string;
  rolParkmanager?: string;
}

export function SolutionTopMeta(props: Props) {
  const {
    wanneerRelevant,
    minimaleInvestering,
    bandbreedteKosten,
    minimumAantalPersonen,
    schaalbaarheid,
    moeilijkheidsgraad,
    impact,
    ruimtebeslag,
    afhankelijkheidExternePartijen,
    dekkingsmogelijkheid,
    rolParkmanager,
  } = props;

  return (
    <section className="text-sm bg-blue-100 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wanneerRelevant && (
          <div>
            <div className="font-semibold text-gray-900">Wanneer relevant:</div>
            <div className="text-gray-800 mt-0.5">{wanneerRelevant}</div>
          </div>
        )}
        {minimaleInvestering && (
          <div>
            <div className="font-semibold text-gray-900">Investering:</div>
            <div className="text-gray-800 mt-0.5">{minimaleInvestering}</div>
          </div>
        )}
        {bandbreedteKosten && (
          <div>
            <div className="font-semibold text-gray-900 flex items-center">Bandbreedte kosten:<CostInfoTooltip /></div>
            <div className="text-gray-800 mt-0.5">{bandbreedteKosten}</div>
          </div>
        )}
        {dekkingsmogelijkheid && (
          <div>
            <div className="font-semibold text-gray-900">Dekkingsmogelijkheid:</div>
            <div className="text-gray-800 mt-0.5">{dekkingsmogelijkheid}</div>
          </div>
        )}
        {minimumAantalPersonen && (
          <div>
            <div className="font-semibold text-gray-900">Minimum aantal personen:</div>
            <div className="text-gray-800 mt-0.5">{minimumAantalPersonen}</div>
          </div>
        )}
        {schaalbaarheid && (
          <div>
            <div className="font-semibold text-gray-900">Schaalbaarheid:</div>
            <div className="text-gray-800 mt-0.5">{schaalbaarheid}</div>
          </div>
        )}
        {moeilijkheidsgraad && (
          <div>
            <div className="font-semibold text-gray-900">Moeilijkheidsgraad:</div>
            <div className="text-gray-800 mt-0.5">{moeilijkheidsgraad}</div>
          </div>
        )}
        {impact && (
          <div>
            <div className="font-semibold text-gray-900">Impact:</div>
            <div className="text-gray-800 mt-0.5">{impact}</div>
          </div>
        )}
        {ruimtebeslag && (
          <div>
            <div className="font-semibold text-gray-900">Ruimtebeslag:</div>
            <div className="text-gray-800 mt-0.5">{ruimtebeslag}</div>
          </div>
        )}
        {afhankelijkheidExternePartijen && (
          <div>
            <div className="font-semibold text-gray-900">Afhankelijkheid externe partijen:</div>
            <div className="text-gray-800 mt-0.5">{afhankelijkheidExternePartijen}</div>
          </div>
        )}
        {rolParkmanager && (
          <div className="md:col-span-2">
            <div className="font-semibold text-gray-900">Rol parkmanager:</div>
            <div className="text-gray-800 mt-0.5">{rolParkmanager}</div>
          </div>
        )}
      </div>
      <div className="mt-4 border-b border-gray-200" />
    </section>
  );
}


