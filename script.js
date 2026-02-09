// NordForm E-commerce - Main Script
// Product Database
const allProducts = [
  // Soft Seating
  { name: "Modern Velvet Sofa", price: 1299, image: "assets/modern_velvet_sofa.jpg", category: "Soft Seating" },
  { name: "Leather Lounge Sofa", price: 1599, image: "assets/Leather_Lounge_Sofa.png", category: "Soft Seating" },
  { name: "L-Shape Sectional", price: 2199, image: "assets/L-Shape_Sectional.jpg", category: "Soft Seating" },
  { name: "Chesterfield Sofa", price: 1899, image: "assets/Chesterfield Sofa.jpg", category: "Soft Seating" },
  { name: "Mid-Century Modern Sofa", price: 1449, image: "assets/Mid-Century_Modern_Sofa.jpg", category: "Soft Seating" },
  { name: "Modular Sofa System", price: 2499, image: "assets/Modular_Sofa_System.jpg", category: "Soft Seating" },

  // Seating
  { name: "Modern Armchair", price: 899, image: "assets/Modern_Armchair.jpg", category: "Seating" },
  { name: "Dining Chair", price: 299, image: "assets/Dining_Chair.jpg", category: "Seating" },
  { name: "Lounge Chair", price: 1299, image: "assets/Lounge_Chair.png", category: "Seating" },
  { name: "Ergonomic Office Chair", price: 549, image: "assets/Ergonomic_Office_Chair.jpg", category: "Seating" },
  { name: "Velvet Accent Chair", price: 699, image: "assets/Velvet_Accent_Chair.jpg", category: "Seating" },
  { name: "Scandinavian Rocking Chair", price: 849, image: "assets/Scandinavian_Rocking_Chair.png", category: "Seating" },

  // Tables
  { name: "Dining Table", price: 1299, image: "assets/Solid_Wood_Dining_Table.jpg", category: "Tables" },
  { name: "Coffee Table", price: 499, image: "assets/Minimalist_Coffee_Table.jpg", category: "Tables" },

  // Storage
  { name: "Bookshelf", price: 799, image: "assets/Minimalist_Bookshelf.jpg", category: "Storage" },
  { name: "Wardrobe", price: 1499, image: "assets/Modern_Wardrobe.jpg", category: "Storage" },
  { name: "Storage Cabinet", price: 599, image: "assets/Storage_Cabinet.jpg", category: "Storage" },

  // Lighting
  { name: "Pendant Light", price: 199, image: "assets/Nordic_Pendant_Light.jpg", category: "Lighting" },
  { name: "Floor Lamp", price: 149, image: "assets/Modern_Floor_Lamp.jpg", category: "Lighting" },
  { name: "Ceramic Table Lamp", price: 65, image: "assets/Ceramic_Table_Lamp.png", category: "Lighting" },

  // Decor
  { name: "Wall Art", price: 89, image: "assets/Abstract_Wall_Art.jpg", category: "Decor" },
  { name: "Decorative Vase", price: 45, image: "assets/Minimalist Vase.jpg", category: "Decor" },
  { name: "Velvet Cushion Set", price: 39, image: "assets/Velvet_Cushion_Set.jpg", category: "Decor" }
];

// Global Variables
let cart = JSON.parse(localStorage.getItem('nordform_cart')) || [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  renderCartDrawer();
  renderQuickViewModal();
  updateCartCount();
  setupEventListeners();
  updateAuthUI();
  setupSearch();
  setupUserDropdown();
});

// Cart Functions
function addToCart(name, price, image = 'assets/product1.jpg') {
  const existingItemIndex = cart.findIndex(item => item.name === name);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
  } else {
    const product = { name, price, image, quantity: 1 };
    cart.push(product);
  }

  saveCart();
  updateCartCount();
  renderCartItems();

  const drawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
  }

  showNotification(`${name} added to cart!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + change);
    saveCart();
    updateCartCount();
    renderCartItems();
  }
}

function saveCart() {
  localStorage.setItem('nordform_cart', JSON.stringify(cart));
}

function updateCartCount() {
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCountElement.textContent = totalItems;
  }
}

function renderCartDrawer() {
  if (document.querySelector('.cart-drawer')) return;

  const drawerHTML = `
    <div class="cart-overlay" onclick="closeCart()"></div>
    <div class="cart-drawer">
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="close-cart" onclick="closeCart()">&times;</button>
      </div>
      <div class="cart-items">
        <!-- Items Injected Here -->
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span class="total-amount">$0</span>
        </div>
        <button class="checkout-btn" onclick="checkout()">Checkout</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', drawerHTML);
  renderCartItems();
}

