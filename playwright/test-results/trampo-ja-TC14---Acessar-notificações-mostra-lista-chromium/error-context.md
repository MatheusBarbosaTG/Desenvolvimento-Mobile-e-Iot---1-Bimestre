# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trampo-ja.spec.ts >> TC14 - Acessar notificações mostra lista
- Location: tests\trampo-ja.spec.ts:291:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Novo candidato!')
Expected: visible
Error: strict mode violation: locator('text=Novo candidato!') resolved to 2 elements:
    1) <span>Novo candidato!</span> aka getByText('Novo candidato!').first()
    2) <span>Novo candidato!</span> aka getByText('Novo candidato!').nth(1)

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Novo candidato!')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - button "← Voltar" [ref=e6] [cursor=pointer]
    - generic [ref=e7]:
      - heading "Notificações" [level=1] [ref=e8]
      - button "Marcar todas como lidas" [ref=e9] [cursor=pointer]
    - paragraph [ref=e10]: 3 não lidas
  - generic [ref=e11]:
    - generic [ref=e13] [cursor=pointer]:
      - generic [ref=e14]: 👤
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: Novo candidato!
          - generic [ref=e18]: 5min
        - paragraph [ref=e19]: José Pereira se candidatou para 'Poda de árvores'
    - generic [ref=e22] [cursor=pointer]:
      - generic [ref=e23]: 💬
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Nova mensagem
          - generic [ref=e27]: 12min
        - paragraph [ref=e28]: "Antônio Silva: 'Posso ir amanhã cedo...'"
    - generic [ref=e31] [cursor=pointer]:
      - generic [ref=e32]: ⭐
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]: Nova avaliação ⭐
          - generic [ref=e36]: 1h
        - paragraph [ref=e37]: Ana Carolina te avaliou com 5 estrelas!
    - generic [ref=e40] [cursor=pointer]:
      - generic [ref=e41]: ✅
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: Proposta aceita!
          - generic [ref=e45]: 2h
        - paragraph [ref=e46]: Seu serviço 'Montagem de móveis' foi aceito
    - generic [ref=e48] [cursor=pointer]:
      - generic [ref=e49]: 👤
      - generic [ref=e50]:
        - generic [ref=e51]:
          - generic [ref=e52]: Novo candidato!
          - generic [ref=e53]: 3h
        - paragraph [ref=e54]: Wagner Costa se candidatou para 'Encanamento'
    - generic [ref=e56] [cursor=pointer]:
      - generic [ref=e57]: 🔔
      - generic [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e60]: Lembrete
          - generic [ref=e61]: 5h
        - paragraph [ref=e62]: Serviço 'Pintura de quartos' é amanhã às 8h
    - generic [ref=e64] [cursor=pointer]:
      - generic [ref=e65]: 💬
      - generic [ref=e66]:
        - generic [ref=e67]:
          - generic [ref=e68]: Nova mensagem
          - generic [ref=e69]: 6h
        - paragraph [ref=e70]: "Fernanda: 'Pode ser no sábado?'"
    - generic [ref=e72] [cursor=pointer]:
      - generic [ref=e73]: 🎉
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]: Serviço concluído
          - generic [ref=e77]: 1d
        - paragraph [ref=e78]: "'Limpeza pós-obra' marcado como concluído. Avalie!"
