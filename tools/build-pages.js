// Generates the Work, Case study, Services and Contact pages from data/projects.json and data/content.json.
// usage: node tools/build-pages.js   (run from the repo root). index.html is hand written and left alone.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const content = JSON.parse(fs.readFileSync(path.join(root, 'data', 'content.json'), 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(root, 'data', 'projects.json'), 'utf8'));
const list = Array.isArray(P) ? P : (P.projects || Object.values(P));
const order = content.order || list.map(p => p.slug);
const projects = order.map(s => list.find(p => p.slug === s)).filter(Boolean).concat(list.filter(p => !order.includes(p.slug)));
const site = content.site;
const WA = (text) => `https://wa.me/${site.wa}?text=${encodeURIComponent(text)}`;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (dir, name) => fs.existsSync(path.join(root, 'assets', 'img', dir, name));
const mainStack = p => { const s = p.stack || []; const pick = []; for (const k of ['WooCommerce', 'Custom Post Types', 'Custom PHP Plugin', 'Advanced Custom Fields', 'Leaflet', 'Elementor Pro']) if (s.includes(k) && pick.length < 2) pick.push(k.replace('Advanced Custom Fields', 'ACF').replace('Custom Post Types', 'CPT').replace('Custom PHP Plugin', 'Custom PHP')); return pick.length ? pick.join(' · ') : 'WordPress'; };
const domain = u => (u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const head = (title, desc, url, extra = '') => `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://adeeliqbalanjum.github.io${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://adeeliqbalanjum.github.io${url}">
<meta property="og:image" content="https://adeeliqbalanjum.github.io/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/pages.css">
<script>document.documentElement.classList.remove('no-js')</script>${extra}
</head>
<body>
`;
const nav = (active) => `
<header class="nav" id="nav">
  <a class="pill brand" href="/">Muhammad Adeel</a>
  <nav class="links" aria-label="Sections"><a href="/work/"${active === 'Work' ? ' class="on"' : ''}>Work</a><a href="/services/"${active === 'Services' ? ' class="on"' : ''}>Services</a><a href="/#process">Process</a><a href="/#about">About</a><a href="/#faq">FAQ</a></nav>
  <a class="pill dark book" href="/contact/">Book a call <span class="arrow">→</span></a>
  <button class="pill menu" id="menu" aria-expanded="false" aria-controls="nav">Menu</button>
</header>
<main id="top">
`;
const footer = (o = {}) => `
<section class="footer" id="contact">
  <div class="wrap">
    <div class="darkblock${o.compact ? ' compact' : ''}">
      <div class="sweep" id="sweep"></div>${o.compact ? '' : `
      <div class="eyebrow serif">${esc(o.eyebrow || 'Taking new projects')}</div>
      <h2>${o.title || "Let's build <span>it properly.</span>"}</h2>
      <p class="sub">${esc(o.sub || 'Send the URL, the problem, or the brief. You get an honest answer and a fixed quote within a day.')}</p>
      <a class="pill ghost lg magnetic" href="${o.href || WA('Hi Adeel, I would like to book an intro call.')}"${o.href ? '' : ' target="_blank" rel="noopener"'}>${esc(o.cta || 'Book a free intro call')} <span class="arrow">→</span></a>`}
      <div class="bottom">
        <span>© Muhammad Adeel Iqbal, 2026 · Lahore, Pakistan · <a href="mailto:${site.email}" style="color:#B5B5B0;text-decoration:none">${site.email}</a></span>
        <div class="socials">
          <a href="${site.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">in</a>
          <a href="https://www.upwork.com/freelancers/~015c368d6586ba4860" target="_blank" rel="noopener" aria-label="Upwork">Up</a>
          <a href="https://www.fiverr.com/sitesculpt0r" target="_blank" rel="noopener" aria-label="Fiverr">Fi</a>
          <a href="https://wa.me/${site.wa}" target="_blank" rel="noopener" aria-label="WhatsApp">Wa</a>
        </div>
      </div>
    </div>
  </div>
</section>
</main>
<script src="/assets/vendor/gsap.min.js"></script>
<script src="/assets/vendor/ScrollTrigger.min.js"></script>
<script src="/assets/vendor/lenis.min.js"></script>
<script src="/assets/site.js"></script>
<script src="/assets/pages.js"></script>
</body>
</html>
`;
const tag = t => `<span>${esc(t)}</span>`;
const write = (rel, html) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); console.log(rel, html.length); };

