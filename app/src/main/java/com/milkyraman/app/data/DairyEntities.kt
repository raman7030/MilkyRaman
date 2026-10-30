package com.milkyraman.app.data

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(tableName = "farmers", indices = [Index(value = ["name"])])
data class FarmerEntity(@PrimaryKey val id: String, val name: String, val phone: String = "", val milkType: String = "COW", val active: Boolean = true, val createdAt: Long = System.currentTimeMillis())

@Entity(tableName = "customers", indices = [Index(value = ["name"]), Index(value = ["phone"])])
data class CustomerEntity(@PrimaryKey val id: String, val name: String, val phone: String = "", val address: String = "", val defaultRate: String = "0.00", val active: Boolean = true, val createdAt: Long = System.currentTimeMillis())

@Entity(tableName = "milk_entries", indices = [Index(value = ["partyId", "entryDate"]), Index(value = ["entryDate", "shift"])])
data class MilkEntryEntity(
    @PrimaryKey val id: String, val partyId: String,
    /** FARMER_BUY or CUSTOMER_SELL */
    val entryType: String, val entryDate: String,
    /** AM or PM */
    val shift: String, val milkType: String, val quantityLitres: String,
    val fat: String?, val snf: String?, val ratePerLitre: String,
    val totalAmount: String, val note: String = "", val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "payments", indices = [Index(value = ["partyId", "paymentDate"])])
data class PaymentEntity(
    @PrimaryKey val id: String, val partyId: String,
    /** FARMER_PAYOUT or CUSTOMER_RECEIPT */
    val paymentType: String, val paymentDate: String, val amount: String,
    val method: String, val reference: String = "", val note: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "products", indices = [Index(value = ["name"], unique = true)])
data class ProductEntity(@PrimaryKey val id: String, val name: String, val unit: String = "LITRE", val saleRate: String = "0.00", val stockQuantity: String = "0.000", val active: Boolean = true)

@Entity(tableName = "expenses", indices = [Index(value = ["expenseDate"])])
data class ExpenseEntity(@PrimaryKey val id: String, val title: String, val category: String, val expenseDate: String, val amount: String, val paymentMethod: String = "CASH", val note: String = "")
