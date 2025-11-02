// Data Storage Keys
const STORAGE_KEYS = {
    MENU_ITEMS: 'menuItems',
    INVOICES: 'invoices',
    CART: 'cart',
    STOCK_TRANSACTIONS: 'stockTransactions'
};

// Default Menu Items with images from Unsplash (free open images)
const DEFAULT_MENU_ITEMS = [
    { 
        id: 1, 
        name: 'Idli', 
        price: 30, 
        description: 'Soft and fluffy steamed rice cakes', 
        stock: 100,
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop&auto=format'
    },
    { 
        id: 2, 
        name: 'Dosa', 
        price: 50, 
        description: 'Crispy fermented crepe', 
        stock: 80,
        image: 'https://images.unsplash.com/photo-1626700051175-54f28f52419a?w=500&h=400&fit=crop&auto=format'
    },
    { 
        id: 3, 
        name: 'Vada', 
        price: 25, 
        description: 'Savory fried donut', 
        stock: 90,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop&auto=format'
    },
    { 
        id: 4, 
        name: 'Chappathi', 
        price: 40, 
        description: 'Whole wheat flatbread', 
        stock: 75,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop&auto=format'
    },
    { 
        id: 5, 
        name: 'Parotta', 
        price: 45, 
        description: 'Layered flatbread', 
        stock: 70,
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop&auto=format'
    }
];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupEventListeners();
    loadMenuItems();
    loadBillingMenu();
    loadInvoices();
    loadSalesReport();
    loadStockManagement();
});

// Initialize default data if localStorage is empty
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
        localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(DEFAULT_MENU_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STOCK_TRANSACTIONS)) {
        localStorage.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, JSON.stringify([]));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Menu Management
    document.getElementById('add-menu-btn').addEventListener('click', () => openMenuModal());
    document.getElementById('menu-form').addEventListener('submit', handleMenuSubmit);
    document.getElementById('cancel-menu-btn').addEventListener('click', () => closeMenuModal());

    // Stock Management
    document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);
    document.getElementById('cancel-stock-btn').addEventListener('click', () => closeStockModal());

    // Billing
    document.getElementById('pay-now-btn').addEventListener('click', handlePayment);

    // Invoice
    document.getElementById('filter-invoices-btn').addEventListener('click', filterInvoices);
    document.getElementById('clear-invoice-filter-btn').addEventListener('click', clearInvoiceFilter);
    document.getElementById('print-invoice-btn').addEventListener('click', printInvoice);
    document.getElementById('close-invoice-btn').addEventListener('click', () => closeInvoiceModal());

    // Sales Report
    document.getElementById('filter-sales-btn').addEventListener('click', filterSalesReport);
    document.getElementById('clear-sales-filter-btn').addEventListener('click', clearSalesFilter);

    // Payment Modal
    document.getElementById('close-payment-btn').addEventListener('click', () => closePaymentModal());

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Close modals on X button
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => closeAllModals());
    });
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-section`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Refresh data when switching tabs
    if (tabName === 'menu') loadMenuItems();
    if (tabName === 'billing') loadBillingMenu();
    if (tabName === 'invoices') loadInvoices();
    if (tabName === 'sales') loadSalesReport();
    if (tabName === 'stock') loadStockManagement();
}

// ========== MENU MANAGEMENT ==========

function loadMenuItems() {
    const menuItems = getMenuItems();
    const menuGrid = document.getElementById('menu-grid');
    
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<p style="text-align: center; color: var(--text-light);">No menu items. Add your first item!</p>';
        return;
    }

    menuGrid.innerHTML = menuItems.map(item => `
        <div class="menu-card">
            <div class="menu-image-container">
                <img src="${item.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                     alt="${escapeHtml(item.name)}" 
                     class="menu-image"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
            </div>
            <h3>${escapeHtml(item.name)}</h3>
            <div class="price">₹${item.price}</div>
            <div class="description">${escapeHtml(item.description || '')}</div>
            <div class="stock-info ${getStockClass(item.stock)}">
                Stock: ${item.stock}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="editMenuItem(${item.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function getStockClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 20) return 'low-stock';
    return 'in-stock';
}

