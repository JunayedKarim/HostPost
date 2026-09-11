/* ===================== DATA ===================== */
const CATEGORIES = [
  {id:'shirt', label:'Shirts', glyph:'👔', thumb:'thumb-shirt'},
  {id:'pant', label:'Pants', glyph:'👖', thumb:'thumb-pant'},
  {id:'suit', label:'Suits', glyph:'🧥', thumb:'thumb-suit'},
  {id:'tie', label:'Ties', glyph:'🎀', thumb:'thumb-tie'},
  {id:'shoe', label:'Shoes', glyph:'👞', thumb:'thumb-shoe'},
  {id:'socks', label:'Socks', glyph:'🧦', thumb:'thumb-socks'},
];
function catInfo(id){ return CATEGORIES.find(c=>c.id===id); }

let products = [
  {id:1, name:'Oxford Slim-Fit Shirt', category:'shirt', price:1850, desc:'Breathable cotton oxford shirt, slim cut through the body with a clean spread collar.'},
  {id:2, name:'Classic White Poplin Shirt', category:'shirt', price:1650, desc:'Crisp poplin weave, made for the boardroom and beyond.'},
  {id:3, name:'Navy Check Casual Shirt', category:'shirt', price:1750, desc:'Soft brushed cotton in a subtle navy check, relaxed weekend fit.'},
  {id:4, name:'Charcoal Wool-Blend Trouser', category:'pant', price:2450, desc:'Tapered wool-blend trouser with a flat front and clean break.'},
  {id:5, name:'Khaki Chino Pant', category:'pant', price:1950, desc:'Everyday cotton chino, tapered leg, reinforced stitching.'},
  {id:6, name:'Slate Formal Trouser', category:'pant', price:2200, desc:'Mid-rise formal trouser built for long days at the office.'},
  {id:7, name:'Charcoal Two-Piece Suit', category:'suit', price:8900, desc:'Half-canvas construction, notch lapel, tailored Dhaka-fit silhouette.'},
  {id:8, name:'Midnight Blue Three-Piece Suit', category:'suit', price:11500, desc:'Jacket, waistcoat and trouser in a fine worsted wool blend.'},
  {id:9, name:'Slim Herringbone Blazer', category:'suit', price:6400, desc:'Stand-alone blazer in a subtle herringbone weave.'},
  {id:10, name:'Silk Burgundy Tie', category:'tie', price:950, desc:'100% mulberry silk, hand-finished, 8cm blade width.'},
  {id:11, name:'Navy Grenadine Tie', category:'tie', price:1050, desc:'Textured grenadine weave for understated formal occasions.'},
  {id:12, name:'Striped Regimental Tie', category:'tie', price:890, desc:'Classic diagonal stripe in house colours.'},
  {id:13, name:'Oxford Leather Brogue', category:'shoe', price:4200, desc:'Full-grain leather brogue with a leather sole and stacked heel.'},
  {id:14, name:'Black Cap-Toe Derby', category:'shoe', price:3950, desc:'Polished cap-toe derby, ideal for suiting and formalwear.'},
  {id:15, name:'Tan Leather Loafer', category:'shoe', price:3600, desc:'Slip-on penny loafer in burnished tan leather.'},
  {id:16, name:'Ribbed Cotton Dress Socks (3-pack)', category:'socks', price:650, desc:'Combed cotton with ribbed cuffs, reinforced heel and toe.'},
  {id:17, name:'Merino Wool Socks (2-pack)', category:'socks', price:780, desc:'Breathable merino blend for all-day comfort.'},
  {id:18, name:'Patterned Ankle Socks (3-pack)', category:'socks', price:590, desc:'Subtle patterned ankle socks for smart-casual wear.'},
];

let customers = []; // {name,email,password}
let currentCustomer = null;
let adminSignedIn = false;
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

let cart = []; // {productId, qty}
let orders = []; // {id, items, subtotal, discount, total, payment, customerEmail, status, date}
let orderCounter = 1001;

let sessionSpinUsed = false;
let activeDiscount = 0; // percent

let selectedProductId = null;
let selectedPayment = null;
let shopFilter = 'all';

/* ===================== VALIDATION ===================== */
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,}$/;

/* ===================== RENDER HELPERS ===================== */
function money(n){ return '৳' + n.toLocaleString('en-BD'); }

