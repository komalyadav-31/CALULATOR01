(() => {
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');

  const buttons = document.querySelectorAll('[data-action]');

  // State
  let current = '0'; // current number being entered
  let acc = null; // accumulated number
  let pendingOp = null; // '+', '-', '*', '/'
  let justEvaluated = false;

  function setError(msg) {
    errorEl.textContent = msg || '';
  }

  function formatNumber(n) {
    if (!Number.isFinite(n)) return 'Error';
    // Avoid floating noise
    const s = String(n);
    if (s.includes('e')) return s;
    return String(Number(s));
  }

  function updateUI() {
    setError('');
    const expr = [];
    if (acc !== null && pendingOp) expr.push(formatNumber(acc), pendingOp);
    if (!justEvaluated) expr.push(current);

    expressionEl.textContent = expr.length ? expr.join(' ') : ' ';
    resultEl.textContent = current === '' ? '0' : current;
  }

  function applyOp(a, op, b) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function inputDigit(d) {
    setError('');

    if (justEvaluated) {
      // starting a new expression after equals
      acc = null;
      pendingOp = null;
      current = d;
      justEvaluated = false;
      updateUI();
      return;
    }

    if (current === '0') {
      current = d;
    } else {
      current += d;
    }
    updateUI();
  }

  function inputDot() {
    setError('');

    if (justEvaluated) {
      acc = null;
      pendingOp = null;
      current = '0.';
      justEvaluated = false;
      updateUI();
      return;
    }

    if (!current.includes('.')) {
      current = current === '' ? '0.' : current + '.';
    }
    updateUI();
  }

  function clearAll() {
    current = '0';
    acc = null;
    pendingOp = null;
    justEvaluated = false;
    setError('');
    updateUI();
  }

  function del() {
    setError('');

    if (justEvaluated) return; // keep result

    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
      if (current === '-' || current === '') current = '0';
    }
    updateUI();
  }

  function chooseOperator(op) {
    setError('');

    const inputVal = Number(current);

    if (acc === null) {
      acc = inputVal;
    } else if (pendingOp && !justEvaluated) {
      const out = applyOp(acc, pendingOp, inputVal);
      if (!Number.isFinite(out)) {
        current = '0';
        acc = null;
        pendingOp = null;
        justEvaluated = false;
        setError('Math error (e.g., division by zero)');
        updateUI();
        return;
      }
      acc = out;
    }

    pendingOp = op;
    justEvaluated = false;
    current = '0';
    updateUI();
  }

  function equals() {
    setError('');

    if (pendingOp === null || acc === null) {
      justEvaluated = true;
      updateUI();
      return;
    }

    const b = Number(current);
    const out = applyOp(acc, pendingOp, b);

    if (!Number.isFinite(out)) {
      current = '0';
      acc = null;
      pendingOp = null;
      justEvaluated = false;
      setError('Math error (e.g., division by zero)');
      updateUI();
      return;
    }

    current = formatNumber(out);
    expressionEl.textContent = `${formatNumber(acc)} ${pendingOp} ${formatNumber(b)}`;
    resultEl.textContent = current;

    // Reset
    acc = null;
    pendingOp = null;
    justEvaluated = true;
    updateUI();
  }

  function handleAction(btn) {
    const action = btn.getAttribute('data-action');

    if (action === 'number') return inputDigit(btn.getAttribute('data-number'));
    if (action === 'dot') return inputDot();
    if (action === 'clear') return clearAll();
    if (action === 'delete') return del();
    if (action === 'operator') return chooseOperator(btn.getAttribute('data-operator'));
    if (action === 'equals') return equals();
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => handleAction(btn));
  });

  // Keyboard support
  function keyToOperator(k) {
    if (k === '+') return '+';
    if (k === '-') return '-';
    if (k === '*') return '*';
    if (k === '/') return '/';
    return null;
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key;

    // Prevent page scroll with space/arrow keys if any
    if ([" "].includes(k)) e.preventDefault();

    if (k >= '0' && k <= '9') {
      e.preventDefault();
      inputDigit(k);
      return;
    }
    if (k === '.' || k === ',') {
      e.preventDefault();
      inputDot();
      return;
    }

    const op = keyToOperator(k);
    if (op) {
      e.preventDefault();
      chooseOperator(op);
      return;
    }

    if (k === 'Enter' || k === '=') {
      e.preventDefault();
      equals();
      return;
    }

    if (k === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }

    if (k === 'Backspace') {
      e.preventDefault();
      del();
      return;
    }
  });

  // Init
  updateUI();
})();

