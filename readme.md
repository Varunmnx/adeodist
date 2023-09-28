# ER Diagram of database
![High Level Overview](./docs/ER.png)


## how to install 

clone this repo
```bash
git clone https://github.com/Varunmnx/adeodist.git
```
install all dependencies
```bash
npm install
```

install mysql ( i have used mysql docker container so kindly use that to avoid any issues )
```bash
docker pull mysql:latest
```

run mysql docker container using your docker command
```bash
 docker run --name my-sql -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD="mypass" mysql:latest
```