# KHA Academy — release 4.0.0 (2026)

Este pacote mantém o userscript do KHA Academy e atualiza o carregamento do painel, a compatibilidade touch e a tolerância a mudanças da interface do Khan Academy.

## Execução estável

Cole o bookmarklet abaixo na barra de favoritos e execute-o em uma página do Khan Academy:

```js
javascript:(async()=>{try{const r=await fetch('https://raw.githubusercontent.com/dzinn22/kha-academy/refs/heads/main/Khanware.js',{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);eval(await r.text())}catch(e){console.error('[KHA Academy]',e)}})()
```

Em telas touch, toque no botão flutuante `B/Blizkt` para abrir o painel. No desktop, o painel continua abrindo pelo watermark. Para remover a injeção e recarregar a página, use o botão `AntiProf` — no celular ele aparece como um botão circular `×`.

## O que foi atualizado

A versão 4.0.0 usa bootstrap assíncrono com fallback, evita duplicação de injeção, trata falhas de CDN e valida a resposta do perfil antes de usá-la. O pipeline de `fetch` agora é compartilhado pelos módulos, evitando que cada módulo substitua o interceptador anterior. O menu mobile usa áreas de toque maiores e o painel de status respeita a safe area inferior.

Os módulos visuais foram endurecidos contra seletores ausentes, mudanças de rota e montagem tardia do DOM. A experiência reimaginada do Khan Academy possui Learner Queue, Classes e Missions; por isso o pacote não deve assumir que a homepage antiga é o único fluxo disponível.

## Limitações importantes

A experiência reimaginada de 2026 é aplicada pelo Khan Academy principalmente a alunos vinculados a salas de aula; alunos independentes podem continuar vendo a experiência anterior. Além disso, o site pode apresentar Client Challenge, bloquear endpoints internos ou alterar contratos de dados sem aviso. Nesses casos, o userscript pode carregar apenas parcialmente e será necessário atualizar os seletores ou o endpoint depois de observar a sessão real.

Não há API pública estável para os endpoints internos usados pelo site. O pacote depende do comportamento da página autenticada e não deve ser tratado como integração oficial do Khan Academy.