function openMenuModal(itemId = null) {
    const modal = document.getElementById('menu-modal');
    const form = document.getElementById('menu-form');
    const title = document.getElementById('modal-title');
    
    if (itemId) {
        const item = getMenuItems().find(m => m.id === itemId);
        if (item) {
            document.getElementById('menu-item-id').value = item.id;
            document.getElementById('menu-name').value = item.name;
            document.getElementById('menu-price').value = item.price;
            document.getElementById('menu-description').value = item.description || '';
            document.getElementById('menu-image').value = item.image || '';
            document.getElementById('menu-stock').value = item.stock || 0;
            title.textContent = 'Edit Menu Item';
        }
    } else {
        form.reset();
        document.getElementById('menu-item-id').value = '';
        document.getElementById('menu-stock').value = 0;
        title.textContent = 'Add Menu Item';
    }
    
    modal.classList.add('active');
}

function closeMenuModal() {
    document.getElementById('menu-modal').classList.remove('active');
    document.getElementById('menu-form').reset();
}

function handleMenuSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('menu-item-id').value;
    const name = document.getElementById('menu-name').value.trim();
    const price = parseFloat(document.getElementById('menu-price').value);
    const description = document.getElementById('menu-description').value.trim();
    const image = document.getElementById('menu-image').value.trim();
    const stock = parseInt(document.getElementById('menu-stock').value) || 0;

    // Validation
    if (!name) {
        showToast('Please enter item name', 'error');
        return;
    }
    if (isNaN(price) || price <= 0) {
        showToast('Please enter a valid price', 'error');
        return;
    }
    if (stock < 0) {
        showToast('Stock cannot be negative', 'error');
        return;
    }

    const menuItems = getMenuItems();
    
    if (id) {
        // Update existing item
        const index = menuItems.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], name, price, description, image, stock };
            showToast('Menu item updated successfully', 'success');
        }
    } else {
        // Add new item
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(m => m.id)) + 1 : 1;
        menuItems.push({ id: newId, name, price, description, image, stock });
        showToast('Menu item added successfully', 'success');
    }

    saveMenuItems(menuItems);
    closeMenuModal();
    loadMenuItems();
    loadBillingMenu();
    loadStockManagement();
}

function editMenuItem(id) {
    openMenuModal(id);
}

function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
        const menuItems = getMenuItems().filter(item => item.id !== id);
        saveMenuItems(menuItems);
        showToast('Menu item deleted successfully', 'success');
        loadMenuItems();
        loadBillingMenu();
        loadStockManagement();
    }
}

// ========== BILLING ==========

function loadBillingMenu() {
    const menuItems = getMenuItems();
    const billingGrid = document.getElementById('billing-menu-grid');
    
    billingGrid.innerHTML = menuItems.map(item => `
        <div class="menu-card">
            <div class="menu-image-container">
                <img src="${item.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                     alt="${escapeHtml(item.name)}" 
                     class="menu-image"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
            </div>
            <h3>${escapeHtml(item.name)}</h3>
            <div class="price">₹${item.price}</div>
            <div class="description">${escapeHtml(item.description || '')}</div>
            <div class="stock-info ${getStockClass(item.stock)}">
                Stock: ${item.stock}
            </div>
            <button class="btn btn-success" onclick="addToCart(${item.id})" ${item.stock === 0 ? 'disabled' : ''}>
                ${item.stock === 0 ? 'Out of Stock' : 'Add to Bill'}
            </button>
        </div>
    `).join('');

    loadCart();
}

