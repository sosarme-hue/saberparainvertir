<?php
// Sondeo temporal 4: contenido de anuncios de subasta del BOE (txt.php, permitido por robots.txt).
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
if (file_exists(__DIR__.'/salida/sondeo4.done')) exit;
touch(__DIR__.'/salida/sondeo4.done');
$UA = 'SaberParaInvertir/1.0 (+https://saberparainvertir.com)';
function get($u, $UA, $acc='application/json') { $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>1, CURLOPT_FOLLOWLOCATION=>1, CURLOPT_TIMEOUT=>30, CURLOPT_USERAGENT=>$UA, CURLOPT_HTTPHEADER=>["Accept: $acc"]]);
  $b = curl_exec($ch); $i = curl_getinfo($ch); curl_close($ch); return [is_string($b)?$b:'', $i]; }
function walk($n, $path, &$items) { if (!is_array($n)) return;
  if (isset($n['identificador']) && isset($n['titulo'])) { $items[] = ['path'=>$path, 'it'=>$n]; return; }
  foreach ($n as $k => $v) { $name = is_array($v) && isset($v['nombre']) ? $v['nombre'] : $k; walk($v, $path.' > '.$name, $items); } }
$out = "fecha ".date('c')."\n";
$muestras = [];
foreach (['20261031', '20261107', '20261027'] as $f) {
  [$b] = get("https://www.boe.es/datosabiertos/api/boe/sumario/$f", $UA); $it = []; walk(json_decode($b, true), '', $it);
  $sub = array_values(array_filter($it, fn($x) => preg_match('/subasta|enajenaci/i', $x['it']['titulo']) && strpos($x['it']['identificador'], 'BOE-B') === 0));
  $dist = []; foreach ($sub as $x) { preg_match('/departamento > ([^>]+) >/', $x['path'], $m); $k = trim($m[1] ?? '?').' | '.mb_substr($x['it']['titulo'], 0, 60); $dist[$k] = ($dist[$k] ?? 0) + 1; }
  arsort($dist); $out .= "\n$f anuncios B de subasta: ".count($sub)."\n"; foreach (array_slice($dist, 0, 15, true) as $k => $c) $out .= "  $c  $k\n";
  // muestras de distintos títulos
  $vistos = []; foreach ($sub as $x) { $t = mb_substr($x['it']['titulo'], 0, 25); if (isset($vistos[$t])) continue; $vistos[$t] = 1; $muestras[] = $x['it']; if (count($vistos) >= 2) break; }
}
foreach (array_slice($muestras, 0, 5) as $m) {
  sleep(1);
  [$b, $i] = get($m['url_html'], $UA, 'text/html');
  if (preg_match('#<div id="textoxslt">(.*?)</div>\s*</div>#s', $b, $mm)) $b = $mm[1];
  $t = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags(str_replace(['</p>', '<br'], ["\n</p>", "\n<br"], $b)), ENT_QUOTES, 'UTF-8')));
  $out .= "\n===== ".$m['identificador']." ".$m['titulo']." ({$i['http_code']})\n".mb_substr($t, 0, 2500)."\n";
}
file_put_contents(__DIR__.'/salida/sondeo.txt', $out); echo "ok\n";
