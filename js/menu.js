/* Menú agrupado: un solo desplegable abierto a la vez; se cierra al pulsar fuera o con Escape. */
(function(){
  var dds=document.querySelectorAll('.menu .dd details');
  if(!dds.length)return;
  dds.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)dds.forEach(function(o){if(o!==d)o.open=false})})});
  document.addEventListener('click',function(e){if(!e.target.closest('.menu .dd'))dds.forEach(function(d){d.open=false})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')dds.forEach(function(d){if(d.open){d.open=false;d.querySelector('summary').focus()}})});
})();