function productCard(p, discountBadge){
  const cat = catInfo(p.category);
  const showPrice = discountBadge ? Math.round(p.price*(1-activeDiscount/100)) : p.price;
  return `
    <div class="card" onclick="openProduct(${p.id})">
      <div class="thumb ${cat.thumb}">
        ${discountBadge && activeDiscount>0 ? `<div class="discount-flag">-${activeDiscount}%</div>` : ''}
        ${cat.glyph}
      </div>
      <h3>${p.name}</h3>
      <div class="cat-label">${cat.label}</div>
      <div class="price">${money(showPrice)} ${discountBadge && activeDiscount>0 ? `<span class="old">${money(p.price)}</span>` : ''}</div>
      <div class="add-row">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); addToCart(${p.id},1)">Add to cart</button>
      </div>
    </div>`;
}

function renderHomeCats(){
  document.getElementById('home-cats').innerHTML = CATEGORIES.map(c=>`
    <div class="cat-card" onclick="showShop('${c.id}')">
      <div class="glyph">${c.glyph}</div>
      <span>${c.label}</span>
    </div>`).join('');
}

function renderHomeGrid(){
  const picks = [products[6], products[0], products[12], products[9], products[3], products[15], products[7], products[13]];
  document.getElementById('home-grid').innerHTML = picks.map(p=>productCard(p,true)).join('');
}

function renderShop(){
  document.getElementById('shop-filters').innerHTML = ['all',...CATEGORIES.map(c=>c.id)].map(id=>{
    const label = id==='all' ? 'All products' : catInfo(id).label;
    return `<button class="filter-chip ${shopFilter===id?'active':''}" onclick="showShop('${id}')">${label}</button>`;
  }).join('');
  const list = shopFilter==='all' ? products : products.filter(p=>p.category===shopFilter);
  document.getElementById('shop-count-label').textContent = list.length + ' item' + (list.length===1?'':'s');
  document.getElementById('shop-grid').innerHTML = list.map(p=>productCard(p,true)).join('');
}

function showShop(filter){
  shopFilter = filter;
  renderShop();
  showView('shop');
}

function openProduct(id){
  selectedProductId = id;
  const p = products.find(x=>x.id===id);
  const cat = catInfo(p.category);
  document.getElementById('pd-content').innerHTML = `
    <div class="thumb-large ${cat.thumb}">${cat.glyph}</div>
    <div>
      <h1>${p.name}</h1>
      <div class="cat-label">${cat.label}</div>
      <div class="price">${money(activeDiscount>0?Math.round(p.price*(1-activeDiscount/100)):p.price)} ${activeDiscount>0?`<span class="old">${money(p.price)}</span>`:''}</div>
      <p class="desc">${p.desc}</p>
      <div class="qty-row">
        <div class="qty-box">
          <button onclick="stepQty(-1)">−</button>
          <span id="pd-qty">1</span>
          <button onclick="stepQty(1)">+</button>
        </div>
        <button class="btn btn-primary" onclick="addToCart(${p.id}, parseInt(document.getElementById('pd-qty').textContent))">Add to cart</button>
      </div>
      <div class="spec-list">
        <div><span>Category</span><span>${cat.label}</span></div>
        <div><span>Availability</span><span>In stock</span></div>
        <div><span>Delivery</span><span>2–5 business days across Bangladesh</span></div>
        <div><span>Payment</span><span>bKash · Rocket · Cash on Delivery</span></div>
      </div>
    </div>`;
  showView('product');
}
function stepQty(d){
  const el = document.getElementById('pd-qty');
  const v = Math.max(1, parseInt(el.textContent)+d);
  el.textContent = v;
}

