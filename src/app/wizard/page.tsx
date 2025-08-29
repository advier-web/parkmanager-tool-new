import Link from 'next/link';
import { Metadata } from 'next';
 
import ResetWizardButton from '@/components/reset-wizard-button';

export const metadata: Metadata = {
  title: 'Start Wizard - ParkManager Tool',
  description: 'Begin met het creëren van uw optimale mobiliteitsplan voor uw bedrijfsterrein',
};

export default function WizardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-even">
        <h2 className="text-2xl font-bold mb-4">Welkom bij de Parkmanager Tool Collectieve Vervoersoplossingen</h2>
        <div className="mb-6 space-y-3">
          <p>
            Ik help parkmanagers, ondernemersverenigingen en bedrijfsverenigingen om snel te komen tot passende collectieve vervoersoplossingen voor hun terrein. Aan het eind ontvangt u een compact advies over de gekozen collectieve vervoersoplossing, de belangrijkste randvoorwaarden en concrete vervolgstappen om door te pakken. U kunt ook factsheets downloaden van de gekozen vervoersoplossing, inkoopvariant en governance model.
          </p>
          <p>
            Let op: dit is géén volledige mobiliteitsscan en ook geen individueel bedrijfsadvies; de uitkomst is bedoeld als gerichte shortlist en startpunt voor verdere uitwerking.
          </p>
          <p>
            Invultijd: ongeveer 5–10 minuten.
          </p>
          <p>
           Deze tool is ontwikkeld in opdracht van het Ministerie van Infrastructuur en Waterstaat.
          </p>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/wizard/bedrijventerrein"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start de wizard
          </Link>
          
          <Link 
            href="/wizard/oplossingen"
            className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-white px-6 py-3 text-blue-600 font-medium text-base hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ik weet al wat ik wil
          </Link>
        </div>
      </div>

      <div className="bg-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Linker kolom: Wat zijn collectieve mobiliteitsoplossingen? */}
          <div className="bg-white rounded-lg p-6 shadow-even">
            <h2 className="text-lg font-semibold mb-3">Wat zijn collectieve vervoeroplossingen?</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Collectieve vervoersoplossingen zijn voorzieningen waarmee meerdere organisaties of doelgroepen samen vervoer organiseren en financieren. Doel is efficiënter, betaalbaarder en duurzamer reizen door capaciteit te bundelen en ritten te combineren.
              </p>
              <p className="font-medium">Voorbeelden</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deelmobiliteit: deelfietsen of (elektrische) deelauto’s voor bedrijven op het terrein.</li>
                <li>Last-mile vervoer vanaf station of HOV-halte naar het terrein.</li>
              </ul>
            </div>
          </div>

          {/* Rechter kolom: definities-blok */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-even">
            <h2 className="text-lg font-semibold mb-3">Subsidieregeling Collectieven mkb Verduurzaming Reisgedrag (COVER)</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <p>
                De COVER subsidie is bedoeld voor organisaties die het mkb vertegenwoordigen, zoals parkmanagers. Met behulp van de subsidie kunnen stappen gezet worden naar blijvend duurzaam reisgedrag van werknemers. De subsidie dekt maximaal 75% van de kosten van het project waar de subsidie voor is aangevraagd, met een maximumbedrag van €100.000.
                </p>
                </div>
                <div>
                <p>
                  In het advies ziet u aan welke voorwaarden het project moet voldoen om in aanmerking te komen voor deze subsidie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & gegevensbescherming - accordion stijl zoals COVER sectie */}
      <div className="bg-white rounded-lg p-6 shadow-even">
        <details className="bg-gray-50 rounded-md border border-gray-200 p-4">
          <summary className="font-medium cursor-pointer select-none">Privacy & gegevensbescherming (AVG)</summary>
          <div className="space-y-3 text-gray-700 mt-2">
            <p>
              Uw antwoorden in deze tool worden uitsluitend lokaal in uw browser opgeslagen via <span className="font-medium">localStorage</span>. We sturen geen gegevens naar een server. Sluit u de browser of komt u later terug op hetzelfde apparaat, dan leest de tool de lokaal bewaarde gegevens weer in.
            </p>
            <p>
              U kunt de opgeslagen invoer op elk moment wissen door uw browseropslag te legen of de wizard te resetten.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Geen server-side opslag of tracking.</li>
              <li>Data blijft op uw eigen apparaat en is alleen voor u zichtbaar.</li>
              <li>Wilt u alles wissen? Verwijder de sitegegevens of reset de wizard in de tool.</li>
            </ul>
            <div className="pt-2 mt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Druk op reset om alle lokaal opgeslagen wizardgegevens te verwijderen. U begint daarna met een lege wizard.</p>
              <ResetWizardButton />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
} 