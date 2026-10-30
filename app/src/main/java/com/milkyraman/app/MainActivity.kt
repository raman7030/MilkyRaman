package com.milkyraman.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.milkyraman.app.data.DairyDatabase
import com.milkyraman.app.data.DairyDao
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dao = DairyDatabase.getInstance(applicationContext).dairyDao()
        setContent { MilkyRamanTheme { DairyApp(dao) } }
    }
}

@Composable
private fun MilkyRamanTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF167A45),
            onPrimary = Color.White,
            primaryContainer = Color(0xFFE5F3E9),
            secondary = Color(0xFF5B8066),
            background = Color(0xFFF6F8F6),
            surface = Color.White,
            surfaceVariant = Color(0xFFF0F3F0)
        ),
        content = content
    )
}

private data class Module(val title: String, val subtitle: String, val icon: ImageVector)

@Composable
private fun DairyApp(dao: DairyDao) {
    var selectedTab by remember { mutableStateOf("Home") }
    var selectedModule by remember { mutableStateOf<String?>(null) }
    val today = remember { SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date()) }
    val sales by dao.observeSalesTotal(today).collectAsState(initial = 0.0)
    val litres by dao.observeSalesLitres(today).collectAsState(initial = 0.0)
    val farmers by dao.observeFarmerCount().collectAsState(initial = 0)
    val customers by dao.observeCustomerCount().collectAsState(initial = 0)
    val currency = remember { NumberFormat.getCurrencyInstance(Locale("en", "IN")) }

    val modules = listOf(
        Module("Milk Buy", "Farmer collection · FAT/SNF · AM/PM", Icons.Default.WaterDrop),
        Module("Milk Sell", "Customer sales · fixed or quality rate", Icons.Default.PointOfSale),
        Module("Farmers", "Farmer profiles and purchase history", Icons.Default.Agriculture),
        Module("Customers", "Customer profiles and individual rates", Icons.Default.People),
        Module("Payments & Khata", "Receipts, payouts, advances and dues", Icons.Default.AccountBalanceWallet),
        Module("Subscriptions", "Recurring quantity and delivery schedule", Icons.Default.CalendarMonth),
        Module("Delivery", "Route lists and delivery status", Icons.Default.LocalShipping),
        Module("Products & Stock", "Milk, curd, paneer, ghee and stock", Icons.Default.Inventory2),
        Module("Bills & Reports", "Day book, statements and profitability", Icons.Default.ReceiptLong)
    )

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                listOf(
                    "Home" to Icons.Default.Home,
                    "Sales" to Icons.Default.PointOfSale,
                    "Parties" to Icons.Default.People,
                    "Khata" to Icons.Default.MenuBook,
                    "More" to Icons.Default.MoreHoriz
                ).forEach { (label, icon) ->
                    NavigationBarItem(
                        selected = selectedTab == label,
                        onClick = { selectedTab = label; selectedModule = null },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) }
                    )
                }
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 16.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text("MilkyRaman", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("YOUR DAIRY. ONE SIMPLE HISAB.", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Surface(shape = MaterialTheme.shapes.large, color = MaterialTheme.colorScheme.surface) {
                        IconButton(onClick = { selectedModule = "Notifications" }) { Icon(Icons.Default.NotificationsNone, contentDescription = "Notifications") }
                    }
                }
            }
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
                    shape = MaterialTheme.shapes.extraLarge
                ) {
                    Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column {
                                Text("TODAY'S RETAIL SALES", style = MaterialTheme.typography.labelMedium, color = Color.White.copy(alpha = 0.78f))
                                Text(currency.format(sales), style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Surface(color = Color.White.copy(alpha = 0.16f), shape = MaterialTheme.shapes.large) {
                                Icon(Icons.Default.TrendingUp, contentDescription = null, tint = Color.White, modifier = Modifier.padding(13.dp))
                            }
                        }
                        HorizontalDivider(color = Color.White.copy(alpha = 0.22f))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            DashboardMetric("MILK SOLD", String.format(Locale.US, "%.2f L", litres))
                            DashboardMetric("FARMERS", farmers.toString())
                            DashboardMetric("CUSTOMERS", customers.toString())
                        }
                    }
                }
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Quick actions", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    Text("DAILY WORK", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                }
            }
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    QuickAction("Milk Buy", Icons.Default.Add, Modifier.weight(1f)) { selectedModule = "Milk Buy" }
                    QuickAction("Milk Sell", Icons.Default.ShoppingCart, Modifier.weight(1f)) { selectedModule = "Milk Sell" }
                    QuickAction("Payment", Icons.Default.Payments, Modifier.weight(1f)) { selectedModule = "Payments & Khata" }
                }
            }
            item { Text("Manage your dairy", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(modules) { module ->
                Card(
                    onClick = { selectedModule = module.title },
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                    shape = MaterialTheme.shapes.large
                ) {
                    Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        Surface(color = MaterialTheme.colorScheme.primaryContainer, shape = MaterialTheme.shapes.large) {
                            Icon(module.icon, contentDescription = null, modifier = Modifier.padding(13.dp), tint = MaterialTheme.colorScheme.primary)
                        }
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                            Text(module.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            Text(module.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            item {
                selectedModule?.let {
                    Surface(color = MaterialTheme.colorScheme.secondaryContainer, shape = MaterialTheme.shapes.large) {
                        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Construction, contentDescription = null)
                            Spacer(Modifier.width(10.dp))
                            Text("$it module is in the implementation roadmap.", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
            item { Text("MilkyRaman 0.2.0 · Offline database foundation", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        }
    }
}

@Composable
private fun DashboardMetric(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.72f))
        Text(value, style = MaterialTheme.typography.titleMedium, color = Color.White, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun QuickAction(label: String, icon: ImageVector, modifier: Modifier, onClick: () -> Unit) {
    FilledTonalButton(onClick = onClick, modifier = modifier.height(54.dp), contentPadding = PaddingValues(horizontal = 8.dp)) {
        Icon(icon, contentDescription = null)
        Spacer(Modifier.width(5.dp))
        Text(label, maxLines = 1)
    }
}