/* ===================== CART ===================== */
function addToCart(productId, qty){
  qty = qty || 1;
  const existing = cart.find(c=>c.productId===productId);
  if(existing) existing.qty += qty;
  else cart.push({productId, qty});
  updateCartCount();
  flashAccount('Added to cart');
}
function updateCartCount(){
  document.getElementById('cart-count').textContent = cart.reduce((s,c)=>s+c.qty,0);
}
function removeFromCart(productId){
  cart = cart.filter(c=>c.productId!==productId);
  renderCart();
}
function changeQty(productId, delta){
  const item = cart.find(c=>c.productId===productId);
  if(!item) return;
  item.qty = Math.max(1, item.qty+delta);
  renderCart();
}
function cartSubtotal(){
  return cart.reduce((sum,c)=>{
    const p = products.find(x=>x.id===c.productId);
    return sum + p.price*c.qty;
  },0);
}
function renderCart(){
  updateCartCount();
  const body = document.getElementById('cart-body');
  if(cart.length===0){
    body.innerHTML = `<div class="empty-state"><h3>Your cart is empty</h3><p>Browse the collection to find something sharp.</p><br><button class="btn btn-primary" onclick="showShop('all')">Shop now</button></div>`;
    return;
  }
  const subtotal = cartSubtotal();
  const discountAmt = Math.round(subtotal*activeDiscount/100);
  const total = subtotal - discountAmt;
  const rows = cart.map(c=>{
    const p = products.find(x=>x.id===c.productId);
    const cat = catInfo(p.category);
    return `
      <div class="cart-row">
        <div class="mini-thumb ${cat.thumb}">${cat.glyph}</div>
        <div>
          <h4>${p.name}</h4>
          <div class="cat-label">${cat.label} · ${money(p.price)}</div>
        </div>
        <div class="qty-box">
          <button onclick="changeQty(${p.id},-1)">−</button>
          <span>${c.qty}</span>
          <button onclick="changeQty(${p.id},1)">+</button>
        </div>
        <button class="btn btn-sm btn-danger" onclick="removeFromCart(${p.id})">Remove</button>
      </div>`;
  }).join('');
  body.innerHTML = `
    <div class="cart-layout">
      <div>${rows}</div>
      <div class="summary-box">
        <h3>Order summary</h3>
        ${activeDiscount>0 ? `<div class="coupon-active"><span>Wheel discount applied</span><b>-${activeDiscount}%</b></div>` : `<div class="hint">No discount applied yet — try the spin wheel on the home page.</div>`}
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Discount</span><span>-${money(discountAmt)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Free</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
        <button class="btn btn-primary btn-block" style="margin-top:18px;" onclick="goCheckout()">Proceed to checkout</button>
      </div>
    </div>`;
}

/* ===================== DISCOUNT WHEEL ===================== */
const wheelValues = [5,10,15,20,25,30,10,20];
const wheelColors = ['#B8862E','#2F4538','#1B1F23','#B8862E','#2F4538','#1B1F23','#B8862E','#2F4538'];
function buildWheelSVG(){
  const n = wheelValues.length, r=100, cx=100, cy=100;
  let html = '';
  for(let i=0;i<n;i++){
    const a0 = (i/n)*2*Math.PI - Math.PI/2;
    const a1 = ((i+1)/n)*2*Math.PI - Math.PI/2;
    const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    html += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z" fill="${wheelColors[i]}" stroke="#F6F4EF" stroke-width="1"/>`;
    const mid = (a0+a1)/2;
    const tx = cx + r*0.62*Math.cos(mid), ty = cy + r*0.62*Math.sin(mid);
    html += `<text x="${tx}" y="${ty}" fill="#F6F4EF" font-size="14" font-family="IBM Plex Sans" font-weight="700" text-anchor="middle" dominant-baseline="middle">${wheelValues[i]}%</text>`;
  }
  document.getElementById('wheel').innerHTML = html;
}
function scrollWheel(){
  setTimeout(()=>document.getElementById('wheel-band').scrollIntoView({behavior:'smooth', block:'center'}), 60);
}
function spinWheel(){
  if(sessionSpinUsed){
    document.getElementById('wheel-result').textContent = "You've already used your spin this session.";
    return;
  }
  const btn = document.getElementById('spin-btn');
  btn.disabled = true;
  const n = wheelValues.length;
  const segIndex = Math.floor(Math.random()*n);
  const segAngle = 360/n;
  const targetCenter = segIndex*segAngle + segAngle/2;
  const spins = 5;
  const finalRotation = spins*360 + (360 - targetCenter);
  const wheel = document.getElementById('wheel');
  wheel.style.transform = `rotate(${finalRotation}deg)`;
  document.getElementById('wheel-result').textContent = 'Spinning...';
  setTimeout(()=>{
    const won = wheelValues[segIndex];
    activeDiscount = won;
    sessionSpinUsed = true;
    document.getElementById('wheel-result').textContent = `You won ${won}% off! Applied to your cart automatically.`;
    renderCart();
  }, 4600);
}

/* ===================== VIEW ROUTING ===================== */
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
  if(name==='cart') renderCart();
  if(name==='admin') renderAdmin();
}

