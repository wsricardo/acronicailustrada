async function test() {
  const cheerio = (await import('cheerio')).default || (await import('cheerio'));
  
  const feeds = [
    'https://g1.globo.com/rss/g1/',
    'https://www.cnnbrasil.com.br/feed/',
    'https://rss.uol.com.br/feed/noticias.xml',
    'https://feeds.bbci.co.uk/portuguese/rss.xml'
  ];
  
  let allResults = [];
  
  for (let feed of feeds) {
    try {
      const res = await fetch(feed);
      const text = await res.text();
      const $ = cheerio.load(text, { xmlMode: true });
      
      $('item').each((i, el) => {
        if (i > 3) return; // limit to 4 per feed
        allResults.push({
          title: $(el).find('title').text(),
          url: $(el).find('link').text(),
          snippet: $(el).find('description').text().replace(/(<([^>]+)>)/gi, "").substring(0, 150)
        });
      });
    } catch (e) {
      console.log("Error on feed: ", feed);
    }
  }
  
  console.log(JSON.stringify(allResults.slice(0, 5), null, 2));
}

test();
