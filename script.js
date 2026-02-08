// State
let cart = JSON.parse(localStorage.getItem('nordform_cart')) || [];

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const searchDropdown = document.getElementById('searchDropdown');
const cartCountElement = document.querySelector('.cart-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCartDrawer();
  renderQuickViewModal();
  updateCartCount();
  setupEventListeners();

  // Re-attach listeners for dynamic content if needed, 
  // but global delegation is better.
});

// Search Toggle
searchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  searchDropdown.classList.toggle('active');
});

document.addEventListener('click', (e) => {
  if (searchDropdown && !searchDropdown.contains(e.target) && e.target !== searchBtn) {
    searchDropdown.classList.remove('active');
  }
});

// Cart Functions
function addToCart(name, price, image = 'assets/product1.jpg') {
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.name === name);

  if (existingItemIndex > -1) {
    // Item exists, increase quantity
    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
  } else {
    // New item, add to cart with quantity 1
    const product = { name, price, image, quantity: 1 };
    cart.push(product);
  }

  saveCart();
  updateCartCount();
  renderCartItems();

  // Open cart drawer
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
  showNotification("Proceeding to Checkout...");
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
  const modalContent = document.querySelector('.modal-content');

  document.getElementById('qvTitle').textContent = name;
  document.getElementById('qvPrice').textContent = '$' + price;
  document.getElementById('qvImage').src = image;
  document.getElementById('qvCategory').textContent = category;

  // Update Add Button
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
      e.preventDefault(); // Prevent default link behavior if it's an anchor
      openCart();
    });
  }

  // Navbar Scroll
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0, 0, 0, 0.9)';
      navbar.style.backdropFilter = 'blur(10px)';
    } else {
      navbar.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%)';
      navbar.style.backdropFilter = 'none';
    }
  });

  // Attach Quick View Listeners using Delegation
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
}
