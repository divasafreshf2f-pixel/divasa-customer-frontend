const CART_KEY = "divasa_cart";

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function notifyCartUpdate() {
  window.dispatchEvent(new Event("cartUpdated"));
}


export function addToCart(item) {
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (i) =>
      i.productId === item.productId &&
      i.variantId === item.variantId
  );

  if (existingIndex !== -1) {
    // Increase quantity if already exists
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
  notifyCartUpdate();

}

export function updateCartQuantity(productId, variantId, change) {
  const cart = getCart();

  const index = cart.findIndex(
    (i) => i.productId === productId && i.variantId === variantId
  );

  if (index !== -1) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
      cart.splice(index, 1); // remove item
    }
  }

  saveCart(cart);
  notifyCartUpdate();

}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  notifyCartUpdate();
}


export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
