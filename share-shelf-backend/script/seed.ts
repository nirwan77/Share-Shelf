// script/seed.ts - PERFECT CSV PARSER for Goodreads format
import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('1234567890abcdef', 21);

interface BookSeed {
  name: string;
  author: string;
  description: string;
  image: string;
  genres: string[];
}

function readCsvSync(): { books: BookSeed[]; genres: string[] } {
  const fs = require('fs');
  const csvPath = 'script/books.csv';

  if (!fs.existsSync(csvPath)) {
    throw new Error(`❌ ${csvPath} not found!`);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').slice(1); // skip header
  const books: BookSeed[] = [];
  const genresSet = new Set<string>();

  lines.forEach((line, lineIndex) => {
    if (!line.trim() || lineIndex >= 1000) return;

    try {
      // ✅ GOODREADS CSV FORMAT: "id","title","series","author",...
      // Split handling quoted fields with commas INSIDE
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());

      if (cols.length < 22) return; // invalid row

      // Extract fields (Goodreads CSV column indexes)
      const title = cols[1]?.replace(/"/g, '').trim() || 'Book Title';
      const author = cols[3]?.replace(/"/g, '').trim() || 'Author';
      let desc = cols[5]?.replace(/"/g, '').trim() || 'Amazing book!';
      desc = desc.length > 500 ? desc.slice(0, 500) + '...' : desc;
      const coverImg =
        cols[21]?.replace(/"/g, '').trim() ||
        'https://via.placeholder.com/300x400?text=Book';
      const genresRaw = cols[8]?.replace(/"/g, '').trim() || '';

      // Parse genres array like "['Fiction', 'Romance']"
      const genres = genresRaw
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((g) => g.trim().replace(/^'|'$/g, ''))
        .filter((g) => g && g.length > 1)
        .slice(0, 5);

      if (genres.length === 0) genres.push('Fiction');

      genres.forEach((g) => genresSet.add(g));

      books.push({
        name: title,
        author: author,
        description: desc,
        image: coverImg,
        genres,
      });
    } catch (e) {
      console.log(`⚠️ Skip line ${lineIndex + 1}: ${e}`);
    }
  });

  console.log(
    `📖 Successfully parsed ${books.length} books from ${lines.length} lines`,
  );
  console.log('Sample:', books[0]?.name, 'by', books[0]?.author);

  return { books, genres: Array.from(genresSet) };
}

// Rest unchanged...
async function main() {
  try {
    const { books, genres } = readCsvSync();
    console.log(
      `🌟 Seeding ${books.length} books + ${genres.length} genres...`,
    );

    const genreMap: Record<string, string> = {};
    for (const name of genres) {
      const existing = await prisma.genre.findUnique({ where: { name } });
      if (!existing) {
        const genre = await prisma.genre.create({
          data: { id: nanoid(), name },
        });
        genreMap[name] = genre.id;
      } else {
        genreMap[name] = existing.id;
      }
    }

    for (let i = 0; i < Math.min(1000, books.length); i++) {
      const bookData = books[i];
      const book = await prisma.books.create({
        data: {
          id: nanoid(),
          name: bookData.name,
          author: bookData.author,
          description: bookData.description,
          image: bookData.image,
        },
      });

      for (const genreName of bookData.genres.slice(0, 3)) {
        await prisma.bookGenre.upsert({
          where: {
            bookId_genreId: { bookId: book.id, genreId: genreMap[genreName] },
          },
          update: {},
          create: { bookId: book.id, genreId: genreMap[genreName] },
        });
      }

      if ((i + 1) % 100 === 0 || i === books.length - 1) {
        console.log(`${i + 1}/${books.length} seeded`);
      }
    }

    // Verify
    const [booksCount, genresCount, relationsCount] = await prisma.$transaction(
      [prisma.books.count(), prisma.genre.count(), prisma.bookGenre.count()],
    );

    console.log(`✅ FINAL STATS:
Books: ${booksCount} 📚
Genres: ${genresCount} 🎭
Relations: ${relationsCount} 🔗`);
  } catch (error: any) {
    console.error('💥 Failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
