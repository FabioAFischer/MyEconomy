# Execução com Docker

O ambiente Docker contém três serviços:

- `postgres`: banco PostgreSQL com volume persistente;
- `api`: API Express com autenticação JWT;
- `app`: servidor de desenvolvimento Expo/Metro.

## Configuração

Crie o arquivo de ambiente:

```bash
cp .env.docker.example .env.docker
```

Troque o valor de `JWT_SECRET` por uma chave longa.

## Expo Go em celular físico

O container detecta automaticamente o IP local quando estas variáveis estão como `auto`:

```env
EXPO_PUBLIC_API_URL=auto
REACT_NATIVE_PACKAGER_HOSTNAME=auto
```

O celular e o computador precisam estar na mesma rede. O Expo inicia em modo LAN, sem abrir navegador e sem exigir ADB ou Android SDK. Depois de iniciar os containers, acompanhe o QR Code nos logs:

```bash
docker compose --env-file .env.docker logs -f app
```

## Comandos

Subir todo o ambiente:

```bash
docker compose --env-file .env.docker up --build
```

Subir em segundo plano:

```bash
docker compose --env-file .env.docker up --build -d
```

Ver o estado:

```bash
docker compose --env-file .env.docker ps
```

Ver logs:

```bash
docker compose --env-file .env.docker logs -f
```

Parar os serviços:

```bash
docker compose --env-file .env.docker down
```

Parar e apagar todos os dados do PostgreSQL:

```bash
docker compose --env-file .env.docker down -v
```

## Endereços

- API: `http://localhost:3333`;
- Healthcheck da API: `http://localhost:3333/health`;
- Expo/Metro: `http://localhost:8081`;
- PostgreSQL: `localhost:5432`.

O schema do PostgreSQL é criado na inicialização do volume e a API também
executa a migration antes de iniciar.
