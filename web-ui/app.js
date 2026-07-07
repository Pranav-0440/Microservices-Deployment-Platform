const API_BASE = "http://localhost:8080";

// App State
let state = {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    role: localStorage.getItem("role") || null,
    selectedProduct: null,
    quantity: 1
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Check if user is logged in
    updateAuthUI();
    
    // Fetch products
    fetchProducts();
});

// Switch Login/Register Tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const tabs = document.querySelectorAll(".tab-btn");
    
    if (tab === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        tabs[0].classList.add("active");
        tabs[1].classList.remove("active");
    } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        tabs[0].classList.remove("active");
        tabs[1].classList.add("active");
    }
}

// Log message to virtual console
function logToConsole(message, type = "system") {
    const consoleOutput = document.getElementById("console-output");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.innerText = `[${timestamp}] ${message}`;
    
    consoleOutput.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearLogs() {
    document.getElementById("console-output").innerHTML = "";
    logToConsole("Console cleared.", "system");
}

// Update authentication state UI
function updateAuthUI() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const tabs = document.querySelector(".auth-tabs");
    const profileContainer = document.getElementById("profile-container");
    const adminCard = document.getElementById("admin-card");

    if (state.token) {
        // Logged in
        loginForm.classList.add("hidden");
        registerForm.classList.add("hidden");
        tabs.classList.add("hidden");
        profileContainer.classList.remove("hidden");
        
        document.getElementById("profile-username").innerText = state.username;
        document.getElementById("profile-role").innerText = state.role;
        document.getElementById("token-display").value = state.token;
        document.getElementById("profile-avatar").innerText = state.username.substring(0, 1).toUpperCase();

        // Show Admin module if role is ADMIN
        if (state.role === "ROLE_ADMIN") {
            adminCard.classList.remove("hidden");
        } else {
            adminCard.classList.add("hidden");
        }
    } else {
        // Logged out
        tabs.classList.remove("hidden");
        profileContainer.classList.add("hidden");
        adminCard.classList.add("hidden");
        switchAuthTab("login");
    }
}

// Handlers
async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    
    logToConsole(`Attempting login for user: ${usernameInput.value}...`, "info");
    
    try {
        const response = await fetch(`${API_BASE}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (jsonErr) {}
        
        if (!response.ok) {
            throw new Error((data && data.error) || `Authentication failed with status ${response.status}`);
        }
        
        if (!data) {
            throw new Error("No response body received from server.");
        }
        
        // Save state
        state.token = data.token;
        state.username = data.username;
        state.role = data.role;
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);
        
        logToConsole(`Login successful! Welcome ${data.username} (${data.role})`, "success");
        logToConsole(`Raw Response: ${JSON.stringify(data)}`, "system");
        
        usernameInput.value = "";
        passwordInput.value = "";
        
        updateAuthUI();
    } catch (err) {
        logToConsole(`Login Error: ${err.message}`, "error");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("reg-username");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");
    const roleInput = document.getElementById("reg-role");

    logToConsole(`Submitting registration for user: ${usernameInput.value}...`, "info");

    try {
        const response = await fetch(`${API_BASE}/api/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                role: roleInput.value
            })
        });

        let data = null;
        try {
            data = await response.json();
        } catch (jsonErr) {}
        
        if (!response.ok) {
            throw new Error((data && data.error) || `Registration failed with status ${response.status}`);
        }
        
        if (!data) {
            throw new Error("No response body received from server.");
        }

        // Auto login on registration success
        state.token = data.token;
        state.username = data.username;
        state.role = data.role;

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        logToConsole(`Registration successful! Registered and logged in as ${data.username}`, "success");
        logToConsole(`Raw Response: ${JSON.stringify(data)}`, "system");

        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        
        updateAuthUI();
    } catch (err) {
        logToConsole(`Registration Error: ${err.message}`, "error");
    }
}

function handleLogout() {
    state.token = null;
    state.username = null;
    state.role = null;
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    logToConsole("Signed out successfully.", "info");
    updateAuthUI();
}

