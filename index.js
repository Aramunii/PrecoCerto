const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeMagaluOffers() {
  try {
    const baseUrl = 'https://www.magazineluiza.com.br/utilidades-domesticas/l/ud/';
    const startPage = 1;
    const endPage = 4;
    let allProducts = [];

    // Load existing products if the file exists
    if (fs.existsSync('magalu_offers.json')) {
      const existingData = fs.readFileSync('magalu_offers.json', 'utf8');
      allProducts = JSON.parse(existingData);
      console.log(`Loaded ${allProducts.length} existing products from file.`);
    }

    for (let page = startPage; page <= endPage; page++) {
      const url = `${baseUrl}?page=${page}`;
      console.log(`Scraping page ${page}...`);

      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      $('.sc-dCFHLb').each((index, element) => {

        const imageUrl = $(element).find('[data-testid="image"]').attr('src');
        const productName = $(element).find('.sc-APcvf').text().trim();
        const price = $(element).find('[data-testid="price-original"]').text().trim();
        console.log(productName);

        allProducts.push({
          imageUrl,
          productName,
          price
        });
      });

      console.log(`Page ${page} completed. Total products so far: ${allProducts.length}`);

      // Save progress after each page
      fs.writeFileSync('magalu_offers.json', JSON.stringify(allProducts, null, 2));
      console.log(`Progress saved to magalu_offers.json`);

      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Scraping completed. Total products: ${allProducts.length}`);
    console.log('Final data saved to magalu_offers.json');

    return allProducts;
  } catch (error) {
    console.error('Error scraping Magalu offers:', error);
  }
}

scrapeMagaluOffers();