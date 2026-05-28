// ── API base helper ──
window.api = function(path) { return (window.API_BASE || '') + path; };

// ── Chart.js dark defaults ──
if (typeof Chart !== 'undefined') {
  Chart.defaults.color           = '#64748b';
  Chart.defaults.borderColor     = 'rgba(255,255,255,.05)';
  Chart.defaults.font.family     = 'Inter, system-ui, sans-serif';
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(6,6,15,.95)';
  Chart.defaults.plugins.tooltip.borderColor     = 'rgba(255,255,255,.1)';
  Chart.defaults.plugins.tooltip.borderWidth     = 1;
  Chart.defaults.plugins.tooltip.padding         = 10;
  Chart.defaults.plugins.tooltip.cornerRadius    = 9;
  Chart.defaults.plugins.legend.labels.usePointStyle   = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
}

// ── Header date ──
(function() {
  const el = document.getElementById('headerDate');
  if (el) {
    const d = new Date();
    el.textContent = d.toLocaleDateString('pt-BR', {weekday:'long', day:'numeric', month:'long'});
  }
})();

// ── Nav active detection ──
(function() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-card').forEach(function(el) {
    const href = (el.getAttribute('href') || '');
    const isDash  = href === '/' || href === '/index.html';
    const isCurDash = path === '/' || path === '/index.html' || path === '';
    if ((isDash && isCurDash) || (!isDash && href && path.endsWith(href))) {
      el.classList.add('active');
    }
  });
})();

// ── Global utilities ──
window.countUp = function(el, target, duration) {
  duration = duration || 900;
  const isNeg = target < 0;
  const abs   = Math.abs(target);
  const start = performance.now();
  const ease  = function(t) { return 1 - Math.pow(1 - t, 3); };
  function tick(now) {
    const p   = Math.min((now - start) / duration, 1);
    const val = abs * ease(p) * (isNeg ? -1 : 1);
    const fmt = Math.abs(val).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
    el.textContent = (isNeg ? '−' : '') + 'R$ ' + fmt;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
};

window.staggerRows = function(tbody, delay) {
  delay = delay || 45;
  Array.from(tbody.querySelectorAll('tr')).forEach(function(tr, i) {
    tr.style.opacity    = '0';
    tr.style.transform  = 'translateX(-10px)';
    tr.style.transition = 'opacity .32s ease ' + (i*delay) + 'ms, transform .32s ease ' + (i*delay) + 'ms';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        tr.style.opacity   = '1';
        tr.style.transform = 'translateX(0)';
      });
    });
  });
};

window.animateCards = function(selector, baseDelay) {
  baseDelay = baseDelay || 60;
  document.querySelectorAll(selector).forEach(function(el, i) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(18px)';
    el.style.transition = 'opacity .45s ease ' + (i*baseDelay) + 'ms, transform .45s ease ' + (i*baseDelay) + 'ms';
    setTimeout(function() { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 30 + i*baseDelay);
  });
};

