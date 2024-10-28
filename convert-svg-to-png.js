const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'src', 'assets', 'img');
const outputDirIcons = path.join(__dirname, 'src', 'assets', 'icons');
const outputDirSplash = path.join(__dirname, 'src', 'assets', 'splash');

// Certifique-se de que os diretórios de saída existam
if (!fs.existsSync(outputDirIcons)) {
  fs.mkdirSync(outputDirIcons, { recursive: true });
}

if (!fs.existsSync(outputDirSplash)) {
  fs.mkdirSync(outputDirSplash, { recursive: true });
}

// Define um percentual para a escala e a margem em pixels
const scalePercent = 0.86; // 80% do tamanho original
const margin = 6; // margem de 4 pixels ao redor do ícone

// Função para converter SVG para PNG com diferentes tamanhos
const convertSvgToPng = async (fileName, outputSizes, outputPath, options = {}) => {
  try {
    const inputPath = path.join(inputDir, fileName);
    const baseName = path.parse(fileName).name;
    const { width: originalWidth, height: originalHeight } = await sharp(inputPath).metadata();

    for (const size of outputSizes) {
      const outputFilePath = path.join(outputPath, `${baseName}-${size.width}x${size.height}.png`);

      const scaledWidth = Math.floor(size.width * scalePercent);
      const scaledHeight = Math.floor(size.height * scalePercent);

      // Calcular novo tamanho, considerando a margem total
      const iconWidth = Math.floor(originalWidth * scalePercent) - 2 * margin;
      const iconHeight = Math.floor(originalHeight * scalePercent) - 2 * margin;

      // Checa se estamos gerando uma splash screen com fundo colorido
      if (options.isSplash) {
        // Cria a imagem de fundo com a cor desejada
        const iconBuffer = await sharp(inputPath)
          .toBuffer(); // Mantém a imagem original sem redimensionar

        // Cria uma nova imagem com o fundo da splash screen
        await sharp({
          create: {
            width: scaledWidth,
            height: scaledHeight,
            channels: 4,
            background: options.background, // cor de fundo slategray
          }
        })
          .composite([
            {
              input: iconBuffer,
              gravity: 'center', // Centraliza o ícone na splash screen
              blend: 'over'
            }
          ])
          .png()
          .toFile(outputFilePath);

      } else {
        // Processo padrão para ícones com fundo colorido
        const iconBuffer = await sharp(inputPath)
          .resize(iconWidth, iconHeight)
          .toBuffer();

        await sharp({
          create: {
            width: originalWidth,
            height: originalHeight,
            channels: 4,
            background: { r: 112, g: 128, b: 144, alpha: 1 }, // Cor slategray
          }
        })
          .composite([
            {
              input: iconBuffer,
              top: Math.floor((originalHeight - iconHeight) / 2),
              left: Math.floor((originalWidth - iconWidth) / 2),
              blend: 'over'
            }
          ])
          .png()
          .toFile(outputFilePath);
      }

      console.log(`Convertido ${fileName} para ${size.width}x${size.height}px PNG com margem de ${margin}px.`);
    }
  } catch (error) {
    console.error(`Erro ao converter ${fileName}:`, error);
  }
};

// Tamanhos de ícones desejados
const iconSizes = [
  { width: 72, height: 72 },
  { width: 96, height: 96 },
  { width: 128, height: 128 },
  { width: 144, height: 144 },
  { width: 152, height: 152 },
  { width: 192, height: 192 },
  { width: 384, height: 384 },
  { width: 512, height: 512 },
];

// Tamanhos de splash screen específicos para dispositivos iOS
const splashSizes = [
  { width: 640, height: 1136 },
  { width: 1242, height: 2208 },
  { width: 1668, height: 2388 },
  { width: 2048, height: 2732 },
];

// Tamanho do ícone na splash screen
const splashIconSize = { width: 640, height: 640 }; // ajuste conforme necessário

// Ler e converter todos os arquivos SVG na pasta de entrada
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Erro ao ler a pasta:', err);
    return;
  }

  files.filter(file => file.endsWith('.svg')).forEach(file => {
    // Converter para ícones
    convertSvgToPng(file, iconSizes, outputDirIcons);

    // Converter para splash screens com cor de fundo slategray, ícone centralizado e tamanho fixo
    convertSvgToPng(file, splashSizes, outputDirSplash, {
      isSplash: true,
      iconSize: splashIconSize,
      background: { r: 112, g: 128, b: 144, alpha: 1 } // Cor slategray
    });
  });
});
