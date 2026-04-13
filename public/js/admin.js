// ── Admin Panel JS ────────────────────────────────────────────────────────
console.log('✅ admin.js cargado - versión 20260413');

// Notificación toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top:20px;right:20px;z-index:9999;min-width:300px;';
    toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ── PRODUCTOS ──────────────────────────────────────────────────────────────

function editProduct(product) {
    document.getElementById('productoId').value          = product.id;
    document.getElementById('productoNombre').value      = product.name;
    document.getElementById('productoPrecio').value      = product.price;
    document.getElementById('productoStock').value       = product.stock;
    document.getElementById('productoImagen').value      = product.image_url || '';
    document.getElementById('productoDescripcion').value = product.description || '';
    document.getElementById('productoCategoria').value = product.category || 'natural';
    document.getElementById('productoActivo').checked = product.is_active;
    document.getElementById('modalProductoTitle').textContent = 'Editar Producto';
    new bootstrap.Modal(document.getElementById('modalProducto')).show();
}

async function guardarProducto() {
    const id          = document.getElementById('productoId').value;
    const nombre      = document.getElementById('productoNombre').value.trim();
    const precio      = document.getElementById('productoPrecio').value;
    const stock       = document.getElementById('productoStock').value;
    const imagen      = document.getElementById('productoImagen').value.trim();
    const descripcion = document.getElementById('productoDescripcion').value.trim();

    if (!nombre || !precio || stock === '') { showToast('Completa los campos obligatorios', 'warning'); return; }

    const method = id ? 'PUT' : 'POST';
    const url    = id ? `/admin/products/${id}` : '/admin/products';

    try {
        const res  = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nombre,
                price: parseFloat(precio),
                stock: parseInt(stock),
                image_url: imagen,
                description: descripcion,
                is_active: id ? document.getElementById('productoActivo').checked : true,
                category: document.getElementById('productoCategoria').value || 'natural'
            })
        });
        const data = await res.json();
        if (data.success) { showToast(data.message); setTimeout(() => location.reload(), 1500); }
        else showToast(data.message || 'Error', 'danger');
    } catch (e) { showToast('Error de conexión', 'danger'); }
}

async function toggleProduct(id, isActive) {
    if (!confirm(`¿${isActive ? 'Desactivar' : 'Activar'} este producto?`)) return;
    try {
        const res  = await fetch(`/admin/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !isActive })
        });
        const data = await res.json();
        if (data.success) { showToast(data.message); setTimeout(() => location.reload(), 1000); }
        else showToast(data.message || 'Error', 'danger');
    } catch (e) { showToast('Error de conexión', 'danger'); }
}

// ── PEDIDOS ────────────────────────────────────────────────────────────────

async function cambiarEstado(orderId, newStatus) {
    try {
        const res  = await fetch(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Estado actualizado correctamente');
            setTimeout(() => location.reload(), 1000); // ← añadir esto
        } else showToast(data.message || 'Error', 'danger');
    } catch (e) { showToast('Error de conexión', 'danger'); }
}

// ── USUARIOS ───────────────────────────────────────────────────────────────

async function cambiarRol(userId, newRole) {
    if (!confirm(`¿Cambiar este usuario a rol "${newRole}"?`)) { location.reload(); return; }
    try {
        const res  = await fetch(`/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (data.success) showToast('Rol actualizado correctamente');
        else showToast(data.message || 'Error', 'danger');
    } catch (e) { showToast('Error de conexión', 'danger'); }
}
