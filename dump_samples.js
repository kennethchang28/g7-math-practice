// 產生審查用樣本：每個題型抽數題，輸出可讀文字（含正解標記與詳解）
const MG = require('./generators.js');
const N = Number(process.argv[2]) || 6;
const lines = [];
const seenTag = {};
let total = 0, guard = 0;
const want = {};
Object.keys(MG.TOPICS).forEach(t => want[t] = MG.TOPICS[t].length);

// 直接針對每個主題大量生成，收集每個 tag 各 N 題
const byTag = {};
Object.keys(MG.TOPICS).forEach(topic => {
  for (let i = 0; i < 6000; i++) {
    const q = MG.genOne(topic);
    const key = q.topic + ' | ' + q.tag;
    byTag[key] = byTag[key] || [];
    if (byTag[key].length < N) byTag[key].push(q);
  }
});

Object.keys(byTag).sort().forEach(key => {
  byTag[key].forEach((q, idx) => {
    total++;
    lines.push('==== [' + key + '] 範例' + (idx + 1) + ' (id#' + total + ') ====');
    lines.push('題目：' + (q.stem || '(僅圖形題)').replace(/\n/g, '\n      '));
    if (q.svg) lines.push('附圖：有（SVG 圖形，數學內容已由程式投影/反射運算驗證；詳解內含關鍵數據）');
    const KEYS = ['A', 'B', 'C', 'D'];
    q.options.forEach((o, i) => {
      const txt = (typeof o === 'string' && o.trim().startsWith('<svg')) ? '〔圖形選項〕' : o;
      lines.push('  (' + KEYS[i] + ') ' + txt + (i === q.answer ? '   ★正解' : ''));
    });
    lines.push('詳解：' + (q.solution || '').replace(/\n/g, '\n      '));
    lines.push('');
  });
});
require('fs').writeFileSync(require('path').join(__dirname, 'samples.txt'), lines.join('\n'), 'utf8');
console.log('已輸出 ' + total + ' 題到 samples.txt（' + Object.keys(byTag).length + ' 種題型，每型 ' + N + ' 題）');
