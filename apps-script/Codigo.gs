/**
 * Trilha do Saber · servidor no Google Apps Script
 * Guarda os dados na planilha, chama o Gemini (opcional) e envia alertas.
 *
 * Como instalar: veja o arquivo LEIA-ME.md, passo 2.
 * Depois de colar este código, rode a função "configurar" uma vez.
 */

const FUSO = 'America/Sao_Paulo';
const PROPS = PropertiesService.getScriptProperties();
const LIMITE_IA_POR_DIA = 60;

/* ===================== INSTALAÇÃO ===================== */

/** Rode UMA vez pelo editor (selecione "configurar" e clique em Executar). */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  criarAba_(ss, 'Sessoes', ['id', 'data', 'inicio', 'fim', 'minutosAtivos', 'materia', 'licao', 'etapa', 'desafio', 'total', 'estrelas', 'ajudasIA', 'nRespostas', 'json']);
  criarAba_(ss, 'Respostas', ['sessaoId', 'quando', 'materia', 'licao', 'etapa', 'habilidade', 'pergunta', 'respondeu', 'certo', 'acertou', 'tempoSeg', 'tipoErro', 'tentativa']);
  criarAba_(ss, 'Estado', ['chave', 'json', 'atualizado']);
  criarAba_(ss, 'MemoriaCC', ['ciclo', 'semana', 'materia', 'texto']);
  criarAba_(ss, 'Diario', ['id', 'data', 'tipo', 'resumo', 'json']);

  if (!PROPS.getProperty('TOKEN')) PROPS.setProperty('TOKEN', Utilities.getUuid().replace(/-/g, ''));
  if (!PROPS.getProperty('HORA_ALERTA')) PROPS.setProperty('HORA_ALERTA', '19');
  if (!PROPS.getProperty('EMAIL_ALERTA')) PROPS.setProperty('EMAIL_ALERTA', Session.getEffectiveUser().getEmail());

  // gatilhos: alerta diário e relatório semanal
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('alertaDiario').timeBased().everyDays(1)
    .atHour(Number(PROPS.getProperty('HORA_ALERTA'))).inTimezone(FUSO).create();
  ScriptApp.newTrigger('relatorioSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(20).inTimezone(FUSO).create();

  Logger.log('Pronto! Seu TOKEN secreto é: ' + PROPS.getProperty('TOKEN'));
  Logger.log('Alertas vão para: ' + PROPS.getProperty('EMAIL_ALERTA') + ' às ' + PROPS.getProperty('HORA_ALERTA') + 'h');
}

/** Rode uma vez para criar as abas novas (MemoriaCC e Diario) sem mexer nos alertas. */
function criarAbasNovas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  criarAba_(ss, 'MemoriaCC', ['ciclo', 'semana', 'materia', 'texto']);
  criarAba_(ss, 'Diario', ['id', 'data', 'tipo', 'resumo', 'json']);
}
function criarAbaMemoria() { criarAbasNovas(); }

function lerMemoria_() {
  const sh = aba_('MemoriaCC');
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues()
    .filter(r => String(r[3]).trim())
    .map(r => ({ ciclo: String(r[0]), semana: Number(r[1]) || 0, materia: String(r[2]), texto: String(r[3]) }));
}

function criarAba_(ss, nome, cab) {
  let sh = ss.getSheetByName(nome);
  if (!sh) sh = ss.insertSheet(nome);
  if (sh.getLastRow() === 0) {
    sh.appendRow(cab);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, cab.length).setFontWeight('bold');
  }
  return sh;
}

/* ===================== API DO APP ===================== */

function doGet() {
  return ContentService.createTextOutput('Trilha do Saber: servidor funcionando.');
}

function doPost(e) {
  let res;
  try {
    const req = JSON.parse(e.postData.contents || '{}');
    if (!req.token || req.token !== PROPS.getProperty('TOKEN')) throw new Error('token_invalido');
    const p = req.payload || {};
    switch (req.action) {
      case 'ping': res = { aiReady: !!PROPS.getProperty('GEMINI_KEY') }; break;
      case 'getAll': res = getAll_(); break;
      case 'saveSession': res = comTrava_(() => salvarSessao_(p)); break;
      case 'saveProgress': res = comTrava_(() => salvarEstado_('progress', p)); break;
      case 'saveConfig': res = comTrava_(() => salvarEstado_('config', p)); break;
      case 'saveDiario': res = comTrava_(() => salvarDiario_(p)); break;
      case 'ai': res = ia_(p); break;
      case 'lerFotoCC': res = lerFotoCC_(p); break;
      case 'salvarMemoria': res = comTrava_(() => salvarMemoria_(p)); break;
      default: throw new Error('acao_desconhecida');
    }
    return json_({ ok: true, data: res });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function comTrava_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function aba_(nome) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome); }

