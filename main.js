/* ================================================
   NEURALFLOW — MAIN JS (Orange Theme)
   No external libraries. All vanilla.
================================================ */

// ---- LOADER ----
(function() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', function() {
    setTimeout(function() { loader.classList.add('hidden'); }, 100);
  });
  setTimeout(function() { loader.classList.add('hidden'); }, 400);
})();

// ---- SCROLL ANIMATIONS ----
(function() {
  const els = document.querySelectorAll('.fade-up');
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  els.forEach(function(el) { obs.observe(el); });
})();

// ---- NAV SCROLL EFFECT ----
(function() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
})();

// ---- HAMBURGER / MOBILE NAV ----
(function() {
  const btn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  let open = false;
  btn.addEventListener('click', function() {
    open = !open;
    mobileNav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
  });
  document.querySelectorAll('.mobile-nav-link').forEach(function(a) {
    a.addEventListener('click', function() {
      open = false;
      mobileNav.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
      mobileNav.setAttribute('aria-hidden', true);
    });
  });
})();

// ---- PRICING ENGINE ----
(function() {
  const PRICING_MATRIX = {
    starter:    { INR: 0,    USD: 0,   EUR: 0   },
    growth:     { INR: 2899, USD: 35,  EUR: 32  },
    enterprise: { INR: null, USD: null, EUR: null }
  };
  const TARIFF = { INR: 1.0, USD: 1.0, EUR: 1.0 };
  const ANNUAL_DISCOUNT = 0.80;
  const SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };
  const TIERS = ['starter', 'growth', 'enterprise'];

  let isAnnual = false;
  let currency = 'INR';

  function formatPrice(val) {
    if (val === null) return null;
    if (val === 0) return '0';
    return val.toLocaleString('en-IN');
  }

  function updatePrices() {
    TIERS.forEach(function(tier, i) {
      const base = PRICING_MATRIX[tier][currency];
      const symEl = document.getElementById('sym-' + i);
      const priceEl = document.getElementById('price-' + i);
      const noteEl = document.getElementById('note-' + i);

      if (base === null) {
        symEl.textContent = '';
        priceEl.textContent = 'Custom';
        noteEl.textContent = '';
        return;
      }

      const tariffed = base * TARIFF[currency];
      const monthly = isAnnual ? Math.round(tariffed * ANNUAL_DISCOUNT) : tariffed;
      const annual = Math.round(tariffed * ANNUAL_DISCOUNT * 12);

      // Isolated DOM text node update — no parent reflow
      symEl.textContent = SYMBOLS[currency];
      priceEl.textContent = formatPrice(monthly);

      if (base === 0) {
        noteEl.textContent = '';
      } else if (isAnnual) {
        noteEl.textContent = SYMBOLS[currency] + formatPrice(annual) + ' billed annually';
      } else {
        noteEl.textContent = 'Save 20% with annual billing';
      }
    });
  }

  const toggleEl = document.getElementById('billing-toggle');
  const labelM = document.getElementById('label-monthly');
  const labelA = document.getElementById('label-annual');

  function setToggle(annual) {
    isAnnual = annual;
    toggleEl.classList.toggle('on', annual);
    toggleEl.setAttribute('aria-checked', annual);
    labelM.classList.toggle('active', !annual);
    labelA.classList.toggle('active', annual);
    updatePrices();
  }

  toggleEl.addEventListener('click', function() { setToggle(!isAnnual); });
  toggleEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setToggle(!isAnnual); }
  });

  document.getElementById('currency-select').addEventListener('change', function() {
    currency = this.value;
    updatePrices();
  });

  setToggle(false);
  labelM.classList.add('active');
})();

