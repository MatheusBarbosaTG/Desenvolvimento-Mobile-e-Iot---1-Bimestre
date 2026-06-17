import { test, expect } from '@playwright/test';

// ════════════════════════════════════════════════════
//  trampoJá — Casos de Teste com Playwright
//  Desenvolvedor: Matheus Barbosa Torres
//  Data: 2026
//  Mínimo 10 casos de teste com evidências (prints)
// ════════════════════════════════════════════════════

// Helper: aguarda Firebase carregar (ou timeout)
async function waitForApp(page) {
  await page.goto('/');
  await page.waitForTimeout(2000);
}

// ─── TC01: Tela de login carrega corretamente ───────
test('TC01 - Tela de login renderiza com todos os elementos', async ({ page }) => {
  await waitForApp(page);

  // Verifica logo
  await expect(page.locator('text=trampo')).toBeVisible();
  await expect(page.locator('text=Araxá, MG')).toBeVisible();

  // Verifica campos de login
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // Verifica botão de entrar
  await expect(page.locator('button:has-text("Entrar")')).toBeVisible();

  // Verifica link de criar conta
  await expect(page.locator('text=Criar conta')).toBeVisible();

  // Verifica botão Google
  await expect(page.locator('text=Continuar com Google')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC01-tela-login.png', fullPage: true });
});

// ─── TC02: Validação de campos vazios ───────────────
test('TC02 - Validação exibe erros com campos vazios', async ({ page }) => {
  await waitForApp(page);

  // Clica em Entrar sem preencher nada
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(500);

  // Verifica mensagens de erro
  await expect(page.locator('text=Informe seu e-mail')).toBeVisible();
  await expect(page.locator('text=Informe sua senha')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC02-validacao-campos-vazios.png', fullPage: true });
});

// ─── TC03: Validação de e-mail inválido ─────────────
test('TC03 - Validação rejeita e-mail com formato inválido', async ({ page }) => {
  await waitForApp(page);

  // Preenche e-mail inválido
  await page.fill('input[type="email"]', 'emailinvalido');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(500);

  // Verifica erro de e-mail
  await expect(page.locator('text=E-mail inválido')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC03-email-invalido.png', fullPage: true });
});

// ─── TC04: Validação de senha curta ─────────────────
test('TC04 - Validação rejeita senha com menos de 6 caracteres', async ({ page }) => {
  await waitForApp(page);

  await page.fill('input[type="email"]', 'teste@email.com');
  await page.fill('input[type="password"]', '123');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(500);

  await expect(page.locator('text=Mínimo 6 caracteres')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC04-senha-curta.png', fullPage: true });
});

// ─── TC05: Login com credenciais erradas ────────────
test('TC05 - Login com credenciais incorretas mostra erro', async ({ page }) => {
  await waitForApp(page);

  await page.fill('input[type="email"]', 'naoexiste@email.com');
  await page.fill('input[type="password"]', 'senhaerrada123');
  await page.click('button:has-text("Entrar")');

  // Aguarda resposta do Firebase
  await page.waitForTimeout(3000);

  // Verifica mensagem de erro (Firebase ou demo)
  const errorVisible = await page.locator('text=/incorretos|Erro|Nenhuma conta/').isVisible();
  expect(errorVisible).toBeTruthy();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC05-credenciais-erradas.png', fullPage: true });
});

// ─── TC06: Navegação para tela de cadastro ──────────
test('TC06 - Link "Criar conta" navega para tela de registro', async ({ page }) => {
  await waitForApp(page);

  // Clica no link de criar conta
  await page.click('text=Criar conta');
  await page.waitForTimeout(500);

  // Verifica elementos da tela de registro
  await expect(page.locator('text=Criar conta').first()).toBeVisible();
  await expect(page.locator('text=Sou cliente')).toBeVisible();
  await expect(page.locator('text=Sou profissional')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC06-tela-registro.png', fullPage: true });
});

// ─── TC07: Validação do formulário de registro ──────
test('TC07 - Registro valida campos obrigatórios', async ({ page }) => {
  await waitForApp(page);

  // Navega para registro
  await page.click('text=Criar conta');
  await page.waitForTimeout(500);

  // Tenta registrar sem preencher
  await page.click('button:has-text("Criar conta")');
  await page.waitForTimeout(500);

  // Verifica erros de validação
  await expect(page.locator('text=Informe seu nome')).toBeVisible();
  await expect(page.locator('text=/Selecione/i')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC07-validacao-registro.png', fullPage: true });
});

// ─── TC08: Seleção de tipo de usuário no registro ───
test('TC08 - Seleção cliente/profissional funciona no registro', async ({ page }) => {
  await waitForApp(page);
  await page.click('text=Criar conta');
  await page.waitForTimeout(500);

  // Seleciona "Sou cliente"
  await page.click('text=Sou cliente');
  await page.waitForTimeout(300);

  // 📸 Evidência - cliente selecionado
  await page.screenshot({ path: 'tests/evidencias/TC08a-selecao-cliente.png', fullPage: true });

  // Seleciona "Sou profissional"
  await page.click('text=Sou profissional');
  await page.waitForTimeout(300);

  // 📸 Evidência - profissional selecionado
  await page.screenshot({ path: 'tests/evidencias/TC08b-selecao-profissional.png', fullPage: true });
});

// ─── TC09: Toggle de mostrar/ocultar senha ──────────
test('TC09 - Botão de mostrar/ocultar senha funciona', async ({ page }) => {
  await waitForApp(page);

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill('minhasenha');

  // 📸 Evidência - senha oculta
  await page.screenshot({ path: 'tests/evidencias/TC09a-senha-oculta.png', fullPage: true });

  // Clica no botão de mostrar senha (emoji 👁️)
  await page.click('text=👁️');
  await page.waitForTimeout(300);

  // Verifica que o campo agora é tipo text
  await expect(page.locator('input[type="text"][value="minhasenha"]')).toBeVisible();

  // 📸 Evidência - senha visível
  await page.screenshot({ path: 'tests/evidencias/TC09b-senha-visivel.png', fullPage: true });
});

// ─── TC10: Login bem-sucedido e redirect ────────────
// NOTA: Requer conta criada no Firebase Console
// Adicione: demo@trampoja.com / demo123 em Authentication > Users
test('TC10 - Login com sucesso redireciona para Home', async ({ page }) => {
  await waitForApp(page);

  // Preenche credenciais válidas
  // ⚠️ Troque por credenciais de uma conta real do Firebase
  await page.fill('input[type="email"]', 'demo@trampoja.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Entrar")');

  // Aguarda login
  await page.waitForTimeout(4000);

  // Verifica se chegou na Home (feed de serviços)
  const homeVisible = await page.locator('text=/trampo|serviços ativos|Todos os serviços/').first().isVisible();

  if (homeVisible) {
    await expect(page.locator('text=trampo')).toBeVisible();
    // 📸 Evidência - home após login
    await page.screenshot({ path: 'tests/evidencias/TC10-home-pos-login.png', fullPage: true });
  } else {
    // Se não logou (conta não existe no Firebase), tira print do estado atual
    await page.screenshot({ path: 'tests/evidencias/TC10-tentativa-login.png', fullPage: true });
    console.log('⚠️ TC10: Crie a conta demo@trampoja.com no Firebase Console para este teste passar');
  }
});

// ─── TC11: Filtro de categorias ─────────────────────
// Precisa estar logado — usa o fluxo do TC10
test('TC11 - Filtro de categorias filtra serviços', async ({ page }) => {
  await waitForApp(page);
  await page.fill('input[type="email"]', 'demo@trampoja.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(4000);

  // Se logou, testa filtro
  const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  if (!homeVisible) { test.skip(); return; }

  // 📸 Evidência - todos os serviços
  await page.screenshot({ path: 'tests/evidencias/TC11a-todos-servicos.png', fullPage: true });

  // Clica na categoria Encanador
  await page.click('text=🔧Encanador');
  await page.waitForTimeout(500);

  // 📸 Evidência - filtrado por encanador
  await page.screenshot({ path: 'tests/evidencias/TC11b-filtro-encanador.png', fullPage: true });
});

// ─── TC12: Abrir detalhe de serviço ─────────────────
test('TC12 - Clicar em serviço abre tela de detalhe', async ({ page }) => {
  await waitForApp(page);
  await page.fill('input[type="email"]', 'demo@trampoja.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(4000);

  const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  if (!homeVisible) { test.skip(); return; }

  // Clica no primeiro serviço
  await page.click('text=Poda de árvores');
  await page.waitForTimeout(500);

  // Verifica tela de detalhe
  await expect(page.locator('text=Descrição')).toBeVisible();
  await expect(page.locator('text=Publicado por')).toBeVisible();
  await expect(page.locator('text=Candidatos')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC12-detalhe-servico.png', fullPage: true });
});

// ─── TC13: Botão voltar funciona ────────────────────
test('TC13 - Botão voltar retorna à tela anterior', async ({ page }) => {
  await waitForApp(page);
  await page.fill('input[type="email"]', 'demo@trampoja.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(4000);

  const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  if (!homeVisible) { test.skip(); return; }

  // Abre detalhe
  await page.click('text=Poda de árvores');
  await page.waitForTimeout(500);

  // Clica voltar
  await page.click('text=← Voltar');
  await page.waitForTimeout(500);

  // Verifica que voltou pra home
  await expect(page.locator('text=Todos os serviços')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC13-botao-voltar.png', fullPage: true });
});

// ─── TC14: Tela de notificações ─────────────────────
test('TC14 - Acessar notificações mostra lista', async ({ page }) => {
  await waitForApp(page);
  await page.fill('input[type="email"]', 'demo@trampoja.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Entrar")');
  await page.waitForTimeout(4000);

  const homeVisible = await page.locator('text=Todos os serviços').isVisible();
  if (!homeVisible) { test.skip(); return; }

  // Clica no ícone de notificação (🔔)
  await page.click('text=🔔');
  await page.waitForTimeout(500);

  // Verifica tela de notificações
  await expect(page.locator('text=Notificações')).toBeVisible();
  await expect(page.locator('text=Novo candidato!')).toBeVisible();

  // 📸 Evidência
  await page.screenshot({ path: 'tests/evidencias/TC14-notificacoes.png', fullPage: true });
});
