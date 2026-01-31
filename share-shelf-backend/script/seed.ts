import { PrismaClient } from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoid = customAlphabet('1234567890abcdef', 21);

const PUBLIC_DOMAIN_BOOKS = [
  {
    name: 'Pride and Prejudice',
    author: 'Jane Austen',
    description:
      'Classic romance novel about love, marriage, and social class in 19th-century England.',
    image: 'https://covers.openlibrary.org/b/id/6886423-M.jpg',
    genres: ['Classics', 'Romance', 'Fiction'],
    releaseDate: new Date('1813-01-28'),
    price: 899,
  },
  {
    name: 'Jane Eyre',
    author: 'Charlotte Brontë',
    description:
      'Gothic romance about an orphaned governess who falls in love with her employer.',
    image: 'https://covers.openlibrary.org/b/id/1059631-M.jpg',
    genres: ['Classics', 'Romance', 'Gothic'],
    releaseDate: new Date('1847-10-16'),
    price: 1299,
  },
  {
    name: 'Frankenstein',
    author: 'Mary Shelley',
    description:
      'The original science fiction novel about a scientist who creates a living creature.',
    image: 'https://covers.openlibrary.org/b/id/201583-M.jpg',
    genres: ['Classics', 'Horror', 'Science Fiction'],
    releaseDate: new Date('1818-01-01'),
    price: 999,
  },
  {
    name: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    description:
      'Collection of detective stories featuring the famous Sherlock Holmes.',
    image: 'https://covers.openlibrary.org/b/id/86232-M.jpg',
    genres: ['Classics', 'Mystery', 'Detective'],
    releaseDate: new Date('1892-10-01'),
    price: 1199,
  },
  {
    name: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    description:
      'Whimsical tale of a girl who falls down a rabbit hole into a fantastical world.',
    image: 'https://covers.openlibrary.org/b/id/2895163-M.jpg',
    genres: ['Classics', 'Fantasy', 'Children'],
    releaseDate: new Date('1865-11-26'),
    price: 799,
  },
  {
    name: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    description:
      'Philosophical novel about a portrait that ages while its subject remains young.',
    image: 'https://covers.openlibrary.org/b/id/17124-M.jpg',
    genres: ['Classics', 'Fiction', 'Philosophy'],
    releaseDate: new Date('1890-07-01'),
    price: 1399,
  },
  {
    name: 'Dracula',
    author: 'Bram Stoker',
    description:
      "Classic gothic horror novel about Count Dracula's quest for blood.",
    image: 'https://covers.openlibrary.org/b/id/3860-M.jpg',
    genres: ['Classics', 'Horror', 'Gothic'],
    releaseDate: new Date('1897-05-26'),
    price: 1099,
  },
  {
    name: 'The War of the Worlds',
    author: 'H. G. Wells',
    description: 'Science fiction novel about a Martian invasion of Earth.',
    image: 'https://covers.openlibrary.org/b/id/40557-M.jpg',
    genres: ['Classics', 'Science Fiction', 'Invasion'],
    releaseDate: new Date('1898-04-01'),
    price: 949,
  },
  {
    name: 'The Time Machine',
    author: 'H. G. Wells',
    description:
      "First time travel novel about a scientist's journey to the year 802,701 AD.",
    image: 'https://covers.openlibrary.org/b/id/78757-M.jpg',
    genres: ['Classics', 'Science Fiction', 'Time Travel'],
    releaseDate: new Date('1895-05-01'),
    price: 899,
  },
  {
    name: 'Treasure Island',
    author: 'Robert Louis Stevenson',
    description: 'Classic pirate adventure story featuring Long John Silver.',
    image: 'https://covers.openlibrary.org/b/id/5704-M.jpg',
    genres: ['Classics', 'Adventure', 'Pirates'],
    releaseDate: new Date('1883-11-01'),
    price: 799,
  },
  {
    name: 'Moby-Dick',
    author: 'Herman Melville',
    description:
      'Epic tale of a whaling voyage and one captain’s obsession with a great white whale.',
    image: 'https://covers.openlibrary.org/b/id/8100921-M.jpg',
    genres: ['Classics', 'Adventure', 'Sea Stories'],
    releaseDate: new Date('1851-10-18'),
    price: 1099,
  },
  {
    name: 'Wuthering Heights',
    author: 'Emily Brontë',
    description:
      'Dark romantic drama set on the Yorkshire moors about love and revenge.',
    image: 'https://covers.openlibrary.org/b/id/8231851-M.jpg',
    genres: ['Classics', 'Romance', 'Gothic'],
    releaseDate: new Date('1847-12-01'),
    price: 999,
  },
  {
    name: 'Les Misérables',
    author: 'Victor Hugo',
    description:
      'Epic story of love, justice, and revolution in 19th-century France.',
    image: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
    genres: ['Classics', 'Historical', 'Drama'],
    releaseDate: new Date('1862-04-03'),
    price: 1499,
  },
  {
    name: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    description:
      'Historical novel set during the French Revolution about sacrifice and redemption.',
    image: 'https://covers.openlibrary.org/b/id/7222240-M.jpg',
    genres: ['Classics', 'Historical', 'Drama'],
    releaseDate: new Date('1859-04-30'),
    price: 899,
  },
  {
    name: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    description:
      'Adventure novel about betrayal, imprisonment, and ultimate revenge.',
    image: 'https://covers.openlibrary.org/b/id/7352166-M.jpg',
    genres: ['Classics', 'Adventure', 'Revenge'],
    releaseDate: new Date('1844-08-28'),
    price: 1299,
  },
  {
    name: 'The Jungle Book',
    author: 'Rudyard Kipling',
    description:
      'Collection of stories about a boy raised by wolves in the Indian jungle.',
    image: 'https://covers.openlibrary.org/b/id/8155425-M.jpg',
    genres: ['Classics', 'Adventure', 'Children'],
    releaseDate: new Date('1894-05-01'),
    price: 799,
  },
  {
    name: 'The Call of the Wild',
    author: 'Jack London',
    description:
      'Story of a domesticated dog’s survival and transformation in the Yukon wilderness.',
    image: 'https://covers.openlibrary.org/b/id/11644272-M.jpg',
    genres: ['Classics', 'Adventure', 'Nature'],
    releaseDate: new Date('1903-02-01'),
    price: 899,
  },
  {
    name: 'The Scarlet Letter',
    author: 'Nathaniel Hawthorne',
    description:
      'Story of sin, guilt, and redemption in a Puritan New England town.',
    image: 'https://covers.openlibrary.org/b/id/7222253-M.jpg',
    genres: ['Classics', 'Historical', 'Romance'],
    releaseDate: new Date('1850-03-16'),
    price: 999,
  },
  {
    name: 'Don Quixote',
    author: 'Miguel de Cervantes',
    description:
      'Satirical tale of a nobleman who believes he is a knight and sets out on absurd adventures.',
    image: 'https://covers.openlibrary.org/b/id/8100983-M.jpg',
    genres: ['Classics', 'Satire', 'Adventure'],
    releaseDate: new Date('1605-01-16'),
    price: 1099,
  },
  {
    name: 'The Odyssey',
    author: 'Homer',
    description:
      'Epic poem following Odysseus’s long and perilous journey home after the Trojan War.',
    image: 'https://covers.openlibrary.org/b/id/8232001-M.jpg',
    genres: ['Classics', 'Epic', 'Mythology'],
    releaseDate: new Date('-800-01-01'),
    price: 799,
  },
];

