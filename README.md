# Portal Veículos

Portal web para a Portal Veículos, revendedora de automóveis em Canoinhas-SC. O site apresenta o estoque, permite filtrar e consultar veículos e inclui uma área administrativa para gerenciar anúncios. A aplicação é composta por um frontend React e uma API Node.js/Express que armazena dados e imagens no MongoDB.

## Estrutura do projeto

```text
.
├── backend/
│   ├── src/
│   │   ├── config/        # Configuração e schemas do MongoDB
│   │   ├── controllers/   # Lógica das rotas da API
│   │   ├── db/            # Conexão e utilitários de banco de dados
│   │   ├── middlewares/   # Autenticação
│   │   ├── models/        # Modelos e operações de veículos
│   │   ├── routes/        # Rotas HTTP
│   │   └── server.js      # Inicialização da API
│   └── tests/             # Testes do backend
├── frontend/
│   ├── public/            # Arquivos públicos
│   ├── src/
│   │   ├── assets/        # Imagens e outros recursos
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── pages/         # Páginas do site
│   └── tests/             # Testes do frontend
└── package.json           # Comandos para executar frontend e backend
```

## Executar localmente

### Requisitos

- Node.js `20.19+` ou `22.12+` e npm.
- MongoDB em execução. As instruções de instalação e configuração estão na seção [Configurar o MongoDB](#3-configurar-o-mongodb).

### 1. Instale as dependências

Na raiz do repositório, execute:

```bash
npm ci
npm --prefix backend ci
npm --prefix frontend ci
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. O arquivo é ignorado pelo Git; não compartilhe nem versione credenciais reais. Use os dados do seu MongoDB e substitua os valores de contato de exemplo:

```dotenv
# API e endereço usado para gerar links das imagens
PORT=3000
API_BASE_URL=http://localhost:3000/api

# MongoDB local
DB_HOST=127.0.0.1
DB_PORT=27017
DB_NAME=portal_veiculos
AUTH_SOURCE=portal_veiculos
DB_USER=seu_usuario_da_aplicacao
DB_PASSWORD=sua_senha_do_mongodb
DB_ADMIN_USER=seu_usuario_de_configuracao
DB_ADMIN_PASSWORD=sua_senha_de_configuracao

# Autenticação da área administrativa
JWT_SECRET=troque-por-um-segredo-aleatorio
APP_USER_LOGIN=admin
APP_USER_PASSWORD=troque-por-uma-senha-forte

# Frontend: /api é encaminhado à API pelo proxy do Vite
VITE_API_URL=/api/vehicles
VITE_WHATSAPP_URL=https://wa.me/5500000000000
VITE_GOOGLE_MAPS_EMBED_URL=https://www.google.com/maps?q=Canoinhas%20SC&output=embed
VITE_CONTACT_PHONE=5547000000000
VITE_CONTACT_PHONE_DISPLAY=(47) 00000-0000
VITE_SECONDARY_PHONE=5547000000000
VITE_SECONDARY_PHONE_DISPLAY=(47) 00000-0000
```

`DB_USER` e `DB_PASSWORD` são as credenciais do usuário da aplicação, com acesso de leitura e gravação. `DB_ADMIN_USER` e `DB_ADMIN_PASSWORD` identificam um usuário de configuração limitado ao banco do projeto. Consulte a próxima seção para criar essas contas.

### 3. Configurar o MongoDB

Instale o MongoDB Server e o `mongosh` seguindo o guia oficial do seu sistema:

- [Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/)
- [Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)

Confirme que o servidor está instalado e ativo. No Ubuntu:

```bash
mongod --version
mongosh --version
sudo systemctl status mongod
```

No Windows, abra o PowerShell:

```powershell
mongod --version
mongosh --version
Get-Service -Name MongoDB
```

O exemplo de `.env` configura o MongoDB local em `127.0.0.1:27017`. Ajuste `DB_HOST`, `DB_PORT` e `DB_NAME` se sua instalação usar outros valores.

#### Configuração inicial com autenticação

Para uma instalação local sem autenticação configurada, o projeto inclui um assistente que cria os usuários indicados no `.env`, habilita a autenticação no MongoDB e reinicia o serviço. Ele também faz uma cópia de segurança do arquivo de configuração antes de alterá-lo e não apaga dados do banco.

Com o `.env` preenchido e o MongoDB instalado como serviço nativo:

- **Windows:** abra o PowerShell como administrador na raiz do projeto e execute:

  ```powershell
  npm --prefix backend run db:enable-auth
  ```

- **Ubuntu:** execute na raiz do projeto:

  ```bash
  sudo node backend/src/db/enable_auth.js
  ```

O assistente exige que `DB_HOST` seja `localhost` ou `127.0.0.1`. Ele configura `DB_ADMIN_USER` com permissões de administração somente no banco do projeto e `DB_USER` com acesso de leitura e gravação. Se o nome do serviço ou caminho do arquivo de configuração for diferente do padrão, configure `MONGODB_SERVICE_NAME` ou `MONGODB_CONFIG_FILE` no `.env`.

Se a autenticação já estiver habilitada, crie os dois usuários manualmente no `mongosh`, conectado com uma conta administrativa do MongoDB. O exemplo assume `DB_NAME=portal_veiculos` e `AUTH_SOURCE=portal_veiculos`; substitua os nomes dos usuários pelos valores do seu `.env`:

```javascript
use portal_veiculos

db.createUser({
  user: "seu_usuario_de_configuracao",
  pwd: passwordPrompt(),
  roles: [
    { role: "dbAdmin", db: "portal_veiculos" },
    { role: "userAdmin", db: "portal_veiculos" }
  ]
})

db.createUser({
  user: "seu_usuario_da_aplicacao",
  pwd: passwordPrompt(),
  roles: [{ role: "readWrite", db: "portal_veiculos" }]
})
```

Como as contas do projeto são criadas no banco `portal_veiculos`, mantenha `AUTH_SOURCE=portal_veiculos` (ou omita essa variável para usar o valor de `DB_NAME`).

#### Criar coleção e usuário do painel

Com o MongoDB em execução e as contas configuradas, crie a coleção de veículos:

```bash
node backend/db_create.js
```

Para criar o usuário do painel administrativo usando `APP_USER_LOGIN` e `APP_USER_PASSWORD` do `.env`, execute:

```bash
node backend/src/db/createAppUser.js
```

### 4. Inicie o projeto

Na raiz do repositório:

```bash
npm run dev
```

O comando inicia o frontend e a API. Acesse **http://localhost:5173** no navegador. A API fica disponível na porta definida por `PORT` (no exemplo, `3000`). Mantenha o MongoDB ligado enquanto usar a aplicação.

Para encerrar, use `Ctrl+C` no terminal.

## Outros comandos

Execute os comandos abaixo na raiz do projeto:

| Comando | Descrição |
| --- | --- |
| `npm run test` | Executa os testes do backend e do frontend |
| `npm run build` | Gera a versão de produção do frontend |
| `npm run backend` | Inicia somente a API em modo de desenvolvimento |
| `npm run frontend` | Inicia somente o frontend |
| `npm start` | Inicia a API sem o modo de desenvolvimento |

Para carregar veículos de exemplo no banco local, execute `npm --prefix backend run seed:test`. Esse comando baixa imagens de exemplo e grava dados no MongoDB.