function renderCartItems() {
  const itemsContainer = document.querySelector('.cart-items');
  const totalElement = document.querySelector('.total-amount');

  if (!itemsContainer || !totalElement) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
    totalElement.textContent = '$0';
    return;
  }

  let total = 0;
  itemsContainer.innerHTML = cart.map((item, index) => {
    const quantity = item.quantity || 1;
    const itemTotal = parseFloat(item.price) * quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price}</div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
            <span class="quantity">${quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
          </div>
          <span class="remove-item-btn" onclick="removeFromCart(${index})">Remove</span>
        </div>
      </div>
    `;
  }).join('');

  totalElement.textContent = '$' + total.toLocaleString();
}

function closeCart() {
  document.querySelector('.cart-drawer').classList.remove('open');
  document.querySelector('.cart-overlay').classList.remove('open');
}

function openCart() {
  document.querySelector('.cart-drawer').classList.add('open');
  document.querySelector('.cart-overlay').classList.add('open');
}

function checkout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!");
    return;
  }
  window.location.href = 'checkout.html';
}

// Quick View Functions
function renderQuickViewModal() {
  if (document.querySelector('.modal-overlay')) return;

  const modalHTML = `
    <div class="modal-overlay" id="quickViewModal">
      <div class="modal-content">
        <button class="close-modal" onclick="closeQuickView()">&times;</button>
        <div class="modal-image">
          <img src="" alt="Product" id="qvImage">
        </div>
        <div class="modal-details">
          <h2 class="modal-title" id="qvTitle">Product Title</h2>
          <p class="modal-category" id="qvCategory">Category</p>
          <p class="modal-price" id="qvPrice">$0</p>
          <p class="modal-description" id="qvDesc">
            Experience the epitome of comfort and style with this premium piece. 
            Designed to complement modern living spaces, it offers both functionality and aesthetic appeal.
          </p>
          <button class="modal-add-btn" id="qvAddBtn">Add to Cart</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Close on overlay click
  document.getElementById('quickViewModal').addEventListener('click', (e) => {
    if (e.target.id === 'quickViewModal') closeQuickView();
  });
}

function openQuickView(name, price, image, category = 'Furniture') {
  const modal = document.querySelector('.modal-overlay');

  document.getElementById('qvTitle').textContent = name;
  document.getElementById('qvPrice').textContent = '$' + price;
  document.getElementById('qvImage').src = image;
  document.getElementById('qvCategory').textContent = category;

  const btn = document.getElementById('qvAddBtn');
  btn.onclick = () => {
    addToCart(name, price, image);
    closeQuickView();
  };

  modal.classList.add('open');
}

function closeQuickView() {
  document.querySelector('.modal-overlay').classList.remove('open');
}

// Notification
function showNotification(message) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Setup Event Listeners
function setupEventListeners() {
  // Cart Icon Click
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  }

  // Navbar Scroll
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.classList.contains('navbar-dark')) {
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      } else {
        navbar.style.background = 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%)';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = 'none';
      }
    }
  });

  // Quick View Listeners using Delegation
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-view-btn')) {
      const card = e.target.closest('.product-card');
      if (card) {
        const title = card.querySelector('.product-title').textContent;
        const price = card.querySelector('.product-price').textContent.replace('$', '').replace(',', '');
        const image = card.querySelector('.product-image img').src;
        const category = card.querySelector('.product-category').textContent;

        openQuickView(title, price, image, category);
      }
    }
  });

  // Mobile menu close on link click
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('.nav-links');
      if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
      }
    });
  });
}

// Search Functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchBtn = document.getElementById('searchBtn');
  const searchDropdown = document.getElementById('searchDropdown');

  if (!searchInput || !searchResults || !searchBtn || !searchDropdown) return;

  // Toggle search dropdown
  searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchDropdown.classList.toggle('active');
    if (searchDropdown.classList.contains('active')) {
      searchInput.focus();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchDropdown.contains(e.target) && e.target !== searchBtn) {
      searchDropdown.classList.remove('active');
    }
  });

  // Search as user types
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length === 0) {
      searchResults.innerHTML = '';
      return;
    }

    const results = allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    ).slice(0, 5);

    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No products found</div>';
    } else {
      searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">
          <img src="${product.image}" alt="${product.name}">
          <div class="search-result-info">
            <div class="search-result-name">${product.name}</div>
            <div class="search-result-meta">
              <span class="search-result-category">${product.category}</span>
              <span class="search-result-price">$${product.price}</span>
            </div>
          </div>
          <button class="search-add-btn" title="Add to cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      `).join('');
    }
  });
}

