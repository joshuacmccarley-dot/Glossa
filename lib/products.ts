export interface Product {
  id: string;
  name: string;
  dosage: string;
  price: number | null;
  description: string;
  badge?: string;
  featured?: boolean;
}

export interface Kit {
  id: string;
  name: string;
  price: number;
  savings: number;
  includes: string[];
  badge?: string;
  popular?: boolean;
}

export const products: Product[] = [
  {
    id: "reta-20",
    name: "RETA",
    dosage: "20mg",
    price: 90,
    description: "High-concentration retatrutide formulation for advanced metabolic research protocols.",
    badge: "Best Seller",
    featured: true,
  },
  {
    id: "ghk-cu-100",
    name: "GHK-CU",
    dosage: "100mg",
    price: 40,
    description: "Copper tripeptide complex used in wound healing and tissue regeneration studies.",
  },
  {
    id: "bac-water-10",
    name: "BAC WATER",
    dosage: "10ml",
    price: 10,
    description: "Sterile bacteriostatic water for precise peptide reconstitution.",
  },
  {
    id: "tesa-10",
    name: "TESA",
    dosage: "10mg",
    price: 60,
    description: "Tesofensine analog studied for its effects on metabolic rate and appetite regulation.",
  },
  {
    id: "mots-c-10",
    name: "MOTS-C",
    dosage: "10mg",
    price: null,
    description: "Mitochondrial-derived peptide studied for metabolic and longevity research.",
    badge: "New",
  },
  {
    id: "mt2-10",
    name: "MT2",
    dosage: "10mg",
    price: 50,
    description: "Melanotan II — widely studied for melanogenesis and pigmentation research.",
  },
  {
    id: "cjc-ipa-5-5",
    name: "CJC-1295 & IPAMORELIN",
    dosage: "5mg / 5mg",
    price: 70,
    description: "Dual GHRH/GHRP blend — synergistic research compound for GH pulse studies.",
    badge: "Combo",
    featured: true,
  },
];

export const kits: Kit[] = [
  {
    id: "reta-kit",
    name: "RETA Starter Kit",
    price: 110,
    savings: 10,
    includes: ["RETA 20mg", "BAC Water 10ml", "10 Insulin Needles", "10 Alcohol Wipes"],
    badge: "Save $10",
  },
  {
    id: "ghk-kit",
    name: "GHK Starter Kit",
    price: 60,
    savings: 10,
    includes: ["GHK-CU 100mg", "BAC Water 10ml", "10 Insulin Needles", "10 Alcohol Wipes"],
    badge: "Save $10",
  },
  {
    id: "mt2-kit",
    name: "MT2 Complete Kit",
    price: 65,
    savings: 10,
    includes: ["MT2 10mg", "BAC Water 10ml", "10 Insulin Needles", "10 Alcohol Wipes"],
    badge: "Most Popular",
    popular: true,
  },
  {
    id: "cjc-ipa-kit",
    name: "CJC + IPA Research Kit",
    price: 90,
    savings: 15,
    includes: ["CJC-1295 5mg", "Ipamorelin 5mg", "BAC Water 10ml", "10 Needles", "10 Wipes"],
    badge: "Save $15",
  },
  {
    id: "tesa-kit",
    name: "TESA Research Kit",
    price: 80,
    savings: 10,
    includes: ["TESA 10mg", "BAC Water 10ml", "10 Insulin Needles", "10 Alcohol Wipes"],
    badge: "Save $10",
  },
];