function updateSessionLabel(){
  const label = document.getElementById('session-label');
  const accountLink = document.getElementById('account-link');
  if(currentCustomer){
    label.textContent = 'Signed in as ' + currentCustomer.name;
    accountLink.textContent = currentCustomer.name.split(' ')[0] + ' ▾';
  } else if(adminSignedIn){
    label.textContent = 'Admin session';
    accountLink.textContent = 'Account';
  } else {
    label.textContent = 'Not signed in';
    accountLink.textContent = 'Account';
  }
}
function flashAccount(msg){
  const label = document.getElementById('session-label');
  const prev = label.textContent;
  label.textContent = msg;
  setTimeout(()=>{ updateSessionLabel(); }, 1200);
}
function handleAccountClick(){
  if(currentCustomer){
    if(confirm('Sign out of ' + currentCustomer.name + ' (' + currentCustomer.email + ')?')){
      currentCustomer = null;
      updateSessionLabel();
      showView('home');
    }
  } else {
    showView('login');
  }
}
function openAdminLogin(){ showView('admin-login'); }

/* ===================== AUTH ===================== */
function showFieldError(id, msg){
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}
function hideFieldError(id){
  document.getElementById(id).style.display = 'none';
}

function doRegister(){
  hideFieldError('register-error');
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if(!name){ showFieldError('register-error','Please enter your full name.'); return; }
  if(!EMAIL_RE.test(email)){ showFieldError('register-error','Email must be a valid @gmail.com address.'); return; }
  if(!PASSWORD_RE.test(password)){ showFieldError('register-error','Password needs 8+ characters, one capital letter, one number and one symbol.'); return; }
  if(customers.find(c=>c.email===email)){ showFieldError('register-error','An account with this email already exists.'); return; }

  customers.push({name, email, password});
  currentCustomer = {name, email};
  updateSessionLabel();
  showView('home');
}

function doLogin(){
  hideFieldError('login-error');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const user = customers.find(c=>c.email===email && c.password===password);
  if(!user){ showFieldError('login-error','Incorrect email or password.'); return; }
  currentCustomer = {name:user.name, email:user.email};
  updateSessionLabel();
  showView('home');
}

function doAdminLogin(){
  hideFieldError('admin-login-error');
  const email = document.getElementById('admin-login-email').value.trim();
  const password = document.getElementById('admin-login-password').value;
  if(email===ADMIN_EMAIL && password===ADMIN_PASSWORD){
    adminSignedIn = true;
    updateSessionLabel();
    showView('admin');
  } else {
    showFieldError('admin-login-error','Invalid admin credentials.');
  }
}
function adminLogout(){
  adminSignedIn = false;
  updateSessionLabel();
  showView('home');
}

/* ===================== CHECKOUT ===================== */
function goCheckout(){
  if(cart.length===0) return;
  if(!currentCustomer){
    showView('login');
    return;
  }
  selectedPayment = null;
  renderCheckout();
  showView('checkout');
}

