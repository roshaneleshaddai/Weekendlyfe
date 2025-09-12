function generateSVGPoster(items) {
  const grouped = { saturday: [], sunday: [] };
  items
    .sort((a, b) => a.order - b.order)
    .forEach((it) => grouped[it.day || "sunday"].push(it));

  const svgWidth = 800,
    svgHeight = 1000;
  const header = `<text x="40" y="60" font-size="28" font-family="sans-serif" fill="#111">Weekendlyfe — Your Weekend Plan</text>`;
  const box = (x, y, w, h, title) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="#eee"/><text x="${
      x + 18
    }" y="${
      y + 28
    }" font-size="16" font-family="sans-serif" fill="#111">${title}</text>`;
  let content = header;
  let y = 100;
  ["saturday", "sunday"].forEach((day) => {
    content += `<text x="40" y="${y}" font-size="18" font-family="sans-serif" fill="#333" font-weight="600" >${day.toUpperCase()}</text>`;
    y += 20;
    grouped[day].forEach((it, idx) => {
      const title = it.activity ? it.activity.title : "Unknown";
      const meta = it.activity
        ? `${it.activity.category} • ${it.activity.durationMin}m`
        : "";
      content += `<g><rect x="40" y="${y}" width="700" height="48" rx="8" fill="#f8fafc" stroke="#e6e6e6"/><text x="58" y="${
        y + 28
      }" font-size="14" font-family="sans-serif" fill="#111">${title} — ${meta}</text></g>`;
      y += 60;
    });
    y += 10;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}"><rect width="100%" height="100%" fill="#f1f5f9"/><g>${content}</g></svg>`;
  return svg;
}

module.exports = {
  generateSVGPoster,
};
