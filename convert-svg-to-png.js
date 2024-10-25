const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'src', 'assets', 'img');
const outputDir = path.join(__dirname, 'src', 'assets', 'icons');

// Certifique-se de que o diretório de saída exista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função para converter SVG para PNG
const convertSvgToPng = async (fileName, outputSizes) => {
  try {
    const inputPath = path.join(inputDir, fileName);
    const baseName = path.parse(fileName).name;

    for (const size of outputSizes) {
      const outputPath = path.join(outputDir, `${baseName}-${size}x${size}.png`);
      await sharp(inputPath)
        .resize(size, size)  // Redimensiona para o tamanho desejado
        .png()
        .toFile(outputPath);
      console.log(`Convertido ${fileName} para ${size}x${size}px PNG.`);
    }
  } catch (error) {
    console.error(`Erro ao converter ${fileName}:`, error);
  }
};

// Tamanhos de ícones desejados (ex.: 72x72, 192x192)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ler e converter todos os arquivos SVG na pasta de entrada
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Erro ao ler a pasta:', err);
    return;
  }

  files.filter(file => file.endsWith('.svg')).forEach(file => {
    convertSvgToPng(file, sizes);
  });
});
