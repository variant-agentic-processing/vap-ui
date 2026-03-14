/**
 * Parses a VCF genotype string (e.g. "0/1", "1|1") and returns a small
 * Het / Hom badge, or null for missing/ambiguous genotypes.
 */

export function zygosity(genotype: string): "Het" | "Hom" | null {
  const alleles = genotype.split(/[/|]/);
  if (alleles.length !== 2) return null;
  const [a, b] = alleles;
  if (a === "." || b === ".") return null;
  return a === b ? "Hom" : "Het";
}

const TOOLTIPS = {
  Het: "Heterozygous — one reference allele and one alternate allele",
  Hom: "Homozygous — two copies of the alternate allele",
};

export function ZygosityBadge({ genotype }: { genotype: string }) {
  const z = zygosity(genotype);
  if (!z) return null;
  return (
    <span
      title={TOOLTIPS[z]}
      className={
        z === "Het"
          ? "ml-1.5 rounded px-1 py-0.5 text-[10px] font-semibold leading-none bg-brand-cyan/15 text-brand-cyan cursor-help"
          : "ml-1.5 rounded px-1 py-0.5 text-[10px] font-semibold leading-none bg-brand-gold/15 text-brand-gold cursor-help"
      }
    >
      {z}
    </span>
  );
}
