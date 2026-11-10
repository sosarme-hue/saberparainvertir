/* Bloques de enlaces de afiliado · Saber para invertir
 *
 * Cómo se usa:
 * 1. Cuando un programa te apruebe, pega tu enlace de afiliado en "url".
 * 2. Un programa sin url no se muestra. Un bloque sin ningún programa con url no se muestra.
 * 3. Para ver todos los bloques aunque no haya enlaces: añade ?afil=demo a la dirección.
 *
 * Los enlaces llevan rel="sponsored nofollow" y el bloque lleva siempre la etiqueta "Publicidad".
 */
(function(){
  var P = {
    'trade-republic': {n:'Trade Republic', d:'Bróker y banco con sucursal en España. Acciones, ETF y planes de inversión periódicos.', reg:'Banco registrado en el Banco de España', url:''},
    'lightyear':      {n:'Lightyear', d:'Bróker europeo de acciones y ETF con cuenta en varias divisas.', reg:'Empresa de servicios de inversión con pasaporte europeo (CNMV)', url:''},
    'degiro':         {n:'DEGIRO', d:'Bróker de bajo coste con acceso a muchas bolsas.', reg:'Empresa de servicios de inversión con pasaporte europeo (CNMV)', url:''},
    'myinvestor':     {n:'MyInvestor', d:'Neobanco español con fondos indexados, carteras automatizadas y bróker.', reg:'Banco español registrado en el Banco de España', url:''},
    'indexa':         {n:'Indexa Capital', d:'Gestor automatizado de carteras de fondos indexados y planes de pensiones.', reg:'Agencia de valores registrada en la CNMV', url:''},
    'finizens':       {n:'Finizens', d:'Gestor automatizado de carteras indexadas y planes de pensiones.', reg:'Registrado en la CNMV', url:''},
    'inbestme':       {n:'inbestMe', d:'Gestor automatizado con carteras de ETF y fondos indexados.', reg:'Registrado en la CNMV', url:''},
    'openbank':       {n:'Openbank', d:'Banco online del grupo Santander: cuentas, depósitos y tarjetas.', reg:'Banco español registrado en el Banco de España', url:''},
    'bankinter':      {n:'Bankinter', d:'Banco español con cuenta remunerada y cuenta digital.', reg:'Banco español registrado en el Banco de España', url:''},
    'raisin':         {n:'Raisin', d:'Plataforma de depósitos a plazo de bancos europeos.', reg:'Comprueba el banco de cada depósito y su fondo de garantía', url:''},
    'revolut':        {n:'Revolut', d:'Cuenta y tarjeta para el día a día y pagos en otras divisas.', reg:'Banco con licencia europea y sucursal en España', url:''},
    'bit2me':         {n:'Bit2Me', d:'Plataforma española de criptoactivos.', reg:'Autorizada como proveedor de servicios de criptoactivos (MiCA)', url:''},
    'coinbase':       {n:'Coinbase', d:'Plataforma internacional de criptoactivos.', reg:'Autorizada como proveedor de servicios de criptoactivos (MiCA)', url:''},
    'ledger':         {n:'Ledger', d:'Cartera física para guardar tus criptoactivos sin depender de una plataforma.', reg:'Producto, no entidad financiera', url:''},
    'trezor':         {n:'Trezor', d:'Cartera física de código abierto para criptoactivos.', reg:'Producto, no entidad financiera', url:''},
    'iahorro':        {n:'iAhorro', d:'Intermediario hipotecario: compara ofertas de varios bancos.', reg:'Intermediario de crédito inmobiliario registrado en el Banco de España', url:''}
  };

  var B = {
    broker:    {t:'Dónde abrir una cuenta de bróker', ids:['trade-republic','myinvestor','lightyear','degiro']},
    indexados: {t:'Dónde invertir en fondos indexados', ids:['myinvestor','indexa','finizens','inbestme']},
    ahorro:    {t:'Dónde encontrar cuentas remuneradas y depósitos', ids:['trade-republic','openbank','bankinter','raisin','myinvestor']},
    cuentas:   {t:'Cuentas y tarjetas sin comisiones', ids:['openbank','bankinter','revolut','myinvestor']},
    cripto:    {t:'Plataformas de criptoactivos autorizadas', ids:['bit2me','coinbase'], cripto:true},
    custodia:  {t:'Carteras físicas para guardar criptoactivos', ids:['ledger','trezor'], cripto:true},
    hipotecas: {t:'Comparar hipotecas', ids:['iahorro']},
    pensiones: {t:'Planes de pensiones indexados', ids:['indexa','finizens','myinvestor']}
  };

  /* Qué bloque sale en cada página (ruta sin el dominio) */
  var R = {
    '/bolsa/':'broker', '/guias/elegir-broker.html':'broker', '/guias/tipos-de-ordenes.html':'broker',
    '/guias/dividendos.html':'broker', '/guias/indices-bursatiles.html':'broker',
    '/fichas/acciones.html':'broker', '/fichas/etf.html':'broker',
    '/fondos/':'indexados', '/guias/fondo-o-etf.html':'indexados', '/guias/gestion-activa-o-indexada.html':'indexados',
    '/guias/tipos-de-fondos.html':'indexados', '/guias/traspaso-de-fondos.html':'indexados',
    '/guias/leer-ficha-de-un-fondo.html':'indexados', '/guias/principios-de-inversion.html':'indexados',
    '/guias/inflacion-e-interes-compuesto.html':'indexados', '/fichas/fondo-indexado.html':'indexados',
    '/renta-fija/':'ahorro', '/guias/deposito-o-letras.html':'ahorro', '/guias/fondo-de-emergencia.html':'ahorro',
    '/fichas/cuenta-remunerada.html':'ahorro', '/fichas/deposito.html':'ahorro', '/fichas/fondo-monetario.html':'ahorro',
    '/bancos/':'cuentas', '/guias/cuenta-corriente-y-comisiones.html':'cuentas', '/guias/tarjetas-debito-credito.html':'cuentas',
    '/cripto/':'cripto', '/guias/como-comprar-cripto.html':'cripto', '/guias/plataformas-cripto-mica.html':'cripto',
    '/fichas/bitcoin.html':'cripto', '/fichas/ethereum.html':'cripto', '/fichas/stablecoins.html':'cripto',
    '/guias/custodia-y-carteras.html':'custodia',
    '/inmobiliaria/':'hipotecas', '/guias/comprar-para-alquilar.html':'hipotecas',
    '/guias/vivienda-o-inversion-financiera.html':'hipotecas', '/fichas/hipoteca.html':'hipotecas',
    '/jubilacion/':'pensiones', '/fichas/plan-de-pensiones.html':'pensiones', '/guias/jubilacion-autonomos.html':'pensiones'
  };

  var path = location.pathname.replace(/index\.html$/, '');
  var key = R[path];
  if (!key) { for (var r in R) { if (path.slice(-r.length) === r) { key = R[r]; break; } } }
  if (!key) return;
  var demo = /[?&]afil=demo\b/.test(location.search);
  var blk = B[key];
  var items = blk.ids.map(function(id){ return P[id]; }).filter(function(p){ return p && (p.url || demo); });
  if (!items.length) return;

  var depth = (location.pathname.match(/\//g) || []).length - 1;
  var root = depth > 0 ? Array(depth + 1).join('../') : '';
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var st = document.createElement('style');
  st.textContent =
    '.afil{border:1px solid var(--line);border-radius:16px;background:var(--soft);padding:20px;display:grid;gap:12px;margin-top:28px;max-width:44em}' +
    '.afil-h{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' +
    '.afil-tag{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);border:1px solid var(--line);background:var(--bg);border-radius:999px;padding:2px 10px}' +
    '.afil h2{font-size:1.25rem}' +
    '.afil-n{font-size:.86rem;color:var(--muted);line-height:1.5}' +
    '.afil-n a{color:inherit}' +
    '.afil ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}' +
    '.afil li{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:4px 14px;align-items:center}' +
    '.afil li b{font-family:var(--display);font-size:1.05rem}' +
    '.afil li p{grid-column:1;font-size:.92rem}' +
    '.afil li small{grid-column:1;font-size:.8rem;color:var(--muted)}' +
    '.afil li a.go{grid-column:2;grid-row:1/span 3;text-decoration:none;font-weight:700;font-size:.9rem;color:var(--on-navy);background:var(--navy);border-radius:999px;padding:9px 16px;white-space:nowrap}' +
    '.afil li a.go:hover{background:var(--green)}' +
    '.afil li .pend{grid-column:2;grid-row:1/span 3;font-size:.78rem;color:var(--warn);border:1px dashed var(--warn);border-radius:999px;padding:6px 12px;white-space:nowrap}' +
    '.afil-risk{font-size:.86rem;font-weight:700;color:var(--warn);background:var(--warn-soft);border-radius:10px;padding:10px 12px;line-height:1.45}' +
    '@media (max-width:560px){.afil{padding:16px}.afil li{grid-template-columns:1fr}.afil li a.go,.afil li .pend{grid-column:1;grid-row:auto;justify-self:start;margin-top:6px}}' +
    '@media print{.afil{display:none}}';
  document.head.appendChild(st);

  var h = '<div class="afil-h"><span class="afil-tag">Publicidad</span><h2>' + esc(blk.t) + '</h2></div>' +
    '<p class="afil-n">Enlaces de afiliado: si abres una cuenta o compras desde ellos, podemos cobrar una comisión, sin coste extra para ti. ' +
    'El orden no es una clasificación ni una recomendación personalizada. Compara condiciones y comprueba siempre el registro de la entidad. ' +
    '<a href="' + root + 'legal/transparencia.html">Cómo nos financiamos</a>.</p>';
  if (blk.cripto) h += '<p class="afil-risk">Los criptoactivos son muy volátiles y puedes perder todo lo que inviertas. Su inversión no está cubierta por fondos de garantía de depósitos ni de inversiones.</p>';
  h += '<ul>' + items.map(function(p){
    var btn = p.url
      ? '<a class="go" href="' + esc(p.url) + '" rel="sponsored nofollow noopener" target="_blank">Ver condiciones ↗</a>'
      : '<span class="pend">Enlace pendiente de alta</span>';
    return '<li><b>' + esc(p.n) + '</b><p>' + esc(p.d) + '</p><small>' + esc(p.reg) + '</small>' + btn + '</li>';
  }).join('') + '</ul>';

  var box = document.createElement('aside');
  box.className = 'afil';
  box.setAttribute('aria-label', 'Publicidad');
  box.innerHTML = h;

  function place(){
    var art = document.querySelector('article');
    var wrap = document.querySelector('.wrap');
    if (art) art.appendChild(box);
    else if (wrap) wrap.appendChild(box);
    else { var f = document.querySelector('footer'); if (f) f.parentNode.insertBefore(box, f); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
})();
