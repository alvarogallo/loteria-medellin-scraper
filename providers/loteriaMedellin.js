const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class LoteriaMedellin {
  constructor() {
    this.baseURL = 'https://loteriademedellin.com.co/resultados/';
    this.cachePath = path.join(__dirname, '../cache/loteria-medellin.json');
    
    // Asegurarse de que exista el directorio de caché
    const cacheDir = path.dirname(this.cachePath);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  }

  async getResults() {
    // Comprobar si existe caché y si es del día de hoy
    if (this.isCacheValid()) {
      console.log('Usando resultados en caché');
      return this.getResultsFromCache();
    }

    // Si no hay caché válida, hacer scraping
    console.log('Obteniendo nuevos resultados desde el sitio web');
    return this.scrapeResults();
  }

  isCacheValid() {
    try {
      // Verificar si el archivo de caché existe
      if (!fs.existsSync(this.cachePath)) {
        return false;
      }

      // Leer datos de caché para verificar el día
      const cacheData = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
      
      // Obtener la fecha de actualización de la caché
      const cacheDate = new Date(cacheData.lastUpdate);
      const now = new Date();
      
      // La caché es válida si es del mismo día (hoy)
      return (
        cacheDate.getDate() === now.getDate() &&
        cacheDate.getMonth() === now.getMonth() &&
        cacheDate.getFullYear() === now.getFullYear()
      );
    } catch (error) {
      console.error('Error al verificar la caché:', error);
      return false;
    }
  }

  getResultsFromCache() {
    try {
      const cacheData = fs.readFileSync(this.cachePath, 'utf8');
      return JSON.parse(cacheData);
    } catch (error) {
      console.error('Error al leer la caché:', error);
      return this.scrapeResults(); // En caso de error, hacer scraping
    }
  }

  async scrapeResults() {
    return new Promise((resolve, reject) => {
      request(this.baseURL, (error, response, html) => {
        if (error || response.statusCode !== 200) {
          return reject(error || new Error(`Status code: ${response.statusCode}`));
        }
        
        try {
          const $ = cheerio.load(html);
          
          // Extraer el número ganador
          const numeroGanador = $('.elementor-lottery-jackpot-number').first().text().trim();
          
          // Extraer la serie
          const serie = $('.elementor-lottery-jackpot-serie .elementor-lottery-jackpot-number').text().trim();
          
          // Extraer el número de sorteo
          const sorteo = $('.elementor-lottery-jackpot-draw-id').text().trim();
          
          // Extraer la fecha del sorteo
          const fechaSorteo = $('.elementor-lottery-jackpot-date').text().trim();
          
          // Formatear los resultados
          const results = {
            name: "Lotería de Medellín",
            date: fechaSorteo,
            draw_no: sorteo,
            results: [numeroGanador, serie],
            lastUpdate: new Date().toISOString()
          };
          
          // Guardar los resultados en caché
          this.saveResultsToCache(results);
          
          resolve(results);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  saveResultsToCache(results) {
    try {
      fs.writeFileSync(this.cachePath, JSON.stringify(results, null, 2));
      console.log('Resultados guardados en caché');
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  }
}

module.exports = LoteriaMedellin;