function renderCheckout(){
  const subtotal = cartSubtotal();
  const discountAmt = Math.round(subtotal*activeDiscount/100);
  const total = subtotal - discountAmt;
  document.getElementById('checkout-body').innerHTML = `
    <div class="checkout-layout">
      <div>
        <h3 style="font-family:'Fraunces',serif;font-size:18px;margin-bottom:14px;">Delivery details</h3>
        <div class="field"><label>Full name</label><input id="ship-name" value="${currentCustomer.name}"></div>
        <div class="field"><label>Phone number</label><input id="ship-phone" placeholder="01XXXXXXXXX"></div>
        <div class="field"><label>Delivery address</label><input id="ship-address" placeholder="House, road, area, city"></div>

        <h3 style="font-family:'Fraunces',serif;font-size:18px;margin:26px 0 4px;">Payment method</h3>
        <div class="pay-options">
          <div class="pay-opt" id="opt-bkash" onclick="selectPayment('bkash')">
            <div class="radio"></div>
            <div><b>bKash</b><small>Pay instantly from your bKash wallet</small></div>
          </div>
          <div class="pay-opt" id="opt-rocket" onclick="selectPayment('rocket')">
            <div class="radio"></div>
            <div><b>Rocket</b><small>Pay instantly from your Rocket wallet</small></div>
          </div>
          <div class="pay-opt" id="opt-cod" onclick="selectPayment('cod')">
            <div class="radio"></div>
            <div><b>Cash on Delivery</b><small>Pay in cash when your order arrives</small></div>
          </div>
        </div>

        <div class="pay-detail" id="detail-bkash">
          <div class="field"><label>bKash account number</label><input id="bkash-number" placeholder="01XXXXXXXXX"></div>
          <div class="field"><label>PIN (demo only, not stored)</label><input type="password" id="bkash-pin" placeholder="••••"></div>
        </div>
        <div class="pay-detail" id="detail-rocket">
          <div class="field"><label>Rocket account number</label><input id="rocket-number" placeholder="01XXXXXXXXX-X"></div>
          <div class="field"><label>PIN (demo only, not stored)</label><input type="password" id="rocket-pin" placeholder="••••"></div>
        </div>
        <div class="pay-detail" id="detail-cod">
          <p>You'll pay the courier in cash when your order is delivered. Please have the exact amount ready.</p>
        </div>

        <div class="form-error" id="checkout-error"></div>
        <button class="btn btn-primary btn-block" onclick="placeOrder()">Place order — ${money(total)}</button>
      </div>
      <div class="summary-box">
        <h3>Order summary</h3>
        ${activeDiscount>0 ? `<div class="coupon-active"><span>Wheel discount</span><b>-${activeDiscount}%</b></div>` : ''}
        <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="summary-row"><span>Discount</span><span>-${money(discountAmt)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>Free</span></div>
        <div class="summary-row total"><span>Total</span><span>${money(total)}</span></div>
      </div>
    </div>`;
}
function selectPayment(method){
  selectedPayment = method;
  ['bkash','rocket','cod'].forEach(m=>{
    document.getElementById('opt-'+m).classList.toggle('selected', m===method);
    document.getElementById('detail-'+m).classList.toggle('active', m===method);
  });
}
function placeOrder(){
  const errEl = document.getElementById('checkout-error');
  errEl.style.display='none';
  const name = document.getElementById('ship-name').value.trim();
  const phone = document.getElementById('ship-phone').value.trim();
  const address = document.getElementById('ship-address').value.trim();
  if(!name || !phone || !address){ errEl.textContent='Please complete your delivery details.'; errEl.style.display='block'; return; }
  if(!selectedPayment){ errEl.textContent='Please choose a payment method.'; errEl.style.display='block'; return; }
  if(selectedPayment==='bkash' && !document.getElementById('bkash-number').value.trim()){ errEl.textContent='Enter your bKash number to continue.'; errEl.style.display='block'; return; }
  if(selectedPayment==='rocket' && !document.getElementById('rocket-number').value.trim()){ errEl.textContent='Enter your Rocket number to continue.'; errEl.style.display='block'; return; }

  const subtotal = cartSubtotal();
  const discountAmt = Math.round(subtotal*activeDiscount/100);
  const total = subtotal - discountAmt;
  const order = {
    id: 'HP' + (orderCounter++),
    items: cart.map(c=>{ const p=products.find(x=>x.id===c.productId); return {name:p.name, qty:c.qty, price:p.price}; }),
    subtotal, discount:activeDiscount, discountAmt, total,
    payment: selectedPayment, customerEmail: currentCustomer.email, customerName:name, phone, address,
    status: selectedPayment==='cod' ? 'Pending (COD)' : 'Paid',
    date: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
  };
  orders.push(order);
  cart = [];
  activeDiscount = 0;
  updateCartCount();

  document.getElementById('checkout-body').innerHTML = `
    <div class="order-conf">
      <div class="mark">✓</div>
      <h2>Order placed — ${order.id}</h2>
      <p style="margin-top:12px;color:#6b6b66;">
        ${selectedPayment==='cod' ? 'Your order is confirmed. Pay in cash when it arrives.' : `Payment of ${money(total)} received via ${selectedPayment==='bkash'?'bKash':'Rocket'}.`}
      </p>
      <button class="btn btn-primary" style="margin-top:26px;" onclick="showShop('all')">Continue shopping</button>
    </div>`;
}

