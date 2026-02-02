// Search Dropdown Toggle
const searchBtn = document.getElementById('searchBtn');
const searchDropdown = document.getElementById('searchDropdown');

searchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  searchDropdown.classList.toggle('active');
});

// Close search dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!searchDropdown.contains(e.target) && e.target !== searchBtn) {
    searchDropdown.classList.remove('active');
  }
});

// Cart functionality (will be expanded later)
let cartCount = 0;
const cartCountElement = document.querySelector('.cart-count');

function updateCartCount(count) {
  cartCount = count;
  cartCountElement.textContent = cartCount;
}

// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    // Add smooth scroll functionality here when sections are ready
  });
});

// Navbar scroll effect (optional - makes navbar solid on scroll)
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
