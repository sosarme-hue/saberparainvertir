/* Calculadoras de Saber para invertir.
   Uso: <div class="cw" data-calcs="ic,co,de" data-start="ic"></div>
   Cada campo tiene deslizador y casilla numérica sincronizados, botón para restablecer
   y una explicación visible del método y de los supuestos. */
(function(){
  'use strict';
  var nf=function(v,d){return v.toLocaleString('de-DE',/* mismo formato que es-ES pero agrupa también 4 cifras: 6.621 */ {minimumFractionDigits:d||0,maximumFractionDigits:d||0})};
  var eur=function(v,d){return nf(v,d)+' €'};
  var pct=function(v){return v.toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:2})+' %'};

  /* IRPF, base del ahorro (territorio común, ejercicio 2026) */
  function irpfAhorro(g){
    if(g<=0)return 0;
    var t=[[6000,.19],[50000,.21],[200000,.23],[300000,.27],[Infinity,.30]],prev=0,s=0;
    for(var k=0;k<t.length;k++){if(g>prev)s+=(Math.min(g,t[k][0])-prev)*t[k][1];prev=t[k][0]}
    return s;
  }
  function cuota(P,tAnual,n){var i=tAnual/100/12;return i?P*i/(1-Math.pow(1+i,-n)):P/n}

  /* Campos: [id, etiqueta, mín, máx, paso, valor inicial, unidad] */
  var CALC={
    ic:{t:'Interés compuesto',g:'Ahorro e inversión',
      f:[['a','Aportación mensual',0,2000,25,150,'€'],['y','Años',1,40,1,20,'años'],['r','Rentabilidad anual',0,10,0.5,5,'%'],['i','Capital inicial',0,100000,500,1000,'€']],
      run:function(v){var rm=v.r/100/12,s=v.i;for(var k=0;k<v.y*12;k++)s=s*(1+rm)+v.a;var put=v.i+v.a*12*v.y;
        return [['Valor final',eur(s),1],['Lo que aportas',eur(put)],['Lo que generan los intereses',eur(s-put)]]},
      met:'Cada mes el saldo crece a la rentabilidad anual dividida entre 12 y después se suma la aportación.',
      sup:'Rentabilidad constante y aportación a final de mes. En la realidad hay años buenos y malos. <b>No incluye comisiones, impuestos ni inflación:</b> para eso usa la calculadora de rentabilidad real y neta.'},
    co:{t:'Coste de las comisiones',g:'Ahorro e inversión',
      f:[['a','Aportación mensual',0,2000,25,200,'€'],['y','Años',1,40,1,25,'años'],['r','Rentabilidad anual bruta',0,10,0.5,6,'%'],['c1','Comisión anual del producto A',0,3,0.05,0.2,'%'],['c2','Comisión anual del producto B',0,3,0.05,1.5,'%']],
      run:function(v){var f=function(c){var rm=(v.r-c)/100/12,s=0;for(var k=0;k<v.y*12;k++)s=s*(1+rm)+v.a;return s};var A=f(v.c1),B=f(v.c2);
        return [['Producto A ('+pct(v.c1)+')',eur(A),1],['Producto B ('+pct(v.c2)+')',eur(B)],['Diferencia por comisiones',eur(Math.abs(A-B))]]},
      met:'Se resta cada comisión anual de la rentabilidad bruta y se acumulan las aportaciones mes a mes con la rentabilidad resultante, igual para los dos productos.',
      sup:'Rentabilidad bruta igual para ambos productos y constante. Introduce los gastos corrientes anuales que figuran en el documento de datos fundamentales de cada uno. <b>No incluye impuestos.</b>'},
    de:{t:'Depósito neto',g:'Ahorro e inversión',
      f:[['k','Importe',1000,200000,1000,10000,'€'],['t','TAE',0,6,0.05,2.5,'%'],['m','Plazo',1,60,1,12,'meses']],
      run:function(v){var b=v.k*(Math.pow(1+v.t/100,v.m/12)-1),ret=b*0.19;
        return [['Recibes neto',eur(b-ret,2),1],['Intereses brutos',eur(b,2)],['Retención del 19 %',eur(ret,2)]]},
      met:'Intereses = importe × ((1 + TAE)<sup>meses/12</sup> − 1). La retención es el 19 % de los intereses.',
      sup:'La retención del 19 % es un adelanto: <b>en la declaración puedes pagar más si tus rendimientos del ahorro superan 6.000 €</b>. El Fondo de Garantía de Depósitos cubre hasta 100.000 € por titular y entidad.'},
    rr:{t:'Rentabilidad real y neta',g:'Ahorro e inversión',nuevo:1,
      f:[['k','Capital invertido',1000,500000,1000,20000,'€'],['y','Años',1,40,1,10,'años'],['r','Rentabilidad anual bruta',-5,12,0.25,6,'%'],['c','Costes anuales',0,3,0.05,0.5,'%'],['inf','Inflación anual',0,8,0.1,2.5,'%']],
      run:function(v){var fin=v.k*Math.pow(1+(v.r-v.c)/100,v.y),gan=fin-v.k,imp=irpfAhorro(gan),neto=fin-imp;
        var rn=Math.pow(neto/v.k,1/v.y)-1,rreal=(1+rn)/(1+v.inf/100)-1,hoy=neto/Math.pow(1+v.inf/100,v.y);
        return [['Rentabilidad real anual',pct(rreal*100),1],['Rentabilidad neta anual',pct(rn*100)],['Poder de compra final (euros de hoy)',eur(hoy)],
                ['Valor final tras costes',eur(fin)],['IRPF al vender',eur(imp)],['Te queda',eur(neto)]]},
      met:'Valor = capital × (1 + rentabilidad − costes)<sup>años</sup>. La ganancia tributa al vender por los tramos de la base del ahorro (19 % a 30 %). Rentabilidad neta = (lo que te queda ÷ capital)<sup>1/años</sup> − 1. Rentabilidad real = (1 + neta) ÷ (1 + inflación) − 1.',
      sup:'Rentabilidad, costes e inflación constantes; impuesto pagado una sola vez al final, sin otras rentas del ahorro ese año. En depósitos los intereses tributan cada año y el resultado sería algo menor. Territorio común.'},
    hi:{t:'Cuota de hipoteca',g:'Deudas y vivienda',
      f:[['p','Importe del préstamo',10000,600000,5000,150000,'€'],['t','Tipo de interés anual',0,8,0.05,3,'%'],['y','Plazo',5,40,1,25,'años']],
      run:function(v){var n=v.y*12,c=cuota(v.p,v.t,n);
        return [['Cuota mensual',eur(c,2),1],['Total de intereses',eur(c*n-v.p)],['Total a devolver',eur(c*n)]]},
      met:'Sistema francés: cuota = capital × i ÷ (1 − (1 + i)<sup>−n</sup>), con i = tipo anual ÷ 12 y n = número de meses.',
      sup:'Tipo fijo durante todo el plazo. <b>No incluye</b> tasación, seguros, impuestos de la compra ni comisiones. En hipotecas variables la cuota cambia con el euríbor.'},
    am:{t:'Amortizar la hipoteca',g:'Deudas y vivienda',nuevo:1,id:'amortizacion',
      f:[['p','Capital pendiente',10000,600000,5000,150000,'€'],['t','Tipo de interés anual',0,8,0.05,3,'%'],['y','Años que quedan',1,40,1,20,'años'],['x','Cantidad que amortizas',1000,200000,1000,20000,'€'],['c','Comisión por amortizar',0,2,0.05,0,'%']],
      run:function(v){var n=v.y*12,i=v.t/100/12,c0=cuota(v.p,v.t,n),int0=c0*n-v.p,x=Math.min(v.x,v.p-1),P2=v.p-x;
        var c1=cuota(P2,v.t,n),int1=c1*n-P2,bal=P2,int2=0,m=0;
        while(bal>0.005&&m<n){var it=bal*i,pay=Math.min(c0,bal+it);bal=bal+it-pay;int2+=it;m++}
        var com=x*v.c/100;
        return [['Reducir plazo: ahorras',eur(int0-int2-com),1],['Terminas antes',(n-m)+' meses'],['Comisión',eur(com)],
                ['Reducir cuota: ahorras',eur(int0-int1-com),1],['Nueva cuota',eur(c1,2)+'<em>antes '+eur(c0,2)+'</em>'],['Intereses pendientes sin amortizar',eur(int0)]]},
      met:'Se recalcula el préstamo con el capital que queda. <b>Reducir cuota:</b> mismo plazo, cuota nueva por el sistema francés. <b>Reducir plazo:</b> misma cuota, se cuentan los meses hasta saldar la deuda. El ahorro son los intereses que dejas de pagar menos la comisión.',
      sup:'Tipo fijo durante el resto del préstamo. Comisiones máximas legales: en tipo variable, 0,15 % los 5 primeros años o 0,25 % los 3 primeros; en tipo fijo, 2 % los 10 primeros años y 1,5 % después (Ley 5/2019, art. 23). No incluye la posible pérdida de la deducción por vivienda en hipotecas anteriores a 2013.'},
    su:{t:'Coste total de una subasta',g:'Deudas y vivienda',nuevo:1,id:'subasta',
      f:[['vs','Valor de subasta',10000,600000,1000,120000,'€'],['dp','Depósito exigido',5,20,5,20,'%'],['pu','Tu puja',5000,600000,1000,90000,'€'],['itp','ITP de tu comunidad',4,11,0.5,8,'%'],['ca','Cargas que asumes (comunidad, IBI, otras)',0,100000,100,2600,'€'],['re','Reforma',0,150000,500,15000,'€'],['ab','Abogado, procurador y posesión',0,20000,100,2500,'€'],['rg','Registro y gestoría',0,5000,100,1000,'€'],['im','Margen para imprevistos',0,40,5,15,'%'],['vm','Valor de mercado reformado',10000,800000,1000,130000,'€']],
      run:function(v){var itp=v.pu*v.itp/100,imp=(v.re+v.ca)*v.im/100,tot=v.pu+itp+v.ca+v.re+v.ab+v.rg+imp,mar=v.vm-tot;
        return [['Coste total',eur(tot),1],['Sobre tu puja',(tot>v.pu?'+':'')+pct((tot/v.pu-1)*100)],['Margen frente al mercado',eur(mar)+'<em>'+pct(mar/v.vm*100)+' del valor de mercado</em>'],
                ['Depósito para pujar',eur(v.vs*v.dp/100)],['ITP',eur(itp)],['Imprevistos',eur(imp)]]},
      met:'Coste total = puja + ITP sobre la puja + cargas + reforma + gastos jurídicos + registro y gestoría + un margen de imprevistos sobre la reforma y las cargas. El margen compara ese coste con lo que vale la vivienda en el mercado una vez reformada.',
      sup:'El depósito se descuenta del precio si ganas; en las judiciales de inmuebles iniciadas desde abril de 2025 es el 20 % (mínimo 1.000 €), en notariales y de Hacienda el 5 %. <b>En algunas comunidades el ITP se calcula sobre el valor de referencia del Catastro si es mayor que la puja.</b> No incluye los meses sin poder usar o alquilar el inmueble. <a href="guias/antes-de-tu-primera-puja.html#participar">Reglas de cada subasta</a>.'},
    re:{t:'Plan de retiradas',g:'Jubilación',nuevo:1,id:'retiradas',
      f:[['k','Ahorro al empezar',10000,2000000,5000,300000,'€'],['w','Retirada el primer año',1000,150000,500,12000,'€'],['y','Años de retiradas',5,40,1,25,'años'],['r','Rentabilidad media anual',0,8,0.25,4,'%'],['inf','Inflación anual',0,6,0.1,2,'%']],
      run:function(v){
        function sim(seq,inf){var W=v.k;for(var y=0;y<v.y;y++){W-=v.w*Math.pow(1+inf/100,y);if(W<=0)return {fin:0,ano:y+1};W*=1+seq(y)/100}return {fin:W,ano:0}}
        var show=function(s){return s.ano?'<span>Se agota en el año '+s.ano+'</span>':eur(s.fin)};
        var base=sim(function(){return v.r},v.inf),fav=sim(function(){return v.r+2},v.inf),
            adv=sim(function(y){return y===0?-25:(y===1?-10:v.r+1.5)},v.inf),inf=sim(function(){return v.r},v.inf+2);
        return [['Escenario central',show(base),1],['Favorable (+2 puntos al año)',show(fav)],['Adverso (−25 % y −10 % al empezar)',show(adv)],
                ['Inflación 2 puntos más alta',show(inf)],['Tasa de retirada inicial',pct(v.w/v.k*100)],['Retirada el último año',eur(v.w*Math.pow(1+v.inf/100,v.y-1))]]},
      met:'Cada año retiras al principio la cantidad inicial actualizada por la inflación y el resto crece a la rentabilidad del escenario. El escenario adverso empieza con dos años malos y después recupera algo por encima de la media, para que la media de 25 años sea parecida: así se ve el efecto del orden de las rentabilidades.',
      sup:'Cifras nominales antes de impuestos y comisiones. No incluye la pensión pública ni otros ingresos. Los escenarios son ilustrativos, no probabilidades. <a href="guias/invertir-y-retirar.html">Cómo protegerte del riesgo de secuencia</a>.'}
  };
  var ORDER=['ic','co','de','rr','hi','am','su','re'];

  function base(){var s=document.currentScript||{};return (document.querySelector('script[src*="calculadoras.js"]')||{}).getAttribute?(document.querySelector('script[src*="calculadoras.js"]').getAttribute('data-base')||''):''}
  var BASE=base();

  function fixLinks(html){return html.replace(/href="(?!https?:|#|\/)/g,'href="'+BASE)}

  function mount(root){
    var ids=(root.getAttribute('data-calcs')||ORDER.join(',')).split(',').filter(function(k){return CALC[k]});
    var extra=root.innerHTML;root.innerHTML='';
    var list=document.createElement('div');list.className='clist';list.setAttribute('role','tablist');list.setAttribute('aria-label','Calculadoras');
    var panel=document.createElement('div');panel.className='panel';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-live','polite');
    var lastG='';
    ids.forEach(function(k){var c=CALC[k];
      if(c.g!==lastG){var g=document.createElement('p');g.className='grp';g.textContent=c.g;list.appendChild(g);lastG=c.g}
      var b=document.createElement('button');b.type='button';b.className='tab';b.setAttribute('role','tab');b.dataset.calc=k;
      b.innerHTML=c.t+(c.nuevo?'<span class="new">Nueva</span>':'');b.addEventListener('click',function(){show(k,true)});list.appendChild(b)});
    if(extra.trim()){var x=document.createElement('div');x.className='links';x.innerHTML=extra;list.appendChild(x)}
    root.appendChild(list);root.appendChild(panel);

    function show(k,focus){var c=CALC[k];
      panel.innerHTML='<div class="phead"><h3>'+c.t+'</h3><button type="button" class="reset">Restablecer valores</button></div><div class="fields">'+
        c.f.map(function(f){var id='c-'+k+'-'+f[0];return '<div class="field"><label for="'+id+'n">'+f[1]+'</label><div class="row"><input type="range" id="'+id+'" min="'+f[2]+'" max="'+f[3]+'" step="'+f[4]+'" value="'+f[5]+'" aria-label="'+f[1]+'"><span class="num"><input type="number" inputmode="decimal" id="'+id+'n" min="'+f[2]+'" max="'+f[3]+'" step="'+f[4]+'" value="'+f[5]+'"><span>'+f[6]+'</span></span></div></div>'}).join('')+
        '</div><div class="out"></div><p class="metodo"><b>Cómo se calcula.</b> '+c.met+'</p><p class="supuestos"><b>Supuestos y límites.</b> '+fixLinks(c.sup)+'</p>';
      c.f.forEach(function(f){var r=panel.querySelector('#c-'+k+'-'+f[0]),n=panel.querySelector('#c-'+k+'-'+f[0]+'n');
        r.addEventListener('input',function(){n.value=r.value;calc()});
        n.addEventListener('input',function(){var x=parseFloat(String(n.value).replace(',','.'));if(isNaN(x))return;r.value=Math.min(Math.max(x,f[2]),f[3]);calc()});
        n.addEventListener('change',function(){var x=parseFloat(String(n.value).replace(',','.'));if(isNaN(x))x=f[5];x=Math.min(Math.max(x,f[2]),f[3]);n.value=x;r.value=x;calc()})});
      panel.querySelector('.reset').addEventListener('click',function(){c.f.forEach(function(f){panel.querySelector('#c-'+k+'-'+f[0]).value=f[5];panel.querySelector('#c-'+k+'-'+f[0]+'n').value=f[5]});calc()});
      function calc(){var v={};c.f.forEach(function(f){var n=panel.querySelector('#c-'+k+'-'+f[0]+'n'),x=parseFloat(String(n.value).replace(',','.'));if(isNaN(x))x=+panel.querySelector('#c-'+k+'-'+f[0]).value;v[f[0]]=Math.min(Math.max(x,f[2]),f[3])});
        panel.querySelector('.out').innerHTML=c.run(v).map(function(o){return '<div'+(o[2]?' class="key"':'')+'><small>'+o[0]+'</small><strong>'+o[1]+'</strong></div>'}).join('')}
      calc();
      list.querySelectorAll('[data-calc]').forEach(function(b){b.setAttribute('aria-selected',b.dataset.calc===k)});
      if(focus&&root.hasAttribute('data-hash')&&history.replaceState)history.replaceState(null,'','#'+(c.id||k));
    }
    var h=(location.hash||'').slice(1),start=root.getAttribute('data-start')||ids[0];
    ids.forEach(function(k){if(h&&(h===k||h===CALC[k].id))start=k});
    show(start);
    if(h&&ids.some(function(k){return h===k||h===CALC[k].id}))setTimeout(function(){root.scrollIntoView({block:'start'})},50);
  }
  document.querySelectorAll('[data-calcs]').forEach(mount);
})();
