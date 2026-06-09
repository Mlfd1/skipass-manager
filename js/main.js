// ========== МОБИЛЬНОЕ МЕНЮ ==========
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobile-nav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
}

// ========== ТАБЫ ==========
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const container = btn.closest('section') || document;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = container.querySelector('#' + target);
        if (panel) panel.classList.add('active');
      });
    });
  });
}
initTabs();

// ========== КАЛЬКУЛЯТОР ЦЕНЫ ==========
function calcPrice() {
  const typeEl = document.getElementById('pass-type');
  const qtyEl  = document.getElementById('pass-qty');
  const outEl  = document.getElementById('total-price');
  if (!typeEl || !qtyEl || !outEl) return;
  const base  = parseInt(typeEl.value) || 1200;
  const qty   = parseInt(qtyEl.value)  || 1;
  const total = base * qty;
  outEl.textContent = total.toLocaleString('ru-RU') + ' сом';
}
const passType = document.getElementById('pass-type');
const passQty  = document.getElementById('pass-qty');
if (passType) passType.addEventListener('change', calcPrice);
if (passQty)  passQty.addEventListener('change', calcPrice);
calcPrice();

// ========== ДАТА (сегодня по умолчанию) ==========
const dateInput = document.getElementById('pass-date');
if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

// ========== АКТИВНАЯ ССЫЛКА В НАВБАРЕ ==========
(function markActive() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });
})();