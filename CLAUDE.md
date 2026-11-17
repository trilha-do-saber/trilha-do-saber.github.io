# Trilha do Saber: instruções para o Claude

App de estudos (PWA no GitHub Pages) da filha do Pedro, 2º ano do Ensino Fundamental em 2027, Londrina/PR. O conteúdo segue a BNCC e o estilo de memorização do Classical Conversations.

## Arquivos
- `conteudo.js`: lições, geradores de questões (`GEN`) e matérias (`SUBJECTS`). **É o único lugar para conteúdo novo.** Lotes novos entram como um bloco `/* LOTE N · data */` antes da linha `MAT_LESSONS.forEach(...)`, com `Object.assign(GEN,{...})` e `X_LESSONS.push(...)`. Para uma matéria nova, crie `X_LESSONS`, defina `subject` nas lições, ligue em `SUBJECTS[i]` (`lessons`, `ready:true`, `ano`) e inclua em `LESSONS`.
- `app.js`: lógica. Só mexa para corrigir bug.
- `sw.js`, `app.js` e `versao.json`: a cada publicação, aumente a versão (`trilha-vN`) nos três lugares: `VERSAO` no sw.js, `APP_VERSAO` no app.js e `versao.json`. O app compara e se atualiza sozinho quando ela não está no meio de uma lição. O teste falha se as três forem diferentes.
- `apps-script/Codigo.gs`: cópia do servidor. Não altere sem o Pedro pedir, porque ele precisa reimplantar à mão.
- `PLANO.md`: roteiro de lições. Marque `[x]` no que publicar.
- `testes/verificar.js`: rode `node testes/verificar.js` antes de cada publicação. Se falhar, corrija ou não publique.

## Recursos do app (não remover)
- **Roteiro do dia** (`roteiro()` em `app.js`): Aquecimento → Matemática ou Português (alternados por dia) → matéria do dia, que ela escolhe entre as 2 que estão há mais tempo sem estudo (Ciências, Dinheiro, Lógica, Emoções e, nos dias configurados ou com semana nova, Memória CC). O tempo livre só abre depois do roteiro. Matérias novas que devem entrar no rodízio precisam estar na lista de `rotOpcoes`.
- **Aquecimento do dia:** 5 questões sorteadas das lições com estrela, com peso maior para as habilidades com erro nos últimos 14 dias (`warmupKeys` em `app.js`).
- **Resposta digitada:** os geradores listados no bloco "Contas com resposta digitada" de `conteudo.js` viram teclado numérico (`q.num`). Geradores numéricos novos de contas devem entrar nessa lista.
- **Missão da semana:** `MISSOES` em `conteudo.js`, uma por semana, feita fora da tela. O Pedro marca na área dos pais. Pode acrescentar missões novas ligadas às lições recentes.
- **Leitura do dia, estante e potes:** são registrados pelo Pedro na área dos pais e salvos na aba `Diario` da planilha (coluna E = JSON; tipos `leitura`, `missao`, `potes` = configuração dos potes e `pote` = cada movimento, com variações em `v.gastar/guardar/investir`; os saldos são a soma dos movimentos, e o rendimento mensal entra sozinho com id `rend-AAAA-MM`). As perguntas de leitura ficam em `LEIT_PERGUNTAS`.

## Regras do conteúdo
- Criança de 7 anos: frases curtas, palavras simples, tudo em português do Brasil. A explicação (`explain`) diz o porquê da resposta.
- Cada questão tem exatamente uma resposta certa. O `type` dos distratores descreve o erro provável, porque aparece no painel dos pais.
- Prefira geradores com variação (números aleatórios). Para conteúdo factual, use `bankGen(skill, [...])` com pelo menos 10 itens.
- Lição: 2 ou 3 slides de explicação, 6 itens de prática e 5 de desafio.
- Nada de personagens, músicas ou textos protegidos por direitos autorais. Na trilha Memória, só letras originais ou cantigas de domínio público.
- Nunca colocar nome, escola ou dados pessoais dela no repositório, que é público.

## Variedade e níveis (quem escreve as perguntas é o Claude)
- O Gemini não cria perguntas. O Claude escreve e amplia os bancos toda semana, nos lotes de `conteudo.js`.
- **Sem repetição:** `gerarItens` (app.js) não repete questão na mesma lição e evita as vistas nos últimos 5 dias (chave = habilidade + `desc`). Por isso o `desc` de cada questão precisa identificar a pergunta de forma única.
- **Níveis:** `NIVEL[habilidade]` vai de 1 a 3 (números até 30, 60 e 99), calculado no app pelas primeiras tentativas (sobe com 7 acertos nas últimas 8, desce com 3 ou menos nas últimas 6). Geradores numéricos novos devem usar `nv(skill)` e `LIM`, e entrar em `HAB_NIVEL` (app.js) se forem de nível.
- **Ampliar bancos:** use `addBanco(chave, [...])` num lote novo. Toda semana, olhe na aba `Respostas` as habilidades em que ela já viu boa parte do banco e acrescente pelo menos 10 itens novos nelas.
- O teste confere a variedade nos níveis 1 e 3: cada gerador precisa ter mais perguntas diferentes do que as usadas numa lição.

## Memória CC
A trilha Memória é montada em tempo real por `buildMemoria()` (em `conteudo.js`), a partir da aba privada `MemoriaCC` da planilha, com as colunas ciclo, semana, materia e texto. O Pedro cadastra cada semana na área dos pais, tirando foto da página do livro Foundations, que a família possui. O Gemini lê a foto pelo Apps Script (`lerFotoCC`), ele confere e salva (`salvarMemoria`); também dá para digitar à mão. Enquanto ela não abre uma semana nova, o ícone da Memória CC pisca com o selo NOVO. **Nunca copie essas frases para o repositório nem para mensagens de commit.** Elas são material protegido do Classical Conversations. A rotina pode ler a aba só para avaliar o desempenho (habilidades "Memória · ...") e pode melhorar o código das atividades.

## Dados de desempenho
Planilha "Trilha do Saber - Dados", ID `1lqJ3i7vUyY1xGPtDd9xEvWAtQ17XABTrS9iMZT2_z1E`, lida pelo conector Google Sheets. Aba `Sessoes`: colunas A a M, com o JSON da sessão na coluna N. Aba `Respostas`: habilidade, pergunta, respondeu, certo, acertou, tempoSeg e tipoErro. Aba `Diario`: leitura, missão e potes (JSON na coluna E). Progresso das lições: aba `Estado`, chave `progress` (JSON com `lessons[id].stars`).
