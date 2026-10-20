# Simulador de uniformes – Marol Sports

Este branch (`simulador`) tem só o simulador. Detalhes de funcionamento, ferramentas e como atualizar modelos estão no `README.md`.

## Branches e publicação (Vercel)
- `main`: site da Marol Store, num projeto próprio da Vercel.
- `simulador`: este simulador, num projeto próprio da Vercel (Production Branch = `simulador`). O `vercel.json` publica a pasta `simulador/` na raiz do endereço, sem build.
- Mudanças vão para um branch novo criado a partir do `simulador`; a Vercel gera uma prévia e, depois da aprovação do dono, o branch é juntado ao `simulador`. Nunca enviar direto sem aprovação.

## Testar localmente
`npx http-server simulador -p 8080 -c-1` e abrir `http://localhost:8080`.
