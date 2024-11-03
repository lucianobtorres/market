const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const versionFilePath = path.join(__dirname, 'src', 'assets', 'version.json');

// Ler o package.json
fs.readFile(packageJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erro ao ler package.json:', err);
    return;
  }

  const packageJson = JSON.parse(data);
  const versionData = { version: packageJson.version };

  // Escrever a versão em um novo arquivo
  fs.writeFile(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever version.json:', err);
    } else {
      console.info('Versão copiada para version.json com sucesso!');
    }
  });
});
