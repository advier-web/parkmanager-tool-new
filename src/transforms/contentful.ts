// Dit bestand is nu leeg en kan verwijderd worden. 

import { 
  Entry,
  Asset,
  AssetFile
} from 'contentful';
import {
  IBusinessParkReason, 
  IGovernanceModel, 
  IMobilityService, 
  IImplementationvariations 
} from '../types/contentful-types.generated';
import { 
  BusinessParkReason, 
  GovernanceModel, 
  MobilitySolution, 
  TrafficType,
  ImplementationVariation
} from '../domain/models';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, Document as ContentfulDocument } from '@contentful/rich-text-types';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

// -- Helper Functions -- 
function safeDocumentToHtmlString(doc: any): string | undefined {
  if (doc && typeof doc === 'object' && doc.nodeType === BLOCKS.DOCUMENT && Array.isArray(doc.content)) {
    try {
      return documentToHtmlString(doc as ContentfulDocument);
    } catch (error) {
      console.error("Error converting Rich Text to HTML:", error);
      return undefined;
    }
  }
  return undefined;
}

// NEW Helper function to safely convert Rich Text to Plain Text
function safeDocumentToPlainTextString(doc: any): string | undefined {
  if (doc && typeof doc === 'object' && doc.nodeType === BLOCKS.DOCUMENT && Array.isArray(doc.content)) {
    try {
      const plainText = documentToPlainTextString(doc as ContentfulDocument);
      return plainText.trim() || undefined; // Return undefined if result is empty string
    } catch (error) {
      console.error("Error converting Rich Text to Plain Text:", error);
      return undefined;
    }
  }
  return undefined;
}

export function parseTypeVervoer(typeVervoerField: any): TrafficType[] {
  if (!typeVervoerField) return [];
  if (Array.isArray(typeVervoerField)) {
    return typeVervoerField.map(item => {
      if (typeof item === 'string') {
        const normalized = item.toLowerCase().trim();
        if (normalized.includes('woon') || normalized.includes('commuter')) return TrafficType.COMMUTER;
        if (normalized.includes('zakelijk') || normalized.includes('business')) return TrafficType.BUSINESS;
        if (normalized.includes('bezoeker') || normalized.includes('visitor')) return TrafficType.VISITOR;
      }
      return null;
    }).filter((type): type is TrafficType => type !== null);
  }
  if (typeof typeVervoerField === 'string') {
    const types: TrafficType[] = [];
    const normalized = typeVervoerField.toLowerCase();
    if (normalized.includes('woon') || normalized.includes('commuter')) types.push(TrafficType.COMMUTER);
    if (normalized.includes('zakelijk') || normalized.includes('business')) types.push(TrafficType.BUSINESS);
    if (normalized.includes('bezoeker') || normalized.includes('visitor')) types.push(TrafficType.VISITOR);
    return types;
  }
  return [];
}

function getRefIdArray(refs: any): Array<{ sys: { id: string } }> {
  if (!Array.isArray(refs)) return [];
  return refs
    .map(ref => (ref && ref.sys && typeof ref.sys.id === 'string' ? { sys: { id: ref.sys.id } } : null))
    .filter((ref): ref is { sys: { id: string } } => ref !== null);
}

function getSafeAssetUrl(assetLink: unknown): string | undefined {
    if (assetLink && typeof assetLink === 'object' && 'sys' in assetLink && (assetLink as any).sys.type === 'Link' && (assetLink as any).sys.linkType === 'Asset') {
        const file = (assetLink as Asset<undefined, string>)?.fields?.file;
        if (file && (file as AssetFile)?.url) {
            const url = (file as AssetFile).url;
            return url.startsWith('//') ? `https:${url}` : url;
        }
        console.warn(`Asset URL not found for linked asset ID: ${(assetLink as any).sys.id}. Asset might not be resolved.`);
    }
    else if (assetLink && typeof assetLink === 'object' && 'fields' in assetLink && (assetLink as any).fields.file && ((assetLink as any).fields.file as AssetFile)?.url) {
        const url = ((assetLink as any).fields.file as AssetFile).url;
        return url.startsWith('//') ? `https:${url}` : url;
    }
    else if (typeof assetLink === 'string' && assetLink.startsWith('http')) {
        return assetLink;
    }
    else if (typeof assetLink === 'string' && assetLink.startsWith('//')) {
        return `https:${assetLink}`;
    }
    console.warn('Could not determine asset URL from:', assetLink);
    return undefined;
}

// -- Transform Functions --

export function transformBusinessParkReason(entry: Entry<any>): BusinessParkReason {
  const fields = entry.fields;
  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : '',
    description: typeof fields.description === 'string' ? fields.description : '',
    summary: typeof fields.summary === 'string' ? fields.summary :
             typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
    icon: typeof fields.icon === 'string' ? fields.icon : undefined,
    category: typeof fields.category === 'string' ? fields.category : undefined,
    identifier: typeof fields.identifier === 'string' ? fields.identifier : undefined,
    order: typeof fields.order === 'number' ? fields.order : undefined,
    weight: typeof fields.weight === 'number' ? fields.weight : undefined,
  };
}

