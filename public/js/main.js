// PURO - Frontend JavaScript
let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    if (path === '/products' || path.includes('/products')) initializeCatalog();
    updateCartCounter();
});

async function initializeCatalog() {
    await loadProducts();
    setupProductSearch();
}

async function loadProducts() {
    try {
        const response = await fetch('/products/api');
        const data = await response.json();
        if (data.success) { allProducts = data.data.products; renderProducts(allProducts); }
        else showNoProducts();
    } catch (error) { showNoProducts(); }
}

function renderProducts(products) {
    const container = document.getElementById('products-grid');
    const template = document.getElementById('product-card-template');
    if (!container || !template) return;
    container.innerHTML = '';
    if (products.length === 0) { showNoProducts(); return; }
    document.getElementById('no-products')?.classList.add('d-none');
    products.forEach((product, index) => {
        const el = createProductCard(product, template);
        container.appendChild(el);
    });
}

function createProductCard(product, template) {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.product-item').dataset.name = product.name.toLowerCase();
    const img = clone.querySelector('.product-image');
    img.src = product.image_url || '';
    img.alt = product.name;
    clone.querySelector('.product-category').textContent = product.category ? product.category.toUpperCase() : 'NATURAL';
    clone.querySelector('.product-name').textContent = product.name;
    clone.querySelector('.product-description').textContent = product.description || 'Shot natural premium';
    clone.querySelector('.product-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
    const stockEl = clone.querySelector('.stock-text');
    if (product.stock <= 0) stockEl.innerHTML = '<i class="bi bi-x-circle-fill me-1"></i>Sin stock';
    else if (product.stock <= 5) stockEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-1 text-warning"></i>Pocas unidades';
    const btn = clone.querySelector('.btn-add-cart');
    btn.dataset.productId = product.id;
    btn.disabled = product.stock <= 0;
    if (product.stock <= 0) btn.innerHTML = 'Sin stock';
    btn.addEventListener('click', () => addToCart(product.id, 1));
    return clone;
}

function setupProductSearch() {
    const searchInput = document.getElementById('searchProducts');
    if (!searchInput) return;
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
        renderProducts(filtered);
    });
}

async function addToCart(productId, quantity = 1) {
    if (!isUserLoggedIn()) { if (confirm('Debes iniciar sesión. ¿Ir al login?')) window.location.href = '/auth/login'; return; }
    const btn = document.querySelector(`[data-product-id="${productId}"]`);
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-arrow-repeat spin me-2"></i>Agregando...';
    btn.disabled = true;
    try {
        const response = await fetch('/orders/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: parseInt(productId), quantity }) });
        const data = await response.json();
        if (data.success) {
            btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>¡Agregado!';
            btn.classList.replace('btn-success', 'btn-success');
            updateCartCounter();
            setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 2000);
        } else throw new Error(data.message);
    } catch (error) {
        btn.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Error';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 3000);
    }
}

async function updateCartCounter() {
    try {
        const response = await fetch('/orders/cart/api');
        const data = await response.json();
        if (data.success) {
            const counter = document.getElementById('cart-count');
            if (counter) { counter.textContent = data.data.totalItems || 0; counter.style.display = data.data.totalItems > 0 ? 'inline' : 'none'; }
        }
    } catch (e) {}
}

function isUserLoggedIn() { return document.querySelector('.navbar-nav .dropdown-toggle') !== null; }
function showNoProducts() { document.getElementById('products-grid').innerHTML = ''; document.getElementById('no-products')?.classList.remove('d-none'); }