async function main() {
  try {
    // Clear existing data
    await prisma.books.deleteMany({});
    await prisma.bookGenre.deleteMany({});
    await prisma.genre.deleteMany({});

    // Seed genres first
    const genreMap: Record<string, string> = {};
    const allGenres = [
      ...new Set(PUBLIC_DOMAIN_BOOKS.flatMap((b) => b.genres)),
    ];

    for (const name of allGenres) {
      const genre = await prisma.genre.create({
        data: { id: nanoid(), name: name.toLowerCase() },
      });
      genreMap[name.toLowerCase()] = genre.id;
    }

    // Seed books
    for (let i = 0; i < PUBLIC_DOMAIN_BOOKS.length; i++) {
      const bookData = PUBLIC_DOMAIN_BOOKS[i];

      const book = await prisma.books.create({
        data: {
          id: nanoid(),
          name: bookData.name,
          author: bookData.author,
          description: bookData.description,
          image: bookData.image,
          price: bookData.price,
          releaseDate: bookData.releaseDate,
        },
      });

      // Link genres
      for (const genreName of bookData.genres.slice(0, 3)) {
        const genreId = genreMap[genreName.toLowerCase()];
        if (genreId) {
          await prisma.bookGenre.create({
            data: {
              bookId: book.id,
              genreId,
            },
          });
        }
      }
    }

    const stats = await prisma.$transaction([
      prisma.books.count(),
      prisma.genre.count(),
      prisma.bookGenre.count(),
    ]);

    console.log(`🎉 SEEDING COMPLETE!
Books: ${stats[0]} 📚
Genres: ${stats[1]} 🎭  
Relations: ${stats[2]} 🔗`);
  } catch (error) {
    console.error('💥 Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