export function transformImplementationVariation(entry: Entry<any>): ImplementationVariation {
    const fields = entry.fields;
    // Helper to safely get linked entry ID
    const getLinkedEntryId = (field: any): string | undefined => {
       if (field && typeof field === 'object' && field.sys && typeof field.sys.id === 'string') {
         return field.sys.id;
       }
       return undefined;
    };
    return {
      id: entry.sys.id,
      title: typeof fields.title === 'string' ? fields.title : 'Unnamed Variation',
      // Extract the ID from the linked mobiliteitsdienstVariant field safely
      mobiliteitsdienstVariantId: getLinkedEntryId(fields.mobiliteitsdienstVariant),
      samenvatting: typeof fields.samenvatting === 'string' ? fields.samenvatting : undefined,
      investering: typeof fields.investering === 'string' ? fields.investering : undefined,
      realisatieplan: typeof fields.realisatieplan === 'string' ? fields.realisatieplan : undefined,
      governanceModels: getRefIdArray(fields.governanceModels),
      governanceModelsMits: getRefIdArray(fields.governanceModelsMits),
      governanceModelsNietgeschikt: getRefIdArray(fields.governanceModelsNietgeschikt),
      geenRechtsvorm: typeof fields.geenRechtsvorm === 'string' ? fields.geenRechtsvorm.trim() || undefined : undefined,
      vereniging: typeof fields.vereniging === 'string' ? fields.vereniging.trim() || undefined : undefined,
      stichting: typeof fields.stichting === 'string' ? fields.stichting.trim() || undefined : undefined,
      ondernemersBiz: typeof fields.ondernemersBiz === 'string' ? fields.ondernemersBiz.trim() || undefined : undefined,
      vastgoedBiz: typeof fields.vastgoedBiz === 'string' ? fields.vastgoedBiz.trim() || undefined : undefined,
      gemengdeBiz: typeof fields.gemengdeBiz === 'string' ? fields.gemengdeBiz.trim() || undefined : undefined,
      cooperatieUa: typeof fields.cooperatieUa === 'string' ? fields.cooperatieUa.trim() || undefined : undefined,
      bv: typeof fields.bv === 'string' ? fields.bv.trim() || undefined : undefined,
      ondernemersfonds: typeof fields.ondernemersfonds === 'string' ? fields.ondernemersfonds.trim() || undefined : undefined,
      realisatieplanLeveranciers: typeof fields.realisatieplanLeveranciers === 'string' ? fields.realisatieplanLeveranciers : undefined,
      realisatieplanContractvormen: typeof fields.realisatieplanContractvormen === 'string' ? fields.realisatieplanContractvormen : undefined,
      realisatieplanKrachtenveld: typeof fields.realisatieplanKrachtenveld === 'string' ? fields.realisatieplanKrachtenveld : undefined,
      realisatieplanVoorsEnTegens: typeof fields.realisatieplanVoorsEnTegens === 'string' ? fields.realisatieplanVoorsEnTegens : undefined,
      realisatieplanAandachtspunten: typeof fields.realisatieplanAandachtspunten === 'string' ? fields.realisatieplanAandachtspunten : undefined,
      realisatieplanChecklist: typeof fields.realisatieplanChecklist === 'string' ? fields.realisatieplanChecklist : undefined,
    } as ImplementationVariation;
}

export function transformGovernanceModel(entry: Entry<any>): GovernanceModel {
  const fields = entry.fields;
  const processField = (fieldValue: any): string | undefined => {
    const html = safeDocumentToHtmlString(fieldValue);
    if (html) return html;
    if (typeof fieldValue === 'string') {
      const trimmed = fieldValue.trim();
      return trimmed ? trimmed : undefined;
    }
    return undefined;
  };

  return {
    id: entry.sys.id,
    title: typeof fields.title === 'string' ? fields.title : 'Geen titel',
    description: processField(fields.description),
    summary: processField(fields.samenvatting),
    advantages: Array.isArray(fields.voordelen) ? fields.voordelen.filter((item: unknown): item is string => typeof item === 'string') : [],
    disadvantages: Array.isArray(fields.nadelen) ? fields.nadelen.filter((item: unknown): item is string => typeof item === 'string') : [],
    applicableScenarios: Array.isArray(fields.applicableScenarios) ? fields.applicableScenarios.filter((item: unknown): item is string => typeof item === 'string') : [],
    organizationalStructure: processField(fields.organizationalStructure),
    legalForm: typeof fields.legalForm === 'string' ? fields.legalForm : undefined,
    stakeholders: Array.isArray(fields.stakeholders) ? fields.stakeholders.filter((item: unknown): item is string => typeof item === 'string') : [],
    aansprakelijkheid: processField(fields.aansprakelijkheid),
    benodigdhedenOprichting: processField(fields.benodigdhedenOprichting),
    doorlooptijdLang: processField(fields.doorlooptijdLang),
    implementatie: processField(fields.implementatie),
    links: processField(fields.links),
    voorbeeldContracten: Array.isArray(fields.voorbeeldContracten) ? fields.voorbeeldContracten.map(getSafeAssetUrl).filter((url): url is string => !!url) : [],
  } as GovernanceModel;
}

// transformMobilitySolution is niet meer nodig hier 