# Integração do formulário com Google Sheets

O formulário envia os dados por um frame temporário para evitar limitações de CORS. O Apps Script responde com `postMessage`, e o site só mostra sucesso quando recebe a confirmação de que a linha foi gravada.

## 1. Preparar a planilha

1. Crie uma planilha no Google Sheets.
2. Na URL `https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA/edit`, copie somente `ID_DA_PLANILHA`.
3. Abra `Code.gs` e substitua `COLE_AQUI_O_ID_DA_PLANILHA` pelo ID copiado.
4. Se quiser outro nome de aba, altere `SHEET_NAME`. A aba e os cabeçalhos serão criados automaticamente no primeiro envio.

## 2. Criar e implantar o Apps Script

1. Acesse [script.google.com](https://script.google.com/) e crie um projeto.
2. Substitua o conteúdo de `Code.gs` pelo arquivo desta pasta.
3. Em **Configurações do projeto**, marque a opção para mostrar o arquivo de manifesto e copie também `appsscript.json`.
4. Clique em **Implantar → Nova implantação → App da Web**.
5. Em **Executar como**, selecione **Eu**.
6. Em **Quem pode acessar**, selecione **Qualquer pessoa**.
7. Autorize o acesso à planilha e conclua a implantação.
8. Copie a URL terminada em `/exec` — não use a URL `/dev`.

## 3. Ligar o site ao script

Abra `shared/sale-form-config.js` no projeto do site e cole a URL:

```js
window.CIGA_SALES_ENDPOINT = 'https://script.google.com/macros/s/SEU_DEPLOYMENT_ID/exec';
```

Depois, rode o site por um servidor local, abra uma página de relógio e faça um envio de teste. Confira a nova linha na aba `Vendas` e teste também um CPF/CNPJ inválido para confirmar o pop-up de erro.

## Atualizações futuras

Ao editar `Code.gs`, crie uma **nova versão da implantação** em **Gerenciar implantações**. Em geral a URL `/exec` permanece a mesma. Não coloque senhas ou chaves secretas no JavaScript do site.

## Dados e segurança

- CPF/CNPJ, telefone e e-mail são dados pessoais. Restrinja o acesso à planilha e defina uma política interna de retenção/eliminação.
- O script valida CPF/CNPJ, limites de tamanho, honeypot, envio rápido, serializa gravações com `LockService` e neutraliza fórmulas iniciadas por `=`, `+`, `-` ou `@`.
- O endpoint público não substitui um backend autenticado ou proteção avançada contra abuso. Se o formulário for exposto fora do presskit, considere CAPTCHA e limitação de requisições por um serviço intermediário.
- A resposta HTML permite frame externo com `XFrameOptionsMode.ALLOWALL`; ela só transmite ao site o status e a mensagem do registro, nunca os dados pessoais enviados.