/* ---------------- WORK ---------------- */
{
  const counts = {}; for (const p of projects) counts[p.industry] = (counts[p.industry] || 0) + 1;
  const inds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  let h = head('Work | Muhammad Adeel Iqbal, WordPress developer', `${projects.length} WordPress and WooCommerce sites built for real businesses, each handed over with documentation.`, '/work/');
  h += nav('Work');
  h += `
<section class="pagehead">
  <div class="wrap head">
    <div class="eyebrow serif">Selected work</div>
    <h1 class="two">${projects.length} sites, <span>built to be run by their teams.</span></h1>
    <p class="sub">Every project here was built in WordPress for a real business and handed over with documentation. Filter by what the business does.</p>
  </div>
</section>
<section class="filters">
  <div class="wrap"><div class="filter-row" id="filters" role="tablist">
    <button class="pill sm on" data-f="all" role="tab" aria-selected="true">All ${projects.length}</button>
    ${inds.map(i => `<button class="pill sm" data-f="${esc(i)}" role="tab" aria-selected="false">${esc(i)} ${counts[i]}</button>`).join('\n    ')}
  </div></div>
</section>
<section class="workgrid">
  <div class="wrap">
    <div class="grid3" id="grid">
${projects.map(p => `      <a class="wcard reveal" data-ind="${esc(p.industry)}" href="/work/${p.slug}/"><div class="stage"><div class="shot"><img src="/assets/img/work/${p.slug}.jpg" alt="${esc(p.name)}" loading="lazy" width="612" height="426"></div></div><div class="meta"><b>${esc(p.name)}</b><div class="tags">${tag(p.industry + (p.location ? ', ' + p.location : ''))}${tag(mainStack(p))}</div></div></a>`).join('\n')}
    </div>
    <p class="empty" id="empty" hidden>Nothing in that category yet.</p>
    <div class="ctastrip reveal">
      <div><h3>Have a site like these that needs work?</h3><p>Send the URL. You get an honest first look for free and a fixed quote within a day.</p></div>
      <a class="pill dark md magnetic" href="${WA('Hi Adeel, here is my site URL: ')}" target="_blank" rel="noopener">Send the URL <span class="arrow">→</span></a>
    </div>
  </div>
</section>
`;
  h += footer();
  write('work/index.html', h);
}

