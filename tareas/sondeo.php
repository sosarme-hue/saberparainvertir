<?php
// Sondeo temporal 3: anuncios de subasta en los datos abiertos del BOE (sumario diario, sección V).
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
$UA = 'SaberParaInvertir/1.0 (+https://saberparainvertir.com)';
function get($u, $UA, $acc='application/json') { $ch = curl_init($u);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>1, CURLOPT_FOLLOWLOCATION=>1, CURLOPT_TIMEOUT=>30, CURLOPT_USERAGENT=>$UA, CURLOPT_HTTPHEADER=>["Accept: $acc"]]);
  $b = curl_exec($ch); $i = curl_getinfo($ch); curl_close($ch); return [is_string($b)?$b:'', $i]; }
function walk($n, $path, &$items) { if (!is_array($n)) return;
  if (isset($n['identificador']) && isset($n['titulo'])) { $items[] = ['path'=>$path, 'it'=>$n]; return; }
  foreach ($n as $k => $v) { $name = is_array($v) && isset($v['nombre']) ? $v['nombre'] : $k; walk($v, $path.' > '.$name, $items); } }
$out = "fecha ".date('c')."\n";
$f = date('Ymd', strtotime('-1 days')); if (date('N', strtotime('-1 days')) == 7) $f = date('Ymd', strtotime('-2 days'));
[$b, $i] = get("https://www.boe.es/datosabiertos/api/boe/sumario/$f", $UA);
$out .= "$f http {$i['http_code']} ".strlen($b)." primeros bytes: ".substr($b, 0, 300)."\n";
$j = json_decode($b, true); $items = []; walk($j, '', $items);
$out .= "items: ".count($items)."\n";
$secs = []; foreach ($items as $x) { $s = explode(' > ', $x['path']); $k = implode(' > ', array_slice($s, 0, 5)); $secs[$k] = ($secs[$k] ?? 0) + 1; }
foreach ($secs as $k => $c) $out .= "  $c  $k\n";
$sub = array_filter($items, fn($x) => preg_match('/subasta|enajenaci|licitaci.n.*venta/i', $x['it']['titulo']));
$out .= "\nde subasta/enajenacion: ".count($sub)."\n";
foreach (array_slice($sub, 0, 12) as $x) $out .= "- [".$x['it']['identificador']."] ".mb_substr($x['it']['titulo'], 0, 260)."\n   ruta: ".mb_substr($x['path'], 0, 200)."\n";
if ($sub) { $x = reset($sub); $out .= "\nItem completo: ".json_encode($x['it'], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n"; }
// Recuento en 10 días
$tot = 0; for ($d = 1; $d <= 14; $d++) { $f = date('Ymd', strtotime("-$d days")); [$b, $i] = get("https://www.boe.es/datosabiertos/api/boe/sumario/$f", $UA); if ($i['http_code'] != 200) continue;
  $it = []; walk(json_decode($b, true), '', $it); $n = count(array_filter($it, fn($x) => preg_match('/subasta|enajenaci/i', $x['it']['titulo']))); $tot += $n; $out .= "$f: ".count($it)." items, $n subastas\n"; }
$out .= "total 14 dias: $tot\n";
// Condiciones de reutilización
[$b] = get('https://www.boe.es/informacion/aviso_legal/index.php', $UA, 'text/html');
$t = preg_replace('/\s+/', ' ', strip_tags($b)); $p = stripos($t, 'reutiliz'); $out .= "\nAVISO LEGAL: ".mb_substr($t, max(0, $p-300), 1800)."\n";
@mkdir(__DIR__.'/salida', 0755, true); file_put_contents(__DIR__.'/salida/sondeo.txt', $out); echo "ok\n";
