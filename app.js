/**
 * app.js — UI controller: wires config form to generator, renders worksheet.
 */

const PRESETS = {
  easy:   { min: 1,  max: 10 },
  medium: { min: 1,  max: 12 },
  hard:   { min: 5,  max: 20 },
};

const OP_LABELS = { '+': 'Addition', '-': 'Subtraction', '×': 'Multiplication', '÷': 'Division' };

// DOM refs
const form          = document.getElementById('config-form');
const difficultyEl  = document.getElementById('difficulty');
const customRange   = document.getElementById('custom-range');
const minInput      = document.getElementById('min-operand');
const maxInput      = document.getElementById('max-operand');
const countInput    = document.getElementById('count');
const generateBtn   = document.getElementById('btn-generate');
const printBtn      = document.getElementById('btn-print');
const errorMsg      = document.getElementById('error-msg');
const worksheet     = document.getElementById('worksheet');

// Show/hide custom range inputs based on difficulty preset
difficultyEl.addEventListener('change', () => {
  const preset = PRESETS[difficultyEl.value];
  if (preset) {
    minInput.value = preset.min;
    maxInput.value = preset.max;
    customRange.classList.add('hidden');
  } else {
    customRange.classList.remove('hidden');
  }
});

generateBtn.addEventListener('click', () => {
  errorMsg.textContent = '';

  // Read selected operations
  const operations = ['op-add', 'op-sub', 'op-mul', 'op-div']
    .filter(id => document.getElementById(id).checked)
    .map(id => ({ 'op-add': '+', 'op-sub': '-', 'op-mul': '×', 'op-div': '÷' }[id]));

  if (operations.length === 0) {
    errorMsg.textContent = 'Please select at least one operation.';
    return;
  }

  const min = parseInt(minInput.value, 10);
  const max = parseInt(maxInput.value, 10);
  const count = Math.min(Math.max(parseInt(countInput.value, 10) || 20, 1), 60);

  if (isNaN(min) || isNaN(max) || min < 0 || max < 1 || min >= max) {
    errorMsg.textContent = 'Please enter a valid number range (min must be less than max).';
    return;
  }

  const problems = generateProblems({ operations, minOperand: min, maxOperand: max, count });
  renderWorksheet(problems, operations);
  printBtn.disabled = false;
});

printBtn.addEventListener('click', () => {
  window.print();
});

function renderWorksheet(problems, operations) {
  // Build title from selected operations
  const opNames = operations.map(op => OP_LABELS[op]);
  const title = opNames.length === 4
    ? 'Arithmetic Practice'
    : opNames.join(' & ') + ' Practice';

  // Choose grid column count
  let colClass = 'cols-4';
  if (problems.length <= 10) colClass = 'cols-2';
  else if (problems.length <= 18) colClass = 'cols-3';

  const problemsHTML = problems.map((p, i) => `
    <div class="problem">
      <span class="problem-number">${i + 1}</span>
      <span class="operand-a">${p.operandA}</span>
      <div class="operand-b-row">
        <span class="operator">${p.operator}</span>
        <span class="operand-b">${p.operandB}</span>
      </div>
      <div class="problem-line"></div>
      <div class="problem-answer"></div>
    </div>
  `).join('');

  worksheet.className = 'worksheet';
  worksheet.innerHTML = `
    <div class="worksheet-header">
      <h1>${title}</h1>
      <div class="student-info">
        <span>Name: &nbsp;</span>
        <span>Date: &nbsp;</span>
        <span>Score: &nbsp;&nbsp;&nbsp;/ ${problems.length}</span>
      </div>
    </div>
    <div class="problem-grid ${colClass}">
      ${problemsHTML}
    </div>
  `;
}