function addToCart(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(m => m.id === itemId);
    
    if (!item) return;
    if (item.stock === 0) {
        showToast('Item is out of stock', 'error');
        return;
    }

    let cart = getCart();
    const existingItem = cart.find(c => c.itemId === itemId);
    
    if (existingItem) {
        if (existingItem.quantity >= item.stock) {
            showToast('Cannot add more. Stock limit reached', 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    saveCart(cart);
    loadCart();
}

function loadCart() {
    const cart = getCart();
    const cartItemsDiv = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const payNowBtn = document.getElementById('pay-now-btn');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        cartTotal.textContent = '0';
        payNowBtn.disabled = true;
        return;
    }

    let total = 0;
    cartItemsDiv.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity(${item.itemId})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${item.itemId})">+</button>
                    <button class="btn btn-danger" onclick="removeFromCart(${item.itemId})" style="margin-left: 10px; padding: 5px 10px;">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    cartTotal.textContent = total.toFixed(2);
    payNowBtn.disabled = false;
}

function increaseQuantity(itemId) {
    const cart = getCart();
    const item = cart.find(c => c.itemId === itemId);
    const menuItem = getMenuItems().find(m => m.id === itemId);
    
    if (item && menuItem) {
        if (item.quantity >= menuItem.stock) {
            showToast('Cannot add more. Stock limit reached', 'error');
            return;
        }
        item.quantity++;
        saveCart(cart);
        loadCart();
    }
}

function decreaseQuantity(itemId) {
    const cart = getCart();
    const item = cart.find(c => c.itemId === itemId);
    
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart(cart);
        loadCart();
    }
}

function removeFromCart(itemId) {
    const cart = getCart().filter(c => c.itemId !== itemId);
    saveCart(cart);
    loadCart();
}

