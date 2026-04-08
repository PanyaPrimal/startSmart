// Плавающий переключатель версий для legacy-страниц.
(function () {
  const versions = [
    { value: '/',        label: 'v1 — Astro' },
    { value: '/legacy/index.html', label: 'v0 — Оригінал' },
    // { value: '/v2/',  label: 'v2 — Новий дизайн' },
  ];

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;background:#fff;border:1px solid #ccc;border-radius:8px;padding:6px 10px;font:13px/1 sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.1);';
  wrap.innerHTML = '<label style="color:#888;margin-right:6px">Версія:</label>';

  const select = document.createElement('select');
  select.style.cssText = 'padding:3px 6px;border:1px solid #ccc;border-radius:4px;font:inherit;cursor:pointer;';
  for (const v of versions) {
    const o = document.createElement('option');
    o.value = v.value;
    o.textContent = v.label;
    select.appendChild(o);
  }

  const path = window.location.pathname;
  let current = '/';
  for (const v of versions) {
    const prefix = v.value.replace(/index\.html$/, '');
    if (v.value !== '/' && path.startsWith(prefix)) { current = v.value; break; }
  }
  select.value = current;
  select.addEventListener('change', (e) => { window.location.href = e.target.value; });

  wrap.appendChild(select);
  document.body.appendChild(wrap);
})();