function salvarSessao_(s) {
  if (!s || !s.id) throw new Error('sessao_invalida');
  const sh = aba_('Sessoes');
  const respostas = s.answers || [];
  const achado = sh.getRange('A:A').createTextFinder(String(s.id)).matchEntireCell(true).findNext();
  const jaGravadas = achado ? Number(sh.getRange(achado.getRow(), 13).getValue()) || 0 : 0;
  const linha = [
    s.id, s.date, dataHora_(s.start), dataHora_(s.end), Math.round((s.activeMs || 0) / 60000 * 10) / 10,
    s.subject || '', s.lessonTitle || '', s.phaseReached || '',
    s.quizScore == null ? '' : s.quizScore, s.quizTotal || '', s.stars == null ? '' : s.stars,
    s.aiHelps || 0, respostas.length, JSON.stringify(s)
  ];
  if (achado) sh.getRange(achado.getRow(), 1, 1, linha.length).setValues([linha]);
  else sh.appendRow(linha);

  // grava só as respostas novas
  const novas = respostas.slice(jaGravadas).map(a => [
    s.id, dataHora_(a.ts), s.subject || '', s.lessonTitle || '', a.phase === 'quiz' ? 'Desafio' : 'Praticar',
    a.skill || '', a.q || '', a.given || '', a.correct || '', a.ok ? 'sim' : 'não',
    Math.round((a.ms || 0) / 100) / 10, a.type || '', a.attempt || 1
  ]);
  if (novas.length) {
    const r = aba_('Respostas');
    r.getRange(r.getLastRow() + 1, 1, novas.length, novas[0].length).setValues(novas);
  }
  return { saved: s.id };
}

function salvarDiario_(r) {
  if (!r || !r.id) throw new Error('registro_invalido');
  let sh = aba_('Diario');
  if (!sh) { criarAbasNovas(); sh = aba_('Diario'); }
  const resumo = r.tipo === 'leitura' ? (r.livro + ' · ' + r.minutos + ' min · ' + r.quem + (r.recontou ? ' · recontou' : ''))
    : r.tipo === 'missao' ? ('Missão feita: ' + r.texto)
    : r.tipo === 'potes' ? ('Gastar R$ ' + r.gastar + ' · Guardar R$ ' + r.guardar + ' · Doar R$ ' + r.doar + (r.metaNome ? ' · Meta: ' + r.metaNome + ' R$ ' + r.metaValor : '')) : '';
  const linha = [r.id, r.data || '', r.tipo || '', resumo, JSON.stringify(r)];
  const achado = sh.getRange('A:A').createTextFinder(String(r.id)).matchEntireCell(true).findNext();
  if (achado) sh.getRange(achado.getRow(), 1, 1, linha.length).setValues([linha]);
  else sh.appendRow(linha);
  return { saved: r.id };
}

function lerDiario_() {
  const sh = aba_('Diario');
  if (!sh || sh.getLastRow() < 2) return [];
  const ini = Math.max(2, sh.getLastRow() - 399);
  return sh.getRange(ini, 5, sh.getLastRow() - ini + 1, 1).getValues()
    .map(x => { try { return JSON.parse(x[0]); } catch (e) { return null; } }).filter(Boolean);
}

function salvarEstado_(chave, valor) {
  const sh = aba_('Estado');
  const achado = sh.getRange('A:A').createTextFinder(chave).matchEntireCell(true).findNext();
  const linha = [chave, JSON.stringify(valor), new Date()];
  if (achado) sh.getRange(achado.getRow(), 1, 1, 3).setValues([linha]);
  else sh.appendRow(linha);
  return { saved: chave };
}

function lerEstado_(chave) {
  const sh = aba_('Estado');
  const achado = sh.getRange('A:A').createTextFinder(chave).matchEntireCell(true).findNext();
  return achado ? JSON.parse(sh.getRange(achado.getRow(), 2).getValue() || 'null') : null;
}

function getAll_() {
  const sh = aba_('Sessoes');
  const n = sh.getLastRow() - 1;
  let sessoes = [];
  if (n > 0) {
    const ini = Math.max(2, sh.getLastRow() - 299);
    sessoes = sh.getRange(ini, 14, sh.getLastRow() - ini + 1, 1).getValues()
      .map(r => { try { return JSON.parse(r[0]); } catch (e) { return null; } })
      .filter(Boolean);
  }
  return { config: lerEstado_('config'), progress: lerEstado_('progress'), sessions: sessoes, memoria: lerMemoria_(), diario: lerDiario_(), aiReady: !!PROPS.getProperty('GEMINI_KEY') };
}

function dataHora_(ms) {
  return ms ? Utilities.formatDate(new Date(ms), FUSO, 'dd/MM/yyyy HH:mm:ss') : '';
}

/* ===================== IA (GEMINI, OPCIONAL) ===================== */

