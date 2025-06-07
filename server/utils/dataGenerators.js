const { Faker, en_US, de, ja, en } = require('@faker-js/faker');
const seedrandom = require('seedrandom');
const { times } = require('./timesFunction');
const { createCanvas } = require('canvas');

const getFakerInstance = (locale) => {
  if (locale === 'de-DE') return new Faker({ locale: [de, en] });
  if (locale === 'ja-JP') return new Faker({ locale: [ja, en] });
  return new Faker({ locale: [en_US, en] });
};

const generateBook = (overallBookIndex, userSeed, languageRegion, avgLikes, avgReviews) => {
  const bookStructureSeed = `${userSeed}_book_${overallBookIndex}`;
  const faker = getFakerInstance(languageRegion);
  faker.seed(globalNumericSeed(bookStructureSeed)); // Ensure Faker is seeded

  const authorCountRng = seedrandom(bookStructureSeed + '_author_count');
  const numAuthors = Math.floor(authorCountRng() * 3) + 1; // 1 to 3 authors
  const authors = [];
  for (let i = 0; i < numAuthors; i++) {
    faker.seed(globalNumericSeed(bookStructureSeed + `_author_${i}`));
    authors.push(faker.person.fullName());
  }

  faker.seed(globalNumericSeed(bookStructureSeed + '_publisher'));
  const publisher = faker.company.name();

  faker.seed(globalNumericSeed(bookStructureSeed + '_title'));
  let title;
  // Generate more book-like titles
  const titleType = Math.floor(faker.number.int(2));
  if (languageRegion === 'ja-JP') {
      const nouns = ["伝説", "冒険", "星", "影", "魔法", "未来", "記憶", "戦い", "夢", "希望"];
      const particles = ["の", "と", "へ"];
      const chosenNoun1 = faker.helpers.arrayElement(nouns);
      const chosenNoun2 = faker.helpers.arrayElement(nouns);
      const chosenParticle = faker.helpers.arrayElement(particles);
      if (titleType === 0) title = `${chosenNoun1}${chosenParticle}${chosenNoun2}`;
      else title = `${faker.lorem.words(2)} ${chosenNoun1}`;
      if (title.length > 20) title = title.substring(0, 20); // Keep it reasonable
  } else if (languageRegion === 'de-DE') {
      if (titleType === 0) title = `${faker.word.adjective()} ${faker.word.noun()}`;
      else title = `Das Geheimnis ${faker.helpers.arrayElement(["des", "der", "des"])} ${faker.word.noun()}`;
      title = title.charAt(0).toUpperCase() + title.slice(1);
  } else { // en-US and default
      if (titleType === 0) title = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()}`;
      else if (titleType === 1) title = `The ${faker.word.noun()} of ${faker.word.noun()}`;
      else title = `${faker.company.catchPhraseAdjective()} ${faker.company.catchPhraseNoun()}`;
      title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  if (title.length > 40) title = title.substring(0, 40);


  faker.seed(globalNumericSeed(bookStructureSeed + '_isbn'));
  const isbn = faker.commerce.isbn(); // Using commerce.isbn as helpers.isbn is not available. Adjust if needed.

  // Generate Likes
  const likesRng = seedrandom(bookStructureSeed + '_likes_count');
  const addLike = (currentCount) => currentCount + 1;
  const likeGenerator = times(parseFloat(avgLikes), addLike, likesRng);
  const likes = likeGenerator(0);

  // Generate Reviews
  const reviewsRng = seedrandom(bookStructureSeed + '_reviews_count');
  const reviews = [];
  const addReview = (currentReviews) => {
    const reviewIndex = currentReviews.length;
    const reviewContentSeed = bookStructureSeed + `_review_content_${reviewIndex}`;
    faker.seed(globalNumericSeed(reviewContentSeed + '_author'));
    const reviewAuthor = faker.person.fullName();
    faker.seed(globalNumericSeed(reviewContentSeed + '_text'));
    let reviewText;
    if (languageRegion === 'ja-JP') reviewText = faker.lorem.paragraph(2);
    else if (languageRegion === 'de-DE') reviewText = faker.lorem.paragraph(2);
    else reviewText = faker.lorem.paragraph(2);

    currentReviews.push({ author: reviewAuthor, text: reviewText });
    return currentReviews;
  };
  const reviewGeneratorInstance = times(parseFloat(avgReviews), addReview, reviewsRng);
  reviewGeneratorInstance(reviews); // Modifies 'reviews' array directly

  return {
    id: bookStructureSeed, // Unique ID for the book
    isbn,
    title,
    authors,
    publisher,
    likes,
    reviews,
    coverSeed: bookStructureSeed // Seed for cover generation
  };
};

const globalNumericSeed = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


const generateBookCover = (title, author, width, height, seed) => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const coverRng = seedrandom(seed + '_cover_details');

    const r = Math.floor(coverRng() * 55) + 200; // Lighter background
    const g = Math.floor(coverRng() * 55) + 200;
    const b = Math.floor(coverRng() * 55) + 200;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    // Title (simple wrapping attempt)
    let titleFontSize = Math.max(14, Math.min(20, Math.floor(width / 10)));
    ctx.font = `bold ${titleFontSize}px Arial`;
    const titleWords = title.split(' ');
    let line = '';
    let yPos = height * 0.35;
    const maxLineWidth = width * 0.8;

    for (let n = 0; n < titleWords.length; n++) {
        let testLine = line + titleWords[n] + ' ';
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxLineWidth && n > 0) {
            ctx.fillText(line, width / 2, yPos);
            line = titleWords[n] + ' ';
            yPos += titleFontSize * 1.2;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line.trim(), width / 2, yPos);
    yPos += titleFontSize * 1.2;


    // Author
    let authorFontSize = Math.max(12, Math.min(16, Math.floor(width / 12)));
    ctx.font = `${authorFontSize}px Arial`;
    ctx.fillText(`by ${author}`, width / 2, yPos + authorFontSize);


    return canvas.toBuffer('image/png');
};


module.exports = { generateBook, generateBookCover };