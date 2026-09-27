const form = document.querySelector('#order-form');
if (form) {
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');
  const original = button.innerHTML;
  const phone = form.elements.phone;
  const show = (message, kind) => { status.textContent = message; status.className = `form-status ${kind}`; };
  phone.addEventListener('input', () => {
    const clean = phone.value.replace(/[\s().-]/g, '');
    phone.setCustomValidity(clean && !/^(?:\+212|00212|0)[5-7]\d{8}$/.test(clean) ? form.dataset.invalid : '');
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    phone.value = phone.value.replace(/[\s().-]/g, '');
    phone.dispatchEvent(new Event('input'));
    if (!form.checkValidity()) { show(form.dataset.invalid, 'error'); form.reportValidity(); return; }
    button.disabled = true;
    button.textContent = form.dataset.sending;
    show('', '');
    try {
      const data = new FormData(form);
      data.set('phone', phone.value.replace(/[\s().-]/g, ''));
      const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Formspree submission failed');
      form.reset();
      phone.setCustomValidity('');
      show(form.dataset.success, 'success');
    } catch (_) {
      show(form.dataset.error, 'error');
    } finally { button.disabled = false; button.innerHTML = original; }
  });
}

// Keep content visible without JS. Motion is enabled only when supported.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -45px 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el => revealObserver.observe(el));
}

const mobileOrder = document.querySelector('.mobile-order');
const hero = document.querySelector('.hero');
const orderSection = document.querySelector('#commande');
if (mobileOrder && hero && orderSection) {
  document.documentElement.classList.add('sticky-ready');
  const syncSticky = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const orderTop = orderSection.getBoundingClientRect().top;
    const orderBottom = orderSection.getBoundingClientRect().bottom;
    const inOrder = orderTop < innerHeight && orderBottom > 0;
    mobileOrder.classList.toggle('is-visible', heroBottom < 25 && !inOrder);
  };
  let scheduled = false;
  const requestSync = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; syncSticky(); });
  };
  addEventListener('scroll', requestSync, { passive: true });
  addEventListener('resize', requestSync, { passive: true });
  syncSticky();
}