// Authentication UI
function updateAuthUI() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;

  if (typeof getCurrentUser === 'function' && typeof logout === 'function') {
    const user = getCurrentUser();

    if (user) {
      authContainer.innerHTML = `
        <div class="user-dropdown">
          <button class="user-btn">
            <span>Hi, ${user.name.split(' ')[0]}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="dropdown-menu">
            <a href="#" onclick="event.preventDefault(); showOrdersModal();">My Orders</a>
            <a href="#" onclick="event.preventDefault(); showProfileModal();">Profile</a>
            <a href="#" onclick="event.preventDefault(); logout();">Logout</a>
          </div>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="login.html" class="login-btn">Login</a>
        <a href="signup.html" class="signup-btn">Sign Up</a>
      `;
    }
  } else {
    authContainer.innerHTML = `
      <a href="login.html" class="login-btn">Login</a>
      <a href="signup.html" class="signup-btn">Sign Up</a>
    `;
  }
}

// User Dropdown Setup
function setupUserDropdown() {
  setTimeout(() => {
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (userBtn && dropdownMenu) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        if (dropdownMenu.classList.contains('show')) {
          dropdownMenu.classList.remove('show');
        }
      });
    }
  }, 100);
}

// Listen for storage changes
window.addEventListener('storage', (e) => {
  if (e.key === 'currentUser' || e.key === 'sessionUser') {
    updateAuthUI();
    setupUserDropdown();
  }
});

// Profile & Orders Modal Functions
function showProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    alert("Please log in to view your profile");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "profileModal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>My Profile</h2>
        <button class="modal-close" onclick="closeModal('profileModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="profile-info">
          <div class="profile-field">
            <label>Full Name</label>
            <div class="value">${user.name}</div>
          </div>
          <div class="profile-field">
            <label>Email Address</label>
            <div class="value">${user.email}</div>
          </div>
          <div class="profile-field">
            <label>Member Since</label>
            <div class="value">${new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div class="profile-field">
            <label>Account ID</label>
            <div class="value">${user.id}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("profileModal");
    }
  });
}

function showOrdersModal() {
  const user = getCurrentUser();
  if (!user) {
    alert("Please log in to view your orders");
    return;
  }

  let orders = JSON.parse(localStorage.getItem("userOrders_" + user.id) || "[]");

  if (orders.length === 0) {
    orders = [
      {
        id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
        items: [
          { name: "Modern Armchair", quantity: 1, price: 899 },
          { name: "Coffee Table", quantity: 1, price: 499 }
        ],
        total: 1398
      },
      {
        id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "shipped",
        items: [
          { name: "Floor Lamp", quantity: 2, price: 149 }
        ],
        total: 298
      },
      {
        id: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString(),
        status: "processing",
        items: [
          { name: "Velvet Accent Chair", quantity: 1, price: 699 },
          { name: "Wall Art", quantity: 3, price: 89 }
        ],
        total: 966
      }
    ];
    localStorage.setItem("userOrders_" + user.id, JSON.stringify(orders));
  }

  const ordersHTML = orders.length > 0 ? orders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <div class="order-id">Order #${order.id}</div>
        <div class="order-status ${order.status}">${order.status}</div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span>${item.quantity}x ${item.name}</span>
            <span>$${item.price * item.quantity}</span>
          </div>
        `).join("")}
      </div>
      <div class="order-total">
        <span>Total</span>
        <span>$${order.total}</span>
      </div>
      <div style="margin-top: 10px; font-size: 12px; color: #999;">
        Ordered on ${new Date(order.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  `).join("") : `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <h3>No Orders Yet</h3>
      <p>Start shopping to see your orders here!</p>
    </div>
  `;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "ordersModal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>My Orders</h2>
        <button class="modal-close" onclick="closeModal('ordersModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="orders-list">
          ${ordersHTML}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("ordersModal");
    }
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}
