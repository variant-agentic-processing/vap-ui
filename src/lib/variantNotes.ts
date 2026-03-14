/**
 * Varis popover notes for variant table columns.
 * All lookups key on raw API values (underscores, not spaces).
 */

// ---------------------------------------------------------------------------
// Clinical significance
// ---------------------------------------------------------------------------
export const CLINICAL_SIG_NOTES: Record<string, string> = {
  Pathogenic:
    "ClinVar's strongest classification — the variant is disease-causing with well-established evidence.",
  Likely_pathogenic:
    "Evidence strongly suggests disease causation but doesn't yet meet the full Pathogenic threshold.",
  "Pathogenic/Likely_pathogenic":
    "Different submitters called it Pathogenic or Likely Pathogenic — effectively treat as high-risk.",
  Uncertain_significance:
    "Evidence is insufficient or conflicting. Known as a VUS — classification may change as more data accumulates.",
  Likely_benign:
    "Probably not disease-causing, but the evidence isn't complete enough for a definitive benign call.",
  Benign:
    "Strong evidence this variant does not cause disease on its own.",
  Conflicting_interpretations_of_pathogenicity:
    "Different labs reached different conclusions. Check the individual ClinVar submissions before acting on this.",
  drug_response:
    "Associated with a differential response to a drug rather than a direct disease classification.",
  association:
    "Linked to a disease or trait through association studies, but not via direct functional evidence.",
  risk_factor:
    "May increase disease risk without being directly causative.",
  protective:
    "Evidence suggests this variant reduces risk for a disease or condition.",
  other:
    "Doesn't fit neatly into standard pathogenicity categories — check the ClinVar record for details.",
  not_provided:
    "The submitter did not provide a classification. Treat as unclassified.",
};

// ---------------------------------------------------------------------------
// Consequence types (VEP / Ensembl style, _variant suffix stripped by display)
// ---------------------------------------------------------------------------
export const CONSEQUENCE_NOTES: Record<string, string> = {
  missense_variant:
    "A base change swaps one amino acid for another. Effect ranges from harmless to severely damaging depending on the position.",
  stop_gained:
    "Creates a premature stop codon, cutting the protein short. Also called a nonsense variant — usually loss-of-function.",
  stop_lost:
    "The normal stop codon is changed, causing the protein to extend beyond its intended end.",
  start_lost:
    "The start codon is disrupted. Translation may fail entirely or begin at an alternate downstream site.",
  frameshift_variant:
    "An insertion or deletion shifts the reading frame, scrambling everything downstream. Almost always loss-of-function.",
  inframe_insertion:
    "One or more amino acids are inserted without shifting the reading frame. Effect depends heavily on where it lands.",
  inframe_deletion:
    "One or more amino acids are deleted without shifting the reading frame. Effect depends on location.",
  splice_donor_variant:
    "Disrupts the GT dinucleotide at the start of an intron. Likely causes abnormal splicing and loss of function.",
  splice_acceptor_variant:
    "Disrupts the AG dinucleotide at the end of an intron. Likely causes abnormal splicing and loss of function.",
  splice_region_variant:
    "Near a splice site but outside the core consensus. May subtly alter splicing — worth checking experimentally.",
  synonymous_variant:
    "Changes a DNA base but not the amino acid sequence. Usually benign, but can affect splicing or mRNA stability.",
  intron_variant:
    "Located within a non-coding intron. Usually benign unless it disrupts a regulatory or splice element.",
  "3_prime_UTR_variant":
    "In the 3′ untranslated region after the stop codon. Can affect mRNA stability, localization, or miRNA binding.",
  "5_prime_UTR_variant":
    "In the 5′ untranslated region before the start codon. Can affect translation initiation efficiency.",
  upstream_gene_variant:
    "Upstream of the gene — may affect promoter activity or transcription factor binding.",
  downstream_gene_variant:
    "Downstream of the gene — regulatory impact is possible but usually low.",
  intergenic_variant:
    "Between genes. Usually benign but could affect long-range regulatory elements.",
  non_coding_transcript_exon_variant:
    "In a non-coding RNA exon. Functional impact depends on the specific RNA's role.",
  regulatory_region_variant:
    "In a known regulatory region — could affect how much of the gene is expressed.",
};

// ---------------------------------------------------------------------------
// ClinVar review status (raw API value with underscores)
// ---------------------------------------------------------------------------
export const REVIEW_STATUS_NOTES: Record<string, string> = {
  "criteria_provided,_multiple_submitters,_no_conflicts":
    "★★ Two or more labs independently classified this with no conflicts. High confidence.",
  "criteria_provided,_single_submitter":
    "★ One lab classified this using standard evidence criteria. Moderate confidence.",
  "reviewed_by_expert_panel":
    "★★★ Classified by a ClinVar Expert Panel — domain specialists who apply rigorous, gene-specific criteria.",
  practice_guideline:
    "★★★★ Supported by a clinical practice guideline. ClinVar's top confidence tier.",
  "criteria_provided,_conflicting_interpretations":
    "★ Multiple labs disagree on the classification. Treat with caution — review individual submissions.",
  no_assertion_criteria_provided:
    "☆ A submission exists but no standard criteria were applied. Low confidence — treat as provisional.",
  no_assertion_provided:
    "☆ No formal classification assertion has been made. Treat as unclassified.",
  "no_classifications_from_unflagged_records":
    "All submissions have been flagged by ClinVar. Classifications are considered unreliable.",
};

