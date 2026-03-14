// frontend/js/scanner.js
// Scanner frontend logic (BarcodeDetector + Quagga fallback) + cart + sale call

const API_BASE = 'http://localhost:3000/api';
const video = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const scannerMsg = document.getElementById('scannerMsg');
const cartArea = document.getElementById('cartArea') || document.getElementById('cartBody') || null;
const checkoutBtn = document.getElementById('checkoutBtn');
const cartMsg = document.getElementById('cartMsg') || document.getElementById('msg');
let stream = null;
let scanning = false;
let lastCode = null;

// cart structure: [{ medicine_id, name, qty, price }]
const cart = [];

// utility helpers
function showScannerMsg(html) { if (!scannerMsg) return; scannerMsg.innerHTML = html; }
function showCartMsg(html, type='info') { if (!cartMsg) return; cartMsg.innerHTML = `<div class="alert alert-${type}">${html}</div>`; setTimeout(()=>cartMsg.innerHTML='',4000); }
function renderCart() {
  if (!cartArea) return;
  // if cartArea is tbody
  if (cartArea.tagName === 'TBODY') {
    cartArea.innerHTML = '';
    let total = 0;
    cart.forEach((it, idx) => {
      const sub = (it.price || 0) * it.qty;
      total += sub;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${it.name}</td>
                      <td><input type="number" min="1" value="${it.qty}" data-idx="${idx}" class="form-control form-control-sm cart-qty" style="width:80px"></td>
                      <td>${it.price?.toFixed(2) || '0.00'}</td>
                      <td>${sub.toFixed(2)}</td>
                      <td><button class="btn btn-sm btn-danger cart-remove" data-idx="${idx}">X</button></td>`;
      cartArea.appendChild(tr);
    });
    // attach qty/change handlers
    cartArea.querySelectorAll('.cart-qty').forEach(inp=>{
      inp.addEventListener('change', (e)=>{
        const i = parseInt(e.target.dataset.idx,10);
        const v = parseInt(e.target.value,10);
        if (v >= 1) { cart[i].qty = v; renderCart(); }
      });
    });
    cartArea.querySelectorAll('.cart-remove').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const i = parseInt(e.target.dataset.idx,10);
        cart.splice(i,1);
        renderCart();
      });
    });
    // show total if element exists
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = total.toFixed(2);
    return;
  }

  // else cartArea is generic container
  cartArea.innerHTML = '';
  if (!cart.length) {
    cartArea.innerHTML = '<div class="text-muted">Cart empty</div>';
    return;
  }
  const t = document.createElement('table');
  t.className = 'table table-sm';
  let html = '<thead><tr><th>Name</th><th>Qty</th><th>Price</th><th>Subtotal</th><th></th></tr></thead><tbody>';
  let total = 0;
  cart.forEach((it, idx) => {
    const sub = (it.price || 0) * it.qty;
    total += sub;
    html += `<tr><td>${it.name}</td><td>${it.qty}</td><td>${it.price?.toFixed(2)||'0.00'}</td><td>${sub.toFixed(2)}</td><td><button class="btn btn-sm btn-danger remove" data-idx="${idx}">X</button></td></tr>`;
  });
  html += `</tbody>`;
  t.innerHTML = html;
  cartArea.appendChild(t);
  cartArea.insertAdjacentHTML('beforeend', `<div class="mt-2"><b>Total:</b> ₹<span id="cartTotal">${total.toFixed(2)}</span></div>`);
  // attach remove
  cartArea.querySelectorAll('.remove').forEach(b=> b.addEventListener('click', (e)=>{ const i = parseInt(e.target.dataset.idx,10); cart.splice(i,1); renderCart(); }));
}

// Add medicine object to cart
function addToCart(med, qty=1) {
  if (!med || !med.medicine_id) return;
  const existing = cart.find(c=> c.medicine_id === med.medicine_id);
  if (existing) existing.qty += qty;
  else cart.push({ medicine_id: med.medicine_id, name: med.name, qty, price: parseFloat(med.price||0) });
  renderCart();
  showCartMsg('Added to cart', 'success');
}

// Find medicine by barcode using scanner API
async function lookupBarcode(code) {
  try {
    const res = await fetch(`${API_BASE}/scanner/lookup?barcode=${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const arr = await res.json();
    return Array.isArray(arr) ? (arr[0] || null) : arr;
  } catch (err) {
    console.error('lookupBarcode', err);
    return null;
  }
}

// Checkout: call /api/sales with items from cart
async function checkoutCart() {
  if (!cart.length) { showCartMsg('Cart is empty', 'warning'); return; }
  const items = cart.map(c => ({ medicine_id: c.medicine_id, quantity: c.qty }));
  try {
    showCartMsg('Processing sale...', 'info');
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ clerk: (getLoggedUser && getLoggedUser().username) || 'cashier', items })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Sale failed');
    showCartMsg(`Sale successful (ID: ${j.saleId})`, 'success');
    cart.length = 0;
    renderCart();
  } catch (err) {
    showCartMsg(err.message || 'Sale failed', 'danger');
  }
}

// Initialize Barcode detection loop (BarcodeDetector or Quagga fallback)
async function initScannerLoop() {
  // Preferred: BarcodeDetector
  if ('BarcodeDetector' in window) {
    const supported = await BarcodeDetector.getSupportedFormats().catch(()=>[]);
    const detector = new BarcodeDetector({ formats: supported.length ? supported : ['ean_13','code_128','upc_e'] });

    scanning = true;
    const loop = async () => {
      if (!scanning) return;
      try {
        const barcodes = await detector.detect(video);
        if (barcodes && barcodes.length) {
          const code = barcodes[0].rawValue;
          if (code && code !== lastCode) {
            lastCode = code;
            showScannerMsg(`<div class="alert alert-info">Detected: ${code}</div>`);
            const med = await lookupBarcode(code);
            if (med) addToCart(med, 1);
            else showScannerMsg(`<div class="alert alert-warning">No medicine found for ${code}</div>`);
          }
        }
      } catch(e) {
        // don't spam
      }
      requestAnimationFrame(loop);
    };
    loop();
    return;
  }

  // Fallback: load QuaggaJS dynamically
  if (!window.Quagga) {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/quagga@0.12.1/dist/quagga.min.js';
    document.head.appendChild(s);
    await new Promise(r=> s.onload = r);
  }

  window.Quagga.init({
    inputStream: { name: "Live", type: "LiveStream", target: video, constraints: { facingMode: "environment", width: 640, height: 480 } },
    decoder: { readers: ["ean_reader","ean_13_reader","code_128_reader","upc_reader"] }
  }, function(err) {
    if (err) {
      console.error('Quagga init error', err);
      showScannerMsg('<div class="alert alert-danger">Scanner init failed</div>');
      return;
    }
    window.Quagga.start();
    window.Quagga.onDetected(async function(result) {
      const code = result && result.codeResult && result.codeResult.code;
      if (code && code !== lastCode) {
        lastCode = code;
        showScannerMsg(`<div class="alert alert-info">Detected: ${code}</div>`);
        const med = await lookupBarcode(code);
        if (med) addToCart(med, 1);
        else showScannerMsg(`<div class="alert alert-warning">No medicine found for ${code}</div>`);
      }
    });
  });
}

// start/stop handlers
startBtn && startBtn.addEventListener('click', async ()=> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    await video.play();
    initScannerLoop();
  } catch (err) {
    showScannerMsg(`<div class="alert alert-danger">Camera access denied: ${err.message}</div>`);
  }
});

stopBtn && stopBtn.addEventListener('click', ()=> {
  scanning = false;
  if (window.Quagga && window.Quagga.stop) { try { window.Quagga.stop(); } catch(e){} }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  try { video.pause(); } catch(e) {}
  showScannerMsg('');
});

// Checkout
checkoutBtn && checkoutBtn.addEventListener('click', checkoutCart);

// allow manual barcode input (optional): if front-end has an input #manualBarcode and button #manualLookup
const manualLookup = document.getElementById('manualLookup');
const manualBarcode = document.getElementById('manualBarcode');
if (manualLookup && manualBarcode) {
  manualLookup.addEventListener('click', async ()=> {
    const code = manualBarcode.value.trim();
    if (!code) return;
    const med = await lookupBarcode(code);
    if (med) addToCart(med, 1);
    else showScannerMsg(`<div class="alert alert-warning">No medicine found for ${code}</div>`);
  });
}

// initial render
renderCart();
