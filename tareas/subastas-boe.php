<?php
/*
 * Saber para invertir · anuncios de subasta publicados en el BOE.
 * Fuente: API de datos abiertos del BOE (sumario diario) y texto HTML de cada anuncio (txt.php),
 * ambos permitidos por robots.txt de boe.es. No se lee el Portal de Subastas (subastas.boe.es),
 * cuyo robots.txt prohíbe la lectura automática: solo se enlaza.
 * Se ejecuta una vez al día por cron. Escribe subastas/datos/anuncios.json.
 */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
date_default_timezone_set('Europe/Madrid');
const UA = 'SaberParaInvertir/1.0 (+https://saberparainvertir.com)';
const DIAS = 30;
$CACHE = __DIR__.'/salida/cache';
$DEST = dirname(__DIR__).'/subastas/datos/anuncios.json';
@mkdir($CACHE, 0755, true); @mkdir(dirname($DEST), 0755, true);
$lock = fopen(__DIR__.'/salida/subastas.lock', 'c'); if (!flock($lock, LOCK_EX | LOCK_NB)) exit("ya en marcha\n");

$PROV = ['01'=>'Araba/Álava','02'=>'Albacete','03'=>'Alicante','04'=>'Almería','05'=>'Ávila','06'=>'Badajoz','07'=>'Illes Balears','08'=>'Barcelona','09'=>'Burgos','10'=>'Cáceres','11'=>'Cádiz','12'=>'Castellón','13'=>'Ciudad Real','14'=>'Córdoba','15'=>'A Coruña','16'=>'Cuenca','17'=>'Girona','18'=>'Granada','19'=>'Guadalajara','20'=>'Gipuzkoa','21'=>'Huelva','22'=>'Huesca','23'=>'Jaén','24'=>'León','25'=>'Lleida','26'=>'La Rioja','27'=>'Lugo','28'=>'Madrid','29'=>'Málaga','30'=>'Murcia','31'=>'Navarra','32'=>'Ourense','33'=>'Asturias','34'=>'Palencia','35'=>'Las Palmas','36'=>'Pontevedra','37'=>'Salamanca','38'=>'Santa Cruz de Tenerife','39'=>'Cantabria','40'=>'Segovia','41'=>'Sevilla','42'=>'Soria','43'=>'Tarragona','44'=>'Teruel','45'=>'Toledo','46'=>'Valencia','47'=>'Valladolid','48'=>'Bizkaia','49'=>'Zamora','50'=>'Zaragoza','51'=>'Ceuta','52'=>'Melilla'];

function get($u, $acc = 'application/json') {
  for ($n = 0; $n < 3; $n++) {
    $ch = curl_init($u);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>1, CURLOPT_FOLLOWLOCATION=>1, CURLOPT_TIMEOUT=>40, CURLOPT_USERAGENT=>UA, CURLOPT_HTTPHEADER=>["Accept: $acc"]]);
    $b = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($c == 200 && is_string($b)) return $b;
    if ($c == 404) return null;
    sleep(3);
  }
  return false;
}
function items($n, $dep, &$out, $key = '') {
  if (!is_array($n)) return;
  if (isset($n['identificador'], $n['titulo'])) { $out[] = $n + ['_dep' => $dep]; return; }
  if ($key === 'departamento' && isset($n['nombre'])) $dep = $n['nombre'];
  foreach ($n as $k => $v) items($v, $dep, $out, is_int($k) ? $key : $k);
}
function texto($html) {
  if (preg_match('#<div id="textoxslt">(.*?)</div>#s', $html, $m)) $html = $m[1];
  return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8')));
}
function organismo($dep, $t) {
  if (preg_match('/subastas?\b/i', $t) && preg_match('/^(U\.R\.|E\.R\.)/', $t)) return 'Agencia Tributaria';
  if (stripos($t, 'Tesorería General de la Seguridad Social') !== false || stripos($dep, 'SEGURIDAD SOCIAL') !== false) return 'Seguridad Social';
  if (stripos($dep, 'DEFENSA') !== false) return 'Defensa';
  if (stripos($t, 'Economía y Hacienda') !== false || stripos($t, 'Patrimonio') !== false) return 'Patrimonio del Estado';
  if (stripos($t, 'FOGASA') !== false || stripos($t, 'Fondo de Garantía Salarial') !== false) return 'FOGASA';
  if (stripos($t, 'ADIF') !== false) return 'ADIF';
  return mb_convert_case(mb_strtolower($dep), MB_CASE_TITLE);
}

