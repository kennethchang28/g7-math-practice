/* =======================================================================
   七年級下學期 第三次段考 數學練習系統 — 題目生成引擎
   範圍：一元一次不等式 / 統計(平均數,中位數,眾數) / 幾何圖形 / 線對稱與三視圖
   難度：班排第一、校排前 20 (多步驟、觀念陷阱、應用題)
   設計原則：所有答案皆由程式「依建構方式」算出，保證正確。
   可同時於瀏覽器與 Node 執行 (檔尾有 module.exports)。
   ======================================================================= */
(function (root) {
  'use strict';

  /* ---------------- 基礎隨機/工具 ---------------- */
  function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function nonZero(a, b) { let v = 0; while (v === 0) v = randInt(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
  function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
  function sum(arr) { return arr.reduce((s, x) => s + x, 0); }
  function uniq(arr) { return Array.from(new Set(arr)); }

  // 顯示分數：化簡、分母為正、整數則僅顯示整數
  function fracStr(n, d) {
    if (d === 0) return 'undef';
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    n /= g; d /= g;
    if (d === 1) return String(n);
    return (n < 0 ? '-' : '') + Math.abs(n) + '/' + d;
  }
  // 數值：整數顯示整數，否則顯示精簡小數
  function numStr(x) {
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    return String(Math.round(x * 1000) / 1000);
  }
  function flip(rel) { return { '>': '<', '<': '>', '≥': '≤', '≤': '≥' }[rel]; }

  /* ---------------- 選項組裝 ---------------- */
  // correct 為正確選項字串；distractors 為誘答字串陣列；filler(g) 補足到 4 個。
  function buildChoices(correct, distractors, filler) {
    const seen = new Set();
    const arr = [];
    const push = (v) => {
      if (v === null || v === undefined) return;
      v = String(v);
      if (!seen.has(v)) { seen.add(v); arr.push(v); }
    };
    push(correct);
    for (const d of (distractors || [])) { if (arr.length >= 4) break; push(d); }
    let g = 0;
    while (arr.length < 4 && g < 800) { if (filler) push(filler(g)); g++; }
    let pad = 1;
    while (arr.length < 4) { push('（其他' + (pad++) + '）'); }
    const tagged = arr.slice(0, 4).map((s, i) => ({ s, c: i === 0 }));
    shuffle(tagged);
    return { options: tagged.map(t => t.s), answer: tagged.findIndex(t => t.c) };
  }
  // 數值型 filler：在正確值附近取偏移
  function numFiller(correctNum, opts) {
    const offs = shuffle([1, -1, 2, -2, 3, -3, 4, 5, -4]);
    return (g) => {
      if (g >= offs.length) return null;
      const v = correctNum + offs[g];
      return (opts && opts.fmt ? opts.fmt(v) : numStr(v));
    };
  }

  /* =====================================================================
     主題一：一元一次不等式
     ===================================================================== */

  // 解 a*x + b (rel) c   (a,b,c 整數, a≠0) -> {rel, num, den(>0)}
  function solveLinear(a, b, rel, c) {
    let num = c - b, den = a, r = rel;
    if (a < 0) { r = flip(r); }
    if (den < 0) { num = -num; den = -den; }
    return { rel: r, num, den };
  }
  function solStr(sol) { return 'x ' + sol.rel + ' ' + fracStr(sol.num, sol.den); }
  // 整數 x 是否滿足 a*x+b rel c
  function satisfy(a, b, rel, c, x) {
    const L = a * x + b;
    if (rel === '>') return L > c;
    if (rel === '<') return L < c;
    if (rel === '≥') return L >= c;
    if (rel === '≤') return L <= c;
  }
  function relWord(rel) { return { '>': '>', '<': '<', '≥': '≥', '≤': '≤' }[rel]; }
  // 把 "k x" 係數寫成可讀字串(含正負號與省略)
  function coefTerm(k, varName) {
    if (k === 0) return '';
    if (k === 1) return varName;
    if (k === -1) return '-' + varName;
    return k + varName;
  }
  function linExpr(a, b) {
    // a x + b  -> 字串
    let s = coefTerm(a, 'x');
    if (b !== 0) s += (b > 0 ? ' + ' + b : ' - ' + (-b));
    if (s === '') s = '0';
    return s;
  }

  // (1) 解兩側含 x 的不等式
  function genIneqSolveBasic() {
    let a, c, b, d, rel, A, B;
    let guard = 0;
    do {
      a = nonZero(-6, 6); c = nonZero(-6, 6);
      b = randInt(-12, 12); d = randInt(-12, 12);
      rel = choice(['>', '<', '≥', '≤']);
      A = a - c; B = d - b;
      guard++;
    } while ((A === 0 || gcd(B, A) === A && Math.abs(B / A) > 20) && guard < 50);
    if (A === 0) { a = 3; c = 1; A = 2; }
    const sol = solveLinear(A, 0, rel, B);
    const stem = '解一元一次不等式： ' + linExpr(a, b) + ' ' + rel + ' ' + linExpr(c, d) + '\n求 x 的解。';
    const correct = solStr(sol);
    // 誘答：忘了變號、移項符號錯
    const wrongFlip = solStr({ rel: A < 0 ? rel : flip(rel), num: sol.num, den: sol.den });
    const wrongB = solStr(solveLinear(A, 0, rel, -B + 0) ); // 用 -(d-b)
    const wrongRel = solStr({ rel: { '>': '≥', '<': '≤', '≥': '>', '≤': '<' }[sol.rel], num: sol.num, den: sol.den });
    const res = buildChoices(correct, [wrongFlip, wrongB, wrongRel],
      (g) => { const ks = [1, -1, 2, -2]; if (g >= ks.length) return null; return solStr({ rel: sol.rel, num: sol.num + ks[g] * sol.den, den: sol.den }); });
    return {
      topic: '不等式', tag: '兩側移項',
      stem, svg: null, options: res.options, answer: res.answer,
      solution: '移項整理：' + linExpr(A, 0) + ' ' + rel + ' ' + B +
        '\n' + (A < 0 ? '兩側同除以負數 ' + A + '，不等號要變向 → ' : '兩側同除以 ' + A + ' → ') +
        correct + '\n(常見錯誤：除以負數忘記變號，或移項符號出錯。)'
    };
  }

  // (2) 含分母的不等式
  function genIneqFraction() {
    // (a x + b)/m  rel  (c x + d)/n
    let m = choice([2, 3, 4, 5, 6]), n = choice([2, 3, 4, 5, 6]);
    while (n === m) n = choice([2, 3, 4, 5, 6]);
    const a = nonZero(-4, 4), b = randInt(-8, 8), c = randInt(-4, 4), d = randInt(-8, 8);
    const rel = choice(['>', '<', '≥', '≤']);
    const L = lcm(m, n);
    // L/m*(a x + b) rel L/n*(c x + d)  -> 整數係數
    const A1 = (L / m) * a, B1 = (L / m) * b;
    const A2 = (L / n) * c, B2 = (L / n) * d;
    const A = A1 - A2, B = B2 - B1; // A x rel B
    if (A === 0) return genIneqFraction();
    const sol = solveLinear(A, 0, rel, B);
    const stem = '解不等式： (' + linExpr(a, b) + ')/' + m + '  ' + rel + '  (' + linExpr(c, d) + ')/' + n +
      '\n（提示：先去分母，最小公倍數為 ' + L + '）';
    const correct = solStr(sol);
    const wrongFlip = solStr({ rel: A < 0 ? rel : flip(rel), num: sol.num, den: sol.den });
    const wrongNoLCM = solStr(solveLinear(a - c, 0, rel, d - b)); // 沒乘公倍數直接相減
    const res = buildChoices(correct, [wrongFlip, wrongNoLCM],
      (g) => { const ks = [1, -1, 2]; if (g >= ks.length) return null; return solStr({ rel: sol.rel, num: sol.num + ks[g] * sol.den, den: sol.den }); });
    return {
      topic: '不等式', tag: '去分母',
      stem, svg: null, options: res.options, answer: res.answer,
      solution: '兩側同乘 ' + L + ' 去分母：' + linExpr(A1, B1) + ' ' + rel + ' ' + linExpr(A2, B2) +
        '\n移項：' + linExpr(A, 0) + ' ' + rel + ' ' + B +
        '\n' + (A < 0 ? '除以負數 ' + A + '，不等號變向 → ' : '除以 ' + A + ' → ') + correct
    };
  }

  // (3) 整數解個數
  function genIneqIntCount() {
    let L, U, lowStrict, upStrict, k1, k2, b1, b2, neg1, neg2;
    let lowIneq, upIneq, set;
    let guard = 0;
    do {
      L = randInt(-6, 5); U = L + randInt(2, 9);
      lowStrict = choice([true, false]);  // true => x > L
      upStrict = choice([true, false]);    // true => x < U
      k1 = randInt(2, 5); k2 = randInt(2, 5);
      b1 = randInt(-6, 6); b2 = randInt(-6, 6);
      neg1 = choice([true, false]); neg2 = choice([true, false]);
      guard++;
      // 下界： x (>|≥) L
      const relLow = lowStrict ? '>' : '≥';
      const relUp = upStrict ? '<' : '≤';
      // 以係數構造： a1 x + bb1 (rel) cc1
      let a1 = neg1 ? -k1 : k1;
      let r1 = (a1 > 0) ? relLow : flip(relLow);
      let c1 = a1 * L + b1;
      lowIneq = { a: a1, b: b1, rel: r1, c: c1 + b1 }; // a1*x + b1 rel a1*L + b1
      lowIneq = { a: a1, b: b1, rel: r1, c: a1 * L + b1 };
      let a2 = neg2 ? -k2 : k2;
      let r2 = (a2 > 0) ? relUp : flip(relUp);
      let c2 = a2 * U + b2;
      upIneq = { a: a2, b: b2, rel: r2, c: a2 * U + b2 };
      // 掃描整數集合
      set = [];
      for (let x = -200; x <= 200; x++) {
        if (satisfy(lowIneq.a, lowIneq.b, lowIneq.rel, lowIneq.c, x) &&
          satisfy(upIneq.a, upIneq.b, upIneq.rel, upIneq.c, x)) set.push(x);
      }
    } while ((set.length < 3 || set.length > 12) && guard < 80);
    const count = set.length;
    const stem = '設 x 為整數，且同時滿足下列兩個不等式：\n　(1) ' +
      linExpr(lowIneq.a, lowIneq.b) + ' ' + lowIneq.rel + ' ' + lowIneq.c + '\n　(2) ' +
      linExpr(upIneq.a, upIneq.b) + ' ' + upIneq.rel + ' ' + upIneq.c + '\n請問符合條件的整數 x 共有幾個？';
    const res = buildChoices(String(count), [String(count + 1), String(count - 1), String(count + 2), String(Math.max(0, count - 2))],
      numFiller(count));
    const setStr = set.length <= 12 ? set.join('、') : (set[0] + '…' + set[set.length - 1]);
    return {
      topic: '不等式', tag: '整數解個數',
      stem, svg: null, options: res.options, answer: res.answer,
      solution: '由(1)解得 x ' + (lowIneq.a > 0 ? (lowStrict ? '> ' : '≥ ') : '') +
        '（下界），由(2)解得上界，取交集後整數解為：\n' + set.join('、') +
        '\n共 ' + count + ' 個。\n(常見錯誤：端點是否可取，造成多算或少算 1 個。)'
    };
  }

  // (4) 最大/最小整數解
  function genIneqExtremeInt() {
    const a = nonZero(-5, 5), b = randInt(-10, 10), c = randInt(-15, 15);
    const rel = choice(['>', '<', '≥', '≤']);
    let set = [];
    for (let x = -300; x <= 300; x++) if (satisfy(a, b, rel, c, x)) set.push(x);
    // 需有最大或最小值
    const askMax = (rel === '<' || rel === '≤') ? (a > 0) : (a < 0);
    // 重新判斷：解為 x R k；若 R 為 < 或 ≤ 則有最大整數；> 或 ≥ 則有最小整數
    const sol = solveLinear(a, 0, rel, c - b);
    const hasMax = (sol.rel === '<' || sol.rel === '≤');
    if (hasMax) {
      const val = set.length ? set[set.length - 1] : null;
      if (val === null || val < -250) return genIneqExtremeInt();
      const stem = '解不等式 ' + linExpr(a, b) + ' ' + rel + ' ' + c + '，求滿足條件的「最大整數解」。';
      const res = buildChoices(String(val), [String(val + 1), String(val - 1), String(val + 2)], numFiller(val));
      return {
        topic: '不等式', tag: '極值整數解', stem, svg: null, options: res.options, answer: res.answer,
        solution: '解得 ' + solStr(sol) + '，故最大整數解為 ' + val + '。\n(注意端點是否能取等號。)'
      };
    } else {
      const askPos = choice([true, false]);
      const pool = askPos ? set.filter(v => v > 0) : set;
      const val = pool.length ? pool[0] : null;
      if (val === null || val > 250) return genIneqExtremeInt();
      const stem = '解不等式 ' + linExpr(a, b) + ' ' + rel + ' ' + c + '，求滿足條件的' + (askPos ? '「最小正整數解」' : '「最小整數解」') + '。';
      const res = buildChoices(String(val), [String(val - 1), String(val + 1), String(val + 2)], numFiller(val));
      return {
        topic: '不等式', tag: '極值整數解', stem, svg: null, options: res.options, answer: res.answer,
        solution: '解得 ' + solStr(sol) + '，故' + (askPos ? '最小正整數解' : '最小整數解') + '為 ' + val + '。'
      };
    }
  }

  // (5) 應用題
  function genIneqWord() {
    const t = randInt(1, 6);
    if (t === 1) {
      // 預算購買
      const price = choice([7, 8, 9, 11, 12, 13, 15, 18, 22, 24]);
      const money = randInt(6, 12) * 10 + randInt(0, 9);
      const totalMoney = money + randInt(40, 120);
      const item = choice(['原子筆', '筆記本', '蘋果', '麵包', '貼紙']);
      let max = 0; while (price * (max + 1) <= totalMoney) max++;
      const stem = '每個' + item + '售價 ' + price + ' 元，小華帶了 ' + totalMoney + ' 元，最多可以買幾個' + item + '？';
      const res = buildChoices(String(max), [String(max + 1), String(max - 1), String(Math.floor(totalMoney / price) + 1)], numFiller(max));
      return { topic: '不等式', tag: '應用-預算', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設買 x 個，' + price + 'x ≤ ' + totalMoney + ' → x ≤ ' + numStr(totalMoney / price) + '，x 為整數，最多 ' + max + ' 個。' };
    }
    if (t === 2) {
      // 平均門檻
      const n = choice([3, 4, 5]);
      const target = choice([70, 75, 80, 85, 90]);
      const scores = []; for (let i = 0; i < n - 1; i++) scores.push(randInt(55, 98));
      const need = target * n - sum(scores);
      if (need > 100 || need < 0) return genIneqWord();
      const stem = '小明' + n + '次數學小考，前 ' + (n - 1) + ' 次成績為 ' + scores.join('、') +
        ' 分。若他希望 ' + n + '次的平均分數至少 ' + target + ' 分，則第 ' + n + ' 次至少要考幾分？';
      const res = buildChoices(String(need), [String(need + 1), String(need - 1), String(target)], numFiller(need));
      return { topic: '不等式', tag: '應用-平均', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設第' + n + '次為 x 分，(' + scores.join('+') + '+x)/' + n + ' ≥ ' + target +
          ' → x ≥ ' + (target * n) + ' - ' + sum(scores) + ' = ' + need + '，至少 ' + need + ' 分。' };
    }
    if (t === 3) {
      // 兩方案比較
      const baseA = choice([200, 250, 300]); const incl = choice([100, 150, 200]); const per = choice([3, 4, 5]);
      const baseB = baseA + per * incl + randInt(40, 120);
      // baseA + per*(t-incl) > baseB  => t > incl + (baseB-baseA)/per
      const thr = incl + (baseB - baseA) / per; // 臨界
      const tInt = Math.floor(thr) + 1;
      if (!Number.isInteger((baseB - baseA) / per)) return genIneqWord();
      const stem = '甲方案：每月基本費 ' + baseA + ' 元，含 ' + incl + ' 分鐘通話，超過部分每分鐘 ' + per +
        ' 元。\n乙方案：每月固定 ' + baseB + ' 元，通話不限。\n每月通話「超過幾分鐘」時，選乙方案比甲方案便宜？（求最少的整數分鐘數）';
      const res = buildChoices(String(tInt), [String(tInt - 1), String(thr), String(tInt + 1)], numFiller(tInt));
      return { topic: '不等式', tag: '應用-方案', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設通話 x 分鐘 (x>' + incl + ')，甲費用 = ' + baseA + ' + ' + per + '(x-' + incl + ')。\n要 ' + baseA + ' + ' + per + '(x-' + incl + ') > ' + baseB +
          ' → x > ' + thr + '，故至少 ' + tInt + ' 分鐘。' };
    }
    if (t === 4) {
      // 長方形周長
      const diff = randInt(2, 6); const peri = randInt(8, 18) * 2;
      // 寬 w, 長 w+diff, 周長 2(2w+diff) ≤ peri  => w ≤ (peri/2 - diff)/2
      const wmax = Math.floor((peri / 2 - diff) / 2);
      if (wmax < 1) return genIneqWord();
      const stem = '一個長方形的長比寬多 ' + diff + ' 公分，若周長不超過 ' + peri + ' 公分，則寬最大是幾公分（取整數）？';
      const res = buildChoices(String(wmax), [String(wmax + 1), String(wmax - 1), String(wmax + 2)], numFiller(wmax));
      return { topic: '不等式', tag: '應用-幾何', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設寬 w，長 = w+' + diff + '，周長 2(w + w+' + diff + ') = 4w + ' + (2 * diff) + ' ≤ ' + peri +
          ' → w ≤ ' + numStr((peri - 2 * diff) / 4) + '，寬最大 ' + wmax + ' 公分。' };
    }
    if (t === 5) {
      // 連續整數
      const k = choice([3, 4, 5]); const thr = randInt(40, 90);
      // k 個連續整數 n, n+1,... 和 = k n + k(k-1)/2 > thr
      const base = k * (k - 1) / 2;
      // k n > thr - base => n > (thr-base)/k
      const nmin = Math.floor((thr - base) / k) + 1;
      const stem = '有 ' + k + ' 個連續正整數，它們的和大於 ' + thr + '。則這 ' + k + ' 個連續整數中「最小的數」最少是多少？';
      const res = buildChoices(String(nmin), [String(nmin - 1), String(nmin + 1), String(nmin + 2)], numFiller(nmin));
      return { topic: '不等式', tag: '應用-連續整數', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設最小數為 n，和 = ' + k + 'n + ' + base + ' > ' + thr + ' → n > ' + numStr((thr - base) / k) + '，n 為整數，最小為 ' + nmin + '。' };
    }
    // t === 6 分裝/分組
    const total = randInt(50, 120); const per = choice([6, 7, 8, 9]);
    const boxes = Math.ceil(total / per); // 至少幾盒(每盒最多per)
    const stem = '有 ' + total + ' 顆糖果要分裝成數盒，每盒最多裝 ' + per + ' 顆，至少需要幾個盒子？';
    const res = buildChoices(String(boxes), [String(boxes - 1), String(boxes + 1), String(Math.floor(total / per))], numFiller(boxes));
    return { topic: '不等式', tag: '應用-分裝', stem, svg: null, options: res.options, answer: res.answer,
      solution: '設需 x 盒，' + per + 'x ≥ ' + total + ' → x ≥ ' + numStr(total / per) + '，x 為整數，至少 ' + boxes + ' 盒。' };
  }

  // (6) 找出與已知不等式同解者
  function genIneqEquivalent() {
    const a = nonZero(2, 5), b = nonZero(-8, 8), c = randInt(-10, 10);
    const rel = choice(['>', '<', '≥', '≤']);
    const sol = solveLinear(a, 0, rel, c - b);
    const target = linExpr(a, b) + ' ' + rel + ' ' + c;
    // 正解：兩側同乘負數 m 並「正確變號」(考驗變號觀念)
    const m = choice([-2, -3]);
    const p = choice([2, 3]);                          // 一個正倍數，用於誘答
    const correct = linExpr(a * m, b * m) + ' ' + flip(rel) + ' ' + (c * m);
    // 誘答1：乘負數但「忘了」變號 (方向反了)
    const wrong1 = linExpr(a * m, b * m) + ' ' + rel + ' ' + (c * m);
    // 誘答2：乘正數卻「多此一舉」把不等號變向
    const wrong2 = linExpr(a * p, b * p) + ' ' + flip(rel) + ' ' + (c * p);
    // 誘答3：常數項算錯 (邊界整數位移，確保解集合明顯不同)
    const wrong3 = linExpr(a, b) + ' ' + rel + ' ' + (c + a * choice([1, -1]));
    const res = buildChoices(correct, [wrong1, wrong2, wrong3],
      (g) => { const o = [[a, b, flip(rel), c], [a * p, b * p, rel, c * p], [a, -b, rel, c]]; if (g >= o.length) return null; const t = o[g]; return linExpr(t[0], t[1]) + ' ' + t[2] + ' ' + t[3]; });
    return {
      topic: '不等式', tag: '同解判別',
      stem: '下列哪一個不等式的解與「' + target + '」「相同」？',
      svg: null, options: res.options, answer: res.answer,
      solution: '原式解為 ' + solStr(sol) + '。\n正解：兩側同乘 ' + m + '（負數，不等號必須變向）得 ' + correct + '，其解仍為 ' + solStr(sol) + '。\n其餘選項或乘負數忘了變號、或不該變號卻變號、或常數算錯，解皆不相同。'
    };
  }

  // (7) 不等式 <-> 數線
  function numberLineSVG(rel, k) {
    // rel: >,<,≥,≤ ; k: 邊界(顯示文字), 但畫圖用相對位置
    const W = 240, H = 56, midY = 30, cx = 120, left = 24, right = 216, unit = 28;
    const closed = (rel === '≥' || rel === '≤');
    const rightDir = (rel === '>' || rel === '≥');
    const dot = closed ? '#1d4ed8' : '#fff';
    const ray = rightDir
      ? `<line x1="${cx}" y1="${midY}" x2="${right}" y2="${midY}" stroke="#1d4ed8" stroke-width="3"/>`
      : `<line x1="${left}" y1="${midY}" x2="${cx}" y2="${midY}" stroke="#1d4ed8" stroke-width="3"/>`;
    const arrow = rightDir
      ? `<polygon points="${right},${midY} ${right - 8},${midY - 5} ${right - 8},${midY + 5}" fill="#1d4ed8"/>`
      : `<polygon points="${left},${midY} ${left + 8},${midY - 5} ${left + 8},${midY + 5}" fill="#1d4ed8"/>`;
    let ticks = '';
    for (let i = -3; i <= 3; i++) {
      const x = cx + i * unit;
      if (x < left || x > right) continue;
      ticks += `<line x1="${x}" y1="${midY - 4}" x2="${x}" y2="${midY + 4}" stroke="#64748b" stroke-width="1"/>`;
      if (i === 0) ticks += `<text x="${x}" y="${midY + 18}" font-size="11" text-anchor="middle" fill="#334155">${k}</text>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<line x1="${left - 6}" y1="${midY}" x2="${right + 6}" y2="${midY}" stroke="#94a3b8" stroke-width="1.5"/>` +
      ticks + ray + arrow +
      `<circle cx="${cx}" cy="${midY}" r="5" fill="${dot}" stroke="#1d4ed8" stroke-width="2.5"/></svg>`;
  }
  function genIneqNumberLine() {
    const a = nonZero(2, 5), b = randInt(-6, 6), c = randInt(-8, 8);
    const rel = choice(['>', '<', '≥', '≤']);
    const sol = solveLinear(a, 0, rel, c - b);
    const k = fracStr(sol.num, sol.den);
    const correctSVG = numberLineSVG(sol.rel, k);
    // 誘答數線
    const wrongs = [
      numberLineSVG(flip(sol.rel), k),
      numberLineSVG({ '>': '≥', '<': '≤', '≥': '>', '≤': '<' }[sol.rel], k),
      numberLineSVG(flip({ '>': '≥', '<': '≤', '≥': '>', '≤': '<' }[sol.rel]), k)
    ];
    const res = buildChoices(correctSVG, wrongs);
    return {
      topic: '不等式', tag: '數線表示',
      stem: '解不等式 ' + linExpr(a, b) + ' ' + rel + ' ' + c + '，其解在數線上的圖形為下列哪一個？（實心點表可取，空心點表不可取）',
      svg: null, options: res.options, answer: res.answer,
      solution: '解得 ' + solStr(sol) + '（邊界 ' + k + '）。' + (sol.rel === '≥' || sol.rel === '≤' ? '含等號→實心點；' : '不含等號→空心點；') +
        (sol.rel === '>' || sol.rel === '≥' ? '向右' : '向左') + '畫射線。'
    };
  }

  // (8) 反向求係數（挑戰級）：由解反推不等式中的未知係數
  function genIneqParam() {
    const k = nonZero(-6, 6);                 // 解的邊界 x ? k
    const a = nonZero(-5, 5);                 // 待求係數
    const rhs = a * k;                        // 使 a x ? rhs 的邊界恰為 k
    const probRel = choice(['>', '<', '≥', '≤']);
    // a x probRel rhs 的解： a>0 → x probRel k；a<0 → x flip(probRel) k
    const solRel = a > 0 ? probRel : flip(probRel);
    const realStem = '已知關於 x 的不等式 a·x ' + probRel + ' ' + rhs + ' 的解為 x ' + solRel + ' ' + k + '，求係數 a 的值。';
    const correct = String(a);
    const distract = [String(-a), String(k), String(rhs)].filter(s => s !== correct);
    const res = buildChoices(correct, distract, numFiller(a));
    return { topic: '不等式', tag: '反向求係數', stem: realStem, svg: null, options: res.options, answer: res.answer,
      solution: 'a·x ' + probRel + ' ' + rhs + ' 兩側同除以 a，解為 x ' + solRel + ' ' + k + '。\n' +
        '比較不等號方向：題目是「' + probRel + '」、解是「' + solRel + '」，' + (a < 0 ? '方向相反 → 除數 a 為負數；' : '方向相同 → 除數 a 為正數；') +
        '又邊界 ' + rhs + ' ÷ a = ' + k + ' → a = ' + a + '。\n(挑戰點：要同時看「不等號方向是否改變」與「邊界值」反推 a 的正負與大小。)' };
  }
  const INEQ_GENS = [genIneqSolveBasic, genIneqFraction, genIneqIntCount, genIneqExtremeInt, genIneqWord, genIneqEquivalent, genIneqNumberLine, genIneqParam, genIneqParam];

  /* =====================================================================
     主題二：統計 (平均數、中位數、眾數)
     ===================================================================== */
  function median(arr) {
    const s = arr.slice().sort((x, y) => x - y);
    const n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  function modes(arr) {
    const m = {}; arr.forEach(x => m[x] = (m[x] || 0) + 1);
    const mx = Math.max(...Object.values(m));
    return Object.keys(m).filter(k => m[k] === mx).map(Number).sort((a, b) => a - b);
  }
  function mean(arr) { return sum(arr) / arr.length; }

  // (1) 平均數
  function genMean() {
    const n = choice([5, 6, 7, 8]);
    let data;
    do { data = Array.from({ length: n }, () => randInt(40, 100)); } while (sum(data) % n !== 0);
    const mu = sum(data) / n;
    const stem = '下列為某次測驗 ' + n + ' 位同學的分數：\n' + data.join('、') + '\n請問這組資料的「平均數」為何？';
    const res = buildChoices(numStr(mu), [numStr(median(data)), numStr(mu + 1), numStr(mu - 1)], numFiller(mu));
    return { topic: '統計', tag: '平均數', stem, svg: null, options: res.options, answer: res.answer,
      solution: '平均數 = 總和 ÷ 個數 = ' + sum(data) + ' ÷ ' + n + ' = ' + mu + '。\n(陷阱：平均數≠中位數。)' };
  }

  // (2) 中位數（偶數個 -> 取中間兩數平均）
  function genMedian() {
    const n = choice([6, 8, 10]); // 偶數，製造陷阱
    const data = Array.from({ length: n }, () => randInt(30, 99));
    const med = median(data);
    const sorted = data.slice().sort((a, b) => a - b);
    const stem = '一組資料如下（共 ' + n + ' 筆）：\n' + data.join('、') + '\n請問其「中位數」為何？';
    const res = buildChoices(numStr(med), [numStr(sorted[n / 2]), numStr(sorted[n / 2 - 1]), numStr(mean(data))], numFiller(med));
    return { topic: '統計', tag: '中位數', stem, svg: null, options: res.options, answer: res.answer,
      solution: '先由小到大排序：' + sorted.join('、') + '\n共 ' + n + ' 筆（偶數），中位數 = 中間兩數 ' + sorted[n / 2 - 1] + ' 與 ' + sorted[n / 2] + ' 的平均 = ' + numStr(med) + '。\n(陷阱：偶數筆要取中間兩數平均，且須先排序。)' };
  }

  // (3) 眾數（可能無眾數或雙眾數的觀念）
  function genMode() {
    const variant = choice(['single', 'bimodal', 'findX']);
    if (variant === 'findX') {
      // 乾淨建構：眾數 M 出現 3 次，次高者 W 出現 2 次(恰差 1)，其餘各 1 次。
      // 如此「唯一能破壞唯一眾數的新增值」恰為 W (加入後 W 也達 3 次造成並列)。
      const usedF = new Set();
      const pf = (lo, hi) => { let v, g = 0; do { v = randInt(lo, hi); g++; } while (usedF.has(v) && g < 60); usedF.add(v); return v; };
      const M = pf(2, 11), W = pf(2, 11), s1 = pf(1, 12), s2 = pf(1, 12);
      const data = [M, M, M, W, W, s1, s2];   // M:3, W:2, s1:1, s2:1
      shuffle(data);
      const stem = '一組資料為 ' + data.join('、') + '、x（共 8 筆，x 為一個整數）。\n已知這組資料的眾數「仍為 ' + M + ' 且為唯一眾數」，則 x 不可能是下列哪一個值？';
      const correct = String(W); // 唯一會破壞者
      const distract = [String(M), String(s1), String(s2)]; // 皆不會破壞唯一性
      const res = buildChoices(correct, distract, (g) => { for (let v = 1; v <= 14; v++) { if (![M, W, s1, s2].includes(v)) { if (g-- === 0) return String(v); } } return null; });
      return { topic: '統計', tag: '眾數-觀念', stem, svg: null, options: res.options, answer: res.answer,
        solution: M + ' 目前出現 3 次（最多），' + W + ' 出現 2 次。\n若 x = ' + W + '，則 ' + W + ' 也變成 3 次，與 ' + M + ' 並列，眾數就不再唯一 → 故 x 不可能是 ' + W + '。\n其餘選項（含 x = ' + M + '）都不會破壞「' + M + ' 為唯一眾數」。' };
    }
    // 乾淨建構，保證眾數結構正確
    const used = new Set();
    const pickInt = (lo, hi) => { let v, g = 0; do { v = randInt(lo, hi); g++; } while (used.has(v) && g < 50); used.add(v); return v; };
    let data, correct, distract;
    if (variant === 'single') {
      const M = pickInt(2, 11);
      data = [M, M, M];                         // 眾數出現 3 次
      const singles = [pickInt(1, 12), pickInt(1, 12), pickInt(1, 12), pickInt(1, 12)]; // 各 1 次
      data = data.concat(singles);
      correct = String(M);
      distract = [numStr(median(data)), String(Math.round(mean(data))), String(singles[0])];
    } else { // bimodal — 雙眾數，觀念陷阱
      const M1 = pickInt(2, 6), M2 = pickInt(7, 11);
      const s1 = pickInt(1, 12), s2 = pickInt(1, 12);
      data = [M1, M1, M2, M2, s1, s2];
      correct = M1 + '、' + M2;                  // 兩個眾數
      distract = [String(M1), String(M2), '無眾數'];
    }
    shuffle(data);
    const md = modes(data);
    const stem = '一組資料為：' + data.join('、') + '\n請問其「眾數」為何？';
    const res = buildChoices(correct, distract,
      (g) => { const extra = [1, 12, 0, 13, 14]; return g < extra.length ? String(extra[g]) : null; });
    return { topic: '統計', tag: '眾數', stem, svg: null, options: res.options, answer: res.answer,
      solution: '眾數是出現次數最多的數。本題出現最多次的是「' + correct + '」。\n(觀念：眾數可能有兩個以上；若每個數出現次數相同則無眾數。與平均數、中位數不同。)' };
  }

  // (4) 已知平均數求未知資料
  function genMissingMean() {
    const n = choice([5, 6]);
    const known = Array.from({ length: n - 1 }, () => randInt(50, 95));
    const mu = randInt(60, 90);
    const x = mu * n - sum(known);
    if (x < 0 || x > 100) return genMissingMean();
    const stem = '某 ' + n + ' 位同學的成績平均為 ' + mu + ' 分，其中 ' + (n - 1) + ' 位的成績為 ' + known.join('、') +
      ' 分，則剩下一位同學的成績是幾分？';
    const res = buildChoices(String(x), [String(mu), String(x + 1), String(x - 1), String(mu * (n - 1) - sum(known))], numFiller(x));
    return { topic: '統計', tag: '逆求資料', stem, svg: null, options: res.options, answer: res.answer,
      solution: '總分 = 平均 × 人數 = ' + mu + ' × ' + n + ' = ' + (mu * n) + '。\n剩下一位 = 總分 - 其餘總和 = ' + (mu * n) + ' - ' + sum(known) + ' = ' + x + ' 分。' };
  }

  // (5) 加權平均
  function genWeighted() {
    const w = choice([[20, 30, 50], [30, 30, 40], [20, 20, 60], [40, 30, 30]]);
    const names = ['平時', '期中', '期末'];
    const scores = w.map(() => randInt(50, 100));
    // 為了乾淨，調整使結果為整數或一位小數
    const wm = (scores[0] * w[0] + scores[1] * w[1] + scores[2] * w[2]) / 100;
    const simple = mean(scores);
    const stem = '數學學期成績計算方式為：' + names.map((nm, i) => nm + ' ' + w[i] + '%').join('、') +
      '。\n某生三項成績依序為 ' + scores.join('、') + ' 分，則他的學期成績（加權平均）為幾分？';
    const res = buildChoices(numStr(wm), [numStr(simple), numStr(wm + 1), numStr(wm - 1)], numFiller(wm));
    return { topic: '統計', tag: '加權平均', stem, svg: null, options: res.options, answer: res.answer,
      solution: '加權平均 = ' + scores.map((s, i) => s + '×' + w[i] + '%').join(' + ') + ' = ' + numStr(wm) + ' 分。\n(陷阱：不可直接算算術平均 ' + numStr(simple) + '。)' };
  }

  // (6) 次數分配表
  function genFreqTable() {
    const vals = [randInt(1, 3), randInt(4, 6), randInt(7, 8), randInt(9, 11)].sort((a, b) => a - b);
    const freqs = [randInt(2, 6), randInt(3, 8), randInt(2, 7), randInt(2, 6)];
    const N = sum(freqs);
    const expanded = [];
    vals.forEach((v, i) => { for (let k = 0; k < freqs[i]; k++) expanded.push(v); });
    const ask = choice(['平均數', '中位數', '眾數']);
    let val, sol;
    if (ask === '平均數') {
      const s = vals.reduce((a, v, i) => a + v * freqs[i], 0);
      val = numStr(s / N);
      sol = '平均數 = Σ(數值×次數) ÷ 總次數 = ' + vals.map((v, i) => v + '×' + freqs[i]).join(' + ') + ' ÷ ' + N + ' = ' + val;
    } else if (ask === '中位數') {
      val = numStr(median(expanded));
      sol = '總共 ' + N + ' 筆，' + (N % 2 ? '中位數為第 ' + ((N + 1) / 2) + ' 筆' : '中位數為第 ' + (N / 2) + '、' + (N / 2 + 1) + ' 筆的平均') + '，由累積次數判斷得 ' + val;
    } else {
      const mx = Math.max(...freqs);
      const md = vals.filter((v, i) => freqs[i] === mx);
      val = md.join('、');
      sol = '次數最多者為眾數：次數 ' + mx + '，對應數值 ' + val;
    }
    const table = '數值：' + vals.join('　') + '\n次數：' + freqs.join('　') + '　（總次數 ' + N + '）';
    const stem = '下表為一組資料的次數分配：\n' + table + '\n請問此組資料的「' + ask + '」為何？';
    let distract;
    if (ask === '平均數') distract = [numStr(mean(vals)), numStr(median(expanded)), numStr(modes(expanded)[0])];
    else if (ask === '中位數') distract = [numStr(vals[1]), numStr(vals[2]), numStr(mean(expanded))];
    else distract = [String(Math.max(...freqs)), numStr(median(expanded)), numStr(vals[0])];
    const baseNum = parseFloat(val);
    const res = buildChoices(val, distract,
      (g) => { const o = [1, -1, 2, -2, 0.5]; if (g >= o.length || !Number.isFinite(baseNum)) return null; return numStr(baseNum + o[g]); });
    return { topic: '統計', tag: '次數分配表-' + ask, stem, svg: null, options: res.options, answer: res.answer, solution: sol };
  }

  // (7) 極端值/統計量選擇 (觀念) — 多種情境敘述，避免重複
  function genOutlierConcept() {
    const ask = choice(['affected', 'represent', 'addConst', 'unchanged']);
    if (ask === 'affected') {
      const ctx = choice([
        '一筆資料中若混入一個「異常巨大」的數（極端值）',
        '某公司多數員工月薪相近，但老闆的薪水特別高',
        '一組考試分數中有一位同學考了 0 分（其餘都及格）'
      ]);
      const res = buildChoices('平均數', ['中位數', '眾數', '全部都不受影響']);
      return { topic: '統計', tag: '觀念-極端值', svg: null, options: res.options, answer: res.answer,
        stem: ctx + '，下列哪一個統計量「最容易」因此受到影響而改變？',
        solution: '平均數把所有數值加總平分，因此最容易被極端值「拉高或拉低」；中位數、眾數較不受極端值影響。' };
    }
    if (ask === 'represent') {
      const ctx = choice([
        '某班大多數同學身高相近，但有一位特別高的轉學生',
        '一個社區多數住戶所得相近，但其中有一戶是大富豪',
        '一場路跑多數人完賽時間相近，但有少數人中途散步而成績特別慢'
      ]);
      const res = buildChoices('中位數', ['平均數', '眾數', '總和']);
      return { topic: '統計', tag: '觀念-代表值', svg: null, options: res.options, answer: res.answer,
        stem: ctx + '。若要用「一個數」代表這群人的「典型（一般）」情形，下列何者最不受少數極端者影響、最具代表性？',
        solution: '有極端值時，中位數不受極端值影響，較能代表「中間、典型」的情形；平均數會被極端值拉動。' };
    }
    if (ask === 'addConst') {
      // 全班每人加同一個常數 → 平均/中位/眾數都 +k；全距/標準差不變(此處只問代表值)
      const k = choice([3, 5, 10]);
      const res = buildChoices('平均數、中位數、眾數都增加 ' + k, ['只有平均數增加 ' + k, '三者都不變', '只有中位數增加 ' + k]);
      return { topic: '統計', tag: '觀念-整體平移', svg: null, options: res.options, answer: res.answer,
        stem: '老師決定把全班每位同學的分數都「加 ' + k + ' 分」。則這組分數的平均數、中位數、眾數會如何變化？',
        solution: '每個數都加同一個常數 ' + k + '，加總後平均、排序後的中位、出現最多的眾數也都同步「加 ' + k + '」。三者皆增加 ' + k + '。' };
    }
    // unchanged：哪個代表值在「資料兩端各去掉一個」後最可能不變
    const res = buildChoices('中位數', ['平均數', '眾數', '全距']);
    return { topic: '統計', tag: '觀念-穩健性', svg: null, options: res.options, answer: res.answer,
      stem: '將一組由小到大排好的資料「去掉最大與最小各一筆」後，下列哪一個統計量「最不容易」改變？',
      solution: '去掉最大、最小各一筆，中間位置的中位數通常不受影響；平均數、全距一定改變，眾數也可能改變。' };
  }

  // (8) 兩組合併平均
  function genCombineMean() {
    const n1 = randInt(15, 30), n2 = randInt(15, 30);
    const a1 = randInt(60, 90), a2 = randInt(60, 90);
    const total = n1 * a1 + n2 * a2;
    const cm = total / (n1 + n2);
    const stem = '甲班 ' + n1 + ' 人，數學平均 ' + a1 + ' 分；乙班 ' + n2 + ' 人，數學平均 ' + a2 +
      ' 分。若將兩班合併，則合併後全體的平均分數約為幾分？（四捨五入到小數第一位）';
    const round1 = Math.round(cm * 10) / 10;
    const simple = (a1 + a2) / 2;
    // 確保「算術平均陷阱」與正解四捨五入後不相同，否則陷阱失效 → 重抽
    if (Math.round(simple * 10) / 10 === round1) return genCombineMean();
    const res = buildChoices(numStr(round1), [numStr(simple), numStr(round1 + 0.5), numStr(round1 - 0.6)], (g) => { const o = [0.1, -0.1, 0.2, -0.2]; if (g >= o.length) return null; return numStr(round1 + o[g]); });
    return { topic: '統計', tag: '合併平均', stem, svg: null, options: res.options, answer: res.answer,
      solution: '合併平均 = (' + n1 + '×' + a1 + ' + ' + n2 + '×' + a2 + ') ÷ (' + n1 + '+' + n2 + ') = ' + total + ' ÷ ' + (n1 + n2) + ' ≈ ' + numStr(round1) +
        ' 分。\n(陷阱：人數不同，不能直接算 (' + a1 + '+' + a2 + ')/2 = ' + simple + '。)' };
  }

  // (9) 新增資料對中位數的影響（問「最大/最小可能中位數」→ 唯一解，且考驗中位數會「卡住」的觀念）
  function genAddDataMedian() {
    let data, sorted;
    do { data = Array.from({ length: 5 }, () => randInt(20, 90)); sorted = data.slice().sort((a, b) => a - b); }
    while (sorted[2] === sorted[3] || sorted[1] === sorted[2]); // 避免邊界相等使選項重複
    const askMax = choice([true, false]);
    // 加入任意一筆 → 六筆中位數 = 第3、4小的平均。
    // v ≥ sorted[3] 時中位數固定 = (sorted[2]+sorted[3])/2 (最大)；v ≤ sorted[1] 時 = (sorted[1]+sorted[2])/2 (最小)
    const maxMed = (sorted[2] + sorted[3]) / 2;
    const minMed = (sorted[1] + sorted[2]) / 2;
    const ans = askMax ? maxMed : minMed;
    // 獨立驗證(取樣)
    let chk = askMax ? -Infinity : Infinity;
    for (let v = -50; v <= 200; v++) { const m = median(data.concat([v])); chk = askMax ? Math.max(chk, m) : Math.min(chk, m); }
    const correct = numStr(ans);
    const distract = [numStr(sorted[3]), numStr(sorted[2]), numStr((sorted[3] + sorted[4]) / 2), numStr(sorted[askMax ? 4 : 0])];
    const res = buildChoices(correct, distract, (g) => { const o = [0.5, -0.5, 1, -1]; if (g >= o.length) return null; return numStr(ans + o[g]); });
    return { topic: '統計', tag: '中位數變化', stem:
      '一組資料為 ' + data.join('、') + '（共 5 筆）。若再「任意加入一筆」資料（數值不限），使其變成 6 筆，則新資料的「中位數」' + (askMax ? '最大' : '最小') + '可能是多少？',
      svg: null, options: res.options, answer: res.answer,
      solution: '原排序：' + sorted.join('、') + '。\n加入第 6 筆後，中位數 = 排序後第 3、4 個數的平均。\n' +
        (askMax
          ? '想讓中位數最大：加入一個「夠大」的數（≥ ' + sorted[3] + '），此時第 3、4 個數固定為 ' + sorted[2] + '、' + sorted[3] + '，中位數 = (' + sorted[2] + '+' + sorted[3] + ')÷2 = ' + numStr(maxMed) + '。再大也不會變（中位數會「卡住」）。'
          : '想讓中位數最小：加入一個「夠小」的數（≤ ' + sorted[1] + '），此時第 3、4 個數固定為 ' + sorted[1] + '、' + sorted[2] + '，中位數 = (' + sorted[1] + '+' + sorted[2] + ')÷2 = ' + numStr(minMed) + '。') +
        '\n(關鍵：中位數不像平均數，加入極端值後會「卡」在某個值，不會無限變大/變小。)' };
  }

  // (10) 平均數＝中位數 反求未知數（挑戰級，需控制 x 的排序位置）
  function genStatConstraint() {
    // 構造 5 筆：兩個比 x 小、兩個比 x 大，使 x 為中位數；令平均 = x → x = (其餘四數和)/4
    let lo1, lo2, hi1, hi2, x, guard = 0;
    do {
      x = randInt(20, 80);
      lo1 = x - randInt(2, 12); lo2 = x - randInt(2, 12);
      hi1 = x + randInt(2, 12); hi2 = x + randInt(2, 12);
      guard++;
    } while ((lo1 + lo2 + hi1 + hi2) !== 4 * x && guard < 400);
    if ((lo1 + lo2 + hi1 + hi2) !== 4 * x) { // 後備：直接令對稱
      const d = randInt(2, 10); lo1 = x - d; hi1 = x + d; lo2 = x - 3; hi2 = x + 3;
    }
    const shown = shuffle([lo1, lo2, hi1, hi2]);
    const stem = '一組 5 筆資料為 ' + shown.join('、') + '、x（x 為整數，且 ' + Math.max(lo1, lo2) + ' < x < ' + Math.min(hi1, hi2) + '）。\n若這組資料的「平均數恰好等於中位數」，求 x。';
    const correct = String(x);
    const distract = [String(Math.round((lo1 + lo2 + hi1 + hi2 + x) / 5 / 1)), String(x + 2), String(x - 2), numStr((lo1 + lo2 + hi1 + hi2) / 4 + 1)];
    const res = buildChoices(correct, distract, numFiller(x));
    return { topic: '統計', tag: '平均=中位反求', stem, svg: null, options: res.options, answer: res.answer,
      solution: '因 ' + Math.max(lo1, lo2) + ' < x < ' + Math.min(hi1, hi2) + '，排序後 x 在正中間 → 中位數 = x。\n令平均數 = x：(' + lo1 + '+' + lo2 + '+' + hi1 + '+' + hi2 + '+x) ÷ 5 = x\n→ ' + (lo1 + lo2 + hi1 + hi2) + ' + x = 5x → 4x = ' + (lo1 + lo2 + hi1 + hi2) + ' → x = ' + x + '。' };
  }

  // (11) 反向合併平均：已知合併平均，求另一班人數（挑戰級）
  function genCombineReverse() {
    let n1, n2, a1, a2, avg, guard = 0;
    do {
      n1 = randInt(20, 40); n2 = randInt(10, 40);
      a1 = randInt(70, 90); a2 = randInt(60, 88);
      if (a1 === a2) a2 += 3;
      avg = (n1 * a1 + n2 * a2) / (n1 + n2);
      guard++;
    } while (!Number.isInteger(avg) && guard < 500);
    if (!Number.isInteger(avg)) return genCombineReverse();
    const stem = '甲班 ' + n1 + ' 人，數學平均 ' + a1 + ' 分；乙班平均 ' + a2 + ' 分。\n兩班合併後共同的平均為 ' + avg + ' 分。求「乙班」有幾人？';
    const correct = String(n2);
    const distract = [String(n1), String(n2 + 2), String(n2 - 2), String(n1 + n2)].filter(s => s !== correct);
    const res = buildChoices(correct, distract, numFiller(n2));
    return { topic: '統計', tag: '反求人數', stem, svg: null, options: res.options, answer: res.answer,
      solution: '設乙班 x 人：(' + n1 + '×' + a1 + ' + x×' + a2 + ') ÷ (' + n1 + ' + x) = ' + avg + '\n→ ' + (n1 * a1) + ' + ' + a2 + 'x = ' + avg + '(' + n1 + ' + x)\n→ 解得 x = ' + n2 + ' 人。\n(挑戰點：未知數在分母，需移項解一元一次方程式。)' };
  }

  // (12) 改動一筆資料後的新平均（挑戰級）
  function genChangeOneValue() {
    const n = choice([5, 6, 8]);
    const oldAvg = randInt(60, 85);
    const oldVal = randInt(40, 70);
    const newVal = oldVal + choice([10, 15, 20, -10, -15]);
    const newAvg = oldAvg + (newVal - oldVal) / n;
    if (!Number.isInteger(newAvg)) return genChangeOneValue();
    const stem = '某 ' + n + ' 筆資料的平均數為 ' + oldAvg + '。若把其中一筆資料由 ' + oldVal + ' 改成 ' + newVal + '（其餘不變），則新的平均數為何？';
    const correct = String(newAvg);
    const distract = [String(oldAvg + (newVal - oldVal)), String(oldAvg), String(newAvg + 1)].filter(s => s !== correct);
    const res = buildChoices(correct, distract, numFiller(newAvg));
    return { topic: '統計', tag: '改值求新平均', stem, svg: null, options: res.options, answer: res.answer,
      solution: '總和改變 = ' + newVal + ' − ' + oldVal + ' = ' + (newVal - oldVal) + '。\n平均改變 = 總和改變 ÷ 個數 = ' + (newVal - oldVal) + ' ÷ ' + n + ' = ' + numStr((newVal - oldVal) / n) + '。\n新平均 = ' + oldAvg + ' + (' + numStr((newVal - oldVal) / n) + ') = ' + newAvg + '。\n(陷阱：平均只改變「差÷個數」，不是直接加上差 ' + (newVal - oldVal) + '。)' };
  }

  const STAT_GENS = [genMean, genMedian, genMode, genMissingMean, genWeighted, genFreqTable, genOutlierConcept, genCombineMean, genAddDataMedian, genStatConstraint, genCombineReverse, genChangeOneValue];

  /* =====================================================================
     主題三：幾何圖形 (角度、平行線、三角形、多邊形、立體圖形)
     ===================================================================== */

  // (1) 餘角/補角
  function genCompSupp() {
    // 一角的補角 = k 倍餘角 + e  (求此角)
    let x, k, e, type;
    let guard = 0;
    do {
      k = choice([2, 3, 4]); e = choice([0, 5, 10, 15, 20, -10, -5]);
      // 180 - x = k(90 - x) + e  => 180 - x = 90k - kx + e => (k-1)x = 90k + e - 180 => x = (90k+e-180)/(k-1)
      x = (90 * k + e - 180) / (k - 1);
      guard++;
    } while ((!Number.isInteger(x) || x <= 0 || x >= 90) && guard < 60);
    if (!Number.isInteger(x) || x <= 0 || x >= 90) { x = 50; k = 3; e = 10; }
    const eStr = e === 0 ? '' : (e > 0 ? ' 多 ' + e + '°' : ' 少 ' + (-e) + '°');
    const stem = '已知一個角的「補角」是它的「餘角」的 ' + k + ' 倍' + eStr + '，求這個角的度數。';
    const supp = 180 - x, comp = 90 - x;
    const res = buildChoices(x + '°', [supp + '°', comp + '°', (90 - x + 10) + '°'], (g) => { const o = [5, -5, 10, -10]; if (g >= o.length) return null; return (x + o[g]) + '°'; });
    return { topic: '幾何', tag: '餘角補角', stem, svg: null, options: res.options, answer: res.answer,
      solution: '設此角為 x°，補角 = (180 - x)°，餘角 = (90 - x)°。\n依題意 180 - x = ' + k + '(90 - x)' + (e ? (e > 0 ? ' + ' + e : ' - ' + (-e)) : '') +
        ' → 解得 x = ' + x + '°。\n(陷阱：補角和為 180°、餘角和為 90°，別弄反。)' };
  }

  // (2) 對頂角 / 鄰補角
  function genVerticalAngle() {
    const type = choice(['vertical', 'adjacent']);
    if (type === 'vertical') {
      // (a x + b)° 與其對頂角 (c x + d)° 相等
      let a, b, c, d, x, ang;
      let guard = 0;
      do {
        a = randInt(2, 6); c = randInt(2, 6); b = randInt(0, 40); d = randInt(0, 40);
        if (a === c) c++;
        x = (d - b) / (a - c);
        ang = a * x + b;
        guard++;
      } while ((!Number.isInteger(x) || ang <= 0 || ang >= 180) && guard < 60);
      if (!Number.isInteger(x) || ang <= 0 || ang >= 180) { a = 3; b = 10; c = 2; d = 30; x = 20; ang = 70; }
      const stem = '兩直線相交於一點。其中一個角為 (' + a + 'x + ' + b + ')°，它的「對頂角」為 (' + c + 'x + ' + d + ')°。求 x 的值。';
      const res = buildChoices(String(x), [String(ang), String(x + 2), String(x - 2)], numFiller(x));
      return { topic: '幾何', tag: '對頂角', stem, svg: null, options: res.options, answer: res.answer,
        solution: '對頂角相等：' + a + 'x + ' + b + ' = ' + c + 'x + ' + d + ' → x = ' + x + '。\n(注意：題目問 x，不是問角度 ' + ang + '°。)' };
    }
    // 鄰補角：兩角和 180
    let a, b, c, d, x;
    let guard = 0;
    do {
      a = randInt(2, 5); c = randInt(1, 5); b = randInt(0, 30); d = randInt(0, 30);
      x = (180 - b - d) / (a + c);
      guard++;
    } while ((!Number.isInteger(x) || x <= 0 || a * x + b <= 0 || a * x + b >= 180) && guard < 60);
    if (!Number.isInteger(x)) { a = 3; b = 10; c = 2; d = 20; x = 30; }
    const ang1 = a * x + b;
    const stem = '一直線上有兩個鄰角（互為鄰補角），分別為 (' + a + 'x + ' + b + ')° 與 (' + c + 'x + ' + d + ')°。求較大角的度數。';
    const ang2 = c * x + d;
    const bigger = Math.max(ang1, ang2);
    const res = buildChoices(bigger + '°', [Math.min(ang1, ang2) + '°', x + '°', (bigger + 10) + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (bigger + o[g]) + '°'; });
    return { topic: '幾何', tag: '鄰補角', stem, svg: null, options: res.options, answer: res.answer,
      solution: '鄰補角和為 180°：(' + a + 'x + ' + b + ') + (' + c + 'x + ' + d + ') = 180 → x = ' + x + '。\n兩角為 ' + ang1 + '° 與 ' + ang2 + '°，較大角為 ' + bigger + '°。' };
  }

  // (3) 平行線截角
  function parallelSVG(topLabel, botLabel) {
    // 兩水平平行線 + 一斜截線，標示上下兩角
    const W = 240, H = 130;
    const y1 = 35, y2 = 95;
    // 斜線從左下到右上
    const x1 = 50, x2 = 200;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<line x1="10" y1="${y1}" x2="230" y2="${y1}" stroke="#475569" stroke-width="2"/>` +
      `<line x1="10" y1="${y2}" x2="230" y2="${y2}" stroke="#475569" stroke-width="2"/>` +
      `<line x1="${x1}" y1="${y2 + 22}" x2="${x2}" y2="${y1 - 22}" stroke="#1d4ed8" stroke-width="2"/>` +
      `<text x="6" y="${y1 - 4}" font-size="12" fill="#475569">L₁</text>` +
      `<text x="6" y="${y2 - 4}" font-size="12" fill="#475569">L₂</text>` +
      `<text x="150" y="${y1 + 16}" font-size="12" fill="#1d4ed8">${topLabel}</text>` +
      `<text x="92" y="${y2 - 6}" font-size="12" fill="#1d4ed8">${botLabel}</text>` +
      `<text x="125" y="${(y1 + y2) / 2 + 4}" font-size="11" fill="#64748b">L₁∥L₂</text></svg>`;
  }
  function genParallelCut() {
    const type = choice(['alt', 'coint', 'corr']);
    let x, ang;
    if (type === 'coint') {
      // 同旁內角互補 (a x + b) + (c x + d) = 180
      let a, b, c, d, guard = 0;
      do { a = randInt(2, 5); c = randInt(1, 4); b = randInt(0, 30); d = randInt(0, 30); x = (180 - b - d) / (a + c); guard++; }
      while ((!Number.isInteger(x) || a * x + b <= 0 || a * x + b >= 180) && guard < 60);
      if (!Number.isInteger(x)) { a = 3; b = 20; c = 2; d = 10; x = 30; }
      ang = a * x + b;
      const stem = '如圖，L₁∥L₂，被一直線所截。已知一對「同旁內角」分別為 (' + a + 'x + ' + b + ')° 與 (' + c + 'x + ' + d + ')°，求 x。';
      const res = buildChoices(String(x), [String(ang), String((180 - 2 * b) / (2 * a) | 0), String(x + 3)], numFiller(x));
      return { topic: '幾何', tag: '平行線-同旁內角', stem, svg: parallelSVG('(' + a + 'x+' + b + ')°', '(' + c + 'x+' + d + ')°'), options: res.options, answer: res.answer,
        solution: '兩平行線被截，同旁內角「互補」（和為 180°）：(' + a + 'x+' + b + ') + (' + c + 'x+' + d + ') = 180 → x = ' + x + '。' };
    }
    // 內錯角 / 同位角相等
    let a, b, c, d, guard = 0;
    do { a = randInt(2, 6); c = randInt(2, 6); if (a === c) c++; b = randInt(0, 40); d = randInt(0, 40); x = (d - b) / (a - c); ang = a * x + b; guard++; }
    while ((!Number.isInteger(x) || ang <= 0 || ang >= 180) && guard < 60);
    if (!Number.isInteger(x) || ang <= 0 || ang >= 180) { a = 4; b = 10; c = 2; d = 50; x = 20; ang = 90; }
    const name = type === 'alt' ? '內錯角' : '同位角';
    const stem = '如圖，L₁∥L₂，被一直線所截。已知一對「' + name + '」分別為 (' + a + 'x + ' + b + ')° 與 (' + c + 'x + ' + d + ')°，求這個角的度數。';
    const res = buildChoices(ang + '°', [x + '°', (180 - ang) + '°', (ang + 10) + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (ang + o[g]) + '°'; });
    return { topic: '幾何', tag: '平行線-' + name, stem, svg: parallelSVG('(' + a + 'x+' + b + ')°', '(' + c + 'x+' + d + ')°'), options: res.options, answer: res.answer,
      solution: '兩平行線被截，' + name + '「相等」：' + a + 'x+' + b + ' = ' + c + 'x+' + d + ' → x = ' + x + '，角度 = ' + ang + '°。' };
  }

  // (4) 平行線轉折(拐點)問題
  function zigzagSVG(alpha, beta) {
    const W = 240, H = 140, y1 = 30, y2 = 110;
    const Px = 70, Py = 70; // 轉折點(凸向左)
    const Ax = 200, Bx = 200;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
      `<line x1="20" y1="${y1}" x2="220" y2="${y1}" stroke="#475569" stroke-width="2"/>` +
      `<line x1="20" y1="${y2}" x2="220" y2="${y2}" stroke="#475569" stroke-width="2"/>` +
      `<line x1="${Px}" y1="${Py}" x2="${Ax}" y2="${y1}" stroke="#1d4ed8" stroke-width="2"/>` +
      `<line x1="${Px}" y1="${Py}" x2="${Bx}" y2="${y2}" stroke="#1d4ed8" stroke-width="2"/>` +
      `<circle cx="${Px}" cy="${Py}" r="3" fill="#dc2626"/>` +
      `<text x="6" y="${y1 + 4}" font-size="12" fill="#475569">L₁</text>` +
      `<text x="6" y="${y2 + 4}" font-size="12" fill="#475569">L₂</text>` +
      `<text x="${Ax - 60}" y="${y1 + 16}" font-size="12" fill="#1d4ed8">${alpha}°</text>` +
      `<text x="${Bx - 60}" y="${y2 - 6}" font-size="12" fill="#1d4ed8">${beta}°</text>` +
      `<text x="${Px - 8}" y="${Py - 6}" font-size="12" fill="#dc2626">P</text>` +
      `<text x="120" y="${(y1 + y2) / 2}" font-size="11" fill="#64748b">L₁∥L₂</text></svg>`;
  }
  function genZigzag() {
    const alpha = randInt(25, 65), beta = randInt(25, 65);
    const ans = alpha + beta;
    const stem = '如圖，L₁∥L₂，P 為兩平行線之間的一點。已知 P 點向右上連到 L₁ 的直線與 L₁ 夾角為 ' + alpha +
      '°，P 點向右下連到 L₂ 的直線與 L₂ 夾角為 ' + beta + '°。求 ∠P（即在 P 點的轉折角）的度數。';
    const res = buildChoices(ans + '°', [Math.abs(alpha - beta) + '°', (180 - ans) + '°', (360 - ans) + '°'], (g) => { const o = [5, -5, 10, -10]; if (g >= o.length) return null; return (ans + o[g]) + '°'; });
    return { topic: '幾何', tag: '平行線-轉折', stem, svg: zigzagSVG(alpha, beta), options: res.options, answer: res.answer,
      solution: '過 P 作一條平行於 L₁、L₂ 的輔助線，將 ∠P 分成上下兩部分。\n上半 = ' + alpha + '°（與上方角為內錯角），下半 = ' + beta + '°（與下方角為內錯角）。\n所以 ∠P = ' + alpha + '° + ' + beta + '° = ' + ans + '°。' };
  }

  // (5) 三角形內角/外角
  function genTriangleAngle() {
    const type = choice(['ratio', 'exterior', 'twoangle']);
    if (type === 'ratio') {
      const r = shuffle([randInt(1, 4), randInt(2, 5), randInt(3, 6)]);
      const g = r.reduce((a, b) => gcd(a, b));
      const rr = r.map(v => v / g);
      const tot = sum(rr);
      if (180 % tot !== 0) return genTriangleAngle();
      const unit = 180 / tot;
      const angs = rr.map(v => v * unit);
      const mx = Math.max(...angs);
      const stem = '一個三角形三內角的度數比為 ' + rr.join(' : ') + '，求最大內角的度數。';
      const res = buildChoices(mx + '°', [Math.min(...angs) + '°', (mx + unit) + '°', numStr(180 / 3) + '°'], (g2) => { const o = [unit, -unit, 2 * unit]; if (g2 >= o.length) return null; return (mx + o[g2]) + '°'; });
      return { topic: '幾何', tag: '三角形-內角比', stem, svg: null, options: res.options, answer: res.answer,
        solution: '三內角和 = 180°。比為 ' + rr.join(':') + '，共 ' + tot + ' 份，每份 ' + unit + '°。\n三角為 ' + angs.join('°、') + '°，最大為 ' + mx + '°。' };
    }
    if (type === 'exterior') {
      const a = randInt(40, 75), b = randInt(40, 75);
      const ext = a + b;
      const stem = '三角形 ABC 中，∠A = ' + a + '°，∠B = ' + b + '°，求頂點 C 的「外角」度數。';
      const res = buildChoices(ext + '°', [(180 - ext) + '°', (180 - a) + '°', a + b + 10 + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (ext + o[g]) + '°'; });
      return { topic: '幾何', tag: '三角形-外角', stem, svg: null, options: res.options, answer: res.answer,
        solution: '三角形的「外角 = 兩個不相鄰內角的和」。\n∠C 的外角 = ∠A + ∠B = ' + a + '° + ' + b + '° = ' + ext + '°。\n(陷阱：不是 180-∠C 之外再減，而是直接等於另兩內角和。)' };
    }
    // 等腰三角形求頂角/底角
    const isVertex = choice([true, false]);
    if (isVertex) {
      const base = randInt(40, 75);
      const vertex = 180 - 2 * base;
      if (vertex <= 0) return genTriangleAngle();
      const stem = '等腰三角形的一個「底角」為 ' + base + '°，求「頂角」的度數。';
      const res = buildChoices(vertex + '°', [base + '°', (180 - base) + '°', (90 - base) + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (vertex + o[g]) + '°'; });
      return { topic: '幾何', tag: '等腰三角形', stem, svg: null, options: res.options, answer: res.answer,
        solution: '等腰三角形兩底角相等。頂角 = 180° - 2×底角 = 180° - 2×' + base + '° = ' + vertex + '°。' };
    }
    const vertex = randInt(30, 100);
    const base = (180 - vertex) / 2;
    if (!Number.isInteger(base)) return genTriangleAngle();
    const stem = '等腰三角形的「頂角」為 ' + vertex + '°，求每一個「底角」的度數。';
    const res = buildChoices(base + '°', [vertex + '°', (180 - vertex) + '°', (90 - vertex) + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (base + o[g]) + '°'; });
    return { topic: '幾何', tag: '等腰三角形', stem, svg: null, options: res.options, answer: res.answer,
      solution: '兩底角相等，底角 = (180° - 頂角) ÷ 2 = (180° - ' + vertex + '°) ÷ 2 = ' + base + '°。' };
  }

  // (6) 多邊形內外角
  function genPolygonAngle() {
    const type = choice(['interiorSum', 'eachInterior', 'findN_ext', 'findN_int']);
    const n = choice([5, 6, 8, 9, 10, 12]);
    if (type === 'interiorSum') {
      const s = (n - 2) * 180;
      const stem = '一個 ' + n + ' 邊形（凸多邊形）的「內角和」為幾度？';
      const res = buildChoices(s + '°', [(n * 180) + '°', ((n - 1) * 180) + '°', '360°'], (g) => { const o = [180, -180]; if (g >= o.length) return null; return (s + o[g]) + '°'; });
      return { topic: '幾何', tag: '多邊形-內角和', stem, svg: null, options: res.options, answer: res.answer,
        solution: 'n 邊形內角和 = (n - 2) × 180° = (' + n + ' - 2) × 180° = ' + s + '°。' };
    }
    if (type === 'eachInterior') {
      const each = (n - 2) * 180 / n;
      if (!Number.isInteger(each)) return genPolygonAngle();
      const stem = '正 ' + n + ' 邊形的「每一個內角」為幾度？';
      const ext = 360 / n;
      const res = buildChoices(each + '°', [ext + '°', ((n - 2) * 180) + '°', (180 - each + 5) + '°'], (g) => { const o = [5, -5, 10]; if (g >= o.length) return null; return (each + o[g]) + '°'; });
      return { topic: '幾何', tag: '正多邊形-內角', stem, svg: null, options: res.options, answer: res.answer,
        solution: '正 n 邊形每一外角 = 360°/n = ' + ext + '°，每一內角 = 180° - ' + ext + '° = ' + each + '°。' };
    }
    if (type === 'findN_ext') {
      const each = 360 / n;
      if (!Number.isInteger(each)) return genPolygonAngle();
      const stem = '一個正多邊形的「每一個外角」為 ' + each + '°，求它是幾邊形？';
      const res = buildChoices(String(n), [String(n + 1), String(n - 1), String(Math.round(180 / each))], numFiller(n));
      return { topic: '幾何', tag: '正多邊形-求邊數', stem, svg: null, options: res.options, answer: res.answer,
        solution: '正多邊形外角和恆為 360°，邊數 n = 360° ÷ 每一外角 = 360° ÷ ' + each + '° = ' + n + '（邊形）。' };
    }
    const each = (n - 2) * 180 / n;
    if (!Number.isInteger(each)) return genPolygonAngle();
    const stem = '一個正多邊形的「每一個內角」為 ' + each + '°，求它是幾邊形？';
    const res = buildChoices(String(n), [String(n + 1), String(n - 1), String(Math.round(360 / (180 - each)) + 1)], numFiller(n));
    return { topic: '幾何', tag: '正多邊形-求邊數', stem, svg: null, options: res.options, answer: res.answer,
      solution: '每一外角 = 180° - ' + each + '° = ' + (180 - each) + '°，邊數 n = 360° ÷ ' + (180 - each) + '° = ' + n + '。' };
  }

  // (7) 立體圖形 頂點/邊/面 與尤拉公式
  function genSolidCount() {
    const kind = choice(['prism', 'pyramid', 'euler', 'roundsolid']);
    if (kind === 'prism') {
      const n = choice([3, 4, 5, 6, 8]);
      const ask = choice(['頂點', '邊', '面']);
      const V = 2 * n, E = 3 * n, F = n + 2;
      const val = ask === '頂點' ? V : ask === '邊' ? E : F;
      const stem = '一個「' + n + '角柱」共有幾個「' + ask + '」？';
      const res = buildChoices(String(val), [String(ask === '頂點' ? n : ask === '邊' ? 2 * n : n), String(val + n), String(val - n)], numFiller(val));
      return { topic: '幾何', tag: '角柱', stem, svg: null, options: res.options, answer: res.answer,
        solution: 'n 角柱：頂點 = 2n、邊 = 3n、面 = n + 2。\n' + n + ' 角柱 → 頂點 ' + V + '、邊 ' + E + '、面 ' + F + '。本題「' + ask + '」= ' + val + '。' };
    }
    if (kind === 'pyramid') {
      const n = choice([3, 4, 5, 6, 8]);
      const ask = choice(['頂點', '邊', '面']);
      const V = n + 1, E = 2 * n, F = n + 1;
      const val = ask === '頂點' ? V : ask === '邊' ? E : F;
      const stem = '一個「' + n + '角錐」共有幾個「' + ask + '」？';
      const res = buildChoices(String(val), [String(n), String(val + 1), String(val - 1)], numFiller(val));
      return { topic: '幾何', tag: '角錐', stem, svg: null, options: res.options, answer: res.answer,
        solution: 'n 角錐：頂點 = n + 1、邊 = 2n、面 = n + 1。\n' + n + ' 角錐 → 頂點 ' + V + '、邊 ' + E + '、面 ' + F + '。本題「' + ask + '」= ' + val + '。' };
    }
    if (kind === 'euler') {
      const n = choice([4, 5, 6, 8]);
      const isPrism = choice([true, false]);
      const V = isPrism ? 2 * n : n + 1;
      const E = isPrism ? 3 * n : 2 * n;
      const F = isPrism ? n + 2 : n + 1;
      // 給 V,F 求 E (用尤拉公式 V - E + F = 2)
      const stem = '某凸多面體有 ' + V + ' 個頂點、' + F + ' 個面。根據尤拉公式（頂點數 − 邊數 + 面數 = 2），求它的「邊數」。';
      const res = buildChoices(String(E), [String(V + F), String(E + 2), String(E - 2)], numFiller(E));
      return { topic: '幾何', tag: '尤拉公式', stem, svg: null, options: res.options, answer: res.answer,
        solution: '尤拉公式：V − E + F = 2 → E = V + F − 2 = ' + V + ' + ' + F + ' − 2 = ' + E + '。' };
    }
    // 圓柱/圓錐/球 面數
    const obj = choice([['圓柱', 3], ['圓錐', 2], ['球', 1]]);
    const stem = '一個「' + obj[0] + '」共有幾個面？（含平面與曲面）';
    const map = { '圓柱': '上下兩個圓形平面 + 1 個曲面 = 3 個面', '圓錐': '1 個圓形底面 + 1 個曲面 = 2 個面', '球': '只有 1 個曲面 = 1 個面' };
    const res = buildChoices(String(obj[1]), [String(obj[1] + 1), String(obj[1] - 1 < 0 ? obj[1] + 2 : obj[1] - 1), String(obj[1] + 2)], numFiller(obj[1]));
    return { topic: '幾何', tag: '曲面立體', stem, svg: null, options: res.options, answer: res.answer,
      solution: obj[0] + '：' + map[obj[0]] + '。' };
  }

  // (8) 正方體展開圖 — 相對面
  function genCubeNet() {
    // 十字展開圖位置 (row,col)，標上 6 個字母
    const letters = shuffle(['甲', '乙', '丙', '丁', '戊', '己']);
    // 十字：
    //        [0]
    //   [1] [2] [3]
    //        [4]
    //        [5]
    // 相對面對：在此十字中，2 與 5 相對、1 與 3 相對、0 與 4 相對
    const layout = [
      { r: 0, c: 1, i: 0 }, { r: 1, c: 0, i: 1 }, { r: 1, c: 1, i: 2 },
      { r: 1, c: 2, i: 3 }, { r: 2, c: 1, i: 4 }, { r: 3, c: 1, i: 5 }
    ];
    const opposite = { 0: 4, 4: 0, 1: 3, 3: 1, 2: 5, 5: 2 };
    const cells = [];
    for (let r = 0; r < 4; r++) { cells.push([]); for (let c = 0; c < 3; c++) cells[r].push(null); }
    layout.forEach(p => cells[p.r][p.c] = letters[p.i]);
    // SVG
    const s = 34, pad = 6, W = 3 * s + 2 * pad, H = 4 * s + 2 * pad;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      if (cells[r][c] === null) continue;
      const x = pad + c * s, y = pad + r * s;
      svg += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.5"/>`;
      svg += `<text x="${x + s / 2}" y="${y + s / 2 + 5}" font-size="16" text-anchor="middle" fill="#1e3a8a">${cells[r][c]}</text>`;
    }
    svg += '</svg>';
    const qi = randInt(0, 5);
    const ansI = opposite[qi];
    const qLetter = letters[qi], ansLetter = letters[ansI];
    const others = [0, 1, 2, 3, 4, 5].filter(i => i !== qi && i !== ansI).map(i => letters[i]);
    const stem = '下圖是一個正方體的展開圖。當它摺成正方體後，與「' + qLetter + '」面「相對（平行）」的是哪一個面？';
    const res = buildChoices(ansLetter, shuffle(others).slice(0, 3));
    return { topic: '幾何', tag: '展開圖-相對面', stem, svg, options: res.options, answer: res.answer,
      solution: '在十字形展開圖中，「相鄰」的面摺起來會相交，「隔一格或在十字兩端」的面才會相對。\n摺合後與 ' + qLetter + ' 相對的面為 ' + ansLetter + '。' };
  }

  // (9) 多邊形反向／綜合（挑戰級）
  function genPolygonReverse() {
    const type = choice(['intExtRatio', 'intToDiagonal']);
    if (type === 'intExtRatio') {
      // 每一內角 = 每一外角的 k 倍 → 外角 = 180/(k+1)，n = 360/外角 = 2(k+1)
      const k = choice([2, 3, 4, 5, 8]);
      const ext = 180 / (k + 1);
      const n = 360 / ext;
      if (!Number.isInteger(n)) return genPolygonReverse();
      const stem = '一個正多邊形的「每一個內角」恰好是「每一個外角」的 ' + k + ' 倍，求這個正多邊形的邊數。';
      const res = buildChoices(String(n), [String(2 * k), String(k + 1), String(n + 2)], numFiller(n));
      return { topic: '幾何', tag: '多邊形-反求(綜合)', stem, svg: null, options: res.options, answer: res.answer,
        solution: '內角 + 外角 = 180°，且內角 = ' + k + '×外角 → ' + k + '×外角 + 外角 = 180° → 外角 = 180°/' + (k + 1) + ' = ' + ext + '°。\n邊數 n = 360° ÷ 外角 = 360° ÷ ' + ext + '° = ' + n + '。' };
    }
    // 由每一內角求邊數，再求對角線總數 n(n-3)/2
    const n = choice([5, 6, 8, 9, 10, 12]);
    const each = (n - 2) * 180 / n;
    if (!Number.isInteger(each)) return genPolygonReverse();
    const diag = n * (n - 3) / 2;
    const stem = '一個正多邊形每一個內角為 ' + each + '°。求此多邊形「對角線的總條數」。';
    const res = buildChoices(String(diag), [String(n), String(n * (n - 3)), String(diag + n)], numFiller(diag));
    return { topic: '幾何', tag: '多邊形-反求(綜合)', stem, svg: null, options: res.options, answer: res.answer,
      solution: '先求邊數：外角 = 180° − ' + each + '° = ' + (180 - each) + '°，n = 360°÷' + (180 - each) + '° = ' + n + '。\n再求對角線：n(n−3)/2 = ' + n + '×' + (n - 3) + '÷2 = ' + diag + ' 條。' };
  }

  // (10) 多面體面數×邊數 與尤拉公式綜合（挑戰級）
  function genSolidHarder() {
    const solids = [
      { name: '正四面體', F: 4, p: 3 }, { name: '正八面體', F: 8, p: 3 },
      { name: '正十二面體', F: 12, p: 5 }, { name: '正二十面體', F: 20, p: 3 }
    ];
    const s = choice(solids);
    const E = s.F * s.p / 2;
    const V = E - s.F + 2; // 尤拉公式
    const ask = choice(['edge', 'vertex']);
    if (ask === 'edge') {
      const stem = '一個多面體共有 ' + s.F + ' 個面，且每一個面都是正 ' + s.p + ' 邊形（即「' + s.name + '」）。求它的「邊數」。';
      const res = buildChoices(String(E), [String(s.F * s.p), String(E + s.F), String(s.F + s.p)], numFiller(E));
      return { topic: '幾何', tag: '多面體-綜合', stem, svg: null, options: res.options, answer: res.answer,
        solution: '每個面有 ' + s.p + ' 條邊，共 ' + s.F + ' 面，但每條邊被「兩個面」共用，故邊數 = ' + s.F + '×' + s.p + ' ÷ 2 = ' + E + '。\n(陷阱：不能直接 ' + s.F + '×' + s.p + '，每條邊算了兩次。)' };
    }
    const stem = '「' + s.name + '」有 ' + s.F + ' 個面，每面都是正 ' + s.p + ' 邊形。求它的「頂點數」。';
    const res = buildChoices(String(V), [String(E), String(s.F), String(V + 2)], numFiller(V));
    return { topic: '幾何', tag: '多面體-綜合', stem, svg: null, options: res.options, answer: res.answer,
      solution: '先求邊數：E = ' + s.F + '×' + s.p + '÷2 = ' + E + '（每邊兩面共用）。\n再用尤拉公式 V − E + F = 2 → V = 2 + ' + E + ' − ' + s.F + ' = ' + V + '。' };
  }

  // (11) 角度多重關係串接（挑戰級）
  function genAngleCombined() {
    const type = choice(['isoExt', 'triExtIso', 'compSuppChain']);
    if (type === 'isoExt') {
      // 等腰三角形頂角的外角 = X，求底角（外角→頂角→底角）
      const base = randInt(40, 75);
      const vertex = 180 - 2 * base;
      if (vertex <= 0) return genAngleCombined();
      const vExt = 180 - vertex;
      const stem = '等腰三角形「頂角的外角」為 ' + vExt + '°，求每一個「底角」的度數。';
      const res = buildChoices(base + '°', [vertex + '°', vExt + '°', (90 - base) + '°'], (g) => { const o = [5, -5, 10]; return g < o.length ? (base + o[g]) + '°' : null; });
      return { topic: '幾何', tag: '角度-綜合', stem, svg: null, options: res.options, answer: res.answer,
        solution: '頂角 = 180° − 頂角外角 = 180° − ' + vExt + '° = ' + vertex + '°。\n底角 = (180° − 頂角) ÷ 2 = (180° − ' + vertex + '°) ÷ 2 = ' + base + '°。\n(需經「外角→頂角→底角」三步。)' };
    }
    if (type === 'triExtIso') {
      // ∠A 的外角 = E，且 ∠B = ∠C，求 ∠B
      const A = randInt(40, 100);
      if ((180 - A) % 2 !== 0) return genAngleCombined();
      const E = 180 - A; const B = (180 - A) / 2;
      const stem = '△ABC 中，∠A 的「外角」為 ' + (180 - A) + '°，且 ∠B = ∠C，求 ∠B 的度數。';
      const res = buildChoices(B + '°', [A + '°', (180 - A) + '°', (90 - B) + '°'], (g) => { const o = [5, -5, 10]; return g < o.length ? (B + o[g]) + '°' : null; });
      return { topic: '幾何', tag: '角度-綜合', stem, svg: null, options: res.options, answer: res.answer,
        solution: '∠A = 180° − 外角 = 180° − ' + (180 - A) + '° = ' + A + '°。\n∠B + ∠C = 180° − ∠A = ' + (180 - A) + '°，又 ∠B = ∠C → ∠B = ' + B + '°。' };
    }
    // 一角的餘角與另一角的補角相等：餘角(90-x) = 補角(180-y)，且 y = 2x，求 x
    const x = randInt(20, 60);
    const y = 2 * x;
    // 設定使 (90 - x) 與 (180 - y) 相等？ 90-x = 180 - y = 180 - 2x → x = 90，不行。改：甲的補角 = 乙的餘角的 2 倍
    // 直接給：甲乙互補，甲是乙的 k 倍，求甲
    const k = choice([2, 3, 4]);
    const yy = 180 / (k + 1);
    if (!Number.isInteger(yy)) return genAngleCombined();
    const big = k * yy;
    const stem = '甲、乙兩角互為「補角」，且甲角是乙角的 ' + k + ' 倍，求甲角的度數。';
    const res = buildChoices(big + '°', [yy + '°', (90 - yy) + '°', (180 - big + 10) + '°'], (g) => { const o = [5, -5, 10]; return g < o.length ? (big + o[g]) + '°' : null; });
    return { topic: '幾何', tag: '角度-綜合', stem, svg: null, options: res.options, answer: res.answer,
      solution: '設乙 = y，甲 = ' + k + 'y，互補 → ' + k + 'y + y = 180° → y = ' + yy + '°，甲 = ' + k + '×' + yy + '° = ' + big + '°。' };
  }

  const GEO_GENS = [genCompSupp, genVerticalAngle, genParallelCut, genZigzag, genTriangleAngle, genPolygonAngle, genSolidCount, genCubeNet, genPolygonReverse, genSolidHarder, genAngleCombined, genAngleCombined];

  /* =====================================================================
     主題四：線對稱與三視圖
     ===================================================================== */

  // ---- 形狀庫(含對稱軸數) ----
  function regPoly(n, cx, cy, r, rotDeg) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (rotDeg + i * 360 / n) * Math.PI / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }
  function polyPath(pts) { return pts.map(p => numStr(p[0]) + ',' + numStr(p[1])).join(' '); }
  function shapeSVG(name, cx, cy, r) {
    const fill = '#dbeafe', stroke = '#1d4ed8';
    const poly = (pts) => `<polygon points="${polyPath(pts)}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    switch (name) {
      case '正三角形': return poly(regPoly(3, cx, cy, r, -90));
      case '正方形': return poly(regPoly(4, cx, cy, r, -45));
      case '正五邊形': return poly(regPoly(5, cx, cy, r, -90));
      case '正六邊形': return poly(regPoly(6, cx, cy, r, -90));
      case '正八邊形': return poly(regPoly(8, cx, cy, r, -90 + 22.5));
      case '長方形': return `<rect x="${cx - r}" y="${cy - r * 0.6}" width="${2 * r}" height="${1.2 * r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      case '等腰三角形': return poly([[cx, cy - r], [cx + r * 0.8, cy + r * 0.7], [cx - r * 0.8, cy + r * 0.7]]);
      case '等腰梯形': return poly([[cx - r * 0.5, cy - r * 0.6], [cx + r * 0.5, cy - r * 0.6], [cx + r, cy + r * 0.6], [cx - r, cy + r * 0.6]]);
      case '平行四邊形': return poly([[cx - r * 0.6, cy - r * 0.5], [cx + r, cy - r * 0.5], [cx + r * 0.6, cy + r * 0.5], [cx - r, cy + r * 0.5]]);
      case '菱形': return poly([[cx, cy - r], [cx + r * 0.7, cy], [cx, cy + r], [cx - r * 0.7, cy]]);
      case '箏形': return poly([[cx, cy - r], [cx + r * 0.6, cy - r * 0.1], [cx, cy + r], [cx - r * 0.6, cy - r * 0.1]]);
      case '圓形': return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
      case '正五角星': {
        const pts = [];
        for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r; const a = (-90 + i * 36) * Math.PI / 180; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
        return poly(pts);
      }
      default: return '';
    }
  }
  const SHAPE_AXES = {
    '正三角形': 3, '正方形': 4, '正五邊形': 5, '正六邊形': 6, '正八邊形': 8,
    '長方形': 2, '等腰三角形': 1, '等腰梯形': 1, '平行四邊形': 0, '菱形': 2,
    '箏形': 1, '圓形': '無限多', '正五角星': 5
  };
  function shapeBox(name) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100" height="100">` + shapeSVG(name, 50, 50, 36) + '</svg>';
  }

  // (1) 數對稱軸
  function genSymCount() {
    const names = Object.keys(SHAPE_AXES).filter(n => n !== '圓形');
    const name = choice(names);
    const ax = SHAPE_AXES[name];
    const stem = '右圖為一個「' + name + '」。它共有幾條「對稱軸」？';
    const correct = String(ax);
    const pool = uniq([0, 1, 2, 3, 4, 5, 6, 8].filter(v => v !== ax)).map(String);
    const res = buildChoices(correct, shuffle(pool).slice(0, 3));
    return { topic: '對稱三視圖', tag: '對稱軸數', stem, svg: shapeBox(name), options: res.options, answer: res.answer,
      solution: name + ' 共有 ' + ax + ' 條對稱軸。\n(提醒：平行四邊形 0 條、長方形與菱形各 2 條、正 n 邊形有 n 條。)' };
  }

  // (2) 哪個圖形恰有 k 條對稱軸 (選項為圖形)
  function genSymWhich() {
    const targets = [0, 1, 2, 3, 4, 5, 6];
    const k = choice(targets);
    const haveK = Object.keys(SHAPE_AXES).filter(n => SHAPE_AXES[n] === k);
    if (!haveK.length) return genSymWhich();
    const correctName = choice(haveK);
    const others = Object.keys(SHAPE_AXES).filter(n => SHAPE_AXES[n] !== k && n !== '圓形');
    const dnames = shuffle(others).slice(0, 3);
    const correctSVG = shapeBox(correctName);
    const res = buildChoices(correctSVG, dnames.map(shapeBox));
    return { topic: '對稱三視圖', tag: '指定對稱軸', stem: '下列哪一個圖形「恰好」有 ' + k + ' 條對稱軸？',
      svg: null, options: res.options, answer: res.answer,
      solution: '答案為「' + correctName + '」，恰有 ' + k + ' 條對稱軸。\n各圖對稱軸數：' + dnames.concat([correctName]).map(n => n + '(' + SHAPE_AXES[n] + ')').join('、') + '。' };
  }

  // (3) 坐標的對稱/反射
  function genReflectCoord() {
    const a = nonZero(-6, 6), b = nonZero(-6, 6);
    const kind = choice(['x', 'y', 'origin', 'yx']);
    const map = {
      'x': { name: 'x 軸', res: [a, -b], desc: '對 x 軸對稱：x 不變、y 變號' },
      'y': { name: 'y 軸', res: [-a, b], desc: '對 y 軸對稱：y 不變、x 變號' },
      'origin': { name: '原點', res: [-a, -b], desc: '對原點對稱：x、y 都變號' },
      'yx': { name: '直線 y = x', res: [b, a], desc: '對 y = x 對稱：x、y 對調' }
    };
    const m = map[kind];
    const pt = (p) => '(' + p[0] + ', ' + p[1] + ')';
    const correct = pt(m.res);
    const distract = [pt([a, b]), pt([-a, -b]), pt([b, a]), pt([-a, b]), pt([a, -b]), pt([b, -a]), pt([-b, a])]
      .filter(s => s !== correct);
    const res = buildChoices(correct, uniq(shuffle(distract)).slice(0, 3),
      (g) => { const o = [[a + 1, b], [a, b + 1], [a - 1, -b], [-a, b - 1]]; return g < o.length ? pt(o[g]) : null; });
    return { topic: '對稱三視圖', tag: '坐標對稱', stem: '坐標平面上有一點 A(' + a + ', ' + b + ')。將 A 對「' + m.name + '」作對稱（鏡射），所得對稱點的坐標為何？',
      svg: null, options: res.options, answer: res.answer,
      solution: m.desc + '。\nA(' + a + ', ' + b + ') → ' + correct + '。' };
  }

  // (4) 格子點線對稱完成圖 (選項為圖形)
  function gridFigureSVG(cells, axisCol, N) {
    // cells: array of [r,c]; 畫 N×N 格，左半填 + 右半填，並畫對稱軸
    const s = 16, pad = 4, W = N * s + 2 * pad, H = N * s + 2 * pad;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const x = pad + c * s, y = pad + r * s;
      const filled = cells.some(p => p[0] === r && p[1] === c);
      svg += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${filled ? '#1d4ed8' : '#f8fafc'}" stroke="#cbd5e1" stroke-width="0.7"/>`;
    }
    const ax = pad + axisCol * s;
    svg += `<line x1="${ax}" y1="0" x2="${ax}" y2="${H}" stroke="#dc2626" stroke-width="2" stroke-dasharray="3,2"/>`;
    svg += '</svg>';
    return svg;
  }
  function genSymGrid() {
    const N = 8, axisCol = 4;
    // 左半 (c < axisCol) 隨機填一些格
    const left = [];
    const ncells = randInt(4, 6);
    let guard = 0;
    while (left.length < ncells && guard < 50) {
      const r = randInt(1, N - 2), c = randInt(1, axisCol - 1);
      if (!left.some(p => p[0] === r && p[1] === c)) left.push([r, c]);
      guard++;
    }
    // 正確：對 axisCol 作鏡射 -> 右半 c' = 2*axisCol - 1 - c
    const reflect = left.map(p => [p[0], 2 * axisCol - 1 - p[1]]);
    const correctCells = left.concat(reflect);
    const correctSVG = gridFigureSVG(correctCells, axisCol, N);
    // 誘答候選：平移(非鏡射)、連 row 也翻、少一格、上下顛倒
    const cellSig = (cells) => cells.map(p => p[0] + ',' + p[1]).sort().join(';');
    const correctSig = cellSig(correctCells);
    const cands = [
      left.concat(left.map(p => [p[0], p[1] + axisCol])),                  // 平移
      left.concat(left.map(p => [N - 1 - p[0], 2 * axisCol - 1 - p[1]])),  // 連列也翻
      left.concat(reflect.slice(1)),                                       // 少一格
      left.concat(reflect.map(p => [N - 1 - p[0], p[1]]))                  // 右側上下顛倒
    ];
    const seen = new Set([correctSig]);
    const distractCells = [];
    for (const c of cands) { const s = cellSig(c); if (!seen.has(s) && c.length) { seen.add(s); distractCells.push(c); } }
    // 保底：微調正解(右側移除/新增一格)以湊滿 3 個不重複誘答
    let guard2 = 0;
    while (distractCells.length < 3 && guard2 < 60) {
      const c = correctCells.slice();
      const r = randInt(1, N - 2), col = randInt(axisCol, N - 1);
      const idx = c.findIndex(p => p[0] === r && p[1] === col);
      if (idx >= 0) c.splice(idx, 1); else c.push([r, col]);
      const s = cellSig(c);
      if (!seen.has(s) && c.length) { seen.add(s); distractCells.push(c); }
      guard2++;
    }
    const res = buildChoices(correctSVG, distractCells.slice(0, 3).map(c => gridFigureSVG(c, axisCol, N)));
    return { topic: '對稱三視圖', tag: '格線對稱', stem: '左圖（紅色虛線左側）為原圖形的一半，紅色虛線為對稱軸。若此圖形為「線對稱圖形」，則完成後的完整圖形應為下列哪一個？',
      svg: gridFigureSVG(left, axisCol, N), options: res.options, answer: res.answer,
      solution: '線對稱：對稱軸兩側的對應點到對稱軸的距離相等、左右鏡射（上下列不變）。\n正確圖是把左側每一格水平翻到右側對應位置，列(row)不變。\n(陷阱：直接「平移」到右邊，或連上下也翻轉，都不是鏡射。)' };
  }

  // ---- 三視圖：堆疊方塊 ----
  // 模型 h[r][c]：r=前後(深度,0=最前), c=左右(0=最左)。
  function makeStack() {
    const R = randInt(2, 3), C = randInt(2, 3);
    let h, total, guard = 0;
    do {
      h = [];
      for (let r = 0; r < R; r++) { h.push([]); for (let c = 0; c < C; c++) h[r].push(randInt(0, 3)); }
      total = h.reduce((s, row) => s + sum(row), 0);
      guard++;
    } while ((total < 4 || total > 12) && guard < 60);
    // 確保至少有一行非零
    if (total === 0) h[0][0] = 2;
    return { h, R, C };
  }
  function frontView(model) { // [c] = max over r
    const { h, R, C } = model; const v = [];
    for (let c = 0; c < C; c++) { let m = 0; for (let r = 0; r < R; r++) m = Math.max(m, h[r][c]); v.push(m); }
    return v; // 長度 C
  }
  function sideView(model) { // 右視圖：[depth y] = max over c ; 前(y=0)在左
    const { h, R, C } = model; const v = [];
    for (let r = 0; r < R; r++) { let m = 0; for (let c = 0; c < C; c++) m = Math.max(m, h[r][c]); v.push(m); }
    return v; // 長度 R
  }
  function topView(model) { // [r][c] footprint
    const { h, R, C } = model; const g = [];
    for (let r = 0; r < R; r++) { g.push([]); for (let c = 0; c < C; c++) g[r].push(h[r][c] > 0 ? 1 : 0); }
    return g;
  }
  // 把「高度輪廓」轉成布林矩陣(由上到下) heights:[每欄高度], maxH
  function profileToGrid(heights, maxH) {
    const g = [];
    for (let rr = 0; rr < maxH; rr++) { g.push([]); for (let c = 0; c < heights.length; c++) g[rr].push((maxH - rr) <= heights[c] ? 1 : 0); }
    return g;
  }
  // 布林矩陣 -> SVG (rows 由上到下)
  function matrixSVG(grid) {
    const rows = grid.length, cols = grid[0].length, s = 18, pad = 4;
    const W = cols * s + 2 * pad, H = rows * s + 2 * pad;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = pad + c * s, y = pad + r * s;
      svg += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${grid[r][c] ? '#1d4ed8' : '#f1f5f9'}" stroke="#94a3b8" stroke-width="0.8"/>`;
    }
    svg += '</svg>';
    return svg;
  }
  function gridKey(grid) { return grid.map(row => row.join('')).join('|'); }
  // 立體堆疊 SVG (等角)
  function stackSVG(model) {
    const { h, R, C } = model;
    const s = 26, dx = 14, dy = 9;
    const polys = [];
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const ox = 40, oy = 150;
    for (let r = R - 1; r >= 0; r--) {
      for (let z = 0; z < 3; z++) {
        for (let c = 0; c < C; c++) {
          if (z >= h[r][c]) continue;
          const bx = ox + c * s + r * dx;
          const by = oy - r * dy - z * s;
          const A = [bx, by], B = [bx + s, by], Cc = [bx + s, by + s], D = [bx, by + s];
          const Ap = [A[0] + dx, A[1] - dy], Bp = [B[0] + dx, B[1] - dy], Cp = [Cc[0] + dx, Cc[1] - dy];
          // 面
          polys.push(`<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${Cc[0]},${Cc[1]} ${D[0]},${D[1]}" fill="#93c5fd" stroke="#1e3a8a" stroke-width="1"/>`);
          polys.push(`<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${Bp[0]},${Bp[1]} ${Ap[0]},${Ap[1]}" fill="#dbeafe" stroke="#1e3a8a" stroke-width="1"/>`);
          polys.push(`<polygon points="${B[0]},${B[1]} ${Cc[0]},${Cc[1]} ${Cp[0]},${Cp[1]} ${Bp[0]},${Bp[1]}" fill="#60a5fa" stroke="#1e3a8a" stroke-width="1"/>`);
          [A, B, Cc, D, Ap, Bp, Cp].forEach(p => { minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
        }
      }
    }
    const pad = 8;
    const W = maxX - minX + 2 * pad, H = maxY - minY + 2 * pad;
    return `<svg viewBox="${minX - pad} ${minY - pad} ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${Math.min(220, W)}" height="${Math.min(180, H)}">` + polys.join('') + '</svg>';
  }
  // 產生與正確矩陣不同的誘答矩陣
  function perturbGrid(grid) {
    const g = grid.map(row => row.slice());
    const rows = g.length, cols = g[0].length;
    const r = randInt(0, rows - 1), c = randInt(0, cols - 1);
    g[r][c] = g[r][c] ? 0 : 1;
    return g;
  }
  function mirrorGrid(grid) { return grid.map(row => row.slice().reverse()); }
  function viewGrid(model, which) {
    if (which === 'front') { const fv = frontView(model); return profileToGrid(fv, Math.max(...fv, 1)); }
    if (which === 'side') { const sv = sideView(model); return profileToGrid(sv, Math.max(...sv, 1)); }
    return topView(model);
  }
  function nonEmptyGrid(g) { return g && g.length && g.some(row => row.some(v => v)); }

  function genThreeView() {
    const model = makeStack();
    const which = choice(['front', 'top', 'side']);
    let correctGrid, label, desc;
    if (which === 'front') {
      const fv = frontView(model); const maxH = Math.max(...fv, 1);
      correctGrid = profileToGrid(fv, maxH);
      label = '前視圖（從正前方看）';
      desc = '前視圖：對每一「直行」取該行最高的方塊數（同一行前後重疊的只算最高）。各行高度 = ' + fv.join('、') + '。';
    } else if (which === 'side') {
      const sv = sideView(model); const maxH = Math.max(...sv, 1);
      correctGrid = profileToGrid(sv, maxH);
      label = '右側視圖（站在右方向左看，最前面的畫在左邊）';
      desc = '側視圖：對每一「前後深度」取最高的方塊數。由前到後高度 = ' + sv.join('、') + '。';
    } else {
      correctGrid = topView(model);
      label = '上視圖（俯視，從正上方往下看；最前排畫在最下面）';
      desc = '上視圖：看「底面的覆蓋範圍（投影輪廓）」，凡有方塊的位置就塗滿（不論高度）。';
    }
    const correctSVG = matrixSVG(correctGrid);
    const seen = new Set([gridKey(correctGrid)]);
    const distractGrids = [];
    let tries = 0;
    // 先以「保持尺寸」的誘答為主：鏡射、微擾；不足時用其他隨機模型的視圖
    while (distractGrids.length < 3 && tries < 250) {
      tries++;
      let g;
      const pick = tries % 4;
      if (pick === 1) g = mirrorGrid(correctGrid);
      else if (pick === 2 || pick === 3) g = perturbGrid(correctGrid);
      else g = viewGrid(makeStack(), which);
      const k = gridKey(g);
      if (!seen.has(k) && nonEmptyGrid(g)) { seen.add(k); distractGrids.push(g); }
    }
    // 保底：加滿一欄（改變寬度，必定為新圖形），保證湊滿 3 個誘答且永不卡住
    let extra = 1;
    while (distractGrids.length < 3 && extra <= 12) {
      const g = correctGrid.map(row => { const r = row.slice(); for (let j = 0; j < extra; j++) r.push(1); return r; });
      const k = gridKey(g);
      if (!seen.has(k) && nonEmptyGrid(g)) { seen.add(k); distractGrids.push(g); }
      extra++;
    }
    const res = buildChoices(correctSVG, distractGrids.map(matrixSVG));
    return { topic: '對稱三視圖', tag: '三視圖-' + which, stem: '右圖為一些「相同的正方體」堆疊而成的立體圖。請問它的「' + label + '」為下列哪一個？',
      svg: stackSVG(model), options: res.options, answer: res.answer, solution: desc };
  }

  // 數方塊個數 / 最少方塊
  function genCubeCount() {
    const model = makeStack();
    const total = model.h.reduce((s, row) => s + sum(row), 0);
    const stem = '右圖為由「相同正方體」堆疊而成的立體圖（沒有懸空的方塊）。請問共用了幾個正方體？';
    const res = buildChoices(String(total), [String(total + 1), String(total - 1), String(total + 2)], numFiller(total));
    return { topic: '對稱三視圖', tag: '數方塊', stem, svg: stackSVG(model), options: res.options, answer: res.answer,
      solution: '逐行(或逐層)數方塊：總共 ' + total + ' 個。\n(技巧：可分層數，或把每一個底面位置的高度相加。)' };
  }

  const SYM_GENS = [genSymCount, genSymWhich, genReflectCoord, genSymGrid, genThreeView, genThreeView, genCubeCount];

  /* =====================================================================
     額外的「挑戰級」題型（多步驟 / 應用 / 反向）
     ===================================================================== */

  // 不等式：多步驟應用（折扣+利潤率 / 混合票價），答案以掃描方式由建構保證正確
  function genIneqWordHard() {
    const t = choice(['profit', 'tickets']);
    if (t === 'profit') {
      const C = choice([200, 300, 400, 500, 600, 800]);
      const dPct = choice([70, 75, 80, 90]);   // 售價 = 標價的 dPct%
      const pPct = choice([10, 15, 20, 25]);   // 利潤 ≥ 成本的 pPct%
      // 條件：dPct/100·x − C ≥ pPct/100·C  ⟺  dPct·x ≥ (100+pPct)·C
      const ok = (x) => dPct * x >= (100 + pPct) * C;
      let xmin = 0; while (!ok(xmin)) xmin++;
      const folded = dPct % 10 === 0 ? (dPct / 10) + ' 折' : (dPct / 10) + ' 折';
      const stem = '一件商品成本為 ' + C + ' 元。店家打算標價後，以「打 ' + (dPct / 10) + ' 折」（即售價為標價的 ' + dPct + '%）出售。\n若希望每件的利潤「不低於成本的 ' + pPct + '%」，則「標價」至少要訂為多少元？（取整數）';
      const wrongNoProfit = Math.ceil(C * 100 / dPct);     // 忘了利潤，只求不虧本
      const res = buildChoices(String(xmin), [String(wrongNoProfit), String(Math.ceil(C * (100 + pPct) / 100)), String(xmin + 1)], numFiller(xmin));
      return { topic: '不等式', tag: '應用-折扣利潤', stem, svg: null, options: res.options, answer: res.answer,
        solution: '設標價 x 元。售價 = ' + dPct + '%·x，利潤 = ' + dPct + '%·x − ' + C + '。\n要利潤 ≥ ' + pPct + '%×成本：' + (dPct / 100) + 'x − ' + C + ' ≥ ' + (pPct / 100) + '×' + C + '\n→ ' + (dPct / 100) + 'x ≥ ' + C + '×' + (1 + pPct / 100) + ' = ' + (C * (100 + pPct) / 100) + ' → x ≥ ' + numStr(C * (100 + pPct) / dPct) + '，故標價至少 ' + xmin + ' 元。\n(陷阱：利潤是對「成本」算百分比，且要先還原折扣。)' };
    }
    const adult = choice([200, 250, 300]), child = choice([100, 120, 150]);
    const more = choice([2, 3, 4]);
    const budget = (adult + child) * choice([6, 8, 10, 12]) + child * more + choice([0, 50, 100]);
    // a 張成人，學生 = a+more，總費用 = adult·a + child·(a+more) ≤ budget
    const cost = (a) => adult * a + child * (a + more);
    let amax = 0; while (cost(amax + 1) <= budget) amax++;
    const stem = '某展覽成人票每張 ' + adult + ' 元、學生票每張 ' + child + ' 元。\n某團體購買的「學生票比成人票多 ' + more + ' 張」，且總花費不超過 ' + budget + ' 元。\n請問最多可以買幾張「成人票」？';
    const wrongIgnoreMore = Math.floor(budget / (adult + child));
    const res = buildChoices(String(amax), [String(wrongIgnoreMore), String(amax + 1), String(amax + more)], numFiller(amax));
    return { topic: '不等式', tag: '應用-混合購買', stem, svg: null, options: res.options, answer: res.answer,
      solution: '設成人票 a 張，學生票 = a + ' + more + ' 張。\n總費用 ' + adult + 'a + ' + child + '(a+' + more + ') = ' + (adult + child) + 'a + ' + (child * more) + ' ≤ ' + budget + '\n→ ' + (adult + child) + 'a ≤ ' + (budget - child * more) + ' → a ≤ ' + numStr((budget - child * more) / (adult + child)) + '，最多 ' + amax + ' 張成人票。' };
  }

  // 三視圖：由「上視圖 + 前視圖」求最少 / 最多方塊（各直行獨立，公式可嚴格證明）
  function cubeMinMax(model) {
    const { h, R, C } = model; const f = frontView(model);
    let mn = 0, mx = 0; const cols = [];
    for (let c = 0; c < C; c++) {
      let occ = 0; for (let r = 0; r < R; r++) if (h[r][c] > 0) occ++;
      if (occ > 0) { cols.push({ c, occ, f: f[c] }); mn += f[c] + occ - 1; mx += occ * f[c]; }
    }
    return { min: mn, max: mx, f, cols };
  }
  function genCubeMinMax() {
    let model, mm, guard = 0;
    do { model = makeStack(); mm = cubeMinMax(model); guard++; }
    while ((mm.min === mm.max || mm.max > 20 || mm.cols.length < 2) && guard < 100);
    const askMin = choice([true, false]);
    const ans = askMin ? mm.min : mm.max;
    const topDisp = topView(model).slice().reverse();           // 前排畫在最下面
    const frontDisp = profileToGrid(mm.f, Math.max(...mm.f, 1));
    const fig = '<div style="display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap">' +
      '<div style="text-align:center"><div style="font-size:12px;color:#475569;margin-bottom:4px">上視圖（俯視）</div>' + matrixSVG(topDisp) + '</div>' +
      '<div style="text-align:center"><div style="font-size:12px;color:#475569;margin-bottom:4px">前視圖</div>' + matrixSVG(frontDisp) + '</div></div>';
    const stem = '某立體由「相同的正方體」堆疊而成（沒有懸空的方塊）。已知它的「上視圖」與「前視圖」如下圖。\n要同時符合這兩個視圖，這個立體「最' + (askMin ? '少' : '多') + '」需要幾個正方體？';
    const totalOcc = mm.cols.reduce((s, x) => s + x.occ, 0);
    const sumF = mm.cols.reduce((s, x) => s + x.f, 0);
    const res = buildChoices(String(ans), [String(askMin ? mm.max : mm.min), String(totalOcc), String(sumF)], numFiller(ans));
    return { topic: '對稱三視圖', tag: '三視圖-最值方塊', stem, svg: fig, options: res.options, answer: res.answer,
      solution: '上視圖告訴我們「哪些位置有方塊」（共有方塊的直行）；前視圖給出「每一直行最高疊幾個」。\n' +
        (askMin
          ? '最少：每一直行只要讓「其中一疊」達到前視圖的高度，其餘有方塊的位置各放 1 個即可。\n最少 = Σ(該行最高高度 + 其餘方塊位置數) = ' + mm.min + ' 個。'
          : '最多：每一直行中「每一個有方塊的位置」都疊到前視圖的最高高度。\n最多 = Σ(該行最高高度 × 該行方塊位置數) = ' + mm.max + ' 個。') +
        '\n(陷阱：兩個視圖無法唯一決定立體，方塊數會落在一個範圍內。)' };
  }

  /* =====================================================================
     主題派發 / 整份試卷（加權：難題權重高；並支援「避免與前一份重複」）
     ===================================================================== */
  // 每個題型給權重，數字越大越常出現。基礎題權重 1、進階 2、挑戰 3~4。
  const TOPICS = {
    '不等式': [[genIneqSolveBasic, 1], [genIneqNumberLine, 1], [genIneqExtremeInt, 2], [genIneqFraction, 2],
      [genIneqIntCount, 3], [genIneqEquivalent, 3], [genIneqWord, 3], [genIneqParam, 3], [genIneqWordHard, 4]],
    '統計': [[genMean, 1], [genOutlierConcept, 1], [genMedian, 2], [genMode, 2], [genMissingMean, 2], [genWeighted, 2], [genCombineMean, 2],
      [genFreqTable, 3], [genChangeOneValue, 3], [genAddDataMedian, 4], [genStatConstraint, 4], [genCombineReverse, 4]],
    '幾何': [[genVerticalAngle, 1], [genTriangleAngle, 1], [genPolygonAngle, 1], [genSolidCount, 1],
      [genCompSupp, 2], [genParallelCut, 2], [genCubeNet, 2],
      [genZigzag, 4], [genPolygonReverse, 4], [genSolidHarder, 4], [genAngleCombined, 4]],
    '對稱三視圖': [[genSymCount, 1], [genReflectCoord, 2], [genSymWhich, 2], [genCubeCount, 2],
      [genThreeView, 3], [genSymGrid, 3], [genCubeMinMax, 4]]
  };
  const TOPIC_LABEL = { '不等式': '一元一次不等式', '統計': '統計（平均數·中位數·眾數）', '幾何': '幾何圖形', '對稱三視圖': '線對稱與三視圖' };

  function weightedPick(pool) {
    const tot = pool.reduce((s, p) => s + p[1], 0);
    let r = Math.random() * tot;
    for (const p of pool) { r -= p[1]; if (r < 0) return p[0]; }
    return pool[pool.length - 1][0];
  }
  // 題目唯一識別鍵：用於「避免與前一份重複」與計算題庫多樣性
  function questionKey(q) { return (q.stem || '') + '||' + (q.options || []).join('|') + '||' + (q.svg || ''); }

  function genOne(topic) {
    const pool = TOPICS[topic];
    let q, guard = 0;
    do { q = weightedPick(pool)(); guard++; } while ((!q || !q.options || q.options.length !== 4) && guard < 25);
    q.topicLabel = TOPIC_LABEL[topic];
    q._key = questionKey(q);
    return q;
  }

  // 一份 20 題，4 主題各 5 題；excludeKeys 內的題目不會再出現（避免與前幾份重複）
  function genTest(excludeKeys) {
    const exclude = excludeKeys instanceof Set ? excludeKeys
      : new Set(Array.isArray(excludeKeys) ? excludeKeys : []);
    const order = ['不等式', '統計', '幾何', '對稱三視圖'];
    const used = new Set();
    const all = [];
    order.forEach(topic => {
      const seenTags = {};
      let made = 0, guard = 0;
      // 主迴圈：避免重複、同題型最多 2 題
      while (made < 5 && guard < 600) {
        guard++;
        const q = genOne(topic); const key = q._key;
        if (exclude.has(key) || used.has(key)) continue;
        if ((seenTags[q.tag] || 0) >= 2) continue;
        seenTags[q.tag] = (seenTags[q.tag] || 0) + 1; used.add(key); all.push(q); made++;
      }
      // 後備：放寬題型限制，但仍避免重複
      while (made < 5 && guard < 1200) {
        guard++;
        const q = genOne(topic); const key = q._key;
        if (exclude.has(key) || used.has(key)) continue;
        used.add(key); all.push(q); made++;
      }
      while (made < 5) { const q = genOne(topic); all.push(q); made++; } // 極端後備
    });
    const byTopic = {};
    all.forEach(q => { (byTopic[q.topic] = byTopic[q.topic] || []).push(q); });
    const mixed = [];
    for (let i = 0; i < 5; i++) order.forEach(t => { if (byTopic[t][i]) mixed.push(byTopic[t][i]); });
    return mixed.map((q, i) => Object.assign(q, { index: i + 1 }));
  }

  const api = { genTest, genOne, questionKey, TOPICS, TOPIC_LABEL,
    // 匯出供測試
    _internal: { solveLinear, satisfy, median, modes, mean, frontView, sideView, topView, makeStack, profileToGrid, gridKey, SHAPE_AXES, buildChoices, numStr, fracStr, cubeMinMax } };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MathGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
