import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Wizard - ParkManager Tool',
  description: 'Begin met het creëren van uw optimale mobiliteitsplan voor uw bedrijfsterrein',
};

export default function WizardPage() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welkom bij de ParkManager Tool</h2>
        <p className="mb-6">
          Deze tool helpt u bij het selecteren van de beste mobiliteitsoplossingen voor uw bedrijfsterrein.
          Doorloop de stappen om een gepersonaliseerd advies te ontvangen.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/wizard/bedrijventerrein"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start de wizard
          </Link>
          
          <Link 
            href="/wizard/stap-2"
            className="inline-flex items-center justify-center rounded-md border border-blue-600 bg-white px-6 py-3 text-blue-600 font-medium text-base hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ik weet al wat ik wil
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md">
        <h3 className="text-xl font-semibold mb-4">De stappen</h3>
        
        <ol className="space-y-4 mt-6">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">0</span>
            </div>
            <div>
              <h4 className="font-medium">Bedrijventerrein informatie</h4>
              <p className="text-gray-600">Vul basisgegevens in over uw bedrijventerrein en het huidige bestuursmodel.</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h4 className="font-medium">Bedrijfsterrein-redenen</h4>
              <p className="text-gray-600">Selecteer de redenen waarom u de mobiliteit op uw bedrijfsterrein wilt verbeteren.</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">2</span>
            </div>
            <div>
              <h4 className="font-medium">Mobiliteitsoplossingen</h4>
              <p className="text-gray-600">Kies welke mobiliteitsoplossingen het beste passen bij uw situatie.</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">3</span>
            </div>
            <div>
              <h4 className="font-medium">Governance modellen</h4>
              <p className="text-gray-600">Bepaal hoe u de mobiliteitsoplossingen wilt organiseren en beheren.</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">4</span>
            </div>
            <div>
              <h4 className="font-medium">Implementatieplan</h4>
              <p className="text-gray-600">Krijg een stappenplan voor de implementatie van de gekozen oplossingen.</p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold">5</span>
            </div>
            <div>
              <h4 className="font-medium">Samenvatting</h4>
              <p className="text-gray-600">Bekijk en download uw gepersonaliseerde mobiliteitsplan.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
} 