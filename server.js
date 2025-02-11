// server.js

// Importa os módulos necessários
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Lê os arquivos de certificado e chave privada
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.crt'))
};

// Lê o conteúdo do arquivo index.html para ser servido na rota "/"
const htmlPage = fs.readFileSync(path.join(__dirname, `./assets/index.html`), 'utf8');

// Cria o servidor HTTPS com as rotas separadas
const server = https.createServer(options, (req, res) => {
  // Faz o parsing da URL para obter o pathname e os parâmetros (query string)
  const parsedUrl = url.parse(req.url, true);

  // Rota para servir a página web (index.html)
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlPage);

  // Rota para tratar a requisição GET na API (/api/dados)
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/dados') {
    // Extrai os parâmetros da query string:
    // Parâmetros obrigatórios: OLT (string), SLOT (int) e PON (int)
    // Parâmetro opcional: debug (int)
    const { OLT, SLOT, PON, debug } = parsedUrl.query;

    // Validação: Verifica se os parâmetros obrigatórios estão presentes
    if (!OLT || !SLOT || !PON) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Parâmetros obrigatórios ausentes. São necessários: OLT, SLOT e PON.'
      }));
      return;
    }

    // Converte os parâmetros numéricos para inteiros
    const slotInt = parseInt(SLOT, 10);
    const ponInt = parseInt(PON, 10);

    if (isNaN(slotInt) || isNaN(ponInt)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Os parâmetros SLOT e PON devem ser números inteiros.'
      }));
      return;
    }

    // Se o parâmetro opcional debug for fornecido, converte para inteiro; senão, define como null
    let debugInt = null;
    if (debug !== undefined) {
      debugInt = parseInt(debug, 10);
      if (isNaN(debugInt)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'O parâmetro debug, se fornecido, deve ser um número inteiro.'
        }));
        return;
      }
    }

    // Cria o objeto de resposta com os parâmetros recebidos
    const responseObject = {
      OLT,
      SLOT: slotInt,
      PON: ponInt,
      debug: debugInt,
      message: 'Parâmetros recebidos com sucesso!'
    };

    // Retorna o JSON de resposta
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseObject));

  } else {
    // Caso a rota não seja reconhecida, retorna 404 (não encontrado)
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Rota não encontrada.');
  }
});

// Define a porta que o servidor HTTPS irá escutar
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTPS rodando em https://localhost:${PORT}`);
});