/* ---------------- CASE STUDIES ---------------- */
projects.forEach((p, idx) => {
  const o = content.overrides[p.slug] || {};
  const h1 = o.h1 || p.tagline || p.name;
  const line = content.lines[p.slug] || '';
  const hasPhone = img('case', `${p.slug}-phone.jpg`);
  const next = [projects[(idx + 1) % projects.length], projects[(idx + 2) % projects.length]];
  const twoTone = s => { const i = s.indexOf(' that '); if (i > 0) return `${esc(s.slice(0, i + 1))}<span>${esc(s.slice(i + 1))}</span>`; const w = s.split(' '); if (w.length > 5) return `${esc(w.slice(0, Math.ceil(w.length / 2)).join(' '))} <span>${esc(w.slice(Math.ceil(w.length / 2)).join(' '))}</span>`; return esc(s); };
  let h = head(`${p.name} case study | Muhammad Adeel Iqbal`, `${p.name}: ${line || p.tagline}`, `/work/${p.slug}/`);
  h += nav('Work');
  h += `
<article class="case">
<section class="pagehead">
  <div class="wrap head">
    <div class="eyebrow serif">Case study · ${esc(p.industry)}${p.location ? ', ' + esc(p.location) : ''}</div>
    <h1 class="two">${twoTone(h1)}</h1>
    <div class="metarow">
      ${p.url ? `<a class="pill sm dark" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(domain(p.url))} ↗</a>` : ''}
      <div class="tags">${p.year ? tag(p.year) : ''}${(p.stack || []).slice(0, 4).map(tag).join('')}</div>
    </div>
  </div>
</section>
<section class="casehero">
  <div class="wrap"><div class="stage big reveal"><div class="shot"><img src="/assets/img/case/${p.slug}-hero.jpg" alt="${esc(p.name)} website" width="1400" height="784"></div></div></div>
</section>
<section class="facts">
  <div class="wrap">
    <div class="factrow">
      <div><small>Industry</small><b>${esc(p.industry)}</b></div>
      <div><small>Location</small><b>${esc(p.location || 'Remote')}</b></div>
      <div><small>Year</small><b>${esc(p.year || '')}</b></div>
      <div><small>Stack</small><b>${esc((p.stack || []).join(', '))}</b></div>
    </div>
  </div>
</section>
<section class="problem">
  <div class="wrap cols2">
    <div><div class="eyebrow serif left">The problem</div><h2 class="left">${esc(line || 'What the business needed.')}</h2></div>
    <p class="lede">${esc(p.challenge || '')}</p>
  </div>
</section>
<section class="built">
  <div class="wrap">
    <div class="head"><div class="eyebrow serif">What I built</div><h2 class="two">${esc(p.name)} <span>in ${(p.solution || []).length} parts.</span></h2></div>
    <ol class="builtlist">
${(p.solution || []).map((s, i) => `      <li class="reveal"><i>${String(i + 1).padStart(2, '0')}</i><span>${esc(s)}</span></li>`).join('\n')}
    </ol>
  </div>
</section>
${o.flow ? `<section class="flow">
  <div class="wrap">
    <div class="head"><div class="eyebrow serif">Content as data</div><h2>One record. Every page reads from it.</h2></div>
    <div class="flowrow">
      <div class="flowcard reveal"><small>01 Record</small><h3>Vehicle post type with ACF fields</h3><p>Body type, fuel, cab, upfit, government price and business price. The team fills in a form, nothing else.</p><div class="tags">${['Body type', 'Fuel', 'Cab', 'Upfit', 'Gov price', 'Business price'].map(tag).join('')}</div></div>
      <div class="flowarrow" aria-hidden="true">→</div>
      <div class="flowcard reveal"><small>02 Templates</small><h3>Card, grid and detail templates</h3><p>Built once in Elementor Pro and the companion plugin. Every new unit gets the same layout automatically.</p><div class="tags">${['Vehicle card', 'Category grid', 'Detail page'].map(tag).join('')}</div></div>
      <div class="flowarrow" aria-hidden="true">→</div>
      <div class="flowcard reveal"><small>03 Pages</small><h3>Grid, filters, detail, quote</h3><p>Buyers filter by body type and fuel. The quote form arrives with the vehicle already filled in.</p><div class="tags">${['Filters', 'Hero slider', 'Quote form'].map(tag).join('')}</div></div>
    </div>
  </div>
</section>
` : ''}<section class="result">
  <div class="wrap">
    <div class="darkcard reveal">
      <div class="sweep"></div>
      <div class="eyebrow serif">${o.result ? 'The result' : 'In short'}</div>
      <p class="big">${esc(o.result || p.body || '')}</p>
      <small>${p.url ? 'Live at ' + esc(domain(p.url)) + ' · ' : ''}built ${esc(p.year || '')}${p.location ? ' · ' + esc(p.location) : ''}</small>
    </div>
  </div>
</section>
<section class="gallery">
  <div class="wrap cols2 gal">
    <figure class="reveal"><div class="stage"><div class="shot"><img src="/assets/img/case/${p.slug}-desktop.jpg" alt="${esc(p.name)} on desktop" loading="lazy" width="944" height="656"></div></div><figcaption>${esc(p.name)} on desktop</figcaption></figure>
    ${hasPhone ? `<figure class="reveal"><div class="stage"><div class="shot phone"><img src="/assets/img/case/${p.slug}-phone.jpg" alt="${esc(p.name)} on a phone" loading="lazy" width="372" height="660"></div></div><figcaption>${esc(p.name)} on a phone</figcaption></figure>` : `<figure class="reveal"><div class="stage"><div class="shot"><img src="/assets/img/case/${p.slug}-hero.jpg" alt="${esc(p.name)} inner page" loading="lazy" width="1400" height="784"></div></div><figcaption>${esc(p.name)}, inner page</figcaption></figure>`}
  </div>
</section>
<section class="next">
  <div class="wrap">
    <div class="eyebrow serif">Next case study</div>
    <div class="cols2 gal">
${next.map(n => `      <a class="case reveal" href="/work/${n.slug}/"><div class="stage"><div class="shot"><img src="/assets/img/work/${n.slug}.jpg" alt="${esc(n.name)}" loading="lazy" width="612" height="426"></div></div><div class="meta"><b>${esc(n.name)}</b><div class="tags">${tag(n.industry + (n.location ? ', ' + n.location : ''))}${tag(mainStack(n))}</div></div></a>`).join('\n')}
    </div>
    <div class="center" style="margin-top:40px"><a class="pill md" href="/work/">All ${projects.length} projects <span class="arrow">→</span></a></div>
  </div>
</section>
</article>
`;
  h += footer({ title: 'Need a site <span>that runs itself?</span>', sub: 'Inventories, directories, bookings, stores. Send the brief and you get a fixed quote within a day.' });
  write(`work/${p.slug}/index.html`, h);
});

