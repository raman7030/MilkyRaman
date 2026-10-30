package com.milkyraman.app.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import java.math.BigDecimal

class MilkPricingTest {
    private fun d(value: String) = BigDecimal(value)

    @Test fun fixedRateCalculatesRoundedTotal() {
        val price = MilkPricing.fixedRate(d("2.5"), d("58.25"))
        assertEquals(d("58.25"), price.ratePerLitre)
        assertEquals(d("145.63"), price.total)
    }

    @Test fun rateChartChoosesHighestMatchingSlab() {
        val chart = listOf(
            RateSlab(d("3.0"), d("8.0"), d("30")),
            RateSlab(d("4.0"), d("8.2"), d("42")),
            RateSlab(d("4.5"), d("8.0"), d("45"))
        )
        val price = MilkPricing.fromRateChart(d("2"), MilkQuality(d("4.6"), d("8.3")), chart)
        assertEquals(d("45.00"), price.ratePerLitre)
        assertEquals(d("90.00"), price.total)
    }

    @Test fun rateChartRejectsMissingSlab() {
        val chart = listOf(RateSlab(d("4.0"), d("8.0"), d("40")))
        assertThrows(IllegalArgumentException::class.java) {
            MilkPricing.fromRateChart(d("1"), MilkQuality(d("3.5"), d("8.0")), chart)
        }
    }

    @Test fun quantityMustBePositive() {
        assertThrows(IllegalArgumentException::class.java) {
            MilkPricing.fixedRate(d("0"), d("50"))
        }
    }
}
