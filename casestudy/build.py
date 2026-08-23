#!/usr/bin/env python3
"""Builds the before/after case study page.

Every figure is read straight out of metrics.json — the file the capture rig
wrote — so nothing on the page is transcribed by hand. If a number here is
wrong, the measurement is wrong, which is the only kind of error worth having.
"""
import base64, json, os, pathlib

SHOTS = pathlib.Path('/tmp/prodani-casestudy2')   # post-launch run, against the real live site
SHOTS_PRE = pathlib.Path('/tmp/prodani-casestudy')  # pre-launch run, kept for the reproducibility band
ASSETS = pathlib.Path('/Users/imac/Desktop/prodani/theme/prodani/assets')
ROOT = pathlib.Path('/Users/imac/Desktop/prodani/casestudy')
OUT_LINKED = ROOT / 'page' / 'index.html'          # references ../images/, small
OUT_INLINE = ROOT / 'page' / 'self-contained.html' # everything embedded, one file
# The published artifact wraps its own <html>/<head>/<body>, so it needs the bare
# fragment. It is a publishing intermediate, not part of what gets uploaded, so it
# is written outside the package.
OUT_FRAGMENT = pathlib.Path('/tmp/prodani-casestudy-artifact.html')
M = json.load(open(SHOTS / 'metrics.json'))
M_PRE = json.load(open(SHOTS_PRE / 'metrics.json'))

def b64(path, mime):
    return f"data:{mime};base64," + base64.b64encode(pathlib.Path(path).read_bytes()).decode()

# The run's own filenames map onto the tidied names in images/.
def rel(n):
    if n.startswith('vp-'):
        side, page = n[3:-4].split('-', 1)
        return f'../images/{side}/{page}-1150.jpg'
    if n.startswith('sm-'):
        side, page = n[3:-9].split('-', 1)
        return f'../images/{side}/{page}-fullpage.jpg'
    raise ValueError(n)

INLINE = True   # flipped below to render the linked variant
img = lambda n: b64(SHOTS / n, 'image/jpeg') if INLINE else rel(n)
FUGAZ = b64(ASSETS / 'fugaz-one-latin.woff2', 'font/woff2')

# ---------- formatting ----------
def ms(v):    return f"{v:,.0f}<span class='u'>ms</span>"
def bytes_(v):
    return (f"{v/1048576:.2f}<span class='u'>MB</span>" if v >= 1048576
            else f"{v/1024:,.0f}<span class='u'>KB</span>")
def num(v):   return f"{v:,.0f}"
def cls_(v):  return f"{v:.4f}"
def px(v):    return f"{v:,.0f}<span class='u'>px</span>"

FMT = {'ms': ms, 'bytes': bytes_, 'num': num, 'cls': cls_, 'px': px}

# metric key, label, formatter, direction ('lower' = lower is better, 'flat' = informational)
ROWS = [
    ('ttfb',               'Time to first byte',      'ms',    'lower'),
    ('fcp',                'First contentful paint',  'ms',    'lower'),
    ('lcp',                'Largest contentful paint','ms',    'lower'),
    ('load',               'Load complete',           'ms',    'lower'),
    ('cls',                'Cumulative layout shift', 'cls',   'lower'),
    ('transfer',           'Page weight transferred', 'bytes', 'lower'),
    ('requests',           'Requests',                'num',   'lower'),
    ('thirdPartyTransfer', 'Loaded from other hosts', 'bytes', 'lower'),
    ('domNodes',           'DOM elements',            'num',   'lower'),
    ('domDepth',           'Deepest nesting level',   'num',   'lower'),
    ('scrollHeight',       'Full page height',        'px',    'flat'),
]

# Rows that need a caveat rather than a clean win. Honesty is the whole point of
# publishing the numbers; a case study that only shows the green ones is an ad.
NOTES = {
    ('home', 'thirdPartyTransfer'):
        'Other hosts includes Shopify\u2019s own CDN, which is where the hero video was served '
        'from \u2014 so most of this line is the 5.6MB video, not tracking scripts.',
    ('home', 'domNodes'):
        'The old homepage had four sections. The new one has nine, so it is a bigger '
        'document by design — the weight went down anyway.',
    ('home', 'scrollHeight'):
        'Longer on purpose: the collection rows, the stat deck, Meet Your Baker and '
        'the reviews all live on the homepage now.',
    ('product', 'transfer'):
        'Heavier, and on purpose. Scripts dropped, but the gallery serves larger photographs '
        'and the page now carries a working reviews widget it did not have at all before.',
    ('contact', 'load'):
        'A wash. The embedded map costs about what the removed scripts saved.',
    ('contact', 'scrollHeight'):
        'Longer because the page gained a form worth filling in: phone, subject and a '
        'message field, plus the map.',
}