/* ---------------- SERVICES ---------------- */
{
  const S = content.services;
  const items = s => (s.causes || s.incl || []).slice(0, 6).map(x => ({ t: x[1], d: x[2] }));
  const imgs = { Fix: 'fix', Build: 'build', Partner: 'partner' };
  let h = head('Services | Muhammad Adeel Iqbal, WordPress developer', 'Fix what is broken, build what your team can run, or add capacity to your agency under your brand. Fixed quote first, every time.', '/services/');
  h += nav('Services');
  h += `
<section class="pagehead">
  <div class="wrap head">
    <div class="eyebrow serif">Services</div>
    <h1 class="two">Three ways <span>I can help.</span></h1>
    <p class="sub">Fix what is broken, build what your team can run, or add capacity to your agency under your brand. Fixed quote first, every time.</p>
    <div class="filter-row jump">${S.map((s, i) => `<a class="pill sm${i === 0 ? ' on' : ''}" href="#${s.nav.toLowerCase()}">${esc(s.nav)}</a>`).join('')}</div>
  </div>
</section>
${S.map((s, i) => `<section class="service" id="${s.nav.toLowerCase()}">
  <div class="wrap">
    <div class="svctop${i % 2 ? ' flip' : ''}">
      <div class="svctext reveal">
        <span class="pill sm dark label">${String(i + 1).padStart(2, '0')}&nbsp;&nbsp;${esc(s.nav)}</span>
        <h2 class="left">${esc(s.h1)}</h2>
        <p class="lede">${esc(s.lede)}</p>
        <div class="tags dots">${(s.reassure || []).map(r => `<span><i></i>${esc(r)}</span>`).join('')}</div>
        <a class="pill dark md magnetic" href="${WA(s.wa || 'Hi Adeel, ')}" target="_blank" rel="noopener">${esc(s.cta)} <span class="arrow">→</span></a>
      </div>
      <div class="stage reveal"><div class="shot"><img src="/assets/img/svc/${imgs[s.nav] || 'fix'}.jpg" alt="" loading="lazy" width="912" height="632"></div></div>
    </div>
    <div class="grid3 items">
${items(s).map(it => `      <div class="item reveal"><i></i><h3>${esc(it.t)}</h3><p>${esc(it.d)}</p></div>`).join('\n')}
    </div>
  </div>
</section>
${i < S.length - 1 ? '<div class="wrap"><hr class="sep"></div>' : ''}`).join('\n')}
<section class="pricing">
  <div class="wrap">
    <div class="head"><div class="eyebrow serif">Pricing</div><h2 class="two">Fixed quotes. <span>The first look is free.</span></h2></div>
    <div class="grid3 prices">
      <div class="price reveal"><small>FIX</small><b>$45 to $140</b><p>Most single fixes. The price depends on how deep the cause goes.</p><hr><ul><li>Backup before anything changes</li><li>Tested afterwards, with a real order where it applies</li><li>A note on what was wrong and what changed</li></ul><a class="pill dark" href="${WA(S[0].wa || 'Hi Adeel, something on my site is broken. My site: ')}" target="_blank" rel="noopener">Tell me what is broken <span class="arrow">→</span></a></div>
      <div class="price dark reveal"><small>BUILD</small><b>From $300</b><p>Business sites in Elementor Pro. Stores, booking flows and custom features add to it.</p><hr><ul><li>A staging build you review</li><li>Checked on phone, tablet and desktop</li><li>Handover included, your team can edit it</li></ul><a class="pill ghost" href="${WA(S[1].wa || 'Hi Adeel, I need a website built. ')}" target="_blank" rel="noopener">Start a build <span class="arrow">→</span></a></div>
      <div class="price reveal"><small>PARTNER</small><b>Per project</b><p>Agency overflow under your brand. Steady volume gets an arrangement that fits.</p><hr><ul><li>Inside your tools and process</li><li>Invisible to your client</li><li>Happy to sign your NDA</li></ul><a class="pill dark" href="${WA(S[2].wa || 'Hi Adeel, we are an agency looking for WordPress capacity. ')}" target="_blank" rel="noopener">Talk capacity <span class="arrow">→</span></a></div>
    </div>
  </div>
</section>
<section class="faq">
  <div class="wrap">
    <div class="head"><div class="eyebrow serif">FAQ</div><h2>Before you ask.</h2></div>
    <div class="acc wide" id="acc">
${S.flatMap(s => (s.faq || []).slice(0, 2)).map(([q, a]) => `      <div class="item"><button type="button" aria-expanded="false">${esc(q)} <i>+</i></button><div class="panel"><p>${esc(a)}</p></div></div>`).join('\n')}
    </div>
  </div>
</section>
`;
  h += footer({ title: "Tell me what's broken, <span>or what to build.</span>" });
  write('services/index.html', h);
}

