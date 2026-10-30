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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { MilkyRamanTheme { DairyApp() } }
    }
}

@Composable
private fun MilkyRamanTheme(content: @Composable () -> Unit) {
    val colors = lightColorScheme(
        primary = androidx.compose.ui.graphics.Color(0xFF167A45),
        secondary = androidx.compose.ui.graphics.Color(0xFF5B8C6B),
        background = androidx.compose.ui.graphics.Color(0xFFF7F8F6),
        surface = androidx.compose.ui.graphics.Color.White
    )
    MaterialTheme(colorScheme = colors, content = content)
}

private data class Module(val title: String, val subtitle: String, val icon: ImageVector)

@Composable
private fun DairyApp() {
    var selectedTab by remember { mutableStateOf("Home") }
    val modules = listOf(
        Module("New Sale", "Record milk or product sales", Icons.Default.AddShoppingCart),
        Module("Customers", "Households, shops and customer rates", Icons.Default.People),
        Module("Farmers & Procurement", "Milk collection, FAT/SNF and purchase", Icons.Default.Agriculture),
        Module("Subscriptions", "Recurring customer deliveries", Icons.Default.CalendarMonth),
        Module("Payments & Khata", "Customer and farmer ledgers", Icons.Default.AccountBalanceWallet),
        Module("Delivery", "Routes and delivery completion", Icons.Default.LocalShipping),
        Module("Products & Stock", "Milk, curd, paneer, ghee and inventory", Icons.Default.Inventory2),
        Module("Bills & Reports", "Invoices, sales, dues and margins", Icons.Default.ReceiptLong)
    )
    Scaffold(
        bottomBar = {
            NavigationBar {
                listOf("Home" to Icons.Default.Home, "Sales" to Icons.Default.PointOfSale, "Customers" to Icons.Default.People, "Khata" to Icons.Default.MenuBook, "More" to Icons.Default.MoreHoriz).forEach { (label, icon) ->
                    NavigationBarItem(selected = selectedTab == label, onClick = { selectedTab = label }, icon = { Icon(icon, contentDescription = label) }, label = { Text(label) })
                }
            }
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            item {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("MilkyRaman", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("DAIRY BUSINESS MANAGER", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    IconButton(onClick = {}) { Icon(Icons.Default.NotificationsNone, contentDescription = "Notifications") }
                }
            }
            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer), modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Today's business", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Metric("₹0", "Sales")
                            Metric("0 L", "Milk sold")
                        }
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Metric("0", "Customers")
                            Metric("₹0", "Outstanding")
                        }
                    }
                }
            }
            item { Text("Manage your dairy", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(modules) { module ->
                Card(onClick = { selectedTab = module.title }, modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        Surface(color = MaterialTheme.colorScheme.secondaryContainer, shape = MaterialTheme.shapes.medium) {
                            Icon(module.icon, contentDescription = null, modifier = Modifier.padding(12.dp), tint = MaterialTheme.colorScheme.primary)
                        }
                        Column(Modifier.weight(1f)) {
                            Text(module.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                            Text(module.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    }
                }
            }
            item { Text("Version 0.1.0 • Local-first foundation", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        }
    }
}

@Composable
private fun Metric(value: String, label: String) {
    Column {
        Text(value, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