function handlePayment() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }

    // Check stock availability
    const menuItems = getMenuItems();
    for (const cartItem of cart) {
        const menuItem = menuItems.find(m => m.id === cartItem.itemId);
        if (!menuItem || menuItem.stock < cartItem.quantity) {
            showToast(`${cartItem.name} is out of stock`, 'error');
            return;
        }
    }

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate invoice
    const invoiceId = generateInvoiceId();
    const invoice = {
        invoiceId,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        items: cart.map(item => ({
            itemId: item.itemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        paymentMethod: 'Cash'
    };

    // Save invoice
    const invoices = getInvoices();
    invoices.unshift(invoice);
    saveInvoices(invoices);

    // Update stock
    updateStockAfterSale(cart);

    // Show receipt
    showPaymentReceipt(invoice);

    // Clear cart
    saveCart([]);
    loadCart();
    loadMenuItems();
    loadBillingMenu();
    
    showToast('Payment successful!', 'success');
}

function updateStockAfterSale(cart) {
    const menuItems = getMenuItems();
    const stockTransactions = getStockTransactions();
    const transactionDate = new Date().toISOString();

    cart.forEach(cartItem => {
        const menuItem = menuItems.find(m => m.id === cartItem.itemId);
        if (menuItem) {
            menuItem.stock -= cartItem.quantity;
            
            // Record stock transaction
            stockTransactions.push({
                transactionId: Date.now() + Math.random(),
                itemId: menuItem.id,
                itemName: menuItem.name,
                type: 'sale',
                quantity: cartItem.quantity,
                timestamp: transactionDate,
                notes: 'Sale transaction'
            });
        }
    });

    saveMenuItems(menuItems);
    saveStockTransactions(stockTransactions);
}

function generateInvoiceId() {
    const invoices = getInvoices();
    const invoiceNum = invoices.length + 1;
    return `INV-${String(invoiceNum).padStart(4, '0')}`;
}

function showPaymentReceipt(invoice) {
    const modal = document.getElementById('payment-modal');
    const receiptDiv = document.getElementById('payment-receipt');
    
    receiptDiv.innerHTML = `
        <div class="invoice-detail">
            <div class="invoice-header">
                <h2>Payment Receipt</h2>
                <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
                <p><strong>Date:</strong> ${invoice.date} ${invoice.time}</p>
            </div>
            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${escapeHtml(item.name)}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="invoice-total">
                <strong>Total: ₹${invoice.total.toFixed(2)}</strong>
            </div>
            <p style="text-align: center; margin-top: 20px; color: var(--success-color);">
                <strong>✓ Payment Successful</strong>
            </p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

// ========== INVOICE REPORTS ==========

function loadInvoices(filteredInvoices = null) {
    const invoices = filteredInvoices || getInvoices();
    const invoicesList = document.getElementById('invoices-list');
    
    if (invoices.length === 0) {
        invoicesList.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-light);">No invoices found</p>';
        return;
    }

    invoicesList.innerHTML = `
        <table class="invoices-table">
            <thead>
                <tr>
                    <th>Invoice ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${invoices.map(invoice => `
                    <tr>
                        <td>${invoice.invoiceId}</td>
                        <td>${invoice.date} ${invoice.time}</td>
                        <td>${invoice.items.length} item(s)</td>
                        <td>₹${invoice.total.toFixed(2)}</td>
                        <td><button class="btn btn-primary" onclick="viewInvoice('${invoice.invoiceId}')">View</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterInvoices() {
    const startDate = document.getElementById('invoice-start-date').value;
    const endDate = document.getElementById('invoice-end-date').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }

    const invoices = getInvoices();
    const filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return invoiceDate >= start && invoiceDate <= end;
    });

    loadInvoices(filtered);
    showToast(`Found ${filtered.length} invoice(s)`, 'success');
}

function clearInvoiceFilter() {
    document.getElementById('invoice-start-date').value = '';
    document.getElementById('invoice-end-date').value = '';
    loadInvoices();
}

function viewInvoice(invoiceId) {
    const invoices = getInvoices();
    const invoice = invoices.find(i => i.invoiceId === invoiceId);
    
    if (!invoice) {
        showToast('Invoice not found', 'error');
        return;
    }

    const modal = document.getElementById('invoice-modal');
    const detailsDiv = document.getElementById('invoice-details');
    
    detailsDiv.innerHTML = `
        <div class="invoice-detail">
            <div class="invoice-header">
                <h2>Invoice</h2>
                <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
                <p><strong>Date:</strong> ${invoice.date} ${invoice.time}</p>
            </div>
            <table class="invoice-items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${escapeHtml(item.name)}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price}</td>
                            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="invoice-total">
                <strong>Total: ₹${invoice.total.toFixed(2)}</strong>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Store current invoice for printing
    window.currentInvoice = invoice;
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').classList.remove('active');
}

function printInvoice() {
    window.print();
}

// ========== SALES REPORT ==========

function loadSalesReport(filteredInvoices = null) {
    const invoices = filteredInvoices || getInvoices();
    
    if (invoices.length === 0) {
        document.getElementById('total-revenue').textContent = '₹0';
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('avg-order').textContent = '₹0';
        document.getElementById('popular-items').innerHTML = '<p style="color: var(--text-light);">No sales data</p>';
        return;
    }

    // Calculate statistics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = invoices.length;
    const avgOrder = totalRevenue / totalOrders;

    // Calculate popular items
    const itemSales = {};
    invoices.forEach(invoice => {
        invoice.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += item.price * item.quantity;
        });
    });

    const popularItems = Object.values(itemSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // Update UI
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('avg-order').textContent = `₹${avgOrder.toFixed(2)}`;

    const popularItemsDiv = document.getElementById('popular-items');
    if (popularItems.length === 0) {
        popularItemsDiv.innerHTML = '<p style="color: var(--text-light);">No items sold</p>';
    } else {
        popularItemsDiv.innerHTML = popularItems.map(item => `
            <div class="popular-item">
                <span class="popular-item-name">${escapeHtml(item.name)}</span>
                <span class="popular-item-stats">
                    ${item.quantity} sold • ₹${item.revenue.toFixed(2)}
                </span>
            </div>
        `).join('');
    }
}

function filterSalesReport() {
    const startDate = document.getElementById('sales-start-date').value;
    const endDate = document.getElementById('sales-end-date').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }

    const invoices = getInvoices();
    const filtered = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.timestamp);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return invoiceDate >= start && invoiceDate <= end;
    });

    loadSalesReport(filtered);
    showToast(`Report filtered: ${filtered.length} invoice(s)`, 'success');
}

