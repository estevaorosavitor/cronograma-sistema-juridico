# Cronograma · Sistema Jurídico Empresarial Integrado

Linha do tempo do projeto, com duas páginas:

- **`index.html`** — página **pública**, que o cliente acessa. É **somente leitura**: ele vê o progresso, mas não consegue alterar nenhuma etapa.
- **`admin.html`** — seu **painel de administração**. Aqui você marca cada etapa como *pendente → em andamento → concluída*. Não vai para o servidor por padrão (é sua ferramenta).

O progresso é guardado em um arquivo **`data.json`** — **sem banco de dados**. A página do cliente lê esse arquivo; você o atualiza quando quiser publicar o avanço.

---

## Como funciona (visão geral)

```
   admin.html  (você edita)
        │  Baixar data.json
        ▼
   data.json  ──►  enviado para a VPS  ──►  index.html (cliente vê, só leitura)
```

1. Você abre o `admin.html`, clica nas etapas e marca o status.
2. Clica em **Baixar data.json**.
3. Envia esse `data.json` para a pasta do site na VPS, substituindo o anterior.
4. O cliente, ao abrir o site, já vê o progresso atualizado.

Como o `data.json` é montado como volume no Docker, **trocar o arquivo não exige rebuild** — a atualização é imediata.

---

## Subir na VPS (Oracle · Ubuntu · Docker · Nginx Proxy Manager)

Envie a pasta para a VPS e, dentro dela:

```bash
docker compose up -d --build
```

O container sobe escutando na porta **8080**. Como você já usa o **Nginx Proxy Manager (NPM)**, basta criar um *Proxy Host* apontando seu domínio para o container:

1. No NPM: **Hosts → Proxy Hosts → Add Proxy Host**.
2. **Domain Names:** seu domínio (ex.: `cronograma.seudominio.com.br`).
3. **Forward Hostname / IP:** o nome do container `cronograma-juridico` (se o NPM estiver na mesma rede Docker) **ou** o IP interno da VPS.
4. **Forward Port:** `8080`.
5. Aba **SSL:** *Request a new SSL Certificate* + *Force SSL* (HTTPS automático via Let's Encrypt).

> Se o NPM e este container não estiverem na mesma rede Docker, conecte-os: `docker network connect <rede_do_npm> cronograma-juridico`. Aí você pode usar `cronograma-juridico` como Forward Hostname.

Pronto — o cliente acessa `https://seudominio` e vê a linha do tempo.

---

## Atualizar o progresso (passo a passo)

1. Abra o **`admin.html`** (veja as opções de acesso abaixo).
2. Marque as etapas. As mudanças ficam salvas no navegador automaticamente.
3. Clique em **Baixar data.json**.
4. Suba o arquivo para a pasta do projeto na VPS, substituindo o `data.json` atual. Pelo terminal:
   ```bash
   scp data.json usuario@SEU_IP:/caminho/do/projeto/data.json
   ```
   (ou use um cliente SFTP como FileZilla / WinSCP).
5. O site do cliente reflete a mudança na hora. Não precisa reiniciar nada.

> **Backup / trocar de computador:** o botão **Importar** carrega um `data.json` existente de volta no `admin.html`. Assim você continua a edição em outra máquina, ou recupera um estado anterior.

---

## Acesso ao painel admin

O `admin.html` **não é publicado no servidor por padrão** (o `Dockerfile` copia apenas os arquivos públicos). Escolha uma das opções:

### Opção A — Usar localmente (recomendado, mais simples e seguro)
Abra o `admin.html` direto no seu computador (clique duas vezes no arquivo). Ele funciona offline, desde que `style.css` e `cronograma.js` estejam na mesma pasta. Como ele nunca vai para a internet, ninguém além de você acessa. É o caminho recomendado.

### Opção B — Hospedar o admin com senha (acesso de qualquer lugar)
Se quiser administrar pelo navegador, de qualquer lugar:

1. No `Dockerfile`, adicione `admin.html` à linha `COPY` e rode `docker compose up -d --build`.
2. No **Nginx Proxy Manager**, crie um **Access List** (menu **Access Lists → Add**), com usuário e senha, e marque *Authorization required*.
3. A forma mais simples de proteger só o admin é criar um **segundo Proxy Host** (ex.: `gestao.seudominio.com.br`) apontando para o mesmo container `:8080`, e **vincular o Access List** a esse host (aba *Details → Access List*). Você administra por `https://gestao.seudominio.com.br/admin.html`, protegido por senha.
4. Para impedir que o `admin.html` seja aberto pelo domínio público, adicione no *Proxy Host* público, aba **Advanced**, o bloco:
   ```nginx
   location = /admin.html { return 404; }
   ```

> Resumo: **Opção A** é o padrão e atende "só eu administro". Use a **Opção B** apenas se precisar editar remotamente.

---

## Editar as fases e tarefas do cronograma

O conteúdo (fases, semanas e tarefas) fica no array **`PHASES`**, no topo do `cronograma.js`. Cada fase tem `nm` (nome), `wk` (semanas), `meta` (descrição) e a lista `tasks`. Uma tarefa pode ser:

- um texto simples: `"Modelagem do banco multiempresa"`, ou
- um objeto com destaque: `{ t:"Marco: ...", milestone:true }` ou `{ t:"...", flag:"paralelo" }`.

Depois de editar, rode `docker compose up -d --build` para publicar.

> Como `index.html` e `admin.html` usam o mesmo `cronograma.js`, editar as fases num lugar vale para os dois.

---

## Arquivos

| Arquivo | Função | Vai para o servidor? |
|---|---|---|
| `index.html` | Página pública do cliente (somente leitura) | **Sim** |
| `admin.html` | Seu painel de edição | Não (uso local) |
| `cronograma.js` | Fases/tarefas + lógica da linha do tempo | **Sim** |
| `style.css` | Estilo (tema escuro) | **Sim** |
| `data.json` | Progresso publicado | **Sim** (montado como volume) |
| `Dockerfile` · `nginx.conf` · `docker-compose.yml` | Empacotamento e publicação | infraestrutura |

---

## Comandos úteis

```bash
docker compose up -d --build   # subir / atualizar o site
docker compose logs -f         # ver logs
docker compose restart         # reiniciar
docker compose down            # parar e remover o container
```
