package com.milkyraman.app.domain

import java.math.BigDecimal
import java.math.RoundingMode

/** Pure pricing functions. The selected pricing method and chart are dairy settings. */
data class MilkQuality(val fat: BigDecimal, val snf: BigDecimal) {
    init {
        require(fat >= BigDecimal.ZERO) { "FAT cannot be negative" }
        require(snf >= BigDecimal.ZERO) { "SNF cannot be negative" }
    }
}
data class RateSlab(val minFat: BigDecimal, val minSnf: BigDecimal, val ratePerLitre: BigDecimal)
data class MilkPrice(val ratePerLitre: BigDecimal, val total: BigDecimal)

object MilkPricing {
    fun fixedRate(quantityLitres: BigDecimal, ratePerLitre: BigDecimal): MilkPrice {
        validateQuantity(quantityLitres)
        require(ratePerLitre >= BigDecimal.ZERO) { "Rate cannot be negative" }
        return MilkPrice(ratePerLitre.money(), quantityLitres.multiply(ratePerLitre).money())
    }

    /** Highest matching minimum FAT/SNF slab wins; no universal formula is assumed. */
    fun fromRateChart(quantityLitres: BigDecimal, quality: MilkQuality, chart: List<RateSlab>): MilkPrice {
        validateQuantity(quantityLitres)
        val match = chart.asSequence()
            .filter { quality.fat >= it.minFat && quality.snf >= it.minSnf }
            .maxWithOrNull(compareBy<RateSlab> { it.minFat }.thenBy { it.minSnf })
            ?: throw IllegalArgumentException("No rate chart slab matches this FAT/SNF reading")
        return fixedRate(quantityLitres, match.ratePerLitre)
    }

    private fun validateQuantity(quantity: BigDecimal) {
        require(quantity > BigDecimal.ZERO) { "Quantity must be greater than zero" }
    }
    private fun BigDecimal.money(): BigDecimal = setScale(2, RoundingMode.HALF_UP)
}
