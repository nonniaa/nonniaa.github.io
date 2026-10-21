/* متجر — كود الواجهة. البيانات في js/data.js */
(() => {

const root = document.documentElement;
root.classList.add('dark'); root.setAttribute('dir', 'rtl'); root.setAttribute('lang', 'ar');

let S = JSON.parse(JSON.stringify(window.STORE_DATA));
const SAVED_JSON = JSON.stringify(S);

// ---------- helpers ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hex = h => /^#[0-9a-f]{3,8}$/i.test(h || '') ? h : '#777777';
const src = s => (typeof s === 'string' && (s.startsWith('data:image/') || /^(\.?\/)?images\/[\w\-./]+$/i.test(s) || s.startsWith('https://'))) ? s : '';
const icons = () => { try { window.lucide && lucide.createIcons(); } catch {} };
const fmt = n => (+n || 0).toLocaleString('ar-EG') + ' ' + esc(S.currency);
const catOf = id => S.categories.find(c => c.id === id);
const prod = id => S.products.find(p => p.id === id);
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const waNum = () => String(S.whatsapp || '').replace(/\D/g, '');

// ---------- garment illustrations (shown when there is no photo) ----------
const SHAPES = {
  tee: 'M62 46 L84 34 Q100 50 116 34 L138 46 L174 74 L156 98 L140 86 L140 214 L60 214 L60 86 L44 98 L26 74 Z',
  hoodie: 'M58 54 L80 40 Q100 56 120 40 L142 54 L170 140 L176 200 L154 202 L144 120 L142 216 L58 216 L56 120 L46 202 L24 200 L30 140 Z',
  jacket: 'M58 44 L84 32 L100 60 L116 32 L142 44 L168 120 L172 206 L150 208 L142 110 L142 218 L58 218 L58 110 L50 208 L28 206 L32 120 Z',
  coat: 'M62 34 L86 26 L100 70 L114 26 L138 34 L160 110 L166 226 L146 226 L140 120 L146 232 L54 232 L60 120 L54 226 L34 226 L40 110 Z',
  dress: 'M82 28 L94 28 Q100 40 106 28 L118 28 L124 72 L114 94 L164 224 L36 224 L86 94 L76 72 Z',
  pants: 'M64 28 L136 28 L148 226 L112 226 L100 98 L88 226 L52 226 Z'
};
const SHAPE_NAMES = { tee: 'تيشيرت / بلوزة', hoodie: 'هودي', jacket: 'جاكيت', coat: 'بالطو', dress: 'فستان', pants: 'بنطلون' };
const DETAILS = {
  tee: '<path d="M84 34 Q100 52 116 34" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3"/>',
  hoodie: '<path d="M80 40 Q100 4 120 40 Q100 62 80 40Z" fill="rgba(0,0,0,.22)"/><path d="M76 150 L124 150 L118 182 L82 182Z" fill="rgba(0,0,0,.14)"/><line x1="94" y1="56" x2="92" y2="84" stroke="rgba(255,255,255,.35)" stroke-width="2"/><line x1="106" y1="56" x2="108" y2="84" stroke="rgba(255,255,255,.35)" stroke-width="2"/>',
  jacket: '<line x1="100" y1="60" x2="100" y2="218" stroke="rgba(0,0,0,.3)" stroke-width="2"/><rect x="68" y="78" width="22" height="18" rx="2" fill="rgba(0,0,0,.15)"/><rect x="110" y="78" width="22" height="18" rx="2" fill="rgba(0,0,0,.15)"/><circle cx="100" cy="110" r="2.5" fill="rgba(255,255,255,.4)"/><circle cx="100" cy="140" r="2.5" fill="rgba(255,255,255,.4)"/><circle cx="100" cy="170" r="2.5" fill="rgba(255,255,255,.4)"/>',
  coat: '<path d="M86 26 L100 70 L92 120 L76 60Z" fill="rgba(0,0,0,.18)"/><path d="M114 26 L100 70 L108 120 L124 60Z" fill="rgba(0,0,0,.18)"/><line x1="100" y1="70" x2="100" y2="232" stroke="rgba(0,0,0,.28)" stroke-width="2"/><circle cx="108" cy="140" r="3" fill="rgba(255,255,255,.35)"/><circle cx="108" cy="170" r="3" fill="rgba(255,255,255,.35)"/>',
  dress: '<path d="M78 92 Q100 100 122 92" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="4"/><path d="M100 98 L92 224 M100 98 L120 224" stroke="rgba(255,255,255,.08)" stroke-width="10"/>',
  pants: '<line x1="64" y1="40" x2="136" y2="40" stroke="rgba(0,0,0,.25)" stroke-width="2"/><line x1="100" y1="40" x2="100" y2="96" stroke="rgba(0,0,0,.25)" stroke-width="2"/><path d="M74 46 Q80 70 66 76" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="2"/>'
};
let uid = 0;
function garment(type, color) {
  type = SHAPES[type] ? type : 'tee';
  const g = 'g' + (++uid);
  return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>
    <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    <radialGradient id="${g}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="100" cy="238" rx="70" ry="8" fill="url(#${g}s)"/><path d="${SHAPES[type]}" fill="${hex(color)}"/>${DETAILS[type]}
    <path d="${SHAPES[type]}" fill="url(#${g})" stroke="rgba(255,255,255,.12)" stroke-width="1"/></svg>`;
}
const artBg = c => `radial-gradient(70% 60% at 50% 45%, ${hex(c)}55, transparent 70%), linear-gradient(160deg, rgba(255,255,255,.04), rgba(255,255,255,0))`;
const pColor = (p, ci) => (p.colors[ci] || p.colors[0] || { hex: '#777777', name: '' });
const pVisual = (p, ci, imgIdx = 0) => {
  const im = src(p.images?.[imgIdx]);
  return im ? `<img src="${im}" alt="${esc(p.name)}" loading="lazy">` : garment(p.type, pColor(p, ci).hex);
};

// ---------- shopper state ----------
let cart = ls.get('noir_cart', []);
let favs = new Set(ls.get('noir_favs', []));
let filter = 'all', query = '';
const chosen = {};
let editing = false;

// ---------- page render ----------
function appHTML() {
  const [c1, c2] = S.categories;
  const cats = S.categories.map(c => `<a href="#shop" data-act="cat" data-cat="${esc(c.id)}" class="hover:text-fg transition">${esc(c.name)}</a>`).join('');
  const ann = S.announce.filter(Boolean);
  const annRow = ann.map(a => `<span>${esc(a)}</span><span class="text-gold">✦</span>`).join('');
  const catTile = (c, d) => !c ? '' : `
    <a href="#shop" data-act="cat" data-cat="${esc(c.id)}" class="glow glass card reveal rounded-[28px] p-6 flex flex-col justify-between min-h-[230px] relative" style="--d:${d}ms">
      ${src(c.image) ? `<div class="absolute inset-0 art"><img src="${src(c.image)}" alt=""></div><div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.1) 60%)"></div>`
        : `<div class="absolute -bottom-5 -left-5 w-[62%] h-[94%] art">${garment(c.art, c.color)}</div>`}
      <div class="relative"><p class="label ${src(c.image) ? 'text-white/70' : 'text-muted'}">${esc(c.latin)}</p><h2 class="font-display text-2xl font-bold mt-1">${esc(c.name)}</h2></div>
      <span class="relative inline-flex items-center gap-1 text-sm text-gold">تسوّقي القسم <i data-lucide="arrow-up-left" class="w-4 h-4"></i></span>
    </a>`;
  return `
  <div class="grain" aria-hidden="true"></div>
  ${ann.length ? `<div class="relative z-10 overflow-hidden border-b border-line text-[13px] text-muted"><div class="marquee flex whitespace-nowrap gap-12 py-2 w-max">${annRow}${annRow}${annRow}</div></div>` : ''}
  <header class="sticky z-40 border-b border-line" style="top: env(safe-area-inset-top, 0px); background: rgba(10,10,10,.72); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);">
    <div class="gutter mx-auto max-w-7xl flex items-center gap-4 h-[68px]">
      <a href="#top" class="flex items-center gap-2 shrink-0 min-w-0">
        ${src(S.logo) ? `<img src="${src(S.logo)}" alt="${esc(S.brand)}" class="h-10 w-auto max-w-[140px] object-contain">`
          : `<span class="font-display text-2xl font-bold tracking-wide truncate">${esc(S.brand)}</span><span class="label text-gold hidden sm:inline">${esc(S.brandLatin)}</span>`}
      </a>
      <nav class="hidden md:flex items-center gap-6 text-sm text-muted ms-4">
        ${cats}<a href="#shop" data-act="cat" data-cat="sale" class="hover:text-fg transition">العروض</a>
      </nav>
      <label class="relative flex-1 max-w-sm ms-auto hidden sm:block">
        <span class="sr-only">ابحثي عن منتج</span>
        <i data-lucide="search" class="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-muted"></i>
        <input id="search" type="search" value="${esc(query)}" placeholder="ابحثي عن فستان، هودي، جاكيت…" class="w-full rounded-full glass py-2.5 pr-9 pl-4 text-sm focus:outline-none">
      </label>
      <div class="flex items-center gap-1 ms-auto sm:ms-0">
        <button data-act="search-toggle" class="sm:hidden p-2.5 rounded-full hover:bg-white/5" aria-label="بحث"><i data-lucide="search" class="w-5 h-5"></i></button>
        <button data-act="fav-filter" class="relative p-2.5 rounded-full hover:bg-white/5" aria-label="المفضلة"><i data-lucide="heart" class="w-5 h-5"></i>
          <span id="favCount" class="num absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-fg text-ink text-[10px] font-bold grid place-items-center">٠</span></button>
        <button data-act="cart-open" class="relative p-2.5 rounded-full hover:bg-white/5" aria-label="سلة التسوق"><i data-lucide="shopping-bag" class="w-5 h-5"></i>
          <span id="cartCount" class="num absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-[#17130C] text-[10px] font-bold grid place-items-center">٠</span></button>
      </div>
    </div>
    <div id="searchMobile" class="gutter pb-3 sm:hidden" hidden><input id="search2" type="search" value="${esc(query)}" placeholder="ابحثي عن منتج…" class="w-full rounded-full glass py-2.5 px-4 text-sm focus:outline-none"></div>
  </header>

  <main id="top" class="relative z-10">
    <section class="gutter mx-auto max-w-7xl" style="padding-block: 28px 12px;">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[230px_230px]">
        <article class="glow glass card reveal rounded-[28px] sm:col-span-2 lg:row-span-2 p-7 sm:p-9 flex flex-col justify-between min-h-[420px] relative">
          <div class="absolute inset-y-0 left-0 w-[58%] art pointer-events-none ${src(S.hero.image) ? 'hero-img' : ''}">${src(S.hero.image) ? `<img src="${src(S.hero.image)}" alt="">` : garment('coat', '#A8875E')}</div>
          <div class="relative max-w-[62%] sm:max-w-[55%]">
            <p class="label text-gold mb-4">${esc(S.hero.eyebrow)}</p>
            <h1 class="font-display text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.15] font-bold">${esc(S.hero.title)} <span class="text-gold">${esc(S.hero.highlight)}</span></h1>
            <p class="text-muted mt-4 max-w-xs">${esc(S.hero.text)}</p>
          </div>
          <div class="relative flex flex-wrap items-center gap-3 mt-8">
            <a href="#shop" class="btn-gold rounded-full px-6 py-3 font-bold inline-flex items-center gap-2">${esc(S.hero.cta)} <i data-lucide="arrow-left" class="w-4 h-4"></i></a>
            <span class="text-sm text-muted num">${esc(S.hero.note)}</span>
          </div>
        </article>
        ${catTile(c1, 80)}
        <a href="#shop" data-act="cat" data-cat="sale" class="glow card reveal rounded-[28px] p-6 flex flex-col justify-between min-h-[230px] relative" style="--d:140ms; background: linear-gradient(150deg, rgba(212,180,122,.22), rgba(212,180,122,.03) 60%); border: 1px solid rgba(212,180,122,.28);">
          <p class="label text-gold">${esc(S.sale.label)}</p>
          <div><p class="font-display font-bold leading-none num" dir="ltr" style="font-size: clamp(3.4rem, 7vw, 5rem); text-align:right">${esc(S.sale.big)}</p><p class="text-muted text-sm mt-2">${esc(S.sale.text)}</p></div>
        </a>
        ${catTile(c2, 200)}
        <div class="glass card reveal rounded-[28px] p-6 flex flex-col justify-between gap-4 min-h-[230px]" style="--d:260ms">
          ${S.promises.map(x => `<div class="flex items-center gap-3"><span class="w-10 h-10 rounded-full grid place-items-center bg-white/5 shrink-0"><i data-lucide="${esc(x.icon)}" class="w-5 h-5 text-gold"></i></span><div class="min-w-0"><p class="font-bold">${esc(x.title)}</p><p class="text-sm text-muted">${esc(x.sub)}</p></div></div>`).join('')}
        </div>
      </div>
    </section>

    <section id="shop" class="gutter mx-auto max-w-7xl scroll-mt-24" style="padding-block: 48px 80px;">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div><p class="label text-gold">المتجر</p><h2 class="font-display text-3xl sm:text-4xl font-bold mt-1">${esc(S.shopTitle)}</h2></div>
        <div class="flex gap-2 overflow-x-auto no-scrollbar max-w-full" id="chips"></div>
      </div>
      <div id="grid" class="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4"></div>
      <p id="empty" class="text-center text-muted py-16" hidden></p>
    </section>

    <footer class="border-t border-line">
      <div class="gutter mx-auto max-w-7xl grid gap-8 sm:grid-cols-3" style="padding-block: 40px 96px;">
        <div><p class="font-display text-2xl font-bold">${esc(S.brand)}</p><p class="text-muted text-sm mt-2 max-w-xs">${esc(S.footer.about)}</p></div>
        <div class="text-sm"><p class="label text-muted mb-3">الأقسام</p><ul class="space-y-2 text-muted">${S.categories.map(c => `<li><a href="#shop" data-act="cat" data-cat="${esc(c.id)}" class="hover:text-fg">${esc(c.name)}</a></li>`).join('')}</ul></div>
        <div class="text-sm"><p class="label text-muted mb-3">تواصلي معانا</p>
          <p class="text-muted">واتساب: <span class="num select-all text-fg" dir="ltr">+${esc(waNum())}</span></p>
          <p class="text-muted mt-2">${esc(S.footer.hours)}</p></div>
      </div>
    </footer>
  </main>`;
}

function render() {
  uid = 0;
  document.title = S.brand;
  $('app').innerHTML = appHTML();
  renderChips(); renderGrid(); updateBadges(); renderCart();
  $('waFloat').href = `https://wa.me/${waNum()}?text=${encodeURIComponent('أهلاً، عندي استفسار عن منتجاتكم')}`;
  observe($('app').querySelectorAll('.reveal'));
  icons();
}

function renderChips() {
  const list = [['all', 'الكل'], ...S.categories.map(c => [c.id, c.name]), ['sale', 'العروض'], ['fav', 'المفضلة']];
  $('chips').innerHTML = list.map(([id, n]) => `<button class="chip ${filter === id ? 'on' : ''} rounded-full px-4 py-2 text-sm whitespace-nowrap" data-act="cat" data-cat="${esc(id)}">${esc(n)}</button>`).join('');
}

function card(p, i) {
  const ci = chosen[p.id] ?? 0, c = pColor(p, ci), fav = favs.has(p.id), hasImg = !!src(p.images?.[0]);
  return `<article class="card glow glass reveal rounded-[24px] p-3 sm:p-4 flex flex-col gap-3 min-w-0" style="--d:${(i % 4) * 70}ms">
    <div class="relative rounded-[18px] overflow-hidden aspect-[4/5]" style="background:${artBg(c.hex)}">
      <button data-act="open" data-id="${p.id}" class="art block w-full h-full ${hasImg ? '' : 'p-5'}" aria-label="عرض ${esc(p.name)}">${pVisual(p, ci)}</button>
      ${p.tag ? `<span class="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${p.old ? 'bg-gold text-[#17130C]' : 'bg-black/40 backdrop-blur text-fg'}">${esc(p.tag)}</span>` : ''}
      <button data-act="fav" data-id="${p.id}" class="absolute top-2.5 left-2.5 w-9 h-9 rounded-full grid place-items-center bg-black/30 backdrop-blur hover:bg-black/50 transition" aria-label="المفضلة" aria-pressed="${fav}">
        <i data-lucide="heart" class="w-4 h-4 ${fav ? 'fill-[var(--gold)] text-gold' : ''}"></i></button>
      ${editing ? `<button data-act="edit-prod" data-id="${p.id}" class="absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-xs font-bold btn-gold inline-flex items-center gap-1"><i data-lucide="pencil" class="w-3.5 h-3.5"></i> تعديل</button>` : ''}
    </div>
    <div class="px-1 flex flex-col gap-2 flex-1">
      <div class="flex items-center justify-between gap-2">
        <span class="label text-muted truncate">${esc(catOf(p.cat)?.name || '')}</span>
        <div class="flex gap-1.5 shrink-0">${p.colors.map((x, j) => `<button class="swatch ${j === ci ? 'on' : ''}" style="background:${hex(x.hex)}" data-act="swatch" data-id="${p.id}" data-ci="${j}" aria-label="${esc(x.name)}" title="${esc(x.name)}"></button>`).join('')}</div>
      </div>
      <h3 class="font-bold leading-snug">${esc(p.name)}</h3>
      <div class="flex items-baseline gap-2 num flex-wrap"><span class="font-bold">${fmt(p.price)}</span>${p.old ? `<span class="text-muted text-sm line-through">${fmt(p.old)}</span>` : ''}</div>
      <button data-act="add" data-id="${p.id}" class="btn-ghost mt-auto rounded-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> أضيفي للسلة</button>
    </div>
  </article>`;
}

function renderGrid() {
  const q = query.trim();
  const list = S.products.filter(p =>
    (filter === 'all' || p.cat === filter || (filter === 'sale' && p.old > 0) || (filter === 'fav' && favs.has(p.id))) &&
    (!q || p.name.includes(q) || (p.desc || '').includes(q)));
  $('grid').innerHTML = list.map(card).join('');
  const empty = $('empty');
  empty.hidden = list.length > 0;
  empty.textContent = filter === 'fav' && !q ? 'لسه ما ضفتيش حاجة للمفضلة. دوسي على القلب في أي منتج.'
    : q ? 'مفيش منتجات بالاسم ده. جرّبي كلمة تانية.' : 'مفيش منتجات في القسم ده لسه.';
  observe($('grid').querySelectorAll('.reveal'));
  icons();
}

function setFilter(cat) { filter = cat; renderChips(); renderGrid(); }

// ---------- static UI (cart, modal, whatsapp, toast) ----------
const ui = document.createElement('div');
ui.innerHTML = `
<div id="cartScrim" class="scrim fixed inset-0 z-50 bg-black/60" data-act="cart-close"></div>
<aside id="cart" class="drawer fixed top-0 bottom-0 left-0 z-50 w-full sm:w-[420px] flex flex-col border-r border-line" style="background: var(--panel-strong); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); padding-left: env(safe-area-inset-left, 0px);" aria-label="سلة التسوق">
  <div class="flex items-center justify-between px-6 h-[68px] border-b border-line">
    <h3 class="font-display text-xl font-bold">سلة التسوق <span id="cartTitleCount" class="text-muted text-base num"></span></h3>
    <button data-act="cart-close" class="p-2 rounded-full hover:bg-white/5" aria-label="إغلاق السلة"><i data-lucide="x" class="w-5 h-5"></i></button>
  </div>
  <div id="cartItems" class="flex-1 overflow-y-auto px-6 py-4 space-y-4"></div>
  <div id="cartFoot" class="px-6 py-5 border-t border-line space-y-3">
    <div class="flex justify-between text-sm text-muted"><span>المجموع</span><span id="subtotal" class="num"></span></div>
    <div class="flex justify-between text-sm text-muted"><span>الشحن</span><span id="shipping" class="num"></span></div>
    <div id="freeShip" class="text-xs text-gold"></div>
    <div class="flex justify-between text-lg font-bold pt-1"><span>الإجمالي</span><span id="total" class="num"></span></div>
    <a id="checkout" href="#" target="_blank" rel="noopener" class="btn-gold w-full rounded-full py-3.5 font-bold flex items-center justify-center gap-2"><i data-lucide="message-circle" class="w-5 h-5"></i> اطلبي على الواتساب</a>
    <p class="text-xs text-muted text-center">هيتبعت الأوردر جاهز برسالة، والدفع عند الاستلام.</p>
  </div>
</aside>
<div id="modal" class="scrim fixed inset-0 z-50 bg-black/70 grid place-items-center gutter" style="padding-block: 24px;" role="dialog" aria-modal="true" data-act="modal-bg">
  <div class="modal-box glass rounded-[28px] w-full max-w-3xl max-h-[92vh] overflow-y-auto grid md:grid-cols-2" style="background: var(--panel-strong);">
    <div class="relative">
      <div id="mArt" class="art aspect-[4/5] md:aspect-auto md:h-full md:min-h-[460px] rounded-t-[28px] md:rounded-t-none md:rounded-r-[28px] overflow-hidden"></div>
      <div id="mThumbs" class="absolute bottom-3 inset-x-3 flex gap-2 justify-center"></div>
    </div>
    <div class="p-6 sm:p-8 flex flex-col gap-5 min-w-0">
      <div class="flex justify-between items-start gap-3">
        <div class="min-w-0"><p id="mCat" class="label text-gold"></p><h3 id="mName" class="font-display text-2xl font-bold mt-1"></h3></div>
        <button data-act="m-close" class="p-2 rounded-full hover:bg-white/5 shrink-0" aria-label="إغلاق"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="flex items-baseline gap-3 flex-wrap"><span id="mPrice" class="text-2xl font-bold num"></span><span id="mOld" class="text-muted line-through num"></span></div>
      <p id="mDesc" class="text-muted text-sm"></p>
      <div id="mColorWrap"><p class="text-sm mb-2">اللون: <span id="mColorName" class="text-muted"></span></p><div id="mColors" class="flex gap-3 flex-wrap"></div></div>
      <div id="mSizeWrap"><p class="text-sm mb-2">المقاس</p><div id="mSizes" class="flex flex-wrap gap-2"></div><p id="mSizeHint" class="text-xs text-gold mt-2" hidden>اختاري المقاس الأول.</p></div>
      <button data-act="m-add" class="btn-gold rounded-full py-3.5 font-bold flex items-center justify-center gap-2 mt-auto"><i data-lucide="shopping-bag" class="w-5 h-5"></i> أضيفي للسلة</button>
    </div>
  </div>
</div>
<a id="waFloat" href="#" target="_blank" rel="noopener" class="wa-btn fixed z-40 w-14 h-14 rounded-full grid place-items-center text-white transition hover:scale-110"
   style="background: var(--wa); right: calc(20px + env(safe-area-inset-right, 0px)); bottom: calc(20px + env(safe-area-inset-bottom, 0px));" aria-label="تواصلي معانا على الواتساب">
  <svg viewBox="0 0 24 24" class="w-7 h-7" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>
</a>
<button id="editLaunch" data-act="ed-open" hidden class="fixed z-40 rounded-full px-5 py-3 font-bold btn-gold inline-flex items-center gap-2 shadow-2xl"
   style="left: calc(20px + env(safe-area-inset-left, 0px)); bottom: calc(20px + env(safe-area-inset-bottom, 0px));"><i data-lucide="pencil" class="w-4 h-4"></i> تعديل المتجر</button>
<div id="toast" class="fixed z-[80] left-1/2 -translate-x-1/2 glass rounded-full px-5 py-3 text-sm flex items-center gap-2 transition-all duration-300 opacity-0 translate-y-4 pointer-events-none" style="bottom: calc(92px + env(safe-area-inset-bottom, 0px)); background: var(--panel-strong);">
  <i data-lucide="check" class="w-4 h-4 text-gold"></i><span id="toastText"></span></div>
<aside id="editor" class="ed" aria-label="لوحة تعديل المتجر"></aside>`;
document.body.appendChild(ui);

// ---------- modal ----------
let mp = null, mColor = 0, mSize = null, mImg = 0;
function openModal(p, fromAdd) {
  mp = p; mColor = chosen[p.id] ?? 0; mSize = p.sizes.length === 1 ? p.sizes[0] : null; mImg = 0;
  $('mCat').textContent = catOf(p.cat)?.name || '';
  $('mName').textContent = p.name;
  $('mPrice').innerHTML = fmt(p.price);
  $('mOld').innerHTML = p.old ? fmt(p.old) : '';
  $('mDesc').textContent = p.desc || '';
  $('mSizeHint').hidden = !fromAdd || !!mSize;
  $('mSizeWrap').hidden = !p.sizes.length;
  $('mColorWrap').hidden = !p.colors.length;
  $('mSizes').innerHTML = p.sizes.map(s => `<button data-act="m-size" data-s="${esc(s)}" class="size chip num rounded-xl min-w-[48px] px-3 py-2 text-sm font-bold ${s === mSize ? 'on' : ''}">${esc(s)}</button>`).join('');
  paintModal();
  $('modal').classList.add('open');
}
function paintModal() {
  const c = pColor(mp, mColor), hasImg = !!src(mp.images?.[0]);
  const art = $('mArt');
  art.style.background = artBg(c.hex);
  art.className = `art aspect-[4/5] md:aspect-auto md:h-full md:min-h-[460px] rounded-t-[28px] md:rounded-t-none md:rounded-r-[28px] overflow-hidden ${hasImg ? '' : 'p-8'}`;
  art.innerHTML = pVisual(mp, mColor, mImg);
  const imgs = (mp.images || []).filter(src);
  $('mThumbs').innerHTML = imgs.length > 1 ? imgs.map((im, i) => `<button data-act="m-img" data-i="${i}" class="w-11 h-14 rounded-lg overflow-hidden border ${i === mImg ? 'border-gold' : 'border-white/20 opacity-70'}"><img src="${im}" alt="" class="w-full h-full object-cover"></button>`).join('') : '';
  $('mColorName').textContent = c.name;
  $('mColors').innerHTML = mp.colors.map((x, j) => `<button data-act="m-color" data-ci="${j}" class="swatch ${j === mColor ? 'on' : ''}" style="width:28px;height:28px;background:${hex(x.hex)}" aria-label="${esc(x.name)}"></button>`).join('');
}
const closeModal = () => $('modal').classList.remove('open');

// ---------- cart ----------
function addToCart(p, ci, size) {
  const key = `${p.id}-${ci}-${size}`;
  const it = cart.find(i => i.key === key);
  it ? it.qty++ : cart.push({ key, id: p.id, ci, size, qty: 1 });
  ls.set('noir_cart', cart); updateBadges(true); renderCart();
  toast(`${p.name} اتضاف للسلة`);
}
const openCart = () => { renderCart(); $('cart').classList.add('open'); $('cartScrim').classList.add('open'); };
const closeCart = () => { $('cart').classList.remove('open'); $('cartScrim').classList.remove('open'); };
function renderCart() {
  cart = cart.filter(i => prod(i.id));
  const box = $('cartItems'), foot = $('cartFoot');
  const count = cart.reduce((a, i) => a + i.qty, 0);
  $('cartTitleCount').textContent = count ? `(${count.toLocaleString('ar-EG')})` : '';
  if (!cart.length) {
    box.innerHTML = `<div class="h-full grid place-items-center text-center py-16"><div>
      <span class="w-16 h-16 mx-auto rounded-full bg-white/5 grid place-items-center mb-4"><i data-lucide="shopping-bag" class="w-7 h-7 text-muted"></i></span>
      <p class="font-bold">السلة فاضية</p><p class="text-sm text-muted mt-1">اختاري قطعة من المتجر وهتظهر هنا.</p>
      <button data-act="cart-close" class="btn-ghost rounded-full px-5 py-2.5 text-sm mt-5">كمّلي تسوق</button></div></div>`;
    foot.hidden = true; icons(); return;
  }
  foot.hidden = false;
  box.innerHTML = cart.map(i => {
    const p = prod(i.id), c = pColor(p, i.ci), hasImg = !!src(p.images?.[0]);
    return `<div class="flex gap-4 items-center">
      <div class="w-20 h-24 rounded-2xl shrink-0 overflow-hidden art ${hasImg ? '' : 'p-2'}" style="background:${artBg(c.hex)}">${pVisual(p, i.ci)}</div>
      <div class="flex-1 min-w-0">
        <p class="font-bold truncate">${esc(p.name)}</p>
        <p class="text-xs text-muted mt-0.5">${esc(c.name)}${i.size ? ` · مقاس <span class="num">${esc(i.size)}</span>` : ''}</p>
        <div class="flex items-center justify-between mt-2 gap-2">
          <div class="flex items-center rounded-full border border-line">
            <button data-act="qty" data-key="${esc(i.key)}" data-d="1" class="w-8 h-8 grid place-items-center hover:text-gold" aria-label="زوّدي"><i data-lucide="plus" class="w-3.5 h-3.5"></i></button>
            <span class="num w-6 text-center text-sm">${i.qty.toLocaleString('ar-EG')}</span>
            <button data-act="qty" data-key="${esc(i.key)}" data-d="-1" class="w-8 h-8 grid place-items-center hover:text-gold" aria-label="قلّلي"><i data-lucide="minus" class="w-3.5 h-3.5"></i></button>
          </div>
          <span class="num text-sm font-bold">${fmt(p.price * i.qty)}</span>
        </div>
      </div>
      <button data-act="rm" data-key="${esc(i.key)}" class="p-2 text-muted hover:text-fg self-start" aria-label="شيلي من السلة"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>`;
  }).join('');
  const sub = cart.reduce((a, i) => a + prod(i.id).price * i.qty, 0);
  const free = S.freeOver > 0 && sub >= S.freeOver;
  const ship = free ? 0 : (+S.shipping || 0);
  $('subtotal').innerHTML = fmt(sub);
  $('shipping').innerHTML = ship ? fmt(ship) : 'مجاني';
  $('total').innerHTML = fmt(sub + ship);
  $('freeShip').innerHTML = S.freeOver > 0 ? (free ? 'مبروك، الشحن عليكي مجاني' : `فاضلك ${fmt(S.freeOver - sub)} وتاخدي الشحن مجاني`) : '';
  const lines = cart.map(i => { const p = prod(i.id); return `• ${p.name} | ${pColor(p, i.ci).name}${i.size ? ' | مقاس ' + i.size : ''} | عدد ${i.qty} = ${p.price * i.qty} ${S.currency}`; });
  const msg = `أهلاً، عايزة أطلب من ${S.brand}:\n${lines.join('\n')}\n\nالمجموع: ${sub} ${S.currency}\nالشحن: ${ship ? ship + ' ' + S.currency : 'مجاني'}\nالإجمالي: ${sub + ship} ${S.currency}\n\nالاسم:\nالعنوان:\nالمحافظة:`;
  $('checkout').href = `https://wa.me/${waNum()}?text=${encodeURIComponent(msg)}`;
  icons();
}
function updateBadges(bump) {
  const cc = $('cartCount'); if (!cc) return;
  cc.textContent = cart.reduce((a, i) => a + i.qty, 0).toLocaleString('ar-EG');
  $('favCount').textContent = [...favs].filter(prod).length.toLocaleString('ar-EG');
  if (bump) { cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump'); }
}

let tt;
function toast(t) {
  const el = $('toast'); $('toastText').textContent = t;
  el.classList.remove('opacity-0', 'translate-y-4');
  clearTimeout(tt); tt = setTimeout(() => el.classList.add('opacity-0', 'translate-y-4'), 2400);
}

// ---------- shopper events ----------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, id = +t.dataset.id;
  if (a.startsWith('ed-')) return editorAction(a, t, e);
  switch (a) {
    case 'cat': setFilter(t.dataset.cat); break;
    case 'open': openModal(prod(id)); break;
    case 'add': openModal(prod(id), true); break;
    case 'fav': favs.has(id) ? favs.delete(id) : favs.add(id); ls.set('noir_favs', [...favs]);
      toast(favs.has(id) ? 'اتضافت للمفضلة' : 'اتشالت من المفضلة'); updateBadges(); renderGrid(); break;
    case 'swatch': chosen[id] = +t.dataset.ci; renderGrid(); break;
    case 'edit-prod': openEditor('products', S.products.findIndex(p => p.id === id)); break;
    case 'fav-filter': setFilter('fav'); $('shop').scrollIntoView({ behavior: 'smooth' }); break;
    case 'search-toggle': { const s = $('searchMobile'); s.hidden = !s.hidden; if (!s.hidden) $('search2').focus(); break; }
    case 'cart-open': openCart(); break;
    case 'cart-close': closeCart(); break;
    case 'qty': case 'rm': {
      const it = cart.find(i => i.key === t.dataset.key); if (!it) break;
      if (a === 'qty') { it.qty += +t.dataset.d; if (it.qty < 1) cart = cart.filter(i => i !== it); } else cart = cart.filter(i => i !== it);
      ls.set('noir_cart', cart); updateBadges(); renderCart(); break;
    }
    case 'modal-bg': if (e.target === t) closeModal(); break;
    case 'm-close': closeModal(); break;
    case 'm-color': mColor = +t.dataset.ci; paintModal(); break;
    case 'm-img': mImg = +t.dataset.i; paintModal(); break;
    case 'm-size': mSize = t.dataset.s; $('mSizes').querySelectorAll('.size').forEach(b => b.classList.toggle('on', b === t)); $('mSizeHint').hidden = true; break;
    case 'm-add': if (mp.sizes.length && !mSize) { $('mSizeHint').hidden = false; break; } addToCart(mp, mColor, mSize || ''); closeModal(); break;
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'search' || e.target.id === 'search2') {
    query = e.target.value;
    if (query && filter !== 'all') { filter = 'all'; renderChips(); }
    renderGrid();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeModal(); } });
document.addEventListener('pointermove', e => {
  const el = e.target.closest && e.target.closest('.glow'); if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 }) : null;
function observe(nodes) { if (io) nodes.forEach(n => io.observe(n)); }

render();

// =====================================================================
//  OWNER EDITOR — visible only to people who can edit this page
// =====================================================================
let tab = 'brand', pIdx = -1, confirmDel = null, busy = false;
const ed = $('editor');
const getP = path => path.split('.').reduce((o, k) => o?.[k], S);
const setP = (path, v) => { const ks = path.split('.'), last = ks.pop(); const o = ks.reduce((o, k) => o[k], S); o[last] = v; };
const dirty = () => JSON.stringify(S) !== SAVED_JSON;

function buildData() {
  return '/* بيانات المتجر — اتعملت من لوحة التعديل (admin.html). ممكن تعدّليها بإيدك برضه. */\nwindow.STORE_DATA = ' + JSON.stringify(S, null, 1) + ';\n';
}

const fld = (label, path, o = {}) => {
  const v = getP(path), type = o.type || 'text';
  const val = type === 'lines' ? (v || []).join('\n') : type === 'csv' ? (v || []).join('، ') : (v ?? '');
  const attrs = `data-path="${path}" data-type="${type}" class="inp" ${o.dir ? `dir="${o.dir}"` : ''} placeholder="${esc(o.ph || '')}"`;
  const input = (type === 'area' || type === 'lines') ? `<textarea ${attrs} rows="${o.rows || 3}">${esc(val)}</textarea>`
    : `<input ${attrs} type="${type === 'num' ? 'number' : 'text'}" ${type === 'num' ? 'inputmode="numeric" min="0"' : ''} value="${esc(val)}">`;
  return `<label class="fld ${o.cls || ''}"><span>${label}</span>${input}${o.hint ? `<small class="text-xs text-muted">${o.hint}</small>` : ''}</label>`;
};
const imgFld = (label, path, o = {}) => {
  const v = src(getP(path));
  return `<div class="fld"><span>${label}</span><div class="flex items-center gap-3">
    <div class="thumb ${o.wide ? '!w-24 !h-16' : ''}">${v ? `<img src="${v}" alt="">` : `<div class="w-full h-full grid place-items-center text-muted"><i data-lucide="image" class="w-5 h-5"></i></div>`}</div>
    <label class="btn-ghost rounded-full px-4 py-2 text-sm cursor-pointer inline-flex items-center gap-2"><i data-lucide="upload" class="w-4 h-4"></i> ${v ? 'تغيير' : 'رفع صورة'}
      <input type="file" accept="image/*" class="sr-only" data-upload="${path}"></label>
    ${v ? `<button data-act="ed-clear" data-path="${path}" class="text-sm text-muted hover:text-fg">إزالة</button>` : ''}</div>
    ${o.hint ? `<small class="text-xs text-muted">${o.hint}</small>` : ''}</div>`;
};
const group = (title, body) => `<section class="space-y-4"><h4 class="sec-title">${title}</h4>${body}</section>`;

function editorBody() {
  if (tab === 'brand') return [
    group('البراند', fld('اسم البراند', 'brand') + fld('الاسم بالإنجليزي (اختياري)', 'brandLatin', { dir: 'ltr' })
      + imgFld('اللوجو (لو رفعتيه هيظهر بدل الاسم)', 'logo', { wide: true, hint: 'يفضّل PNG بخلفية شفافة.' })),
    group('الطلبات والشحن', fld('رقم الواتساب', 'whatsapp', { dir: 'ltr', ph: '2010xxxxxxxx', hint: 'بالكود الدولي من غير + ولا مسافات. مثال: 201012345678' })
      + `<div class="grid grid-cols-3 gap-3">${fld('سعر الشحن', 'shipping', { type: 'num' })}${fld('شحن مجاني فوق', 'freeOver', { type: 'num', hint: '٠ = مفيش' })}${fld('العملة', 'currency')}</div>`),
    group('الأقسام', S.categories.map((c, i) => `<div class="glass rounded-2xl p-3 space-y-3">
        <div class="grid grid-cols-2 gap-3">${fld('اسم القسم', `categories.${i}.name`)}${fld('بالإنجليزي', `categories.${i}.latin`, { dir: 'ltr' })}</div>
        ${S.categories.length > 1 ? `<button data-act="ed-cat-del" data-i="${i}" class="text-xs ${confirmDel === 'cat' + i ? 'text-[var(--danger)] font-bold' : 'text-muted'} hover:text-fg">${confirmDel === 'cat' + i ? 'متأكدة؟ دوسي تاني للحذف (المنتجات هتتنقل لأول قسم)' : 'حذف القسم'}</button>` : ''}
      </div>`).join('') + `<button data-act="ed-cat-add" class="btn-ghost w-full rounded-full py-2.5 text-sm inline-flex items-center justify-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> قسم جديد</button>
      <small class="text-xs text-muted block">أول قسمين بيظهروا كمربعات كبيرة في الواجهة.</small>`),
    group('شريط الإعلانات وأسفل الصفحة', fld('جمل الشريط المتحرك (كل سطر جملة)', 'announce', { type: 'lines', rows: 4 })
      + fld('نبذة عن البراند', 'footer.about', { type: 'area', rows: 2 }) + fld('مواعيد التواصل', 'footer.hours'))
  ].join('');

  if (tab === 'front') return [
    group('البانر الرئيسي', fld('السطر الصغير فوق العنوان', 'hero.eyebrow') + fld('العنوان', 'hero.title') + fld('الكلمة الذهبية في آخر العنوان', 'hero.highlight')
      + fld('الوصف', 'hero.text', { type: 'area', rows: 2 }) + `<div class="grid grid-cols-2 gap-3">${fld('نص الزرار', 'hero.cta')}${fld('ملاحظة جنب الزرار', 'hero.note')}</div>`
      + imgFld('صورة البانر', 'hero.image', { wide: true, hint: 'صورة عرضية أو موديل لابس. بتظهر على الشمال وبتختفي تدريجياً.' })),
    group('صور الأقسام', S.categories.slice(0, 2).map((c, i) => imgFld(`صورة قسم "${esc(c.name)}"`, `categories.${i}.image`)).join('')),
    group('مربع العروض', fld('العنوان الصغير', 'sale.label') + fld('الرقم الكبير', 'sale.big', { dir: 'ltr' }) + fld('الوصف', 'sale.text')),
    group('المميزات', S.promises.map((x, i) => `<div class="grid grid-cols-2 gap-3">${fld('الميزة', `promises.${i}.title`)}${fld('تفصيلة', `promises.${i}.sub`)}</div>`).join('')),
    group('قسم المنتجات', fld('عنوان القسم', 'shopTitle'))
  ].join('');

  // products
  if (pIdx >= 0 && S.products[pIdx]) {
    const p = S.products[pIdx], b = `products.${pIdx}`;
    return `<button data-act="ed-back" class="text-sm text-muted hover:text-fg inline-flex items-center gap-1"><i data-lucide="arrow-right" class="w-4 h-4"></i> كل المنتجات</button>
    ${group('صور المنتج', `<div class="flex flex-wrap gap-3">${(p.images || []).map((im, j) => `<div class="relative thumb !w-20 !h-24"><img src="${src(im)}" alt="">
        <button data-act="ed-img-del" data-j="${j}" class="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/70 grid place-items-center" aria-label="حذف الصورة"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
        ${j > 0 ? `<button data-act="ed-img-first" data-j="${j}" class="absolute bottom-1 inset-x-1 rounded-md bg-black/70 text-[10px] py-0.5">خليها الأولى</button>` : `<span class="absolute bottom-1 inset-x-1 rounded-md bg-gold text-[#17130C] text-[10px] py-0.5 text-center font-bold">الرئيسية</span>`}</div>`).join('')}
        <label class="drop !w-20 !h-24 grid place-items-center text-center text-xs text-gold cursor-pointer"><span><i data-lucide="image-plus" class="w-5 h-5 mx-auto mb-1"></i>أضيفي صور</span>
          <input type="file" accept="image/*" multiple class="sr-only" data-upload-multi="${b}.images"></label></div>
        <small class="text-xs text-muted">ممكن ترفعي كذا صورة مرة واحدة. الصور بتتصغّر تلقائي عشان الموقع يفضل سريع.</small>`)}
    ${group('البيانات', fld('اسم المنتج', `${b}.name`)
      + `<label class="fld"><span>القسم</span><select data-path="${b}.cat" data-type="text" class="inp">${S.categories.map(c => `<option value="${esc(c.id)}" ${c.id === p.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>`
      + `<div class="grid grid-cols-2 gap-3">${fld('السعر', `${b}.price`, { type: 'num' })}${fld('السعر قبل الخصم', `${b}.old`, { type: 'num', hint: 'سيبيه ٠ لو مفيش خصم' })}</div>`
      + fld('شارة على الصورة (اختياري)', `${b}.tag`, { ph: 'جديد / -30% / الأكثر طلباً' })
      + fld('الوصف', `${b}.desc`, { type: 'area', rows: 3 })
      + fld('المقاسات (افصلي بينهم بفاصلة)', `${b}.sizes`, { type: 'csv', dir: 'ltr', ph: 'S, M, L, XL' }))}
    ${group('الألوان', p.colors.map((c, j) => `<div class="flex items-center gap-2">
        <input type="color" value="${hex(c.hex)}" data-path="${b}.colors.${j}.hex" data-type="text" class="w-11 h-11 rounded-xl bg-transparent border border-line cursor-pointer shrink-0" aria-label="اللون">
        <input type="text" value="${esc(c.name)}" data-path="${b}.colors.${j}.name" data-type="text" class="inp" placeholder="اسم اللون">
        <button data-act="ed-color-del" data-j="${j}" class="p-2 text-muted hover:text-fg" aria-label="حذف اللون"><i data-lucide="x" class="w-4 h-4"></i></button></div>`).join('')
      + `<button data-act="ed-color-add" class="btn-ghost w-full rounded-full py-2.5 text-sm inline-flex items-center justify-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> لون جديد</button>`)}
    ${!src(p.images?.[0]) ? group('الرسمة البديلة', `<label class="fld"><span>لحد ما ترفعي صورة، تظهر رسمة لـ</span><select data-path="${b}.type" data-type="text" class="inp">${Object.entries(SHAPE_NAMES).map(([k, n]) => `<option value="${k}" ${k === p.type ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`) : ''}
    <button data-act="ed-prod-del" class="w-full rounded-full py-2.5 text-sm border ${confirmDel === 'p' ? 'border-[var(--danger)] text-[var(--danger)] font-bold' : 'border-line text-muted'} hover:text-fg">${confirmDel === 'p' ? 'متأكدة؟ دوسي تاني لحذف المنتج' : 'حذف المنتج'}</button>`;
  }
  return `<button data-act="ed-prod-add" class="btn-gold w-full rounded-full py-3 font-bold inline-flex items-center justify-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> منتج جديد</button>
    <div class="space-y-2">${S.products.map((p, i) => `<div class="flex items-center gap-3 glass rounded-2xl p-2">
      <div class="thumb !w-12 !h-14" style="background:${artBg(pColor(p, 0).hex)}">${src(p.images?.[0]) ? `<img src="${src(p.images[0])}" alt="">` : garment(p.type, pColor(p, 0).hex)}</div>
      <button data-act="ed-prod" data-i="${i}" class="flex-1 min-w-0 text-right"><p class="font-bold text-sm truncate">${esc(p.name)}</p><p class="text-xs text-muted num">${fmt(p.price)} · ${esc(catOf(p.cat)?.name || '')}</p></button>
      <div class="flex flex-col"><button data-act="ed-move" data-i="${i}" data-d="-1" class="p-1 text-muted hover:text-fg" aria-label="لفوق" ${i === 0 ? 'disabled' : ''}><i data-lucide="chevron-up" class="w-4 h-4"></i></button>
        <button data-act="ed-move" data-i="${i}" data-d="1" class="p-1 text-muted hover:text-fg" aria-label="لتحت" ${i === S.products.length - 1 ? 'disabled' : ''}><i data-lucide="chevron-down" class="w-4 h-4"></i></button></div>
      <button data-act="ed-prod" data-i="${i}" class="p-2 text-gold" aria-label="تعديل"><i data-lucide="pencil" class="w-4 h-4"></i></button></div>`).join('')}</div>`;
}

function renderEditor(keepScroll) {
  const sc = $('edScroll')?.scrollTop || 0;
  const size = buildData().length;
  ed.innerHTML = `
    <div class="flex items-center justify-between gap-2 px-5 h-16 border-b border-line shrink-0">
      <div class="min-w-0"><p class="font-display font-bold">تعديل المتجر</p><p id="edState" class="text-xs ${dirty() ? 'text-gold' : 'text-muted'}">${dirty() ? 'فيه تعديلات لسه ما اتحفظتش' : 'مفيش تعديلات جديدة'}</p></div>
      <div class="flex items-center gap-1">
        <button data-act="ed-min" class="p-2 rounded-full hover:bg-white/5 lg:hidden" aria-label="معاينة"><i data-lucide="${ed.classList.contains('min') ? 'chevron-up' : 'eye'}" class="w-5 h-5"></i></button>
        <button data-act="ed-close" class="p-2 rounded-full hover:bg-white/5" aria-label="قفل لوحة التعديل"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
    </div>
    <div class="flex gap-1 px-4 py-3 border-b border-line shrink-0">
      ${[['brand', 'البراند'], ['front', 'الواجهة'], ['products', `المنتجات (${S.products.length.toLocaleString('ar-EG')})`]].map(([k, n]) => `<button data-act="ed-tab" data-tab="${k}" class="tab ${tab === k ? 'on' : ''}">${n}</button>`).join('')}
    </div>
    <div id="edScroll" class="flex-1 overflow-y-auto px-5 py-5 space-y-8">${editorBody()}</div>
    <div class="px-5 py-4 border-t border-line space-y-2 shrink-0">
      <p id="edMsg" class="text-xs text-muted min-h-[1em]"></p>
      <div class="flex gap-2">
        <button data-act="ed-save" class="btn-gold flex-1 rounded-full py-3 font-bold inline-flex items-center justify-center gap-2"><i data-lucide="download" class="w-4 h-4"></i> حفظ (تنزيل data.js)</button>
        <button data-act="ed-revert" class="btn-ghost rounded-full px-4 text-sm" ${dirty() ? '' : 'disabled'}>إلغاء التعديلات</button>
      </div>
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="num">حجم البيانات: ${(size / 1048576).toFixed(1)} ميجا</span>
        <span>بعد التنزيل حطّي الملف في فولدر js</span>
      </div>
    </div>`;
  if (keepScroll) $('edScroll').scrollTop = sc;
  icons();
}

let rt;
function liveUpdate() {
  clearTimeout(rt);
  rt = setTimeout(() => { render(); const st = $('edState'); if (st) { st.textContent = dirty() ? 'فيه تعديلات لسه ما اتحفظتش' : 'مفيش تعديلات جديدة'; st.className = `text-xs ${dirty() ? 'text-gold' : 'text-muted'}`; }
    const rv = ed.querySelector('[data-act="ed-revert"]'); if (rv) rv.disabled = !dirty(); }, 180);
}

function openEditor(t, i) {
  editing = true; document.body.classList.add('editing');
  if (t) tab = t; if (i !== undefined) pIdx = i;
  ed.classList.add('open'); ed.classList.remove('min');
  $('editLaunch').hidden = true;
  renderEditor(); renderGrid();
}
function closeEditor() {
  editing = false; document.body.classList.remove('editing');
  ed.classList.remove('open', 'min'); $('editLaunch').hidden = false; renderGrid();
}
const msg = (t, gold) => { const m = $('edMsg'); if (m) { m.textContent = t; m.className = `text-xs min-h-[1em] ${gold ? 'text-gold' : 'text-muted'}`; } };

async function editorAction(a, t) {
  const i = +t.dataset.i, j = +t.dataset.j;
  if (a !== 'ed-cat-del' && a !== 'ed-prod-del') confirmDel = null;
  switch (a) {
    case 'ed-open': openEditor(); return;
    case 'ed-close': closeEditor(); return;
    case 'ed-min': ed.classList.toggle('min'); renderEditor(true); return;
    case 'ed-tab': tab = t.dataset.tab; pIdx = -1; break;
    case 'ed-prod': pIdx = i; break;
    case 'ed-back': pIdx = -1; break;
    case 'ed-clear': setP(t.dataset.path, ''); break;
    case 'ed-cat-add': { const n = S.categories.length + 1; S.categories.push({ id: 'cat' + Date.now().toString(36), name: 'قسم ' + n.toLocaleString('ar-EG'), latin: '', image: '', art: 'tee', color: '#5B6B7A' }); break; }
    case 'ed-cat-del':
      if (confirmDel !== 'cat' + i) { confirmDel = 'cat' + i; break; }
      { const gone = S.categories.splice(i, 1)[0]; S.products.forEach(p => { if (p.cat === gone.id) p.cat = S.categories[0].id; }); if (filter === gone.id) filter = 'all'; confirmDel = null; } break;
    case 'ed-prod-add': {
      const id = Math.max(0, ...S.products.map(p => p.id)) + 1;
      S.products.unshift({ id, name: 'منتج جديد', cat: S.categories[0].id, type: 'tee', price: 0, old: 0, tag: 'جديد', images: [], colors: [{ hex: '#1C1C1C', name: 'أسود' }], sizes: ['S', 'M', 'L', 'XL'], desc: '' });
      pIdx = 0; filter = 'all'; break;
    }
    case 'ed-prod-del':
      if (confirmDel !== 'p') { confirmDel = 'p'; break; }
      S.products.splice(pIdx, 1); pIdx = -1; confirmDel = null; break;
    case 'ed-move': { const k = i + (+t.dataset.d); if (k < 0 || k >= S.products.length) return; [S.products[i], S.products[k]] = [S.products[k], S.products[i]]; break; }
    case 'ed-color-add': S.products[pIdx].colors.push({ hex: '#C9B79C', name: '' }); break;
    case 'ed-color-del': S.products[pIdx].colors.splice(j, 1); break;
    case 'ed-img-del': S.products[pIdx].images.splice(j, 1); break;
    case 'ed-img-first': { const im = S.products[pIdx].images.splice(j, 1)[0]; S.products[pIdx].images.unshift(im); break; }
    case 'ed-revert': S = JSON.parse(SAVED_JSON); pIdx = -1; confirmDel = null; filter = 'all'; break;
    case 'ed-save': return save();
  }
  const keep = ['ed-clear', 'ed-cat-add', 'ed-cat-del', 'ed-color-add', 'ed-color-del', 'ed-img-del', 'ed-img-first', 'ed-move', 'ed-prod-del'].includes(a) && a !== 'ed-prod-del';
  renderEditor(keep); liveUpdate();
}

ed.addEventListener('input', e => {
  const el = e.target, path = el.dataset.path; if (!path) return;
  const type = el.dataset.type; let v = el.value;
  if (type === 'num') v = Math.max(0, +v || 0);
  else if (type === 'lines') v = v.split('\n').map(s => s.trim()).filter(Boolean);
  else if (type === 'csv') v = v.split(/[,،]/).map(s => s.trim()).filter(Boolean);
  setP(path, v);
  liveUpdate();
});
ed.addEventListener('change', async e => {
  const el = e.target;
  if (el.tagName === 'SELECT') { renderEditor(true); return; }
  const one = el.dataset.upload, many = el.dataset.uploadMulti;
  if (!one && !many) return;
  const files = [...el.files].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  msg('بنجهّز الصور…', true);
  try {
    const out = [];
    for (const f of files) out.push(await shrink(f, one && /logo/.test(one) ? 600 : 1100));
    if (one) setP(one, out[0]); else getP(many).push(...out);
    renderEditor(true); liveUpdate();
    msg(`اتضافت ${out.length.toLocaleString('ar-EG')} صورة. متنسيش تدوسي حفظ.`, true);
  } catch { msg('الصورة دي ما اتقريتش. جرّبي صورة JPG أو PNG تانية.'); }
});

function shrink(file, max) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
      const im = new Image();
      im.onerror = rej;
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        const g = c.getContext('2d');
        let out = '';
        g.drawImage(im, 0, 0, c.width, c.height);
        try { out = c.toDataURL('image/webp', .82); } catch {}
        if (!out.startsWith('data:image/webp')) { g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height); out = c.toDataURL('image/jpeg', .84); }
        res(out);
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

function save() {
  try {
    const blob = new Blob([buildData()], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'data.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    msg('اتنزل data.js. حطّيه مكان الملف القديم في فولدر js، وارفعي الفولدر كله على Netlify.', true);
  } catch { msg('التنزيل ما اشتغلش من المتصفح ده. جرّبي Chrome.'); }
}

if (window.STORE_ADMIN) {
  $('editLaunch').hidden = false; icons(); openEditor();
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
}
})();
