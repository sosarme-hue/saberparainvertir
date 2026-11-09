<?php
// Sondeo temporal 2: fuentes que permiten lectura automática.
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
$UA = 'SaberParaInvertir/1.0 (+https://saberparainvertir.com)';
function get($u, $UA) {
  $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>1, CURLOPT_FOLLOWLOCATION=>1, CURLOPT_TIMEOUT=>25, CURLOPT_USERAGENT=>$UA, CURLOPT_HTTPHEADER=>['Accept: application/json, text/html;q=0.9, */*;q=0.5']]);
  $b = curl_exec($ch); $i = curl_getinfo($ch); curl_close($ch);
  return [is_string($b) ? $b : '', $i];
}
$out = "fecha ".date('c')."\n";
// 1. Anuncios de subasta en el sumario del BOE, últimos 15 días hábiles
$total = 0;
for ($d = 0; $d < 21; $d++) {
  $f = date('Ymd', strtotime("-$d days"));
  [$b, $i] = get("https://www.boe.es/datosabiertos/api/boe/sumario/$f", $UA);
  if ($i['http_code'] != 200) { $out .= "$f sin sumario ({$i['http_code']})\n"; continue; }
  preg_match_all('/"titulo":"((?:[^"\\\\]|\\\\.)*)"/u', $b, $m);
  $sub = array_values(array_filter(array_map(fn($t) => json_decode('"'.$t.'"'), $m[1]), fn($t) => stripos($t, 'subasta') !== false || stripos($t, 'enajenaci') !== false));
  $total += count($sub);
  $out .= "$f: ".count($m[1])." anuncios, ".count($sub)." de subasta\n";
  foreach (array_slice($sub, 0, 4) as $t) $out .= "   - ".mb_substr($t, 0, 220)."\n";
}
$out .= "TOTAL subastas en sumarios: $total\n";
// Estructura de un item del sumario (para saber qué campos hay)
[$b] = get("https://www.boe.es/datosabiertos/api/boe/sumario/".date('Ymd', strtotime('-1 days')), $UA);
if (preg_match('/\{"identificador":"BOE-B[^{}]*(\{[^{}]*\}[^{}]*)*\}/u', $b, $m)) $out .= "\nEjemplo item V: ".mb_substr($m[0], 0, 900)."\n";
// 2. AEAT
foreach (['https://www2.agenciatributaria.gob.es/robots.txt', 'https://sede.agenciatributaria.gob.es/robots.txt',
  'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/taiif/subastaInmuebles/index.html',
  'https://subastas.boe.es/textoPolitica.php', 'https://sede.seg-social.gob.es/robots.txt'] as $u) {
  [$b, $i] = get($u, $UA);
  $out .= "\n=== $u {$i['http_code']} ".strlen($b)."\n";
  if (str_ends_with($u, 'index.html')) { preg_match_all('/(?:src|href)="([^"]+\.js[^"]*)"/', $b, $m); $out .= "scripts: ".implode(' ', $m[1])."\n";
    foreach ($m[1] as $s) { if (strpos($s, 'main') === false && strpos($s, 'app') === false) continue; $su = (strpos($s,'http')===0)?$s:'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/taiif/subastaInmuebles/'.ltrim($s,'/');
      [$js] = get($su, $UA); preg_match_all('#["\'](/?[a-zA-Z0-9_\-/]*(?:wlpl|api|SREM|json)[a-zA-Z0-9_\-/.?=&]*)["\']#', $js, $mm); $out .= "  $s endpoints: ".implode(' ', array_slice(array_unique($mm[1]), 0, 30))."\n"; } }
  else $out .= mb_substr(preg_replace('/\s+/', ' ', strip_tags($b)), 0, 1500)."\n";
}
@mkdir(__DIR__.'/salida', 0755, true);
file_put_contents(__DIR__.'/salida/sondeo.txt', $out);
echo "ok\n";
