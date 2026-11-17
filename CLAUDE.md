# Trilha do Saber: instruções para o Claude

App de estudos (PWA no GitHub Pages) da filha do Pedro, 2º ano do Ensino Fundamental em 2027, Londrina/PR. O conteúdo segue a BNCC e o estilo de memorização do Classical Conversations.

## Arquivos
- `conteudo.js`: lições, geradores de questões (`GEN`) e matérias (`SUBJECTS`). **É o único lugar para conteúdo novo.** Lotes novos entram como um bloco `/* LOTE N · data */` antes da linha `MAT_LESSONS.forEach(...)`, com `Object.assign(GEN,{...})` e `X_LESSONS.push(...)`. Para uma matéria nova, crie `X_LESSONS`, defina `subject` nas lições, ligue em `SUBJECTS[i]` (`lessons`, `ready:true`, `ano`) e inclua em `LESSONS`.
- `app.js`: lógica. Só mexa para corrigir bug.
- `sw.js`: a cada publicação, aumente `VERSAO` (`trilha-vN`) para o tablet baixar a versão nova.
- `apps-script/Codigo.gs`: cópia do servidor. Não altere sem o Pedro pedir, porque ele precisa reimplantar à mão.
- `PLANO.md`: roteiro de lições. Marque `[x]` no que publicar.
- `testes/verificar.js`: rode `node testes/verificar.js` antes de cada publicação. Se falhar, corrija ou não publique.

## Regras do conteúdo
- Criança de 7 anos: frases curtas, palavras simples, tudo em português do Brasil. A explicação (`explain`) diz o porquê da resposta.
- Cada questão tem exatamente uma resposta certa. O `type` dos distratores descreve o erro provável, porque aparece no painel dos pais.
- Prefira geradores com variação (números aleatórios). Para conteúdo factual, use `bankGen(skill, [...])` com pelo menos 10 itens.
- Lição: 2 ou 3 slides de explicação, 6 itens de prática e 5 de desafio.
- Nada de personagens, músicas ou textos protegidos por direitos autorais. Na trilha Memória, só letras originais ou cantigas de domínio público.
- Nunca colocar nome, escola ou dados pessoais dela no repositório, que é público.

## Memória CC
A trilha Memória é montada em tempo real por `buildMemoria()` (em `conteudo.js`), a partir da aba privada `MemoriaCC` da planilha, com as colunas ciclo, semana, materia e texto. O Pedro digita ali as frases do livro Foundations, que a família possui. **Nunca copie essas frases para o repositório nem para mensagens de commit.** Elas são material protegido do Classical Conversations. A rotina pode ler a aba só para avaliar o desempenho (habilidades "Memória · ...") e pode melhorar o código das atividades.

## Dados de desempenho
Planilha "Trilha do Saber - Dados", ID `1lqJ3i7vUyY1xGPtDd9xEvWAtQ17XABTrS9iMZT2_z1E`, lida pelo conector Google Sheets. Aba `Sessoes`: colunas A a M, com o JSON da sessão na coluna N. Aba `Respostas`: habilidade, pergunta, respondeu, certo, acertou, tempoSeg e tipoErro.