// ── Toast notifications ──
(function() {
  function inject() {
    if (document.getElementById('_toastBox')) return;
    const b = document.createElement('div');
    b.id = '_toastBox';
    b.style.cssText = 'position:fixed;top:1.1rem;right:1.1rem;z-index:9999;display:flex;flex-direction:column;gap:.45rem;pointer-events:none';
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();

window.showToast = function(msg, type) {
  type = type || 'success';
  const cfg = {
    success: { color:'#10b981', icon:'bi-check-circle-fill' },
    error:   { color:'#f43f5e', icon:'bi-x-circle-fill' },
    info:    { color:'#a78bfa', icon:'bi-info-circle-fill' },
    warning: { color:'#fbbf24', icon:'bi-exclamation-triangle-fill' },
  }[type] || { color:'#a78bfa', icon:'bi-info-circle-fill' };
  const box = document.getElementById('_toastBox');
  if (!box) return;
  const t = document.createElement('div');
  t.style.cssText = 'background:rgba(12,12,24,.97);border:1px solid rgba(255,255,255,.1);border-left:3px solid ' + cfg.color + ';border-radius:10px;padding:.6rem .95rem;font-size:.82rem;color:#f1f5f9;display:flex;align-items:center;gap:.55rem;min-width:240px;max-width:320px;box-shadow:0 8px 32px rgba(0,0,0,.55);pointer-events:auto;animation:_toastIn .22s ease';
  t.innerHTML = '<i class="bi ' + cfg.icon + '" style="color:' + cfg.color + ';font-size:.95rem;flex-shrink:0"></i><span>' + msg + '</span>';
  box.appendChild(t);
  setTimeout(function() {
    t.style.animation = '_toastOut .2s ease forwards';
    setTimeout(function() { t.remove(); }, 200);
  }, 3200);
};

// ── Confirm dialog ──
window.showConfirm = function(msg, btnLabel) {
  return new Promise(function(resolve) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:_toastIn .15s ease';
    ov.innerHTML = '<div style="background:rgba(12,12,24,.98);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:1.5rem;max-width:340px;width:90%;box-shadow:0 32px 80px rgba(0,0,0,.7)">'
      + '<div style="font-size:.9rem;font-weight:600;color:#f1f5f9;margin-bottom:.35rem">Confirmar ação</div>'
      + '<div style="font-size:.84rem;color:#94a3b8;margin-bottom:1.2rem;line-height:1.5">' + msg + '</div>'
      + '<div style="display:flex;gap:.55rem;justify-content:flex-end">'
      + '<button id="_cNo"  style="padding:.42rem .9rem;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#94a3b8;font-size:.82rem;cursor:pointer;font-family:inherit">Cancelar</button>'
      + '<button id="_cYes" style="padding:.42rem .9rem;border-radius:8px;border:none;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;font-size:.82rem;font-weight:600;cursor:pointer;font-family:inherit">' + (btnLabel || 'Confirmar') + '</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#_cYes').onclick = function() { ov.remove(); resolve(true); };
    ov.querySelector('#_cNo').onclick  = function() { ov.remove(); resolve(false); };
    ov.addEventListener('click', function(e) { if (e.target === ov) { ov.remove(); resolve(false); } });
  });
};

// ── Ripple effect ──
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.btn');
  if (!btn || btn.classList.contains('btn-close')) return;
  const r    = document.createElement('span');
  r.className = 'ripple';
  const d    = Math.max(btn.offsetWidth, btn.offsetHeight);
  const rect = btn.getBoundingClientRect();
  r.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - rect.left - d/2) + 'px;top:' + (e.clientY - rect.top - d/2) + 'px';
  btn.appendChild(r);
  setTimeout(function() { r.remove(); }, 600);
});

// ── Animate nav and cards on load ──
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-card').forEach(function(el, i) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(10px) scale(.96)';
    el.style.transition = 'opacity .35s ease ' + (i*50) + 'ms, transform .35s ease ' + (i*50) + 'ms';
    setTimeout(function() { el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; }, 80 + i*50);
  });
  animateCards('.stat-card', 70);
  animateCards('.card', 50);
});

// ── Chat ──
function toggleChat() {
  const panel = document.getElementById('chatPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open'))
    setTimeout(function() { document.getElementById('chatInput').focus(); }, 100);
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

function appendMsg(role, text) {
  const box    = document.getElementById('chatMessages');
  const wrap   = document.createElement('div');
  wrap.className = 'msg ' + role;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
  return bubble;
}

function showTyping() {
  const box  = document.getElementById('chatMessages');
  const wrap = document.createElement('div');
  wrap.className = 'msg bot';
  wrap.id = 'typingMsg';
  wrap.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
  box.appendChild(wrap);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingMsg');
  if (el) el.remove();
}

async function sendChatMessage() {
  const input   = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const text    = input.value.trim();
  if (!text || sendBtn.disabled) return;
  input.value = '';
  input.style.height = 'auto';
  appendMsg('user', text);
  showTyping();
  sendBtn.disabled = true;
  try {
    const res = await fetch(api('/api/ai/chat'), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({message: text})
    });
    removeTyping();
    const bubble  = appendMsg('bot', '');
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '', full = '';
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      buf += decoder.decode(value, {stream:true});
      const lines = buf.split('\n'); buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6);
        if (raw === '[DONE]') break;
        try {
          const p = JSON.parse(raw);
          if (p.text) { full += p.text; bubble.textContent = full; document.getElementById('chatMessages').scrollTop = 999999; }
        } catch(e) {}
      }
    }
  } catch(e) {
    removeTyping();
    appendMsg('bot', 'Erro ao conectar com a API. Verifique a configuração.');
  }
  sendBtn.disabled = false;
  input.focus();
}

document.addEventListener('DOMContentLoaded', function() {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    });
  }
});