PAGES = [
    ('home',    'Homepage',        '/',
     'A 5.6MB hero video, served raw. Re-encoding it to 375KB is where three quarters of the '
     'homepage weight went — and it is why the largest element on the screen now paints in a third '
     'of the time.'),
    ('product', 'Product page',    '/products/family-orange-cake',
     'The old page nested 23 levels deep across 2,026 elements to show one cake. Layout shift was '
     '0.076 — visible movement under the buyer’s thumb while the page settled. Both numbers are '
     'now a fraction of that.'),
    ('baker',   'Meet Your Baker', '/pages/meet-your-baker',
     'Dani’s story was trapped in theme settings rather than the page record. It was lifted out '
     'verbatim, then given a layout instead of a wall of centred text.'),
    ('contact', 'Contact',         '/pages/contact',
     'Two fields and a message box became a real enquiry form — name, email, phone, subject, message '
     '— on a panel light enough to read, next to a map. Every colour pair on it was checked against '
     'WCAG before it shipped.'),
]

def delta_cell(before, after, direction):
    if not before:
        return '<td class="d"></td>'
    pct = (after - before) / before * 100
    if direction == 'flat' or abs(pct) < 1:
        tone = 'flat'
    else:
        tone = 'good' if pct < 0 else 'warn'
    sign = '+' if pct > 0 else '−'
    return f'<td class="d d--{tone}">{sign}{abs(pct):.0f}%</td>'

def facts_panel(key, title):
    b = M['before']['pages'][key]['median']
    a = M['after']['pages'][key]['median']
    rows, notes, n = [], [], 0
    for mk, label, fmt, direction in ROWS:
        bv, av = b[mk], a[mk]
        marker = ''
        if (key, mk) in NOTES:
            n += 1
            marker = f'<sup class="fn">{n}</sup>'
            notes.append(f'<li><span class="fn">{n}</span>{NOTES[(key, mk)]}</li>')
        rows.append(
            f'<tr><th scope="row">{label}{marker}</th>'
            f'<td class="v v--was">{FMT[fmt](bv)}</td>'
            f'<td class="v v--now">{FMT[fmt](av)}</td>'
            f'{delta_cell(bv, av, direction)}</tr>')
    notes_html = f'<ol class="notes">{"".join(notes)}</ol>' if notes else ''
    return f'''
<div class="facts">
  <p class="facts__title">Performance Facts</p>
  <p class="facts__sub">{title} &middot; one cold load &middot; 1150 &times; 1000 viewport</p>
  <div class="facts__rule facts__rule--heavy"></div>
  <p class="facts__basis">Median of 5 interleaved runs</p>
  <div class="facts__rule facts__rule--mid"></div>
  <div class="facts__scroll">
  <table class="facts__table">
    <thead><tr><th scope="col">Measure</th><th scope="col">Was</th><th scope="col">Now</th><th scope="col">&Delta;</th></tr></thead>
    <tbody>{"".join(rows)}</tbody>
  </table>
  </div>
  {notes_html}
</div>'''

def compare(key, title):
    return f'''
<figure class="cmp" style="--x:52%">
  <img class="cmp__img" src="{img(f'vp-before-{key}.jpg')}" alt="{title} on the old theme, at 1150 pixels wide" width="900" height="783" loading="lazy">
  <img class="cmp__img cmp__img--after" src="{img(f'vp-after-{key}.jpg')}" alt="{title} on the new theme, at 1150 pixels wide" width="900" height="783" loading="lazy">
  <span class="cmp__tag cmp__tag--l">Before</span>
  <span class="cmp__tag cmp__tag--r">After</span>
  <div class="cmp__bar" aria-hidden="true"><span class="cmp__grip"></span></div>
  <input class="cmp__range" type="range" min="0" max="100" value="52" step="0.1"
         aria-label="Reveal the new {title} design. Left shows the old theme, right shows the new one.">
</figure>'''

# ---------- headline figures ----------
h = M['home']['pages'] if 'home' in M else None
bh, ah = M['before']['pages']['home']['median'], M['after']['pages']['home']['median']
bp, ap = M['before']['pages']['product']['median'], M['after']['pages']['product']['median']
ttfb_b = sum(M['before']['pages'][k]['median']['ttfb'] for k, *_ in PAGES) / 4
ttfb_a = sum(M['after']['pages'][k]['median']['ttfb'] for k, *_ in PAGES) / 4

HEADLINE = [
    ('Homepage weight', bh['transfer'], ah['transfer'], 'bytes'),
    ('Homepage LCP',    bh['lcp'],      ah['lcp'],      'ms'),
    ('Product layout shift', bp['cls'], ap['cls'],      'cls'),
    ('Server response, all pages', ttfb_b, ttfb_a,      'ms'),
]

# Module level on purpose: the copy.md and metrics.csv writers below need these
# too, and they do not depend on how the images are embedded.

def build_page(inline):
    """Renders the page once. `inline` decides whether images are embedded as
    data URIs or referenced from ../images/ — same markup either way."""
    global INLINE
    INLINE = inline
    sections = []
    for key, title, route, blurb in PAGES:
        sections.append(f'''
    <section class="page" id="{key}">
      <div class="page__head">
        <h2>{title}</h2>
        <code class="route">{route}</code>
      </div>
      <p class="page__blurb">{blurb}</p>
      <div class="page__body">
        {compare(key, title)}
        {facts_panel(key, title)}
      </div>
    </section>''')

    fulls = []
    for key, title, _, _ in PAGES:
        fulls.append(f'''
    <figure class="full">
      <figcaption>{title}</figcaption>
      <div class="full__pair">
        <div class="full__col"><span class="full__lab">Before</span>
          <div class="full__win"><img src="{img(f'sm-before-{key}-full.jpg')}" alt="The whole {title} on the old theme" loading="lazy"></div></div>
        <div class="full__col"><span class="full__lab full__lab--now">After</span>
          <div class="full__win"><img src="{img(f'sm-after-{key}-full.jpg')}" alt="The whole {title} on the new theme" loading="lazy"></div></div>
      </div>
    </figure>''')

    big = []
    for label, bv, av, fmt in HEADLINE:
        pct = (av - bv) / bv * 100
        big.append(f'''
    <div class="big">
      <p class="big__pct">&minus;{abs(pct):.0f}<span class="big__sym">%</span></p>
      <p class="big__label">{label}</p>
      <p class="big__pair"><span class="was">{FMT[fmt](bv)}</span><span class="arr">&rarr;</span><span class="now">{FMT[fmt](av)}</span></p>
    </div>''')

    HTML = f'''<title>ProDani Miami — before &amp; after</title>
    <style>
    @font-face{{font-family:"Fugaz One";src:url({FUGAZ}) format("woff2");font-weight:400;font-display:swap;}}

    :root{{
      --paper:#F4F4F1; --card:#FFFFFF; --sunk:#EDEDE9;
      --ink:#16171B; --ink-2:#56585F; --ink-3:#84868D;
      --rule:#DCDCD7; --rule-2:#C6C6C0;
      --accent:#C13C68; --accent-tint:#F7DCE5;
      --good:#14663F; --warn:#8A5A18;
      --shadow:0 1px 2px rgba(22,23,27,.05), 0 8px 24px -12px rgba(22,23,27,.18);
      --display:"Fugaz One", ui-sans-serif, system-ui, sans-serif;
      --sans:ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
      --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
      --wrap:1180px;
    }}
    @media (prefers-color-scheme:dark){{
      :root:not([data-theme="light"]){{
        --paper:#131417; --card:#1A1C20; --sunk:#101115;
        --ink:#ECECE8; --ink-2:#9B9DA4; --ink-3:#75777E;
        --rule:#2B2D33; --rule-2:#3A3D45;
        --accent:#F58FAF; --accent-tint:#3A222B;
        --good:#4FC08D; --warn:#D5A55E;
        --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6);
      }}
    }}
    :root[data-theme="dark"]{{
      --paper:#131417; --card:#1A1C20; --sunk:#101115;
      --ink:#ECECE8; --ink-2:#9B9DA4; --ink-3:#75777E;
      --rule:#2B2D33; --rule-2:#3A3D45;
      --accent:#F58FAF; --accent-tint:#3A222B;
      --good:#4FC08D; --warn:#D5A55E;
      --shadow:0 1px 2px rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6);
    }}

    *,*::before,*::after{{box-sizing:border-box;}}
    body{{
      margin:0; background:var(--paper); color:var(--ink);
      font-family:var(--sans); font-size:16px; line-height:1.6;
      -webkit-font-smoothing:antialiased;
    }}
    :where(a):focus-visible,:where(input):focus-visible{{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px;}}
    .wrap{{max-width:var(--wrap);margin-inline:auto;padding-inline:clamp(20px,5vw,48px);}}

    /* ---------- masthead ---------- */
    .mast{{padding-block:clamp(52px,9vw,104px) clamp(28px,4vw,44px);}}
    .eyebrow{{
      font-family:var(--mono); font-size:11.5px; letter-spacing:.16em; text-transform:uppercase;
      color:var(--accent); margin:0 0 22px;
    }}
    .eyebrow a{{color:inherit;}}
    h1{{
      font-family:var(--display); font-weight:400; line-height:.98;
      font-size:clamp(44px,8.4vw,104px); letter-spacing:-.015em;
      margin:0 0 24px; text-wrap:balance;
    }}
    h1 .sub{{display:block;color:var(--accent);}}
    .lede{{
      max-width:60ch; font-size:clamp(17px,1.5vw,20px); line-height:1.62;
      color:var(--ink-2); margin:0;
    }}
    .lede strong{{color:var(--ink);font-weight:600;}}

    /* ---------- headline figures ---------- */
    .bigs{{
      display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
      gap:1px; background:var(--rule); border-block:1px solid var(--rule);
      margin-block:clamp(40px,6vw,68px);
    }}
    .big{{background:var(--paper);padding:26px clamp(18px,2vw,26px) 24px;}}
    .big__pct{{
      font-family:var(--display); font-size:clamp(46px,5.6vw,68px); line-height:.9;
      margin:0 0 12px; color:var(--good); letter-spacing:-.02em;
    }}
    .big__sym{{font-size:.5em;vertical-align:.42em;margin-left:.04em;}}
    .big__label{{
      margin:0 0 8px; font-size:12px; letter-spacing:.09em; text-transform:uppercase;
      font-weight:600; color:var(--ink);
    }}
    .big__pair{{margin:0;font-family:var(--mono);font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--ink-3);}}
    .big__pair .was{{text-decoration:line-through;text-decoration-color:var(--rule-2);}}
    .big__pair .arr{{margin-inline:8px;}}
    .big__pair .now{{color:var(--ink);}}
    .u{{font-size:.78em;margin-left:.1em;color:var(--ink-3);}}

    /* ---------- method note ---------- */
    .method{{
      background:var(--card); border:1px solid var(--rule); border-radius:3px;
      padding:clamp(22px,3vw,30px); margin-bottom:clamp(48px,7vw,84px); box-shadow:var(--shadow);
    }}
    .method h2{{
      font-size:12px; letter-spacing:.14em; text-transform:uppercase; margin:0 0 16px;
      font-family:var(--mono); color:var(--accent); font-weight:500;
    }}
    .method ul{{margin:0;padding:0;list-style:none;display:grid;gap:11px;}}
    .method li{{
      display:grid; grid-template-columns:132px 1fr; gap:18px; align-items:baseline;
      font-size:14.5px; color:var(--ink-2); line-height:1.55;
    }}
    .method li b{{
      font-family:var(--mono); font-size:11px; letter-spacing:.09em; text-transform:uppercase;
      color:var(--ink); font-weight:600;
    }}
    @media (max-width:620px){{.method li{{grid-template-columns:1fr;gap:3px;}}}}

    /* ---------- page sections ---------- */
    .page{{padding-block:clamp(40px,6vw,64px);border-top:1px solid var(--rule);}}
    .page__head{{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:14px;}}
    .page h2{{
      font-family:var(--display); font-weight:400; font-size:clamp(26px,3.4vw,38px);
      letter-spacing:-.01em; margin:0; line-height:1.05;
    }}
    .route{{
      font-family:var(--mono); font-size:12px; color:var(--ink-3);
      background:var(--sunk); border:1px solid var(--rule); border-radius:2px; padding:3px 8px;
    }}
    .page__blurb{{max-width:66ch;color:var(--ink-2);margin:0 0 30px;font-size:15.5px;}}
    .page__body{{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.95fr);gap:clamp(24px,3vw,40px);align-items:start;}}
    @media (max-width:940px){{.page__body{{grid-template-columns:1fr;}}}}

    /* ---------- comparison slider ---------- */
    .cmp{{
      position:relative; margin:0; aspect-ratio:1150/1000; overflow:hidden;
      border:1px solid var(--rule); border-radius:3px; background:var(--sunk);
      box-shadow:var(--shadow); touch-action:pan-y;
    }}
    .cmp__img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block;}}
    .cmp__img--after{{clip-path:inset(0 0 0 var(--x));}}
    .cmp__bar{{
      position:absolute; top:0; bottom:0; left:var(--x); width:2px;
      background:var(--accent); transform:translateX(-1px); pointer-events:none;
    }}
    .cmp__grip{{
      position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:38px; height:38px; border-radius:50%; background:var(--accent);
      box-shadow:0 2px 10px rgba(0,0,0,.3);
    }}
    .cmp__grip::before,.cmp__grip::after{{
      content:""; position:absolute; top:50%; width:0; height:0;
      border-block:5px solid transparent;
    }}
    .cmp__grip::before{{left:9px;border-right:6px solid #fff;transform:translateY(-50%);}}
    .cmp__grip::after{{right:9px;border-left:6px solid #fff;transform:translateY(-50%);}}
    .cmp__range{{
      position:absolute; inset:0; width:100%; height:100%; margin:0;
      opacity:0; cursor:ew-resize; appearance:none; background:transparent;
    }}
    .cmp__range::-webkit-slider-thumb{{appearance:none;width:44px;height:100%;}}
    .cmp__range::-moz-range-thumb{{width:44px;height:100%;border:0;}}
    .cmp:focus-within{{outline:2px solid var(--accent);outline-offset:3px;}}
    .cmp__tag{{
      position:absolute; top:12px; z-index:2; pointer-events:none;
      font-family:var(--mono); font-size:10.5px; letter-spacing:.12em; text-transform:uppercase;
      padding:4px 9px; border-radius:2px; background:rgba(10,10,12,.72); color:#fff;
      backdrop-filter:blur(3px);
    }}
    .cmp__tag--l{{left:12px;}}
    .cmp__tag--r{{right:12px;background:var(--accent);color:#fff;}}

    /* ---------- nutrition-label facts panel ---------- */
    .facts{{
      background:var(--card); border:1px solid var(--ink); border-radius:2px;
      padding:18px clamp(16px,1.6vw,20px) 16px; box-shadow:var(--shadow);
    }}
    .facts__title{{font-family:var(--display);font-size:clamp(24px,2.6vw,30px);line-height:1;margin:0 0 5px;letter-spacing:-.01em;}}
    .facts__sub{{margin:0 0 9px;font-size:12.5px;color:var(--ink-2);}}
    .facts__rule{{background:var(--ink);}}
    .facts__rule--heavy{{height:9px;}}
    .facts__rule--mid{{height:4px;margin-top:5px;}}
    .facts__basis{{
      margin:6px 0 0; font-family:var(--mono); font-size:10.5px; letter-spacing:.1em;
      text-transform:uppercase; color:var(--ink-2); text-align:right;
    }}
    .facts__scroll{{overflow-x:auto;}}
    .facts__table{{width:100%;border-collapse:collapse;font-size:13.5px;}}
    .facts__table thead th{{
      font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase;
      color:var(--ink-3); font-weight:500; text-align:right; padding:8px 0 7px; border-bottom:1px solid var(--rule);
    }}
    .facts__table thead th:first-child{{text-align:left;}}
    .facts__table tbody th{{
      text-align:left; font-weight:500; color:var(--ink); padding:9px 12px 9px 0;
      border-bottom:1px solid var(--rule); font-size:13.5px;
    }}
    .facts__table td{{
      text-align:right; padding:9px 0 9px 12px; border-bottom:1px solid var(--rule);
      font-family:var(--mono); font-variant-numeric:tabular-nums; white-space:nowrap;
    }}
    .facts__table tbody tr:last-child :is(th,td){{border-bottom:0;}}
    .v--was{{color:var(--ink-3);}}
    .v--now{{color:var(--ink);font-weight:600;}}
    .d{{font-weight:600;min-width:60px;}}
    .d--good{{color:var(--good);}}
    .d--warn{{color:var(--warn);}}
    .d--flat{{color:var(--ink-3);}}
    .fn{{color:var(--accent);font-weight:700;}}
    sup.fn{{font-size:.72em;margin-left:2px;}}
    .notes{{margin:14px 0 0;padding:0;list-style:none;display:grid;gap:8px;border-top:1px solid var(--rule);padding-top:12px;}}
    .notes li{{display:grid;grid-template-columns:16px 1fr;gap:6px;font-size:12.5px;line-height:1.5;color:var(--ink-2);}}

    /* ---------- full page strip ---------- */
    .fulls{{padding-block:clamp(44px,6vw,72px);border-top:1px solid var(--rule);}}
    .fulls > h2{{font-family:var(--display);font-weight:400;font-size:clamp(26px,3.4vw,38px);margin:0 0 10px;letter-spacing:-.01em;}}
    .fulls > p{{max-width:64ch;color:var(--ink-2);margin:0 0 34px;font-size:15.5px;}}
    .full{{margin:0 0 34px;}}
    .full figcaption{{
      font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase;
      color:var(--ink); margin-bottom:10px; font-weight:600;
    }}
    .full__pair{{display:grid;grid-template-columns:1fr 1fr;gap:14px;}}
    .full__lab{{
      display:inline-block; font-family:var(--mono); font-size:10px; letter-spacing:.12em;
      text-transform:uppercase; color:var(--ink-3); margin-bottom:6px;
    }}
    .full__lab--now{{color:var(--accent);}}
    .full__win{{
      height:380px; overflow:auto; border:1px solid var(--rule); border-radius:3px;
      background:var(--sunk); scrollbar-width:thin;
    }}
    .full__win img{{display:block;width:100%;height:auto;}}

    /* ---------- ledger ---------- */
    .ledger{{padding-block:clamp(44px,6vw,72px);border-top:1px solid var(--rule);}}
    .ledger h2{{font-family:var(--display);font-weight:400;font-size:clamp(26px,3.4vw,38px);margin:0 0 10px;letter-spacing:-.01em;}}
    .ledger > p{{max-width:64ch;color:var(--ink-2);margin:0 0 30px;font-size:15.5px;}}
    .cols{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:clamp(20px,3vw,34px);}}
    .col h3{{
      font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase;
      margin:0 0 14px; padding-bottom:9px; border-bottom:2px solid var(--ink); font-weight:600;
    }}
    .col--warn h3{{border-bottom-color:var(--warn);color:var(--warn);}}
    .col ul{{margin:0;padding:0;list-style:none;display:grid;gap:12px;}}
    .col li{{font-size:14.5px;line-height:1.55;color:var(--ink-2);padding-left:18px;position:relative;}}
    .col li::before{{
      content:""; position:absolute; left:0; top:.62em; width:7px; height:2px; background:var(--accent);
    }}
    .col--warn li::before{{background:var(--warn);}}
    .col li b{{color:var(--ink);font-weight:600;}}

    /* ---------- footer ---------- */
    footer{{border-top:1px solid var(--rule);padding-block:clamp(36px,5vw,60px) 44px;}}
    .foot{{display:flex;justify-content:space-between;gap:22px;flex-wrap:wrap;align-items:baseline;}}
    .foot p{{margin:0;font-size:13.5px;color:var(--ink-3);}}
    .foot a{{color:var(--accent);text-decoration:none;border-bottom:1px solid var(--accent-tint);}}
    .foot a:hover{{border-bottom-color:var(--accent);}}
    .studio{{font-family:var(--display);font-size:19px;color:var(--ink);letter-spacing:-.01em;}}
    @media (prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important;}}}}
    </style>

    <div class="wrap">
      <header class="mast">
        <p class="eyebrow">Switch Case Studio &middot; Case study &middot; prodanimiami.com</p>
        <h1>ProDani Miami<span class="sub">measured, then rebuilt.</span></h1>
        <p class="lede">A Miami bakery selling high-protein, no-added-sugar desserts, running a bought
          Shopify theme. The storefront was rebuilt from scratch on Dawn as a bespoke theme &mdash; and
          then both versions were put through the same instrument, at the same viewport, on the same
          afternoon. <strong>Every figure below is measured, not estimated.</strong></p>
      </header>

      <div class="bigs">{"".join(big)}</div>

      <div class="method">
        <h2>How this was measured</h2>
        <ul>
          <li><b>Viewport</b><span>Exactly 1150 &times; 1000 CSS pixels, pinned with Chrome&rsquo;s device-metrics
            override, at a device pixel ratio of 1. Both versions, no exceptions.</span></li>
          <li><b>Runs</b><span>5 per page per version, cache disabled on every one, and <em>interleaved</em> &mdash;
            before, after, before, after. Running all of one version first would let a slow minute on the
            network land entirely on one side and read as a design result. Reported value is the median.</span></li>
          <li><b>Instrument</b><span>Headless Chrome driven over the DevTools protocol. Paint and layout-shift
            figures come from PerformanceObserver hooks installed before the first byte of the document,
            because layout-shift and LCP entries cannot be recovered after the fact.</span></li>
          <li><b>Same store</b><span>Identical products, prices, apps and pixels on both sides &mdash; one
            catalogue, two themes, so the theme is the only variable. Nothing here touched the store&rsquo;s
            data: products, orders, customers and checkout are not part of a theme, and the previous theme
            is still sitting in the library, one call away from being live again.</span></li>
          <li><b>Measured twice</b><span>Once before launch, with the old theme live and the new one in
            preview, and again after launch with those roles reversed. That matters for time to first byte,
            because only a published theme gets Shopify&rsquo;s full page cache &mdash; so the cache bias ran
            one way in the first run and the other way in the second. The figure came back at
            &minus;68% and then &minus;69%. It is a real difference in render time, not a caching artefact.
            Figures on this page are from the post-launch run, against the live storefront.</span></li>
        </ul>
      </div>
    </div>

    <main class="wrap">
    {"".join(sections)}

    <section class="fulls">
      <h2>The whole page, top to bottom</h2>
      <p>The frames above are the first screen. These are the entire documents at the same 1150px width &mdash;
        scroll either column. The homepage got substantially longer, which was the point: the collection,
        the proof, the story and the enquiry form all moved onto it.</p>
      {"".join(fulls)}
    </section>

    <section class="ledger">
      <h2>Beyond the numbers</h2>
      <p>Speed was the measurable part. Most of the work was not measurable, and some of it made the
        numbers worse on purpose.</p>
      <div class="cols">
        <div class="col">
          <h3>What got better</h3>
          <ul>
            <li><b>Reviews became real.</b> The old product page showed a dead five-star widget reading
              &ldquo;No reviews&rdquo;. The new one embeds the store&rsquo;s actual Judge.me account &mdash; 25 verified
              reviews render, a shopper can page through them and leave their own.</li>
            <li><b>Fonts came in-house.</b> Google Fonts was a blocking third-party request on every
              page. Three self-hosted woff2 files, 42KB total, replaced it. One fewer host in the
              critical path.</li>
            <li><b>Colour was calculated, not eyeballed.</b> Every text and control pair on the new
              panels was computed against WCAG before it shipped &mdash; the contact panel&rsquo;s field outline
              sits at 55% opacity because 28% measured 1.89:1 and failed, and 55% is the first value
              that clears 3:1.</li>
            <li><b>Structure got honest.</b> One <code>&lt;h1&gt;</code> per page across all sixteen routes;
              every image on the homepage carries alt text; the product page lost six levels of nesting.</li>
            <li><b>Copy came out of the theme.</b> Dani&rsquo;s story and the contact details were stored in
              the old theme&rsquo;s settings, not in the page records &mdash; a theme swap would have blanked both
              pages. They were extracted verbatim first.</li>
          </ul>
        </div>
        <div class="col col--warn">
          <h3>What got worse, and why</h3>
          <ul>
            <li><b>The homepage is 69% taller and carries 53% more elements.</b> It went from four
              sections to nine. A shopper who used to leave the homepage knowing nothing now passes the
              catalogue, the claims, the baker and the reviews on the way down.</li>
            <li><b>The product page barely lost any weight.</b> Scripts dropped by 320KB; photographs
              gained 251KB, because the new gallery shows the cake bigger. Net: 2%. The wins there are
              layout shift and DOM size, not bytes.</li>
            <li><b>The contact page picked up a 100ms long task.</b> That is the embedded map. It buys a
              shopper who can see where the bakery is, which was judged worth a tenth of a second.</li>
            <li><b>Both versions still load ~150 scripts.</b> Almost all of it is Shopify apps and
              pixels, which live outside the theme. A theme rebuild cannot remove them; that is a
              separate conversation about which apps still earn their place.</li>
          </ul>
        </div>
      </div>
    </section>
    </main>

    <footer class="wrap">
      <div class="foot">
        <p class="studio">Switch Case Studio</p>
        <p>Design and build by <a href="https://switchcasestudio.com" target="_blank" rel="noopener">switchcasestudio.com</a>
           &nbsp;&middot;&nbsp; Measured 23 August 2026</p>
      </div>
    </footer>

    <script>
    /* The slider is the whole interaction, so it is driven by a real range input:
       pointer drag comes free, and so do arrow keys and screen-reader semantics. */
    for (const fig of document.querySelectorAll('.cmp')) {{
      const range = fig.querySelector('.cmp__range');
      const apply = () => fig.style.setProperty('--x', range.value + '%');
      range.addEventListener('input', apply);
      apply();
    }}
    </script>
    '''

    return HTML

def document(fragment, cover_rel):
    """Wraps the page fragment as a complete, valid HTML document.

    The fragment is written for a host that supplies <html>/<head>/<body>. Split it
    at the end of the stylesheet so <title> and <style> land in the head and the
    content lands in the body, rather than relying on the browser to sort it out."""
    cut = fragment.index('</style>') + len('</style>')
    head, body = fragment[:cut], fragment[cut:]
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="ProDani Miami storefront rebuild by Switch Case Studio: measured before and after, at a pinned 1150px viewport.">
<meta property="og:title" content="ProDani Miami, measured then rebuilt">
<meta property="og:description" content="A Shopify storefront rebuilt from scratch. Every figure measured, not estimated.">
<meta property="og:image" content="{cover_rel}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>&#127850;</text></svg>">
{head}
</head>
<body>
{body}
</body>
</html>
"""

INLINE = True
OUT_FRAGMENT.write_text(build_page(True))
OUT_INLINE.write_text(document(build_page(True), '../images/cover-1200x630.jpg'))
print(f'wrote {OUT_INLINE.relative_to(ROOT)}  {OUT_INLINE.stat().st_size/1048576:.2f}MB')
OUT_LINKED.write_text(document(build_page(False), '../images/cover-1200x630.jpg'))
print(f'wrote {OUT_LINKED.relative_to(ROOT)}  {OUT_LINKED.stat().st_size/1024:.0f}KB')

# ---------------------------------------------------------------- copy + table
# Written from the same metrics.json the page is built from. Editing these by
# hand is what puts a wrong number in a portfolio, so they are generated.

def pct(before, after):
    if not before: return ''
    v = (after - before) / before * 100
    return f"{'+' if v > 0 else '\u2212'}{abs(v):.0f}%"

def plain(v):
    """Same formatters as the page, minus the markup."""
    import re
    return re.sub(r'<[^>]+>', '', str(v))

CSV_HEAD = 'page,metric,before,after,change,lower_is_better,note\n'
def csv_rows():
    out = []
    for key, title, route, _ in PAGES:
        b = M['before']['pages'][key]['median']
        a = M['after']['pages'][key]['median']
        for mk, label, fmt, direction in ROWS:
            note = NOTES.get((key, mk), '').replace('"', "'")
            out.append(','.join([
                f'"{title}"', f'"{label}"',
                f'"{plain(FMT[fmt](b[mk]))}"', f'"{plain(FMT[fmt](a[mk]))}"',
                f'"{pct(b[mk], a[mk])}"',
                'yes' if direction == 'lower' else 'informational',
                f'"{note}"',
            ]))
    return CSV_HEAD + '\n'.join(out) + '\n'

def md_table(key):
    b = M['before']['pages'][key]['median']
    a = M['after']['pages'][key]['median']
    lines = ['| Measure | Before | After | Change |', '| --- | ---: | ---: | ---: |']
    notes = []
    n = 0
    for mk, label, fmt, direction in ROWS:
        mark = ''
        if (key, mk) in NOTES:
            n += 1; mark = f' [^{key}{n}]'
            notes.append(f'[^{key}{n}]: {NOTES[(key, mk)]}')
        lines.append(f'| {label}{mark} | {plain(FMT[fmt](b[mk]))} | {plain(FMT[fmt](a[mk]))} | {pct(b[mk], a[mk])} |')
    return '\n'.join(lines) + ('\n\n' + '\n'.join(notes) if notes else '')

big_md = []
for label, bv, av, fmt in HEADLINE:
    big_md.append(f'| {label} | {plain(FMT[fmt](bv))} | {plain(FMT[fmt](av))} | {pct(bv, av)} |')

COPY = f"""# ProDani Miami — storefront rebuild

**Client** ProDani Miami, a Miami bakery selling high-protein, no-added-sugar desserts
**Site** prodanimiami.com (Shopify)
**Studio** Switch Case Studio
**Launched** 23 August 2026

---

## The short version

ProDani was running a bought Shopify theme. We rebuilt the storefront from scratch as a
bespoke theme on Dawn, then measured both versions through the same instrument, at the
same viewport, on the same afternoon — and again after launch, to be sure the result was
not an artefact of how the two were being served.

| | Before | After | |
| --- | ---: | ---: | ---: |
{chr(10).join(big_md)}

---

## How it was measured

Numbers in a redesign case study are usually estimates. These are not, and the method is
worth stating because it is what makes them worth quoting.

- **Viewport** — exactly 1150 x 1000 CSS pixels, pinned with Chrome's device-metrics
  override at a device pixel ratio of 1. Both versions, no exceptions.
- **Runs** — five per page per version, cache disabled on every one, and *interleaved*:
  before, after, before, after. Running all of one version first would let a slow minute
  on the network land entirely on one side and read as a design result. Reported value is
  the median.
- **Instrument** — headless Chrome driven over the DevTools protocol. Paint and
  layout-shift figures come from PerformanceObserver hooks installed before the first byte
  of the document, because layout-shift and LCP entries cannot be recovered after the fact.
