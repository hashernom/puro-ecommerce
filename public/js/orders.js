// orders.js - Frontend del carrito
console.log('✅ orders.js cargado - versión 20260413');
document.addEventListener('DOMContentLoaded', loadCart);

async function loadCart() {
    try {
        const response = await fetch('/orders/cart/api');
        const data = await response.json();
        if (data.success) renderCart(data.data);
        else renderEmptyCart();
    } catch (e) { renderEmptyCart(); }
}

function renderCart(cartData) {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    if (!cartData.items || cartData.items.length === 0) { renderEmptyCart(); return; }
    container.innerHTML = cartData.items.map(item => `
        <div class="card shadow-sm rounded-4 mb-3">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="fw-bold mb-1">${item.name}</h6>
                        <p class="text-secondary mb-0 small">$${parseFloat(item.price).toFixed(2)} c/u</p>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <div class="input-group" style="width: 120px;">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQty(${item.productId}, ${item.quantity - 1})">-</button>
                            <input type="number" class="form-control form-control-sm text-center" value="${item.quantity}" min="0"
                                onchange="updateQty(${item.productId}, parseInt(this.value))">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQty(${item.productId}, ${item.quantity + 1})">+</button>
                        </div>
                        <span class="fw-bold">$${parseFloat(item.subtotal).toFixed(2)}</span>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeItem(${item.productId})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('cart-subtotal').textContent = `$${parseFloat(cartData.total).toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${parseFloat(cartData.total).toFixed(2)}`;
}

function renderEmptyCart() {
    const container = document.getElementById('cart-items-container');
    if (container) container.innerHTML = `<div class="text-center py-5"><i class="bi bi-cart display-1 text-secondary mb-3"></i><h4 class="text-secondary">Tu carrito está vacío</h4><a href="/products" class="btn btn-success mt-3">Ver productos</a></div>`;
}

async function updateQty(productId, quantity) {
    if (quantity < 0) return;
    try {
        const response = await fetch(`/orders/cart/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        const data = await response.json();
        if (data.success) renderCart(data.data);
        else alert(data.message || 'Error al actualizar');
    } catch (e) { alert('Error de conexión'); }
}

async function removeItem(productId) {
    try {
        const response = await fetch(`/orders/cart/${productId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) renderCart(data.data);
        else alert('Error: ' + data.message);
    } catch (e) { console.error(e); alert('Error de conexión'); }
}

function proceedToCheckout() {
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
}

async function submitOrder() {
    const address = document.getElementById('shipping_address').value.trim();
    const notes = document.getElementById('order_notes').value.trim();
    if (!address || address.length < 10) { alert('Por favor ingresa una dirección válida (mínimo 10 caracteres)'); return; }
    
    const btn = document.querySelector('#checkoutModal .btn-success');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/payment/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shipping_address: address, notes })
        });
        const data = await response.json();
        if (data.success && data.url) {
            window.location.href = data.url;
        } else {
            alert(data.message || (data.errors && data.errors.join(', ')) || 'Error al procesar pago. Verifica configuración de Stripe.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        alert('Error de conexión');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
