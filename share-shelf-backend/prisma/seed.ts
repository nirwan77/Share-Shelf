import { PrismaClient } from '@prisma/client';

const books = [
  {
    name: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description:
      'A story about the Jazz Age in the United States, exploring themes of decadence, idealism, and social upheaval.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
  },
  {
    name: '1984',
    author: 'George Orwell',
    description:
      'A dystopian novel set in a totalitarian society under constant surveillance.',
    genre: 'Dystopian Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
  },
  {
    name: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description:
      'A novel centered on racial injustice and moral growth in the American South.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg',
  },
  {
    name: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description:
      'A fantasy adventure that precedes the events of the Lord of the Rings, following Bilbo Baggins.',
    genre: 'Fantasy',
    image: 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg',
  },
  {
    name: 'Pride and Prejudice',
    author: 'Jane Austen',
    description:
      'A romantic novel exploring themes of class, marriage, and society in 19th-century England.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9781503290563-M.jpg',
  },
  {
    name: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description:
      'A story about adolescent angst and alienation in postwar New York.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780316769488-M.jpg',
  },
  {
    name: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    description:
      'An epic fantasy trilogy chronicling the quest to destroy the One Ring.',
    genre: 'Fantasy',
    image: 'https://covers.openlibrary.org/b/isbn/9780544003415-M.jpg',
  },
  {
    name: 'Brave New World',
    author: 'Aldous Huxley',
    description:
      'A dystopian novel about a technologically advanced society with engineered happiness.',
    genre: 'Dystopian Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg',
  },
  {
    name: 'Moby-Dick',
    author: 'Herman Melville',
    description:
      'The classic tale of obsession and revenge between Captain Ahab and the white whale.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9781503280786-M.jpg',
  },
  {
    name: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    description:
      'A psychological novel exploring morality, guilt, and redemption in 19th-century Russia.',
    genre: 'Classic Fiction',
    image: 'https://covers.openlibrary.org/b/isbn/9780143058144-M.jpg',
  },
];

const prisma = new PrismaClient();

async function main() {
  for (const b of books) {
    await prisma.books.create({
      data: b,
    });
  }
}

main();
