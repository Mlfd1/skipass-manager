// =============================================
//  CART.JS — Корзина + История + QR-код
// =============================================

const CART_KEY   = 'skipass_cart';
const ORDERS_KEY = 'skipass_orders';

/* ── Корзина ─────────────────────────────── */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}
function addToCart(item) {
  const cart     = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) { existing.qty += (item.qty || 1); }
  else          { cart.push({ ...item, qty: item.qty || 1 }); }
  saveCart(cart);
  showCartToast(item.name);
}
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}
function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}
function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#nav-cart-count').forEach(el => {
    el.textContent   = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

function showCartToast(name) {
  let t = document.getElementById('cart-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'cart-toast'; t.className = 'cart-toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<i class="ti ti-check"></i> «${name}» добавлен в корзину`;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch { return []; }
}
function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/* ── Промокод ────────────────────────────── */
function applyPromo() {
  const val = (document.getElementById('promo-input').value || '').trim().toUpperCase();
  const msg = document.getElementById('promo-msg');
  if (val === 'SKI2025') {
    window._promoActive = true;
    msg.textContent = '✓ Промокод применён — скидка 10%';
    msg.style.color = 'var(--green-400)';
  } else {
    window._promoActive = false;
    msg.textContent = '✗ Неверный промокод';
    msg.style.color = '#e24b4a';
  }
  msg.style.display = 'block';
  renderCart();
}

/* ── Имитация платёжной страницы ────────── */
function redirectToPayment() {
  const cart = getCart();
  if (cart.length === 0) return;

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = window._promoActive ? Math.round(subtotal * 0.1) : 0;
  const total    = subtotal - discount;

  // Сохраняем данные заказа во временное хранилище
  const pendingOrder = {
    cart,
    subtotal,
    discount,
    total,
    promo: window._promoActive ? 'SKI2025' : null,
  };
  localStorage.setItem('skipass_pending_order', JSON.stringify(pendingOrder));

  // Переход на страницу оплаты
  window.location.href = 'payment.html';
}

/* ── Оформить заказ (вызывается со страницы payment.html) ── */
function finalizeOrder(paymentMethod) {
  const pending = JSON.parse(localStorage.getItem('skipass_pending_order') || 'null');
  if (!pending) return null;

  const orderNum = '#SKI-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const order = {
    id:            orderNum,
    date:          new Date().toLocaleDateString('ru-RU', {
                     day:'2-digit', month:'2-digit', year:'numeric',
                     hour:'2-digit', minute:'2-digit'
                   }),
    items:         pending.cart.map(i => ({
                     name: i.name, qty: i.qty,
                     price: i.price, meta: i.meta || ''
                   })),
    total:         pending.total,
    discount:      pending.discount,
    paymentMethod,
    status:        'Оплачен',
  };

  saveOrder(order);
  saveCart([]);
  localStorage.removeItem('skipass_pending_order');
  updateAdminStats();

  return order;
}

/* ── Рендер корзины ──────────────────────── */
function renderCart() {
  const cartEl    = document.getElementById('cart-list');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  if (!cartEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    cartEl.innerHTML   = '';
    if (emptyEl)   emptyEl.style.display   = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }
  if (emptyEl)   emptyEl.style.display   = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  cartEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item__icon"><i class="ti ti-ticket"></i></div>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__meta">${item.meta || ''}</p>
        <p class="cart-item__price">${(item.price * item.qty).toLocaleString('ru-RU')} сом</p>
      </div>
      <div class="cart-item__controls">
        <button class="qty-btn" onclick="changeQty('${item.id}',-1)"><i class="ti ti-minus"></i></button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}',1)"><i class="ti ti-plus"></i></button>
        <button class="cart-item__remove" onclick="removeFromCart('${item.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count    = cart.reduce((s, i) => s + i.qty, 0);
  const discount = window._promoActive ? Math.round(subtotal * 0.1) : 0;
  const total    = subtotal - discount;
  document.getElementById('sum-count').textContent    = count + ' шт.';
  document.getElementById('sum-discount').textContent =
    discount > 0 ? `−${discount.toLocaleString('ru-RU')} сом` : '0 сом';
  document.getElementById('sum-total').textContent    =
    total.toLocaleString('ru-RU') + ' сом';
}

/* ── Обновление статистики админки ────────── */
function updateAdminStats() {
  const orders = getOrders();
  const el = document.getElementById('admin-orders-count');
  if (el) el.textContent = orders.length;
  const rev = document.getElementById('admin-revenue');
  if (rev) rev.textContent =
    orders.reduce((s, o) => s + o.total, 0).toLocaleString('ru-RU') + ' сом';
}

// Инициализация
updateCartBadge();
renderCart();
updateAdminStats();