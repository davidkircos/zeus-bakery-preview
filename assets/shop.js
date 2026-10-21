(() => {
  const form = document.getElementById('zeus-buy-form');
  if (!form) return;

  const currency = form.dataset.currency || 'USD';
  const formatter = new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  });
  const money = cents => formatter.format(Number(cents) / 100);

  const priceNow = form.querySelector('[data-price-now]');
  const priceWas = form.querySelector('[data-price-was]');
  const priceSave = form.querySelector('[data-price-save]');
  const pricePer = form.querySelector('[data-price-per]');
  const planInput = form.querySelector('input[name="selling_plan"]');
  const addButton = form.querySelector('.buy-add');

  const selectedVariant = () => form.querySelector('input[name="id"]:checked');
  const selectedPlan = () => {
    const option = form.querySelector('input[name="purchase_option"]:checked');
    return option && option.value ? option.value : '';
  };

  const render = () => {
    const variant = selectedVariant();
    if (!variant) return;
    const basePrice = Number(variant.dataset.price);
    const compare = Number(variant.dataset.compare) || 0;
    const bags = Math.max(1, Number(variant.dataset.bags) || 1);
    const title = variant.parentElement.querySelector('.buy-option-title')?.textContent.trim() || '';
    let plans = {};
    try { plans = JSON.parse(variant.dataset.plans || '{}'); } catch (error) { plans = {}; }

    const planId = selectedPlan();
    let price = basePrice;
    let was = compare > basePrice ? compare : 0;
    if (planId && plans[planId] !== undefined) {
      price = Number(plans[planId]);
      was = Math.max(basePrice, compare);
    }

    if (planInput) {
      planInput.value = planId;
      planInput.disabled = !planId;
    }

    if (priceNow) priceNow.textContent = money(price);
    if (priceWas) {
      priceWas.hidden = !(was > price);
      priceWas.textContent = was > price ? money(was) : '';
    }
    if (priceSave) {
      const percent = was > price ? Math.round(((was - price) / was) * 100) : 0;
      priceSave.hidden = percent <= 0;
      priceSave.textContent = percent > 0 ? `Save ${percent}%` : '';
    }
    if (pricePer) {
      const per = money(Math.round(price / bags));
      pricePer.textContent = planId ? `${per} per bag · ${title} · every delivery` : `${per} per bag · ${title}`;
    }
    if (addButton) {
      addButton.disabled = variant.disabled;
    }

    if (window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.value);
      window.history.replaceState({}, '', url);
    }
  };

  form.addEventListener('change', event => {
    if (event.target.matches('input[name="id"], input[name="purchase_option"]')) render();
  });
  form.addEventListener('submit', () => {
    const planId = selectedPlan();
    if (planInput) {
      planInput.value = planId;
      planInput.disabled = !planId;
    }
  });

  render();
})();
