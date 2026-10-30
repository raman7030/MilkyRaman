import { RateSlab } from '../types';

export interface MilkQuality {
  fat: number;
  snf: number;
}

export interface MilkPrice {
  ratePerLitre: number;
  total: number;
}

/**
 * Pure pricing functions matching Android MilkPricing.kt domain rules.
 */
export const MilkPricing = {
  fixedRate(quantityLitres: number, ratePerLitre: number): MilkPrice {
    if (quantityLitres <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    if (ratePerLitre < 0) {
      throw new Error('Rate cannot be negative');
    }
    const cleanRate = Math.round(ratePerLitre * 100) / 100;
    const cleanTotal = Math.round(quantityLitres * cleanRate * 100) / 100;
    return {
      ratePerLitre: cleanRate,
      total: cleanTotal
    };
  },

  /**
   * Highest matching minimum FAT/SNF slab wins; no universal formula is assumed.
   */
  fromRateChart(quantityLitres: number, quality: MilkQuality, chart: RateSlab[]): MilkPrice {
    if (quality.fat < 0) throw new Error('FAT cannot be negative');
    if (quality.snf < 0) throw new Error('SNF cannot be negative');
    if (quantityLitres <= 0) throw new Error('Quantity must be greater than zero');

    const matchingSlabs = chart.filter(
      slab => quality.fat >= slab.minFat && quality.snf >= slab.minSnf
    );

    if (matchingSlabs.length === 0) {
      throw new Error('No rate chart slab matches this FAT/SNF reading');
    }

    // Sort to find max minFat, then max minSnf
    matchingSlabs.sort((a, b) => {
      if (b.minFat !== a.minFat) {
        return b.minFat - a.minFat;
      }
      return b.minSnf - a.minSnf;
    });

    const match = matchingSlabs[0];
    return this.fixedRate(quantityLitres, match.ratePerLitre);
  }
};