```

# Test source

```ts
  207 |     // 📸 Evidência - home após login
  208 |     await page.screenshot({ path: 'tests/evidencias/TC10-home-pos-login.png', fullPage: true });
  209 |   } else {
  210 |     // Se não logou (conta não existe no Firebase), tira print do estado atual
  211 |     await page.screenshot({ path: 'tests/evidencias/TC10-tentativa-login.png', fullPage: true });
  212 |     console.log('⚠️ TC10: Crie a conta demo@trampoja.com no Firebase Console para este teste passar');
  213 |   }
  214 | });
  215 | 
  216 | // ─── TC11: Filtro de categorias ─────────────────────
  217 | // Precisa estar logado — usa o fluxo do TC10
  218 | test('TC11 - Filtro de categorias filtra serviços', async ({ page }) => {
  219 |   await waitForApp(page);
  220 |   await page.fill('input[type="email"]', 'demo@trampoja.com');
  221 |   await page.fill('input[type="password"]', 'demo123');
  222 |   await page.click('button:has-text("Entrar")');
  223 |   await page.waitForTimeout(4000);
  224 | 
  225 |   // Se logou, testa filtro
  226 |   const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  227 |   if (!homeVisible) { test.skip(); return; }
  228 | 
  229 |   // 📸 Evidência - todos os serviços
  230 |   await page.screenshot({ path: 'tests/evidencias/TC11a-todos-servicos.png', fullPage: true });
  231 | 
  232 |   // Clica na categoria Encanador
  233 |   await page.click('text=🔧Encanador');
  234 |   await page.waitForTimeout(500);
  235 | 
  236 |   // 📸 Evidência - filtrado por encanador
  237 |   await page.screenshot({ path: 'tests/evidencias/TC11b-filtro-encanador.png', fullPage: true });
  238 | });
  239 | 
  240 | // ─── TC12: Abrir detalhe de serviço ─────────────────
  241 | test('TC12 - Clicar em serviço abre tela de detalhe', async ({ page }) => {
  242 |   await waitForApp(page);
  243 |   await page.fill('input[type="email"]', 'demo@trampoja.com');
  244 |   await page.fill('input[type="password"]', 'demo123');
  245 |   await page.click('button:has-text("Entrar")');
  246 |   await page.waitForTimeout(4000);
  247 | 
  248 |   const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  249 |   if (!homeVisible) { test.skip(); return; }
  250 | 
  251 |   // Clica no primeiro serviço
  252 |   await page.click('text=Poda de árvores');
  253 |   await page.waitForTimeout(500);
  254 | 
  255 |   // Verifica tela de detalhe
  256 |   await expect(page.locator('text=Descrição')).toBeVisible();
  257 |   await expect(page.locator('text=Publicado por')).toBeVisible();
  258 |   await expect(page.locator('text=Candidatos')).toBeVisible();
  259 | 
  260 |   // 📸 Evidência
  261 |   await page.screenshot({ path: 'tests/evidencias/TC12-detalhe-servico.png', fullPage: true });
  262 | });
  263 | 
  264 | // ─── TC13: Botão voltar funciona ────────────────────
  265 | test('TC13 - Botão voltar retorna à tela anterior', async ({ page }) => {
  266 |   await waitForApp(page);
  267 |   await page.fill('input[type="email"]', 'demo@trampoja.com');
  268 |   await page.fill('input[type="password"]', 'demo123');
  269 |   await page.click('button:has-text("Entrar")');
  270 |   await page.waitForTimeout(4000);
  271 | 
  272 |   const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  273 |   if (!homeVisible) { test.skip(); return; }
  274 | 
  275 |   // Abre detalhe
  276 |   await page.click('text=Poda de árvores');
  277 |   await page.waitForTimeout(500);
  278 | 
  279 |   // Clica voltar
  280 |   await page.click('text=← Voltar');
  281 |   await page.waitForTimeout(500);
  282 | 
  283 |   // Verifica que voltou pra home
  284 |   await expect(page.locator('text=Todos os serviços')).toBeVisible();
  285 | 
  286 |   // 📸 Evidência
  287 |   await page.screenshot({ path: 'tests/evidencias/TC13-botao-voltar.png', fullPage: true });
  288 | });
  289 | 
  290 | // ─── TC14: Tela de notificações ─────────────────────
  291 | test('TC14 - Acessar notificações mostra lista', async ({ page }) => {
  292 |   await waitForApp(page);
  293 |   await page.fill('input[type="email"]', 'demo@trampoja.com');
  294 |   await page.fill('input[type="password"]', 'demo123');
  295 |   await page.click('button:has-text("Entrar")');
  296 |   await page.waitForTimeout(4000);
  297 | 
  298 |   const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  299 |   if (!homeVisible) { test.skip(); return; }
  300 | 
  301 |   // Clica no ícone de notificação (🔔)
  302 |   await page.click('text=🔔');
  303 |   await page.waitForTimeout(500);
  304 | 
  305 |   // Verifica tela de notificações
  306 |   await expect(page.locator('text=Notificações')).toBeVisible();
> 307 |   await expect(page.locator('text=Novo candidato!')).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  308 | 
  309 |   // 📸 Evidência
  310 |   await page.screenshot({ path: 'tests/evidencias/TC14-notificacoes.png', fullPage: true });
  311 | });
  312 | 
```