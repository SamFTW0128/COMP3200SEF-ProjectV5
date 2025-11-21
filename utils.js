/* utils.js — small helpers used by pages */
(function(global){
  function escapeHtml(s){
    if(s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, function(m){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  function toast(msg, timeout=2000){
    let t = document.getElementById('toast');
    if(!t){
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      Object.assign(t.style, { position:'fixed', right:'12px', bottom:'12px', background:'rgba(0,0,0,0.8)', color:'#fff', padding:'8px 12px', borderRadius:'8px', zIndex:9999 });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(()=> t.style.display='none', timeout);
  }

  function renderStars(n){
    n = Number(n) || 0;
    let s = '';
    for(let i=0;i<5;i++){ s += i < n ? '★' : '☆'; }
    return s;
  }

  global.escapeHtml = escapeHtml;
  global.toast = toast;
  global.renderStars = renderStars;
})(window);