// ---------------------------------------------------------------------------
// Chromosome (handles both "chr1" and "1" formats)
// ---------------------------------------------------------------------------
const CHROM_FACTS: Record<string, string> = {
  "1":  "The largest chromosome — ~249 Mb, home to ~8% of the genome. Contains BRCA2, CFHR genes, and many cancer loci.",
  "2":  "Second largest. Likely the result of a fusion of two ancestral ape chromosomes — telomeric sequences sit right in the middle.",
  "3":  "Carries VHL (von Hippel-Lindau) and MLH1 (Lynch syndrome mismatch repair).",
  "4":  "Home to FGFR3 (achondroplasia) and the Huntington disease locus HTT.",
  "5":  "Contains APC, the gatekeeper of colorectal cancer, and the spinal muscular atrophy SMN1/SMN2 region.",
  "6":  "Home to the MHC/HLA complex — the densest concentration of immune-system genes in the genome.",
  "7":  "Carries CFTR (cystic fibrosis) and EGFR, one of the most targeted oncogenes in cancer therapy.",
  "8":  "Contains MYC, a master oncogene amplified in many cancers.",
  "9":  "Carries CDKN2A/B — key tumor suppressors deleted in many cancers — and the ABL1 locus relevant in CML.",
  "10": "Contains PTEN, a frequently mutated tumor suppressor in breast, prostate, and endometrial cancers.",
  "11": "Home to ATM (ataxia-telangiectasia / breast cancer risk) and WT1 (Wilms tumor).",
  "12": "Carries KRAS — one of the most commonly mutated oncogenes across all cancers.",
  "13": "Contains BRCA2 and RB1 (retinoblastoma), one of the first tumor suppressors ever identified.",
  "14": "Home to BRCA2's regulatory partners and several immunoglobulin heavy chain loci.",
  "15": "Carries FBN1 (Marfan syndrome) and imprinted regions involved in Angelman and Prader-Willi syndromes.",
  "16": "Contains PALB2 (BRCA pathway, breast cancer risk) and PKD1 (polycystic kidney disease).",
  "17": "One of the most gene-dense chromosomes — BRCA1, TP53, ERBB2 (HER2), and NF1 all live here.",
  "18": "Carries SMAD4 (pancreatic cancer / Peutz-Jeghers) and BCL2.",
  "19": "Highest gene density of any chromosome. Contains LDLR (familial hypercholesterolemia) and BRCA1-interacting genes.",
  "20": "Home to STK11 (Peutz-Jeghers syndrome) and several growth factor receptors.",
  "21": "The smallest autosome. Trisomy 21 causes Down syndrome. Contains DYRK1A and RUNX1.",
  "22": "Smallest autosome by gene count. Carries NF2 and BCR (the CML translocation breakpoint).",
  X:   "One of two sex chromosomes. Females carry two copies — one is randomly inactivated in each cell (X-inactivation).",
  Y:   "The male sex chromosome. Carries SRY (the sex-determining gene) but is largely non-coding.",
  MT:  "Mitochondrial DNA — maternally inherited, circular, ~16.6 kb. Encodes 13 proteins critical for oxidative phosphorylation.",
  M:   "Mitochondrial DNA — maternally inherited, circular, ~16.6 kb. Encodes 13 proteins critical for oxidative phosphorylation.",
};

