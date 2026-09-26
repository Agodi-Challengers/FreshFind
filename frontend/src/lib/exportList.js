import { scheduleLabel, seasonRange } from './time.js';

export function buildList(items, { marketById, produceById }) {
  const markets = items.filter((i) => i.type === 'market' && marketById[i.id]);
  const produce = items.filter((i) => i.type === 'produce' && produceById[i.id]);
  const lines = ['FRESHFIND · MY MARKET LIST', ''];
  if (markets.length) {
    lines.push('MARKETS');
    markets.forEach((i, n) => {
      const m = marketById[i.id];
      lines.push(`${n + 1}. ${m.name} (${scheduleLabel(m.schedule)})`);
      lines.push(`   ${m.address}`);
      if (i.note.trim()) lines.push(`   Note: ${i.note.trim()}`);
    });
    lines.push('');
  }
  if (produce.length) {
    lines.push('PRODUCE');
    produce.forEach((i) => {
      const p = produceById[i.id];
      lines.push(`• ${p.name} (${seasonRange(p.season)})`);
      if (i.note.trim()) lines.push(`   Note: ${i.note.trim()}`);
    });
    lines.push('');
  }
  if (!markets.length && !produce.length) lines.push('(Nothing saved yet)', '');
  lines.push('Made with FreshFind');
  return lines.join('\n');
}

export function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function shareUrls(text, url) {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  return {
    whatsapp: `https://wa.me/?text=${t}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent('My market list from FreshFind')}&url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    email: `mailto:?subject=${encodeURIComponent('My FreshFind market list')}&body=${t}`,
  };
}
