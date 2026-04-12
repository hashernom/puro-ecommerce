class Cart {
    constructor(items = []) { this.items = items; }

    addProduct(product, quantity = 1) {
        const existing = this.items.find(i => i.productId === product.id);
        if (existing) {
            existing.quantity += quantity;
            existing.subtotal = existing.quantity * existing.price;
        } else {
            this.items.push({
                productId: product.id, name: product.name,
                price: parseFloat(product.price), quantity,
                subtotal: parseFloat(product.price) * quantity,
                image_url: product.image_url
            });
        }
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(i => i.productId === productId);
        if (item) {
            if (quantity <= 0) this.removeProduct(productId);
            else { item.quantity = quantity; item.subtotal = item.quantity * item.price; }
        }
    }

    removeProduct(productId) { this.items = this.items.filter(i => i.productId !== productId); }
    getTotal() { return this.items.reduce((t, i) => t + i.subtotal, 0); }
    getTotalItems() { return this.items.reduce((t, i) => t + i.quantity, 0); }
    clear() { this.items = []; }
    isEmpty() { return this.items.length === 0; }
    getItems() { return this.items; }
    toJSON() { return { items: this.items }; }
    static fromJSON(data) { return new Cart(data.items || []); }
}

module.exports = Cart;
