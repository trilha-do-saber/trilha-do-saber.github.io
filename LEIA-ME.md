# Trilha do Saber

App de estudos (Matemática e Português do 2º ano) com acompanhamento dos pais.

- **App:** GitHub Pages. Instala no tablet como um aplicativo e funciona sem internet.
- **Dados:** Google Sheets, por meio do Google Apps Script.
- **IA (opcional):** Gemini, chamado pelo Apps Script. A chave fica só no Google, nunca no GitHub.
- **Alertas:** e-mail (e Telegram, se quiser) quando ela não estuda, mais um relatório semanal.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Tela e estilos do app |
| `conteudo.js` | Lições, explicações e geradores de questões. **É aqui que entram as lições novas.** |
| `app.js` | Lógica: telas, tempo de estudo, área dos pais e envio para a planilha |
| `sw.js` | Faz o app funcionar sem internet |
| `manifest.webmanifest` e `icons/` | Permitem instalar como app |
| `apps-script/Codigo.gs` | Código do servidor. Vai no Apps Script, **não** precisa subir no GitHub |

---

## Passo 1: publicar o app no GitHub (10 min)

1. Entre em github.com e crie um repositório novo: **New repository**, nome `trilha-do-saber`, **Public**. Clique em **Create repository**.
2. Na página do repositório, clique em **uploading an existing file** e arraste **todos os arquivos e a pasta `icons`**. A pasta `apps-script` pode ficar de fora. Clique em **Commit changes**.
3. Vá em **Settings → Pages**. Em *Branch*, escolha `main` e a pasta `/ (root)` e clique em **Save**.
4. Depois de 1 ou 2 minutos, o endereço aparece no topo da página, algo como `https://SEU-USUARIO.github.io/trilha-do-saber/`.

> No GitHub gratuito, o Pages exige repositório público. O código e as lições ficam visíveis, mas os dados dela não, porque eles ficam na sua planilha.

## Passo 2: criar a planilha e o servidor (10 min)

1. Em sheets.google.com, crie uma planilha em branco chamada **Trilha do Saber - Dados**.
2. Na planilha, abra **Extensões → Apps Script**.
3. Apague o que estiver no editor, cole todo o conteúdo de `apps-script/Codigo.gs` e salve (ícone de disquete).
4. Na barra de cima, escolha a função **`configurar`** e clique em **Executar**. O Google vai pedir autorização: escolha sua conta, clique em **Avançado → Acessar (não seguro)** e depois em **Permitir**. O aviso aparece porque o script é seu e não foi verificado pelo Google.
5. No **Registro de execução**, copie o **TOKEN secreto** que apareceu.
6. Clique em **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web** e preencha:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
7. Clique em **Implantar** e copie o **URL do app da Web**, que termina em `/exec`.

> "Qualquer pessoa" só significa que o app consegue chamar o script. Sem o token, ninguém lê nem grava nada.

**Quando alterar o `Codigo.gs` no futuro:** use **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão**. Assim o endereço continua o mesmo.

## Passo 3: conectar o app (2 min)

Monte este link, trocando as três partes:

```
https://SEU-USUARIO.github.io/trilha-do-saber/?api=URL_DO_EXEC&token=SEU_TOKEN
```

Abra esse link uma vez em **cada aparelho** (o tablet dela e o seu celular). A conexão fica salva no aparelho e o link é limpo da barra de endereço.

Também dá para colar o URL e o token à mão em **Área dos pais → Conexão com a planilha**.

> Não compartilhe esse link com o token.

## Passo 4: instalar no tablet

- **Android (Chrome):** abra o app, toque em **⋮ → Instalar app** (ou "Adicionar à tela inicial").
- **iPad (Safari):** toque em **Compartilhar → Adicionar à Tela de Início**.

Para ela não sair do app:

- **Android:** Configurações → Segurança → **Fixação de tela**.
- **iPad:** Ajustes → Acessibilidade → **Acesso Guiado**. Depois, três cliques no botão lateral dentro do app.

Primeiro acesso na área dos pais: o PIN inicial é **1234**. Troque em Configurações.

## Passo 5 (opcional): IA com Gemini

1. Em aistudio.google.com, clique em **Get API key → Create API key** e copie a chave.
2. No Apps Script, vá em **Configurações do projeto (engrenagem) → Propriedades do script → Adicionar propriedade**:
   - `GEMINI_KEY` = sua chave
3. Rode a função **`testarIA`**. Se aparecer um "olá" no registro, está funcionando.
4. No app, abra a área dos pais e toque em **Salvar e testar conexão**. Deve aparecer "IA ativa".

Com a IA ativa, ela ganha o botão **"Me explica de outro jeito"** quando erra, e você ganha a **análise da semana** no app e no e-mail.

Cuidados que já estão no código:

- Só são enviados à IA a pergunta, a resposta e os números. Nunca o nome dela.
- Há um limite de 60 usos de IA por dia.
- No plano gratuito, o Google pode usar o que é enviado para melhorar os produtos dele. Por isso nenhum dado pessoal vai junto.
- O modelo padrão é `gemini-3.5-flash-lite`. Se o Google trocar o nome do modelo, crie a propriedade `GEMINI_MODEL` com o nome novo.

## Alertas

Depois do `configurar`, já ficam ativos:

- **Todo dia às 19h:** e-mail se ela não estudou ou ficou abaixo da meta.
- **Domingo às 20h:** relatório da semana (com análise, se a IA estiver ativa).

Para ajustar, use as **Propriedades do script**:

| Propriedade | Para quê |
|---|---|
| `EMAIL_ALERTA` | Outro e-mail para receber os avisos |
| `HORA_ALERTA` | Outro horário (ex.: `18`). Depois rode `configurar` de novo |
| `TELEGRAM_TOKEN` e `TELEGRAM_CHAT_ID` | Receber também no Telegram: crie um bot com o @BotFather e pegue seu chat id |

## Atualizar o app

1. Edite ou suba os arquivos novos no GitHub.
2. Em `sw.js`, troque `trilha-v1` para `trilha-v2` (e assim por diante). Isso faz o tablet baixar a versão nova.
3. No tablet, feche e abra o app duas vezes.

## Onde ficam os dados

Na planilha:

- **Sessoes:** cada vez que ela estuda (data, minutos ativos, lição, estrelas).
- **Respostas:** cada resposta (pergunta, o que ela respondeu, se acertou, tempo, tipo de erro).
- **Estado:** configurações e progresso.

Os dados também ficam guardados no aparelho. Sem internet, o app continua funcionando e envia tudo quando a conexão voltar.