/* ---------------- CONTACT ---------------- */
{
  let h = head('Contact | Muhammad Adeel Iqbal, WordPress developer', 'Send the URL, the problem, or the brief. You get an honest answer and a fixed quote within a day.', '/contact/');
  h += nav('');
  h += `
<section class="contactpage">
  <div class="wrap cols2 contact">
    <div class="ctext">
      <div class="eyebrow serif left">Contact</div>
      <h1 class="two left">Send the URL, <span>the problem, or the brief.</span></h1>
      <p class="lede">You get an honest answer and a fixed quote within a day. If I am not the right fit, I say so and point you to who is.</p>
      <span class="pill sm status"><span class="dot"></span> Taking new projects · replies within a day</span>
      <div class="channels">
        <a href="https://wa.me/${site.wa}" target="_blank" rel="noopener"><span><small>WhatsApp · Fastest</small><b>${esc(site.phone)}</b></span><i>→</i></a>
        <a href="mailto:${site.email}"><span><small>Email</small><b>${esc(site.email)}</b></span><i>→</i></a>
        <a href="${site.linkedin}" target="_blank" rel="noopener"><span><small>LinkedIn</small><b>/in/adeelatwork</b></span><i>→</i></a>
      </div>
      <div class="include"><small>Helpful to include</small><ul><li>The site URL</li><li>What changed before it broke, or the design file for a build</li><li>Screenshots or a short screen recording</li></ul></div>
    </div>
    <form class="formcard reveal" id="cform" novalidate>
      <h2 class="left">Tell me about it</h2>
      <label><span>Name</span><input type="text" name="name" placeholder="Your name" required></label>
      <div class="two"><label><span>Email</span><input type="email" name="email" placeholder="you@company.com" required></label><label><span>Website</span><input type="url" name="site" placeholder="https://"></label></div>
      <label><span>What is happening?</span><textarea name="message" rows="4" placeholder="Checkout stopped working after a plugin update on Friday. Customers see a blank page after they press Place order…" required></textarea></label>
      <fieldset><legend>Budget, if you have one in mind</legend><div class="filter-row"><label class="pill sm"><input type="radio" name="budget" value="Under $150">Under $150</label><label class="pill sm"><input type="radio" name="budget" value="$150 to $500">$150 to $500</label><label class="pill sm"><input type="radio" name="budget" value="$500 to $2,000">$500 to $2,000</label><label class="pill sm on"><input type="radio" name="budget" value="Not sure yet" checked>Not sure yet</label></div></fieldset>
      <button type="submit" class="pill dark md send">Send it <span class="arrow">→</span></button>
      <p class="note">No account, no newsletter. Sending opens WhatsApp with your message ready to go; use the email link if you prefer. You hear back within a day, usually sooner.</p>
      <div class="thanks" hidden><b>Opened in WhatsApp.</b> If nothing opened, email me at <a href="mailto:${site.email}">${site.email}</a>.</div>
    </form>
  </div>
</section>
<section class="steps">
  <div class="wrap">
    <div class="eyebrow serif">How it goes</div>
    <div class="grid3 stepcards">
      <div class="step reveal"><b>1</b><h3>Within a day</h3><p>I read the site or the brief and reply with what I think is going on.</p></div>
      <div class="step reveal"><b>2</b><h3>Free first look</h3><p>For fixes, I find the likely cause before you pay anything. For builds, a page list and a plan.</p></div>
      <div class="step reveal"><b>3</b><h3>Fixed quote</h3><p>Scope, price and date in writing. If it turns out bigger than it looked, I stop and tell you.</p></div>
    </div>
  </div>
</section>
`;
  h += footer({ compact: true });
  write('contact/index.html', h);
}
console.log('done:', projects.length, 'case pages');
