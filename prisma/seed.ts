import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Categories first
  const categories = [
    {
      name: 'Fiction',
      description: 'Literary works of fiction including novels, short stories, and poetry',
      image: '/category-fiction.svg'
    },
    {
      name: 'Non-Fiction',
      description: 'Educational and informational books based on facts and real events',
      image: '/category-nonfiction.svg'
    },
    {
      name: 'Technology',
      description: 'Books about computer science, programming, and modern technology',
      image: '/category-technology.svg'
    },
    {
      name: 'Science',
      description: 'Scientific literature covering physics, chemistry, biology, and more',
      image: '/category-science.svg'
    },
    {
      name: 'History',
      description: 'Historical accounts, biographies, and cultural studies',
      image: '/category-history.svg'
    },
    {
      name: 'Literature',
      description: 'Classic and contemporary literary works and analysis',
      image: '/category-literature.svg'
    }
  ];

  console.log('Creating categories...');
  const createdCategories = await Promise.all(
    categories.map(async (category) => {
      return await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    })
  );

  console.log('Categories created:', createdCategories.length);

  // Get category IDs for book creation
  const categoryMap = createdCategories.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  // Create Books with updated schema format
  const books = [
    {
      isbn: '978-0-123456-78-9',
      title: 'The Great Library',
      author: 'Dr. Elena Richardson',
      description: 'A comprehensive guide to modern library science and information management systems. This book covers everything from traditional cataloging to digital transformation.',
      categoryId: categoryMap['Non-Fiction'],
      image: '/book-1.svg', // Local image
      totalCopies: 5,
      availableCopies: 3,
      publishedYear: 2023,
      publisher: 'Academic Press'
    },
    {
      isbn: '978-0-987654-32-1',
      title: 'Digital Transformation',
      author: 'Prof. Michael Chen',
      description: 'Understanding the impact of digital technology on modern society, business processes, and educational institutions.',
      categoryId: categoryMap['Technology'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop', // Online image
      totalCopies: 8,
      availableCopies: 5,
      publishedYear: 2024,
      publisher: 'Tech Publications'
    },
    {
      isbn: '978-0-456789-12-3',
      title: 'Research Methodology',
      author: 'Dr. Sarah Williams',
      description: 'Essential guide for academic research and scholarly writing. This book provides comprehensive coverage of research methods and data analysis.',
      categoryId: categoryMap['Non-Fiction'],
      image: '/book-3.svg',
      totalCopies: 4,
      availableCopies: 1,
      publishedYear: 2023,
      publisher: 'Research Press'
    },
    {
      isbn: '978-0-234567-89-1',
      title: 'Modern Literature',
      author: 'James Patterson',
      description: 'A collection of contemporary literary works and analysis. This anthology explores themes in modern fiction and poetry.',
      categoryId: categoryMap['Literature'],
      image: '/book-4.svg',
      totalCopies: 6,
      availableCopies: 4,
      publishedYear: 2024,
      publisher: 'Literary House'
    },
    {
      isbn: '978-0-345678-91-2',
      title: 'Data Science Fundamentals',
      author: 'Dr. Lisa Zhang',
      description: 'Complete guide to data science, analytics, and machine learning. From basic statistics to advanced algorithms.',
      categoryId: categoryMap['Technology'],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=400&fit=crop',
      totalCopies: 10,
      availableCopies: 6,
      publishedYear: 2024,
      publisher: 'Data Science Press'
    },
    {
      isbn: '978-0-567891-23-4',
      title: 'Environmental Studies',
      author: 'Prof. David Green',
      description: 'Comprehensive study of environmental science and sustainability. This book covers climate change, ecology, and conservation.',
      categoryId: categoryMap['Science'],
      image: '/book-6.svg',
      totalCopies: 5,
      availableCopies: 0,
      publishedYear: 2023,
      publisher: 'Environment Press'
    },
    {
      isbn: '978-0-678912-34-5',
      title: 'Philosophy of Mind',
      author: 'Dr. Rebecca Moore',
      description: 'Exploring consciousness, thought, and the nature of mind. This philosophical work examines the relationship between mind and reality.',
      categoryId: categoryMap['Non-Fiction'],
      image: '/book-1.svg',
      totalCopies: 3,
      availableCopies: 2,
      publishedYear: 2023,
      publisher: 'Philosophy Today'
    },
    {
      isbn: '978-0-789123-45-6',
      title: 'Quantum Physics Explained',
      author: 'Prof. Alan Cooper',
      description: 'Making quantum mechanics accessible to everyone. This book breaks down complex physics concepts into understandable explanations.',
      categoryId: categoryMap['Science'],
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=400&fit=crop',
      totalCopies: 4,
      availableCopies: 3,
      publishedYear: 2024,
      publisher: 'Science World'
    },
    {
      isbn: '978-0-891234-56-7',
      title: 'Creative Writing Workshop',
      author: 'Emma Thompson',
      description: 'A practical guide to developing your writing skills. This hands-on workshop covers fiction, poetry, and creative non-fiction.',
      categoryId: categoryMap['Fiction'],
      image: '/book-3.svg',
      totalCopies: 6,
      availableCopies: 2,
      publishedYear: 2023,
      publisher: 'Writers Guild'
    },
    {
      isbn: '978-0-912345-67-8',
      title: 'Machine Learning Mastery',
      author: 'Dr. Kevin Johnson',
      description: 'Advanced techniques in artificial intelligence and machine learning. This comprehensive guide covers neural networks, deep learning, and AI applications.',
      categoryId: categoryMap['Technology'],
      image: '/book-4.svg',
      totalCopies: 8,
      availableCopies: 5,
      publishedYear: 2024,
      publisher: 'AI Publications'
    },
    {
      isbn: '978-0-567123-89-0',
      title: 'History of Ancient Civilizations',
      author: 'Dr. Maria Rodriguez',
      description: 'A comprehensive journey through ancient civilizations from Mesopotamia to Rome. Explore the cultures that shaped our world.',
      categoryId: categoryMap['History'],
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&h=400&fit=crop',
      totalCopies: 7,
      availableCopies: 5,
      publishedYear: 2023,
      publisher: 'Historical Society Press'
    },
    {
      isbn: '978-0-234789-01-2',
      title: 'Modern Psychology',
      author: 'Dr. Robert Kim',
      description: 'Understanding human behavior and mental processes in the 21st century. This book covers cognitive psychology, social psychology, and clinical applications.',
      categoryId: categoryMap['Science'],
      image: '/book-6.svg',
      totalCopies: 9,
      availableCopies: 6,
      publishedYear: 2024,
      publisher: 'Psychology Press'
    }
  ];

  console.log('Creating books...');
  const createdBooks = await Promise.all(
    books.map(async (book) => {
      return await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book
      });
    })
  );

  console.log('Books created:', createdBooks.length);

  // Create an admin user
  console.log('Creating admin user...');
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Library',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('Admin user created:', adminUser.email);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });