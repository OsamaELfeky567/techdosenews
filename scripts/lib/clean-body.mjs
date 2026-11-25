// Normalizes AI article bodies that leak Markdown / scraped-page junk into HTML
// (headings "##", "**bold**", "* bullets", "> quotes", "!Image N: caption", widget text). Idempotent.
// Used by the generator (before the quality gate) and for repairing stored articles.
const txt = s => s.replace(/<[^>]+>/g, '').trim();
const JUNK = /^(تابعنا|شارك|المزيد|اقرأ أيضا|اقرأ أيضًا|اشترك|Google News|اضغط هنا)\s*:?$/;
export function cleanBody(html) {
  const h = String(html || '');
  const blocks = [...h.matchAll(/<(p|h[1-6]|ul|ol|table|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)];
  const inline = s => s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/\*\*/g, '');
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push('<ul>' + list.map(i => '<li>' + i + '</li>').join('') + '</ul>'); list = []; } };
  const items = blocks.length ? blocks.map(m => ({ tag: m[1].toLowerCase(), html: m[0], inner: m[2] })) : [{ tag: 'p', html: h, inner: h }];
  for (const b of items) {
    if (/^(h[1-6]|ul|ol)$/.test(b.tag)) {
      flush(); const r = inline(b.html).replace(/<h[1346]/gi, '<h2').replace(/<\/h[1346]>/gi, '</h2>');
      if (txt(r) && !/^#{1,4}/.test(txt(r))) out.push(r); else if (txt(r)) out.push('<h2>' + txt(r).replace(/^#{1,4}\s*/, '') + '</h2>'); continue;
    }
    if (b.tag === 'table') continue;
    const p = b.inner;
    let buf = [];
    const flushP = () => { if (buf.length) { out.push('<p>' + inline(buf.join(' ')) + '</p>'); buf = []; } };
    for (let line of p.split(/<br\s*\/?>/i)) {
      line = line.trim().replace(/^(?:&gt;|>)\s*/, '').replace(/(?:&gt;|>)\s*$/, '').trim();
      if (!line) continue;
      const t = txt(line);
      if (!t || JUNK.test(t) || /^!?\[?Image\s*\d+\]?:?/i.test(t) || /^!\[[^\]]*\]\([^)]*\)/.test(t) || /^[*•\-]+$/.test(t)) continue;
      line = line.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/!Image\s*\d+:?[^<]*/gi, '').trim();
      if (!line) continue;
      const hm = line.match(/^#{1,4}\s*(.+)$/);
      if (hm) { flushP(); flush(); out.push('<h2>' + inline(txt(hm[1])) + '</h2>'); continue; }
      const bm = line.match(/^(?:\*|•|-)\s+(.+)$/);
      if (bm) { flushP(); bm[1].split(/\s+(?:\*|•)\s+/).forEach(i => i.trim() && list.push(inline(i.trim()))); continue; }
      flush(); buf.push(line.replace(/^#{1,4}\s*/, ''));
    }
    flushP();
  }
  flush();
  let r = out.join('');
  for (let i = 0; i < 3; i++) r = r.replace(/<strong>\s*<strong>([\s\S]*?)<\/strong>/g, '<strong>$1').replace(/<\/strong>\s*<\/strong>/g, '</strong>');
  r = r.replace(/\s*(?:&gt;|>)\s*(<\/(?:li|p|strong|h2)>)/g, '$1').replace(/<li>\s*(?:&gt;|>)\s*/g, '<li>');
  r = r.replace(/([^.\s])\.\.(\s)/g, '$1.$2');
  return r.replace(/<li>\s*<strong>([\s\S]*?)<\/strong>\s*<\/li>/g, '<li>$1</li>');
}
export const hasMarkdownLeak = h => /(^|<p>|\s)#{1,4}\s|\*\*|<(p|li)>\s*(\*|•)\s|(&gt;|>)\s*\*|!?Image\s*\d|<br>\s*[*•>]/.test(String(h || ''));
