#!/usr/bin/env ts-node
"use strict";
/**
 * Script om types te genereren vanuit het Contentful content model
 *
 * Gebruik:
 * - Installeer eerst de dependencies: npm install -D contentful-management ts-node
 * - Voeg CONTENTFUL_MANAGEMENT_TOKEN toe aan je .env.local
 * - Voer het script uit: npx ts-node scripts/generate-contentful-types.ts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var contentful_management_1 = require("contentful-management");
// Environment variables
var SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || '';
var ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master';
var MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN || '';
// Controleer of de environment variables zijn ingesteld
if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    console.error('Error: NEXT_PUBLIC_CONTENTFUL_SPACE_ID en CONTENTFUL_MANAGEMENT_TOKEN moeten worden ingesteld');
    process.exit(1);
}
// Pad voor de gegenereerde types
var OUTPUT_FILE = path.resolve(__dirname, '../src/types/contentful-types.generated.ts');
// Maak een Contentful Management client
var client = (0, contentful_management_1.createClient)({
    accessToken: MANAGEMENT_TOKEN,
});
/**
 * Zet Contentful types om naar TypeScript types
 */
function contentfulTypeToTs(type, required) {
    // Basic type mapping
    var typeMap = {
        Symbol: 'string',
        Text: 'string',
        Integer: 'number',
        Number: 'number',
        Date: 'string',
        Boolean: 'boolean',
        Object: 'Record<string, any>',
        Location: '{ lat: number; lon: number }',
    };
    var tsType = typeMap[type] || 'any';
    // Voeg optionele type marker toe indien nodig
    if (!required) {
        tsType += ' | undefined';
    }
    return tsType;
}
/**
 * Genereer TypeScript interface voor een content type
 */
function generateContentTypeInterface(contentType) {
    var name = contentType.sys.id;
    var displayName = contentType.name;
    var fields = contentType.fields || [];
    // Begin met de interface voor de velden
    var fieldsInterface = "export interface I".concat(name, "Fields {\n");
    // Voeg elk veld toe aan de interface
    fields.forEach(function (field) {
        var fieldName = field.id;
        var isRequired = field.required;
        var fieldType = field.type;
        // Add description as JSDoc comment if available
        if (field.description) {
            fieldsInterface += "  /** ".concat(field.description, " */\n");
        }
        // Handle different field types
        if (fieldType === 'Array') {
            var itemType = field.items.type;
            if (itemType === 'Symbol' || itemType === 'Text') {
                fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": string[];\n");
            }
            else if (itemType === 'Link') {
                var linkType = field.items.linkType;
                if (linkType === 'Entry') {
                    fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": { sys: { id: string } }[];\n");
                }
                else if (linkType === 'Asset') {
                    fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": { sys: { id: string } }[];\n");
                }
            }
            else {
                fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": any[];\n");
            }
        }
        else if (fieldType === 'Link') {
            var linkType = field.linkType;
            if (linkType === 'Entry') {
                fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": { sys: { id: string } };\n");
            }
            else if (linkType === 'Asset') {
                fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": { sys: { id: string } };\n");
            }
        }
        else {
            fieldsInterface += "  ".concat(fieldName).concat(isRequired ? '' : '?', ": ").concat(contentfulTypeToTs(fieldType, isRequired), ";\n");
        }
    });
    fieldsInterface += '}\n\n';
    // Voeg de entry interface toe
    var entryInterface = "export interface I".concat(name, " extends EntrySkeletonType<I").concat(name, "Fields> {\n  contentTypeId: '").concat(name, "';\n}\n\n");
    return fieldsInterface + entryInterface;
}
/**
 * Generate the types file header
 */
function generateTypesFileHeader() {
    return "/**\n * THIS FILE IS AUTO-GENERATED FROM CONTENTFUL\n * Do not edit this file directly\n * Generated on: ".concat(new Date().toISOString(), "\n */\n\nexport interface EntryFields {\n  [key: string]: any;\n}\n\nexport interface EntrySkeletonType<T extends EntryFields = EntryFields> {\n  sys: {\n    id: string;\n    createdAt: string;\n    updatedAt: string;\n    contentTypeId: string;\n  };\n  fields: T;\n}\n\n");
}
/**
 * Main function to generate types
 */
function generateTypes() {
    return __awaiter(this, void 0, void 0, function () {
        var space, environment, contentTypes, typesFileContent, _i, _a, contentType, outputDir, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    console.log('Contentful Types Generator: Starting...');
                    return [4 /*yield*/, client.getSpace(SPACE_ID)];
                case 1:
                    space = _b.sent();
                    return [4 /*yield*/, space.getEnvironment(ENVIRONMENT)];
                case 2:
                    environment = _b.sent();
                    console.log("Generating types for space: ".concat(SPACE_ID, ", environment: ").concat(ENVIRONMENT));
                    return [4 /*yield*/, environment.getContentTypes({ limit: 1000 })];
                case 3:
                    contentTypes = _b.sent();
                    typesFileContent = generateTypesFileHeader();
                    // Voeg interfaces toe voor elk content type
                    for (_i = 0, _a = contentTypes.items; _i < _a.length; _i++) {
                        contentType = _a[_i];
                        typesFileContent += generateContentTypeInterface(contentType);
                    }
                    outputDir = path.dirname(OUTPUT_FILE);
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
                    // Schrijf de gegenereerde content naar het output bestand
                    fs.writeFileSync(OUTPUT_FILE, typesFileContent);
                    console.log("\u2705 Generated Contentful types at: ".concat(OUTPUT_FILE));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('Error generating Contentful types:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the type generation
generateTypes();