export function chromNote(raw: string): string | null {
  const key = raw.replace(/^chr/i, "").toUpperCase();
  // numeric chroms stored as numbers in the map
  const numericKey = key === key ? key : key;
  return CHROM_FACTS[numericKey] ?? CHROM_FACTS[key.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Allele frequency
// ---------------------------------------------------------------------------
export function afNote(af: number): string | null {
  if (af <= 0) return "Not observed in population databases — may be private to this individual or cohort.";
  if (af >= 0.05) return `Common variant (AF ${(af * 100).toFixed(1)}%) — present in more than 1 in 20 people. Unlikely to be pathogenic on its own.`;
  if (af >= 0.01) return `Low-frequency variant (AF ${(af * 100).toFixed(2)}%) — present in roughly 1–5% of the population.`;
  if (af >= 0.001) return `Rare variant (AF ${af.toExponential(1)}) — seen in roughly 1 in ${Math.round(1 / af).toLocaleString()} people. Worth investigating in disease contexts.`;
  if (af >= 0.0001) return `Very rare variant (AF ${af.toExponential(1)}) — seen in roughly 1 in ${Math.round(1 / af).toLocaleString()} people.`;
  return `Extremely rare variant (AF ${af.toExponential(1)}) — seen in fewer than 1 in 10,000 people. High priority in disease studies.`;
}

// ---------------------------------------------------------------------------
// Gene symbols (well-known disease genes)
// ---------------------------------------------------------------------------
export const GENE_NOTES: Record<string, string> = {
  BRCA1:  "Tumor suppressor involved in DNA double-strand break repair. Pathogenic variants confer high lifetime risk of breast and ovarian cancer.",
  BRCA2:  "DNA repair gene and BRCA1 binding partner. Pathogenic variants are the most common cause of hereditary breast cancer.",
  TP53:   "The 'guardian of the genome' — the most frequently mutated gene in human cancer. Regulates cell cycle arrest and apoptosis.",
  EGFR:   "Epidermal growth factor receptor. Frequently amplified or mutated in lung adenocarcinoma; the target of erlotinib and osimertinib.",
  KRAS:   "RAS GTPase proto-oncogene — one of the most commonly mutated genes across all cancers, particularly pancreatic and colorectal.",
  BRAF:   "Serine/threonine kinase in the MAPK pathway. V600E mutation drives ~50% of melanomas and is targeted by vemurafenib.",
  APC:    "Gatekeeper tumor suppressor of colorectal cancer. Germline variants cause familial adenomatous polyposis (FAP).",
  CFTR:   "Chloride channel mutated in cystic fibrosis. Hundreds of variants catalogued; F508del is by far the most common.",
  MLH1:   "Mismatch repair gene. Pathogenic variants cause Lynch syndrome — elevated risk of colorectal, endometrial, and other cancers.",
  MSH2:   "Mismatch repair gene and Lynch syndrome cause. Works with MSH6 to detect base-base mismatches after replication.",
  MSH6:   "Mismatch repair gene. Lynch syndrome variants here tend to show weaker cancer penetrance than MLH1/MSH2.",
  PMS2:   "Mismatch repair gene involved in Lynch syndrome. Biallelic variants cause constitutional mismatch repair deficiency.",
  VHL:    "Tumor suppressor mutated in von Hippel-Lindau syndrome. Regulates HIF-1α and is frequently lost in clear-cell renal carcinoma.",
  RB1:    "The first tumor suppressor identified. Loss causes retinoblastoma; also implicated in osteosarcoma and small-cell lung cancer.",
  NF1:    "Neurofibromin — a RAS-GAP that keeps RAS signaling in check. Loss causes neurofibromatosis type 1.",
  NF2:    "Merlin — tumor suppressor mutated in neurofibromatosis type 2 and sporadic meningiomas.",
  PTEN:   "Phosphatase that opposes PI3K/AKT signaling. Germline loss causes Cowden syndrome; somatic loss is extremely common in cancer.",
  ATM:    "Master kinase of the DNA damage response. Biallelic loss causes ataxia-telangiectasia; heterozygous variants raise breast cancer risk.",
  PALB2:  "BRCA1/BRCA2 binding partner — forms the bridge between the two. Pathogenic variants confer moderate-to-high breast cancer risk.",
  CHEK2:  "Checkpoint kinase activated by ATM after DNA damage. Moderate-penetrance breast and colorectal cancer risk gene.",
  STK11:  "Serine/threonine kinase mutated in Peutz-Jeghers syndrome. Also a tumor suppressor in lung adenocarcinoma.",
  CDH1:   "E-cadherin — epithelial cell adhesion molecule. Germline variants cause hereditary diffuse gastric cancer.",
  LDLR:   "LDL receptor responsible for clearing LDL cholesterol. Loss-of-function variants cause familial hypercholesterolemia.",
  MUTYH:  "Base excision repair gene. Biallelic variants cause MUTYH-associated polyposis, a recessive colorectal cancer syndrome.",
  RAD51C: "RAD51 paralog in the BRCA pathway. Pathogenic variants are associated with ovarian and breast cancer risk.",
  RAD51D: "Another RAD51 paralog. Germline variants primarily raise ovarian cancer risk.",
  FBN1:   "Fibrillin-1, structural component of extracellular microfibrils. Variants cause Marfan syndrome.",
  LMNA:   "Nuclear lamins. Variants cause a wide spectrum of laminopathies including Emery-Dreifuss muscular dystrophy and progeria.",
  PKD1:   "Polycystin-1 — the major cause of autosomal dominant polycystic kidney disease.",
  PKD2:   "Polycystin-2 — the second polycystic kidney disease gene; accounts for ~15% of ADPKD cases.",
  HBB:    "Beta-globin — variants cause sickle cell disease (HbS) and various beta-thalassemias.",
  HBA1:   "Alpha-globin subunit. Deletions and variants cause alpha-thalassemia.",
  HBA2:   "Second alpha-globin gene. Often co-deleted with HBA1 in alpha-thalassemia.",
  G6PD:   "Glucose-6-phosphate dehydrogenase — X-linked. Deficiency is the most common enzyme disorder, triggering hemolytic anemia.",
  F8:     "Clotting factor VIII — X-linked. Variants cause hemophilia A, the most common severe bleeding disorder.",
  F9:     "Clotting factor IX — X-linked. Variants cause hemophilia B (Christmas disease).",
  DMD:    "Dystrophin — largest gene in the human genome. Frame-disrupting variants cause Duchenne muscular dystrophy.",
};