async function fetchProducts() {
    const container = document.getElementById("catalog-container");
    const emptyState = document.getElementById("catalog-empty");
    const loadingSpinner = document.getElementById("catalog-loading");
    const refreshIcon = document.getElementById("refresh-icon");
    
    container.innerHTML = "";
    emptyState.classList.add("hidden");
    loadingSpinner.classList.remove("hidden");
    
    logToConsole("Refreshing catalog list...", "info");
    
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) {
            throw new Error("Unable to fetch catalog.");
        }
        
        const products = await response.json();
        loadingSpinner.classList.add("hidden");
        
        if (products.length === 0) {
            emptyState.classList.remove("hidden");
            logToConsole("Catalog refresh complete. Catalog is currently empty.", "system");
            return;
        }
        
        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                </div>
                <div class="product-meta">
                    <span class="price">$${product.price.toFixed(2)}</span>
                    <span class="stock ${product.stock <= 3 ? 'low' : ''}">Stock: ${product.stock}</span>
                </div>
                <button class="btn-buy" style="margin-top: 1rem; width: 100%; justify-content: center;" onclick='openCheckout(${JSON.stringify(product)})'>
                    <i data-lucide="shopping-cart"></i>
                    <span>Buy Product</span>
                </button>
            `;
            container.appendChild(card);
        });
        
        lucide.createIcons();
        logToConsole(`Loaded ${products.length} products into catalog.`, "success");
    } catch (err) {
        loadingSpinner.classList.add("hidden");
        emptyState.classList.remove("hidden");
        logToConsole(`Catalog Fetch Error: ${err.message}`, "error");
    }
}

async function handleCreateProduct(e) {
    e.preventDefault();
    if (!state.token) {
        logToConsole("Session expired. Please log in.", "error");
        return;
    }
    
    const nameInput = document.getElementById("prod-name");
    const descInput = document.getElementById("prod-desc");
    const priceInput = document.getElementById("prod-price");
    const stockInput = document.getElementById("prod-stock");
    
    logToConsole(`Attempting to add product "${nameInput.value}"...`, "info");
    
    try {
        const response = await fetch(`${API_BASE}/api/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify({
                name: nameInput.value,
                description: descInput.value,
                price: parseFloat(priceInput.value),
                stock: parseInt(stockInput.value)
            })
        });
        
        let data = null;
        try {
            data = await response.json();
        } catch (jsonErr) {}
        
        if (!response.ok) {
            throw new Error((data && data.error) || `Unable to create product with status ${response.status}`);
        }
        
        if (!data) {
            throw new Error("No response body received from server.");
        }
        
        logToConsole(`Product "${data.name}" added successfully with ID: ${data.id}`, "success");
        logToConsole(`Raw Response: ${JSON.stringify(data)}`, "system");
        
        nameInput.value = "";
        descInput.value = "";
        priceInput.value = "";
        stockInput.value = "";
        
        // Refresh catalog list
        fetchProducts();
    } catch (err) {
        logToConsole(`Create Product Error: ${err.message}`, "error");
    }
}

// Side Drawer Operations
function openCheckout(product) {
    if (!state.token) {
        logToConsole("Authentication required. Please sign in before placing an order.", "error");
        return;
    }
    
    state.selectedProduct = product;
    state.quantity = 1;
    
    document.getElementById("checkout-prod-name").innerText = product.name;
    document.getElementById("checkout-prod-desc").innerText = product.description;
    document.getElementById("checkout-prod-price").innerText = product.price.toFixed(2);
    document.getElementById("checkout-quantity").value = 1;
    
    updateCheckoutTotal();
    
    document.getElementById("checkout-drawer").classList.remove("hidden");
    logToConsole(`Checkout drawer opened for: ${product.name}`, "info");
}

function closeCheckout() {
    document.getElementById("checkout-drawer").classList.add("hidden");
    state.selectedProduct = null;
}

function changeQuantity(delta) {
    if (!state.selectedProduct) return;
    
    let newQty = state.quantity + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > state.selectedProduct.stock) {
        logToConsole(`Requested quantity exceeds available stock (${state.selectedProduct.stock}).`, "error");
        return;
    }
    
    state.quantity = newQty;
    document.getElementById("checkout-quantity").value = newQty;
    updateCheckoutTotal();
}

function updateCheckoutTotal() {
    if (!state.selectedProduct) return;
    const total = state.selectedProduct.price * state.quantity;
    document.getElementById("checkout-grand-total").innerText = total.toFixed(2);
}

async function placeOrder() {
    if (!state.selectedProduct || !state.token) return;
    
    const productId = state.selectedProduct.id;
    const quantity = state.quantity;
    
    logToConsole(`Initiating transaction checkout for: ${state.selectedProduct.name} (Qty: ${quantity})...`, "info");
    closeCheckout();
    
    try {
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            })
        });
        
        let data = null;
        try {
            data = await response.json();
        } catch (jsonErr) {
            // response was empty or not JSON
        }
        
        if (!response.ok) {
            throw new Error((data && data.error) || `Order checkout failed with status ${response.status}`);
        }
        
        if (!data) {
            throw new Error("No response body received from API Gateway.");
        }
        
        logToConsole(`Order checkout succeeded! ID: ${data.id} | Status: ${data.orderStatus}`, "success");
        logToConsole(`Raw Response: ${JSON.stringify(data)}`, "system");
        
        // Refresh products list to show decreased stock
        fetchProducts();
    } catch (err) {
        logToConsole(`Checkout Error: ${err.message}`, "error");
    }
}
