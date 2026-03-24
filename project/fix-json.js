const fs = require('fs');

['zh-Hant', 'zh-CN'].forEach(lang => {
  const filepath = `src/i18n/locales/${lang}/query.json`;
  let content = fs.readFileSync(filepath, 'utf8');

  // Replace smart quotes with regular quotes
  content = content.replace(/"/g, '"').replace(/"/g, '"');

  // Now try to parse
  try {
    const data = JSON.parse(content);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Fixed ${lang}/query.json`);
  } catch (e) {
    console.error(`Still error in ${lang}:`, e.message);
  }
});
