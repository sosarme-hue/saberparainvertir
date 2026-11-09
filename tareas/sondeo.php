<?php
// Sondeo temporal: comprueba qué fuentes oficiales responden desde el servidor.
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
$UA = 'SaberParaInvertir/1.0 (+https://saberparainvertir.com)';
$hoy = date('Ymd');
$urls = [
  'boe_robots' => 'https://www.boe.es/robots.txt',
  'subastas_robots' => 'https://subastas.boe.es/robots.txt',
  'boe_sumario' => "https://www.boe.es/datosabiertos/api/boe/sumario/$hoy",
  'subastas_portada' => 'https://subastas.boe.es/',
  'subastas_ej' => 'https://subastas.boe.es/subastas_ava.php?campo%5B2%5D=SUBASTA.ESTADO&dato%5B2%5D=EJ&page_hits=50&sort_field%5B0%5D=SUBASTA.FECHA_FIN&sort_order%5B0%5D=desc&accion=Buscar',
  'subastas_ava' => 'https://subastas.boe.es/subastas_ava.php',
  'ss_sede' => 'https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/subastas',
  'ss_web' => 'https://www.seg-social.es/wps/portal/wss/internet/Subastas',
  'aeat_subastas' => 'https://sede.agenciatributaria.gob.es/Sede/subastas.html',
];
$out = "PHP ".PHP_VERSION." dir ".__DIR__." fecha ".date('c')."\n";
foreach ($urls as $k => $u) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>1, CURLOPT_FOLLOWLOCATION=>1, CURLOPT_TIMEOUT=>25, CURLOPT_USERAGENT=>$UA,
    CURLOPT_HTTPHEADER=>['Accept: application/json, text/html;q=0.9, */*;q=0.5']]);
  $b = curl_exec($ch); $i = curl_getinfo($ch); $e = curl_error($ch); curl_close($ch);
  if (!is_string($b)) $b = '';
  if (stripos($i['content_type'] ?? '', 'iso-8859') !== false) $b = mb_convert_encoding($b, 'UTF-8', 'ISO-8859-1');
  $out .= "\n=== $k ".$i['http_code']." ".($i['content_type'] ?? '')." ".strlen($b)." bytes ".$i['url']." $e\n";
  if ($k === 'boe_robots' || $k === 'subastas_robots') { $out .= substr($b, 0, 1500)."\n"; continue; }
  if ($k === 'boe_sumario') {
    $j = json_decode($b, true);
    if ($j) { $txt = json_encode($j, JSON_UNESCAPED_UNICODE);
      preg_match_all('/"nombre":"([^"]{0,90})"/u', $txt, $m); $out .= "secciones/nombres: ".implode(' | ', array_slice(array_unique($m[1]), 0, 60))."\n";
      $out .= "menciones subasta: ".preg_match_all('/subasta/iu', $txt)."\n";
      preg_match_all('/"titulo":"([^"]*subasta[^"]*)"/iu', $txt, $t); $out .= implode("\n", array_slice($t[1], 0, 8))."\n";
    } else $out .= substr($b, 0, 400)."\n";
    continue;
  }
  preg_match_all('/href="([^"]*(?:idSub|detalle|subasta)[^"]*)"/i', $b, $m);
  $out .= "enlaces: ".count($m[1])."\n".implode("\n", array_slice(array_unique($m[1]), 0, 15))."\n";
  $plain = preg_replace('/\s+/', ' ', strip_tags(preg_replace('#<(script|style)[^>]*>.*?</\1>#si', '', $b)));
  $out .= substr($plain, 0, 1800)."\n";
}
@mkdir(__DIR__.'/salida', 0755, true);
file_put_contents(__DIR__.'/salida/sondeo.txt', $out);
echo $out;