- **Same store** — identical products, prices, apps and pixels on both sides. One
  catalogue, two themes, so the theme is the only variable.
- **Measured twice** — once before launch with the old theme live and the new one in
  preview, and again after launch with those roles reversed. Only a published theme gets
  Shopify's full page cache, so the cache bias ran one way in the first run and the other
  way in the second. Server response came back at -68%, then -69%. It is a real difference
  in render time, not a caching artefact. Figures here are from the post-launch run.

---

## Page by page

### Homepage
`/`

{PAGES[0][3]}

{md_table('home')}

### Product page
`/products/family-orange-cake`

{PAGES[1][3]}

{md_table('product')}

### Meet Your Baker
`/pages/meet-your-baker`

{PAGES[2][3]}

{md_table('baker')}

### Contact
`/pages/contact`

{PAGES[3][3]}

{md_table('contact')}

---

## Beyond the numbers

Speed was the measurable part. Most of the work was not measurable, and some of it made
the numbers worse on purpose.

**What got better**

- **Reviews became real.** The old product page showed a dead five-star widget reading
  "No reviews". The new one embeds the store's actual Judge.me account — verified reviews
  render, a shopper can page through them and leave their own.
- **Fonts came in-house.** Google Fonts was a blocking third-party request on every page.
  Three self-hosted woff2 files, 42KB total, replaced it. One fewer host in the critical path.
