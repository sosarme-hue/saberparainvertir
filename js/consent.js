/* Aviso de cookies y Google Analytics 4 (solo con consentimiento) */
(function(){
  var GA='G-HVS3YTJ7T2', KEY='spi-cookies';
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function set(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function loadGA(){
    if(window.__spiGA)return;window.__spiGA=1;
    var s=document.createElement('script');s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date());gtag('config',GA,{anonymize_ip:true});
  }
  function clearGA(){
    document.cookie.split(';').forEach(function(c){
      var n=c.split('=')[0].trim();
      if(/^_ga/.test(n)){
        var d=location.hostname.replace(/^www\./,'');
        ['', '; domain=.'+d, '; domain='+d].forEach(function(x){
          document.cookie=n+'=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'+x;});
      }
    });
  }
  function banner(){
    if(document.getElementById('spi-ck'))return;
    var st=document.createElement('style');
    st.textContent='#spi-ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:0 auto;background:var(--bg,#fff);color:var(--ink,#0E2A47);border:1px solid var(--line,#d7dde5);border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.18);padding:14px 16px;font:15px/1.45 var(--body,system-ui,sans-serif)}'+
      '#spi-ck p{margin:0 0 10px}#spi-ck a{color:inherit;text-decoration:underline}'+
      '#spi-ck .b{display:flex;gap:8px;flex-wrap:wrap}#spi-ck button{flex:1 1 120px;min-height:42px;border-radius:999px;font:600 15px/1 var(--body,system-ui,sans-serif);cursor:pointer;border:1px solid var(--ink,#0E2A47)}'+
      '#spi-ck .ok{background:var(--navy,#0E2A47);color:var(--on-navy,#fff);border-color:var(--navy,#0E2A47)}#spi-ck .no{background:transparent;color:var(--ink,#0E2A47)}'+
      '@media print{#spi-ck{display:none}}';
    document.head.appendChild(st);
    var d=document.createElement('div');d.id='spi-ck';d.setAttribute('role','dialog');d.setAttribute('aria-label','Aviso de cookies');
    d.innerHTML='<p>Usamos cookies de Google Analytics para saber cuántas personas visitan la web y qué páginas leen. Solo se activan si aceptas. <a href="/legal/cookies.html">Más información</a></p>'+
      '<div class="b"><button type="button" class="no">Rechazar</button><button type="button" class="ok">Aceptar</button></div>';
    document.body.appendChild(d);
    d.querySelector('.ok').onclick=function(){set('si');d.remove();loadGA()};
    d.querySelector('.no').onclick=function(){set('no');d.remove();clearGA()};
  }
  window.spiCookies=function(){try{localStorage.removeItem(KEY)}catch(e){}clearGA();banner()};
  var v=get();
  if(v==='si')loadGA();
  else if(v!=='no'){if(document.body)banner();else document.addEventListener('DOMContentLoaded',banner)}
})();
