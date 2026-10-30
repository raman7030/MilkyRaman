package com.milkyraman.app.data

import com.milkyraman.app.domain.MilkPricing
import com.milkyraman.app.domain.MilkQuality
import com.milkyraman.app.domain.RateSlab
import java.math.BigDecimal
import java.util.UUID

/**
 * Validates and persists business events. UI code should call this layer, never DAOs directly.
 */
class DairyRepository(private val dao: DairyDao) {
    suspend fun registerFarmer(name: String, phone: String = "", milkType: String = "COW") {
        require(name.isNotBlank()) { "Farmer name is required" }
        require(milkType in setOf("COW", "BUFFALO", "MIXED")) { "Unsupported milk type" }
        dao.addFarmer(FarmerEntity(UUID.randomUUID().toString(), name.trim(), phone.trim(), milkType))
    }

    suspend fun registerCustomer(name: String, phone: String = "", address: String = "", defaultRate: BigDecimal) {
        require(name.isNotBlank()) { "Customer name is required" }
        require(defaultRate >= BigDecimal.ZERO) { "Customer rate cannot be negative" }
        dao.addCustomer(CustomerEntity(UUID.randomUUID().toString(), name.trim(), phone.trim(), address.trim(), defaultRate.toPlainString()))
    }

    suspend fun recordMilk(
        partyId: String,
        entryType: String,
        entryDate: String,
        shift: String,
        milkType: String,
        quantityLitres: BigDecimal,
        ratePerLitre: BigDecimal? = null,
        quality: MilkQuality? = null,
        rateChart: List<RateSlab> = emptyList(),
        note: String = ""
    ): MilkEntryEntity {
        require(partyId.isNotBlank()) { "Select a farmer or customer" }
        require(entryType == "FARMER_BUY" || entryType == "CUSTOMER_SELL") { "Invalid milk entry type" }
        require(entryDate.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) { "Date must be YYYY-MM-DD" }
        require(shift == "AM" || shift == "PM") { "Shift must be AM or PM" }
        require(milkType in setOf("COW", "BUFFALO", "MIXED")) { "Unsupported milk type" }
        val price = if (quality != null) {
            MilkPricing.fromRateChart(quantityLitres, quality, rateChart)
        } else {
            requireNotNull(ratePerLitre) { "Enter a rate or FAT/SNF quality with a rate chart" }
            MilkPricing.fixedRate(quantityLitres, ratePerLitre)
        }
        val row = MilkEntryEntity(
            id = UUID.randomUUID().toString(), partyId = partyId, entryType = entryType,
            entryDate = entryDate, shift = shift, milkType = milkType,
            quantityLitres = quantityLitres.stripTrailingZeros().toPlainString(),
            fat = quality?.fat?.toPlainString(), snf = quality?.snf?.toPlainString(),
            ratePerLitre = price.ratePerLitre.toPlainString(), totalAmount = price.total.toPlainString(),
            note = note.trim()
        )
        dao.addMilkEntry(row)
        return row
    }

    suspend fun recordPayment(
        partyId: String, paymentType: String, paymentDate: String,
        amount: BigDecimal, method: String, reference: String = "", note: String = ""
    ) {
        require(partyId.isNotBlank()) { "Select a farmer or customer" }
        require(paymentType == "FARMER_PAYOUT" || paymentType == "CUSTOMER_RECEIPT") { "Invalid payment type" }
        require(amount > BigDecimal.ZERO) { "Payment must be greater than zero" }
        require(method in setOf("CASH", "UPI", "BANK", "CHEQUE", "OTHER")) { "Unsupported payment method" }
        require(paymentDate.matches(Regex("\\d{4}-\\d{2}-\\d{2}"))) { "Date must be YYYY-MM-DD" }
        dao.addPayment(PaymentEntity(UUID.randomUUID().toString(), partyId, paymentType, paymentDate, amount.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString(), method, reference.trim(), note.trim()))
    }
}