// ---- BENTO ↔ ACCORDION with Context Persistence ----
(function() {
  const FEATURES = [
    { icon: '⚡', iconClass: 'icon-orange', tag: 'Core Engine', tagClass: 'tag-orange',
      title: 'Neural Pipeline Engine',
      desc: 'Our distributed execution core processes petabyte-scale datasets across heterogeneous compute clusters. Adaptive sharding, auto-scaling partitions, and fault-tolerant checkpointing are built in — not bolted on.' },
    { icon: '📊', iconClass: 'icon-orange', tag: null,
      title: 'Real-time Analytics',
      desc: 'Sub-second aggregations over streaming and batch data simultaneously, with customizable dashboards and alert triggers.' },
    { icon: '🧠', iconClass: 'icon-dark', tag: 'MLOps', tagClass: 'tag-dark',
      title: 'Adaptive ML Ops',
      desc: 'Version, deploy, and monitor models with automated A/B rollout, shadow traffic splitting, and one-click rollback.' },
    { icon: '🔒', iconClass: 'icon-dark', tag: 'Security', tagClass: 'tag-dark',
      title: 'Zero-Trust Security',
      desc: 'End-to-end encryption, role-scoped access policies, and SOC 2 Type II compliance baked into every layer.' },
    { icon: '🌐', iconClass: 'icon-orange', tag: null,
      title: 'Global Edge Network',
      desc: 'Deploy pipelines to 38 edge regions with automatic geo-routing. Data never leaves its compliance boundary unless you explicitly authorize cross-region replication.' },
    { icon: '🔌', iconClass: 'icon-orange', tag: null,
      title: 'Connector Marketplace',
      desc: 'Pre-built integrations with every major data warehouse, SaaS app, and cloud provider. 340+ connectors and counting.' },
    { icon: '✨', iconClass: 'icon-orange', tag: 'AI-Powered', tagClass: 'tag-orange',
      title: 'AI Transformation Studio',
      desc: 'Write data transformations in plain English. Our LLM layer converts natural language into optimized pipeline steps — reviewed, not blindly applied.' },
  ];

  let activeBentoIndex = -1;
  let activeAccordionIndex = -1;
  const MOBILE_BP = 768;

  const accordionList = document.getElementById('accordion-list');
  FEATURES.forEach(function(f, i) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.setAttribute('role', 'listitem');

    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'acc-body-' + i);
    trigger.setAttribute('id', 'acc-trigger-' + i);
    trigger.innerHTML = `
      <span class="accordion-trigger-left">
        <span class="acc-icon ${f.iconClass}" aria-hidden="true">${f.icon}</span>
        ${f.title}
      </span>
      <span class="accordion-chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    `;

    const body = document.createElement('div');
    body.className = 'accordion-body';
    body.setAttribute('id', 'acc-body-' + i);
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', 'acc-trigger-' + i);
    body.innerHTML = `<div class="accordion-body-inner">${f.desc}</div>`;

    item.appendChild(trigger);
    item.appendChild(body);
    accordionList.appendChild(item);

    trigger.addEventListener('click', function() {
      const isOpen = activeAccordionIndex === i;
      closeAllAccordions();
      if (!isOpen) openAccordion(i, false);
    });
  });

  function openAccordion(index, smooth) {
    activeAccordionIndex = index;
    const triggers = accordionList.querySelectorAll('.accordion-trigger');
    const bodies = accordionList.querySelectorAll('.accordion-body');
    if (triggers[index] && bodies[index]) {
      triggers[index].classList.add('open');
      triggers[index].setAttribute('aria-expanded', 'true');
      bodies[index].classList.add('open');
      if (smooth) bodies[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function closeAllAccordions() {
    activeAccordionIndex = -1;
    accordionList.querySelectorAll('.accordion-trigger').forEach(function(t) {
      t.classList.remove('open');
      t.setAttribute('aria-expanded', 'false');
    });
    accordionList.querySelectorAll('.accordion-body').forEach(function(b) { b.classList.remove('open'); });
  }

  const bentoNodes = document.querySelectorAll('.bento-node');
  bentoNodes.forEach(function(node) {
    node.addEventListener('mouseenter', function() {
      activeBentoIndex = parseInt(node.getAttribute('data-index'));
      bentoNodes.forEach(function(n) { n.classList.remove('active-bento'); });
      node.classList.add('active-bento');
    });
    node.addEventListener('focus', function() {
      activeBentoIndex = parseInt(node.getAttribute('data-index'));
      bentoNodes.forEach(function(n) { n.classList.remove('active-bento'); });
      node.classList.add('active-bento');
    });
  });

  // Context transfer on resize
  let lastMobile = window.innerWidth <= MOBILE_BP;
  window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= MOBILE_BP;
    if (isMobile !== lastMobile) {
      lastMobile = isMobile;
      if (isMobile && activeBentoIndex >= 0) {
        closeAllAccordions();
        openAccordion(activeBentoIndex, true);
      } else if (!isMobile && activeAccordionIndex >= 0) {
        bentoNodes.forEach(function(n) { n.classList.remove('active-bento'); });
        if (bentoNodes[activeAccordionIndex]) {
          bentoNodes[activeAccordionIndex].classList.add('active-bento');
          activeBentoIndex = activeAccordionIndex;
        }
        closeAllAccordions();
      }
    }
  });
})();