/* ===================== ADMIN ===================== */
let adminTab = 'overview';
function showAdminTab(tab){
  adminTab = tab;
  document.querySelectorAll('.admin-side a[data-tab]').forEach(a=>a.classList.toggle('active', a.dataset.tab===tab));
  renderAdmin();
}
function renderAdmin(){
  if(!adminSignedIn){ showView('admin-login'); return; }
  const main = document.getElementById('admin-main');
  if(adminTab==='overview'){
    const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
    main.innerHTML = `
      <h2>Overview</h2>
      <div class="stat-row">
        <div class="stat-card"><div class="num">${products.length}</div><div class="lbl">Products listed</div></div>
        <div class="stat-card"><div class="num">${orders.length}</div><div class="lbl">Orders placed</div></div>
        <div class="stat-card"><div class="num">${customers.length}</div><div class="lbl">Registered customers</div></div>
        <div class="stat-card"><div class="num">${money(totalRevenue)}</div><div class="lbl">Total revenue</div></div>
      </div>
      <p style="color:#6b6b66;font-size:13.5px;">This is a front-end demo: product, order and customer data live in memory for this session and reset on reload. Connect a real database and payment gateway (bKash/Rocket merchant API) for production use.</p>`;
  } else if(adminTab==='products'){
    main.innerHTML = `
      <h2>Products</h2>
      <div class="admin-form-grid">
        <input id="np-name" placeholder="Product name">
        <select id="np-cat">${CATEGORIES.map(c=>`<option value="${c.id}">${c.label}</option>`).join('')}</select>
        <input id="np-price" type="number" placeholder="Price (৳)">
        <input id="np-desc" placeholder="Short description">
      </div>
      <button class="btn btn-gold btn-sm" onclick="adminAddProduct()">Add product</button>
      <table style="margin-top:22px;">
        <tr><th>Name</th><th>Category</th><th>Price</th><th></th></tr>
        ${products.map(p=>`
          <tr>
            <td>${p.name}</td>
            <td>${catInfo(p.category).label}</td>
            <td>${money(p.price)}</td>
            <td><button class="btn btn-sm btn-danger" onclick="adminDeleteProduct(${p.id})">Delete</button></td>
          </tr>`).join('')}
      </table>`;
  } else if(adminTab==='orders'){
    main.innerHTML = `
      <h2>Orders</h2>
      <table>
        <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr>
        ${orders.length===0 ? `<tr><td colspan="7" style="color:#8a8a84;">No orders yet.</td></tr>` : orders.map(o=>`
          <tr>
            <td>${o.id}</td>
            <td>${o.customerName}<br><span style="color:#8a8a84;font-size:12px;">${o.customerEmail}</span></td>
            <td>${o.items.reduce((s,i)=>s+i.qty,0)} item(s)</td>
            <td>${money(o.total)}</td>
            <td><span class="tag-pill ${o.payment==='cod'?'cod':'mobile'}">${o.payment==='cod'?'COD':o.payment==='bkash'?'bKash':'Rocket'}</span></td>
            <td>${o.status}</td>
            <td>${o.date}</td>
          </tr>`).join('')}
      </table>`;
  } else if(adminTab==='customers'){
    main.innerHTML = `
      <h2>Customers</h2>
      <table>
        <tr><th>Name</th><th>Email</th><th>Orders</th></tr>
        ${customers.length===0 ? `<tr><td colspan="3" style="color:#8a8a84;">No customers registered yet.</td></tr>` : customers.map(c=>`
          <tr><td>${c.name}</td><td>${c.email}</td><td>${orders.filter(o=>o.customerEmail===c.email).length}</td></tr>`).join('')}
      </table>`;
  }
}
function adminAddProduct(){
  const name = document.getElementById('np-name').value.trim();
  const category = document.getElementById('np-cat').value;
  const price = parseInt(document.getElementById('np-price').value);
  const desc = document.getElementById('np-desc').value.trim() || 'A HostPost essential.';
  if(!name || !price){ alert('Please enter a product name and price.'); return; }
  const id = Math.max(...products.map(p=>p.id)) + 1;
  products.push({id, name, category, price, desc});
  renderAdmin();
  renderShop();
  renderHomeGrid();
}
function adminDeleteProduct(id){
  products = products.filter(p=>p.id!==id);
  cart = cart.filter(c=>c.productId!==id);
  renderAdmin();
  renderShop();
  renderHomeGrid();
  updateCartCount();
}

/* ===================== INIT ===================== */
renderHomeCats();
renderHomeGrid();
renderShop();
buildWheelSVG();
updateSessionLabel();
updateCartCount();
