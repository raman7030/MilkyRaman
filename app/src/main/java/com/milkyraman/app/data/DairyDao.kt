package com.milkyraman.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface DairyDao {
    @Query("SELECT * FROM farmers WHERE active = 1 ORDER BY name COLLATE NOCASE")
    fun observeFarmers(): Flow<List<FarmerEntity>>
    @Query("SELECT * FROM customers WHERE active = 1 ORDER BY name COLLATE NOCASE")
    fun observeCustomers(): Flow<List<CustomerEntity>>
    @Query("SELECT * FROM milk_entries ORDER BY entryDate DESC, createdAt DESC")
    fun observeMilkEntries(): Flow<List<MilkEntryEntity>>
    @Query("SELECT * FROM payments ORDER BY paymentDate DESC, createdAt DESC")
    fun observePayments(): Flow<List<PaymentEntity>>
    @Query("SELECT * FROM products WHERE active = 1 ORDER BY name COLLATE NOCASE")
    fun observeProducts(): Flow<List<ProductEntity>>
    @Query("SELECT * FROM expenses ORDER BY expenseDate DESC")
    fun observeExpenses(): Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT) suspend fun addFarmer(item: FarmerEntity)
    @Insert(onConflict = OnConflictStrategy.ABORT) suspend fun addCustomer(item: CustomerEntity)
    @Insert(onConflict = OnConflictStrategy.ABORT) suspend fun addMilkEntry(item: MilkEntryEntity)
    @Insert(onConflict = OnConflictStrategy.ABORT) suspend fun addPayment(item: PaymentEntity)
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun saveProduct(item: ProductEntity)
    @Insert(onConflict = OnConflictStrategy.ABORT) suspend fun addExpense(item: ExpenseEntity)

    @Query("SELECT COUNT(*) FROM farmers WHERE active = 1") fun observeFarmerCount(): Flow<Int>
    @Query("SELECT COUNT(*) FROM customers WHERE active = 1") fun observeCustomerCount(): Flow<Int>
    @Query("SELECT COALESCE(SUM(CAST(totalAmount AS REAL)), 0) FROM milk_entries WHERE entryType = 'CUSTOMER_SELL' AND entryDate = :date")
    fun observeSalesTotal(date: String): Flow<Double>
    @Query("SELECT COALESCE(SUM(CAST(quantityLitres AS REAL)), 0) FROM milk_entries WHERE entryType = 'CUSTOMER_SELL' AND entryDate = :date")
    fun observeSalesLitres(date: String): Flow<Double>
}
