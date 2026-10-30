package com.milkyraman.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [FarmerEntity::class, CustomerEntity::class, MilkEntryEntity::class, PaymentEntity::class, ProductEntity::class, ExpenseEntity::class], version = 1, exportSchema = true)
abstract class DairyDatabase : RoomDatabase() {
    abstract fun dairyDao(): DairyDao
    companion object {
        @Volatile private var instance: DairyDatabase? = null
        fun getInstance(context: Context): DairyDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(context.applicationContext, DairyDatabase::class.java, "milkyraman.db")
                .build().also { instance = it }
        }
    }
}