function clearSalesFilter() {
    document.getElementById('sales-start-date').value = '';
    document.getElementById('sales-end-date').value = '';
    loadSalesReport();
}

// ========== STOCK MANAGEMENT ==========

function loadStockManagement() {
    const menuItems = getMenuItems();
    const stockList = document.getElementById('stock-list');
    
    if (menuItems.length === 0) {
        stockList.innerHTML = '<p style="text-align: center; color: var(--text-light);">No items in stock</p>';
        return;
    }

    stockList.innerHTML = menuItems.map(item => `
        <div class="stock-item">
            <div class="stock-item-info">
                <div class="stock-item-name">${escapeHtml(item.name)}</div>
                <div class="stock-item-quantity ${getStockClass(item.stock)}" style="display: inline-block; padding: 5px 10px; border-radius: 5px;">
                    Stock: ${item.stock}
                </div>
            </div>
            <button class="btn btn-primary" onclick="openStockModal(${item.id})">Adjust Stock</button>
        </div>
    `).join('');
}

function openStockModal(itemId) {
    const item = getMenuItems().find(m => m.id === itemId);
    if (!item) return;

    const modal = document.getElementById('stock-modal');
    document.getElementById('stock-item-id').value = item.id;
    document.getElementById('stock-item-name').value = item.name;
    document.getElementById('stock-current').value = item.stock;
    document.getElementById('stock-quantity').value = '';
    document.getElementById('stock-notes').value = '';
    document.getElementById('stock-type').value = 'in';
    
    modal.classList.add('active');
}

function closeStockModal() {
    document.getElementById('stock-modal').classList.remove('active');
    document.getElementById('stock-form').reset();
}

function handleStockSubmit(e) {
    e.preventDefault();
    
    const itemId = parseInt(document.getElementById('stock-item-id').value);
    const type = document.getElementById('stock-type').value;
    const quantity = parseInt(document.getElementById('stock-quantity').value);
    const notes = document.getElementById('stock-notes').value.trim();

    if (isNaN(quantity) || quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    const menuItems = getMenuItems();
    const item = menuItems.find(m => m.id === itemId);
    
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }

    const stockTransactions = getStockTransactions();
    let newStock = item.stock;

    if (type === 'in') {
        newStock += quantity;
    } else if (type === 'out') {
        if (quantity > item.stock) {
            showToast('Insufficient stock', 'error');
            return;
        }
        newStock -= quantity;
    } else if (type === 'adjustment') {
        newStock = quantity;
    }

    if (newStock < 0) {
        showToast('Stock cannot be negative', 'error');
        return;
    }

    // Update stock
    item.stock = newStock;

    // Record transaction
    stockTransactions.push({
        transactionId: Date.now() + Math.random(),
        itemId: item.id,
        itemName: item.name,
        type: type,
        quantity: quantity,
        timestamp: new Date().toISOString(),
        notes: notes || `${type} transaction`
    });

    saveMenuItems(menuItems);
    saveStockTransactions(stockTransactions);
    
    showToast('Stock updated successfully', 'success');
    closeStockModal();
    loadStockManagement();
    loadMenuItems();
    loadBillingMenu();
}

// ========== UTILITY FUNCTIONS ==========

function getMenuItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU_ITEMS) || '[]');
}

function saveMenuItems(items) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
}

function getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]');
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function getInvoices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
}

function saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

function getStockTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_TRANSACTIONS) || '[]');
}

function saveStockTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, JSON.stringify(transactions));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Make functions globally available for onclick handlers
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.addToCart = addToCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.viewInvoice = viewInvoice;
window.openStockModal = openStockModal;

