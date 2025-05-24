# webstack v2

This project contains the backend and the frontend for aquarc!

## git clone

```bash
git clone https://github.com/aquarc/webstack-v2.git
cd webstack-v2
```

## build the frontend

```bash
cd frontend
npm install 
npm run build
cd ..
```
You may have to run 
```bash
npm install
```
if it does not recognize react-scripts.

## Install PostgreSQL
### Windows
1. Download PostgreSQL from the official website: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Add PostgreSQL to your system PATH if not done automatically

### macOS
Using HomeBrew:
```bash
brew install postgresql
```

### Linux(Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

## build the backend

```bash
go build
```

You will have to install postgreSQL properly for the project to build correctly

If "go build" has run properly, it should not have produced any output, 
rather it would have generated a "serve.exe" file which can be found with the command:
```bash
ls
```

## run the code

On windows:

```bash
serve.exe
```
or
```bash
.\serve.exe
```

On everything else:

```bash
./serve
```

## run everything together (convenience)
```bash
cd frontend
npm install 
npm run build
cd ..
go build
./serve.exe
```

## set up ENV

Your .env file should look like:
```sh
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_SSLMODE=enable
PASSWORD=...
```

you will have to make a second one inside the frontend directory
```sh
echo "REACT_APP_GTAG=G-..." >> ../frontend/.env
```