function contarUsoIA_() {
  const hoje = Utilities.formatDate(new Date(), FUSO, 'yyyy-MM-dd');
  const chave = 'IA_USO_' + hoje;
  const uso = Number(PROPS.getProperty(chave) || 0);
  if (uso >= LIMITE_IA_POR_DIA) throw new Error('limite_ia');
  PROPS.setProperty(chave, String(uso + 1));
}

function ia_(p) {
  if (!PROPS.getProperty('GEMINI_KEY')) throw new Error('ia_nao_configurada');
  contarUsoIA_();
  const prompt = String(p.prompt || '').slice(0, 12000);
  return { text: gemini_(prompt, p.kind === 'analyze' ? 1500 : 400) };
}

function gemini_(prompt, maxTokens) {
  return geminiParts_([{ text: prompt }], maxTokens, false);
}

function geminiParts_(parts, maxTokens, json) {
  const key = PROPS.getProperty('GEMINI_KEY');
  const modelo = PROPS.getProperty('GEMINI_MODEL') || 'gemini-3.5-flash-lite';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + modelo + ':generateContent';
  const cfg = { temperature: json ? 0.1 : 0.6, maxOutputTokens: maxTokens || 800 };
  if (json) cfg.responseMimeType = 'application/json';
  const r = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-goog-api-key': key },
    payload: JSON.stringify({ contents: [{ role: 'user', parts: parts }], generationConfig: cfg })
  });
  const j = JSON.parse(r.getContentText());
  if (r.getResponseCode() !== 200) throw new Error('gemini_' + r.getResponseCode() + (j.error ? ': ' + j.error.message : ''));
  const c = j.candidates && j.candidates[0];
  return c && c.content && c.content.parts ? c.content.parts.map(x => x.text || '').join('').trim() : '';
}

/* ===================== MEMÓRIA CC POR FOTO ===================== */

/** Lê fotos de páginas do livro Foundations (material da família) e devolve as frases por matéria, para o Pedro conferir. */
function lerFotoCC_(p) {
  if (!PROPS.getProperty('GEMINI_KEY')) throw new Error('ia_nao_configurada');
  const imgs = (p.imagens || []).slice(0, 4);
  if (!imgs.length) throw new Error('sem_imagem');
  contarUsoIA_();
  const prompt = 'Estas são fotos de páginas do guia Foundations do Classical Conversations, livro que a família possui, '
    + 'para uso privado nos estudos da filha. Transcreva fielmente o conteúdo de memorização (memory work) '
    + 'da semana ' + p.semana + ' do ciclo ' + p.ciclo + ', separado por matéria. '
    + 'Ignore instruções ao professor, atividades, números de página e textos decorativos. '
    + 'Use estes nomes de matéria quando couber: História, Geografia, Ciências, Matemática, Inglês, Latim, Linha do tempo. '
    + 'Se uma matéria tiver várias frases, junte em um só texto. Se não achar a semana pedida, use o conteúdo de memorização visível. '
    + 'Responda somente JSON no formato {"itens":[{"materia":"História","texto":"..."}]}.';
  const parts = [{ text: prompt }].concat(imgs.map(b => ({ inline_data: { mime_type: 'image/jpeg', data: b } })));
  const txt = geminiParts_(parts, 3000, true);
  let j;
  try { j = JSON.parse(txt.replace(/^```(json)?/, '').replace(/```$/, '').trim()); } catch (e) { throw new Error('ia_resposta_invalida'); }
  const itens = (j.itens || []).filter(x => x && x.texto)
    .map(x => ({ materia: String(x.materia || 'Memória').slice(0, 40), texto: String(x.texto).slice(0, 800) }));
  return { itens: itens };
}

/** Grava (ou substitui) as frases de uma semana na aba MemoriaCC. */
function salvarMemoria_(p) {
  const ciclo = String(p.ciclo || '1'), semana = Number(p.semana) || 0;
  const itens = (p.itens || []).filter(x => x && String(x.texto || '').trim());
  if (!semana || !itens.length) throw new Error('semana_vazia');
  let sh = aba_('MemoriaCC');
  if (!sh) { criarAbasNovas(); sh = aba_('MemoriaCC'); }
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
    for (let i = vals.length - 1; i >= 0; i--) {
      if (String(vals[i][0]) === ciclo && Number(vals[i][1]) === semana) sh.deleteRow(i + 2);
    }
  }
  const linhas = itens.map(x => [ciclo, semana, String(x.materia || 'Memória').slice(0, 40), String(x.texto).trim().slice(0, 800)]);
  sh.getRange(sh.getLastRow() + 1, 1, linhas.length, 4).setValues(linhas);
  return { salvas: linhas.length };
}

/** Rode pelo editor para testar a IA depois de colocar a GEMINI_KEY. */
function testarIA() {
  Logger.log(gemini_('Diga "olá" em uma frase curta para uma criança.', 100));
}

