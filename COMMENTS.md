Para rodar a api , basta abrir o diretorio em uma maquina com o Nodejs instalado e executar o arquivo com : node game.js
Para testar a simulaçao basta dar um get no [localhost:8080/](http://localhost:8080/jogo/simular) como o solicitado no problema
Após executar cada simulação, se quiser ver o que aconteceu, é gerado um id que começa no 0 e salvo na memoria,
Voce pode dar um get logo em seguida http://localhost:8080/jogo/simular?id=0 com o ID na queryString e ele tera uma especie de logs de açoes ocorridas na simulação.