$hoy = new DateTime('today');
$todos = []; $leidos = 0;
for ($d = 0; $d < DIAS; $d++) {
  $f = (clone $hoy)->modify("-$d days")->format('Ymd');
  $cf = "$CACHE/$f.json";
  if (is_file($cf)) { $dia = json_decode(file_get_contents($cf), true); if (is_array($dia)) { $todos = array_merge($todos, $dia); continue; } }
  $b = get("https://www.boe.es/datosabiertos/api/boe/sumario/$f");
  if ($b === null) { if ($d > 0) file_put_contents($cf, '[]'); continue; }   // sin BOE ese día (domingo/festivo)
  if ($b === false) continue;                                                // error temporal: se reintenta mañana
  $its = []; items(json_decode($b, true), '', $its);
  $dia = []; $ok = true;
  foreach ($its as $it) {
    $t = $it['titulo'];
    if (strpos($it['identificador'], 'BOE-B') !== 0) continue;
    if (!preg_match('/subasta|enajenaci/iu', $t)) continue;
    $a = ['fecha' => substr($f,0,4).'-'.substr($f,4,2).'-'.substr($f,6,2), 'boe' => $it['identificador'], 'organismo' => organismo($it['_dep'], $t),
          'titulo' => $t, 'url_boe' => $it['url_html'] ?? "https://www.boe.es/diario_boe/txt.php?id=".$it['identificador'],
          'provincia' => '', 'zona' => '', 'referencia' => '', 'url_portal' => '', 'correccion' => (bool)preg_match('/correcci|anulaci|suspensi/iu', $t)];
    if (preg_match('/^(?:U\.R\.|E\.R\.)\s*SUBASTAS[\s.]*(?:SEDE\s+)?(.+)$/iu', $t, $m)) $a['zona'] = mb_convert_case(mb_strtolower(trim(preg_replace('/\s*\d+$/', '', $m[1]))), MB_CASE_TITLE);
    // Los anuncios breves de la Agencia Tributaria solo traen la referencia y el enlace al portal: se leen del texto del anuncio.
    if ($a['organismo'] === 'Agencia Tributaria') {
      usleep(800000); $leidos++;
      $h = get($a['url_boe'], 'text/html');
      if ($h === false) { $ok = false; break; }
      $tx = $h ? texto($h) : '';
      if (preg_match('#https://subastas\.boe\.es/ds\.php\?id=([A-Z0-9-]+)#', $tx, $m)) { $a['url_portal'] = $m[0]; $a['referencia'] = $m[1]; }
      if (preg_match('/referencia\s+(S\d{4}R(\d{2})\d+)/u', $tx, $m)) { $a['provincia'] = $PROV[$m[2]] ?? ''; if (!$a['referencia']) $a['referencia'] = $m[1]; }
      $a['titulo'] = 'Subasta de la Agencia Tributaria'.($a['provincia'] ? ' en '.$a['provincia'] : ($a['zona'] ? ' ('.$a['zona'].')' : ''));
    } else {
      foreach ($PROV as $p) if (mb_stripos($t, $p) !== false) { $a['provincia'] = $p; break; }
    }
    $dia[] = $a;
  }
  if (!$ok) continue;
  if ($d > 0 || (int)date('G') >= 9) file_put_contents($cf, json_encode($dia, JSON_UNESCAPED_UNICODE));
  $todos = array_merge($todos, $dia);
}
// Limpieza de caché antigua
foreach (glob("$CACHE/*.json") as $c) if (basename($c, '.json') < (clone $hoy)->modify('-'.(DIAS+5).' days')->format('Ymd')) @unlink($c);

usort($todos, fn($x, $y) => strcmp($y['fecha'], $x['fecha']) ?: strcmp($y['boe'], $x['boe']));
$json = ['actualizado' => date('c'), 'dias' => DIAS, 'fuente' => 'Agencia Estatal Boletín Oficial del Estado (datos abiertos)', 'anuncios' => $todos];
$tmp = "$DEST.tmp";
file_put_contents($tmp, json_encode($json, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
rename($tmp, $DEST);
echo date('c')." anuncios: ".count($todos)." (textos leídos: $leidos)\n";