/* ===================== ALERTAS ===================== */

function sessoesDesde_(dias) {
  const limite = Date.now() - dias * 86400000;
  const sh = aba_('Sessoes');
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 14, sh.getLastRow() - 1, 1).getValues()
    .map(r => { try { return JSON.parse(r[0]); } catch (e) { return null; } })
    .filter(s => s && s.start >= limite);
}

function alertaDiario() {
  const hoje = Utilities.formatDate(new Date(), FUSO, 'yyyy-MM-dd');
  const cfg = lerEstado_('config') || {};
  const meta = cfg.goal || 20;
  const min = Math.round(sessoesDesde_(1).filter(s => s.date === hoje).reduce((a, s) => a + (s.activeMs || 0), 0) / 60000);
  const nome = cfg.childName || 'Ela';
  const ontem = Utilities.formatDate(new Date(Date.now() - 86400000), FUSO, 'yyyy-MM-dd');
  const leu = lerDiario_().some(r => r.tipo === 'leitura' && (r.data === hoje || r.data === ontem));
  const avisos = [];
  if (min < meta) avisos.push(min === 0 ? nome + ' ainda não estudou hoje na Trilha do Saber.' : nome + ' estudou ' + min + ' min hoje (meta: ' + meta + ' min).');
  if (!leu) avisos.push('Não há leitura registrada ontem nem hoje. Que tal 15 minutos de leitura juntos antes de dormir?');
  if (avisos.length) avisar_('Trilha do Saber: lembrete de hoje', avisos.join('\n\n'));
}

function relatorioSemanal() {
  const ss = sessoesDesde_(7);
  const cfg = lerEstado_('config') || {};
  const respostas = ss.flatMap(s => s.answers || []);
  const acertos = respostas.filter(a => a.ok).length;
  const porDia = {};
  ss.forEach(s => porDia[s.date] = (porDia[s.date] || 0) + (s.activeMs || 0));
  const erros = {};
  respostas.filter(a => !a.ok).forEach(a => erros[a.type] = (erros[a.type] || 0) + 1);
  const topErros = Object.entries(erros).sort((a, b) => b[1] - a[1]).slice(0, 5);

  let txt = 'Resumo dos últimos 7 dias\n\n';
  txt += 'Dias com estudo: ' + Object.keys(porDia).length + ' de 7\n';
  txt += 'Tempo total: ' + Math.round(Object.values(porDia).reduce((a, b) => a + b, 0) / 60000) + ' min\n';
  txt += 'Respostas: ' + respostas.length + (respostas.length ? ' (' + Math.round(acertos / respostas.length * 100) + '% de acerto)' : '') + '\n';
  txt += 'Lições concluídas: ' + ss.filter(s => s.phaseReached === 'done').map(s => s.subject + ' · ' + s.lessonTitle + ' (' + s.stars + '★)').join(', ') + '\n';
  const lim7 = Date.now() - 7 * 86400000, diario = lerDiario_();
  const leit = diario.filter(r => r.tipo === 'leitura' && r.ts >= lim7);
  txt += 'Leitura: ' + new Set(leit.map(r => r.data)).size + ' dias, ' + leit.reduce((a, r) => a + (r.minutos || 0), 0) + ' min'
    + (leit.length ? ' (' + [...new Set(leit.map(r => r.livro))].join(', ') + ')' : '') + '\n';
  txt += 'Missão da semana: ' + (diario.some(r => r.tipo === 'missao' && r.ts >= lim7) ? 'feita' : 'não registrada') + '\n';
  if (topErros.length) txt += '\nErros mais frequentes:\n' + topErros.map(([t, n]) => '- ' + t + ': ' + n + 'x').join('\n') + '\n';

  if (PROPS.getProperty('GEMINI_KEY') && respostas.length) {
    try {
      txt += '\n— Análise —\n' + gemini_('Você ajuda um pai a acompanhar a filha de 7 anos (2º ano, Brasil) num app de reforço. ' +
        'Em até 150 palavras, em português, diga pontos fortes, o que reforçar e uma atividade fora da tela para esta semana. ' +
        'Texto simples, sem markdown. Dados:\n' + txt, 800);
    } catch (e) { console.warn(e); }
  }
  avisar_('Trilha do Saber: relatório da semana' + (cfg.childName ? ' · ' + cfg.childName : ''), txt);
}

function avisar_(assunto, texto) {
  MailApp.sendEmail(PROPS.getProperty('EMAIL_ALERTA'), assunto, texto);
  const tg = PROPS.getProperty('TELEGRAM_TOKEN'), chat = PROPS.getProperty('TELEGRAM_CHAT_ID');
  if (tg && chat) {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + tg + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({ chat_id: chat, text: assunto + '\n\n' + texto })
    });
  }
}