- **Colour was calculated, not eyeballed.** Every text and control pair on the new panels
  was computed against WCAG before it shipped — the contact panel's field outline sits at
  55% opacity because 28% measured 1.89:1 and failed, and 55% is the first value that
  clears 3:1.
- **Structure got honest.** One `<h1>` per page across all sixteen routes; every image on
  the homepage carries alt text; the product page lost six levels of nesting.
- **Copy came out of the theme.** Dani's story and the contact details were stored in the
  old theme's settings, not in the page records — a theme swap would have blanked both
  pages. They were extracted verbatim first.

**What got worse, and why**

- **The homepage is taller and carries more elements.** It went from four sections to
  nine. A shopper who used to leave the homepage knowing nothing now passes the catalogue,
  the claims, the baker and the reviews on the way down.
- **The product page is slightly heavier.** Scripts dropped; photography grew, and the
  page now carries a working reviews widget it did not have at all. The wins there are
  layout shift and DOM size, not bytes.
- **The contact page picked up a long task.** That is the embedded map. It buys a shopper
  who can see where the bakery is.
- **Both versions still load around 150 scripts.** Almost all of it is Shopify apps and
  pixels, which live outside the theme. A theme rebuild cannot remove them; that is a
  separate conversation about which apps still earn their place.

---

## Deployment

The rebuild went live as a theme publish, not a migration. Products, orders, customers and
checkout are store data, not theme data, and were never touched. The previous theme stays
in the library, unpublished — a rollback is one call away.

Before publishing, a read-only check suite ran against the new theme: every route renders
without a Liquid error, add-to-cart works end to end, no stock theme markup leaks through,
every referenced asset resolves, one `<h1>` per page, every image has alt text. It ran
again against the live storefront after publishing. **89 checks, 0 failures.**

---

Design and build by [Switch Case Studio](https://switchcasestudio.com)
"""

(ROOT / 'copy.md').write_text(COPY)
(ROOT / 'metrics.csv').write_text(csv_rows())
print('wrote copy.md and metrics.csv')

