import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const books = [
  {
    title: "The Great Library",
    author: "Dr. Elena Richardson",
    category: "Academic",
    image: "/book-1.svg",
    rating: 4.8,
    description: "A comprehensive guide to modern library science and information management systems. This book explores the evolution of libraries from traditional repositories to digital hubs of knowledge, covering everything from cataloging systems to user experience design.",
    publishYear: 2023,
    isbn: "978-0-123456-78-9",
    pages: 320,
    language: "English",
    publisher: "Academic Press",
    edition: "3rd Edition",
    subjects: ["Library Science", "Information Management", "Digital Libraries"],
    location: "Section A - Floor 2",
    callNumber: "020.1 RIC",
    format: "Hardcover",
    price: "₹2,850",
    totalCopies: 5,
    availableCopies: 3
  },
  {
    title: "Digital Transformation",
    author: "Prof. Michael Chen",
    category: "Technology",
    image: "/book-2.svg",
    rating: 4.9,
    description: "Understanding the impact of digital technology on modern society, business, and personal life. This comprehensive text examines how digital transformation is reshaping industries, creating new opportunities, and challenging traditional business models.",
    publishYear: 2024,
    isbn: "978-0-987654-32-1",
    pages: 256,
    language: "English",
    publisher: "Tech Publications",
    edition: "2nd Edition",
    subjects: ["Digital Technology", "Business Transformation", "Innovation"],
    location: "Section C - Floor 1",
    callNumber: "004.6 CHE",
    format: "Paperback",
    price: "₹1,950",
    totalCopies: 8,
    availableCopies: 6
  },
  {
    title: "Research Methodology",
    author: "Dr. Sarah Williams",
    category: "Academic",
    image: "/book-3.svg",
    rating: 4.7,
    description: "Essential guide for academic research and scholarly writing. This book provides a comprehensive overview of research methods, from qualitative and quantitative approaches to data analysis and presentation techniques.",
    publishYear: 2023,
    isbn: "978-0-456789-12-3",
    pages: 384,
    language: "English",
    publisher: "Research Press",
    edition: "5th Edition",
    subjects: ["Research Methods", "Academic Writing", "Data Analysis"],
    location: "Section A - Floor 3",
    callNumber: "001.42 WIL",
    format: "Hardcover",
    price: "₹3,200",
    totalCopies: 4,
    availableCopies: 1
  },
  {
    title: "Modern Literature",
    author: "James Patterson",
    category: "Fiction",
    image: "/book-4.svg",
    rating: 4.6,
    description: "A collection of contemporary literary works and analysis. This anthology brings together the most influential pieces of modern literature, accompanied by critical analysis and historical context.",
    publishYear: 2024,
    isbn: "978-0-234567-89-1",
    pages: 292,
    language: "English",
    publisher: "Literary House",
    edition: "1st Edition",
    subjects: ["Modern Literature", "Literary Analysis", "Contemporary Fiction"],
    location: "Section B - Floor 2",
    callNumber: "813.54 PAT",
    format: "Paperback",
    price: "₹1,450",
    totalCopies: 6,
    availableCopies: 4
  },
  {
    title: "Data Science Fundamentals",
    author: "Dr. Lisa Zhang",
    category: "Technology",
    image: "/book-5.svg",
    rating: 4.9,
    description: "Complete guide to data science, analytics, and machine learning. From basic statistical concepts to advanced machine learning algorithms, this book provides hands-on examples and practical applications in real-world scenarios.",
    publishYear: 2024,
    isbn: "978-0-345678-91-2",
    pages: 448,
    language: "English",
    publisher: "Data Science Press",
    edition: "4th Edition",
    subjects: ["Data Science", "Machine Learning", "Statistics", "Analytics"],
    location: "Section C - Floor 2",
    callNumber: "006.31 ZHA",
    format: "Hardcover",
    price: "₹3,750",
    totalCopies: 10,
    availableCopies: 7
  },
  {
    title: "Environmental Studies",
    author: "Prof. David Green",
    category: "Science",
    image: "/book-6.svg",
    rating: 4.5,
    description: "Comprehensive study of environmental science and sustainability. This textbook covers climate change, biodiversity, pollution control, and sustainable development practices with case studies from around the world.",
    publishYear: 2023,
    isbn: "978-0-567891-23-4",
    pages: 376,
    language: "English",
    publisher: "Environment Press",
    edition: "6th Edition",
    subjects: ["Environmental Science", "Sustainability", "Climate Change", "Ecology"],
    location: "Section D - Floor 1",
    callNumber: "577 GRE",
    format: "Hardcover",
    price: "₹2,650",
    totalCopies: 5,
    availableCopies: 0
  },
  {
    title: "Philosophy of Mind",
    author: "Dr. Rebecca Moore",
    category: "Philosophy",
    image: "/book-1.svg",
    rating: 4.4,
    description: "Exploring consciousness, thought, and the nature of mind. This philosophical treatise delves into fundamental questions about consciousness, artificial intelligence, and the relationship between mind and body.",
    publishYear: 2023,
    isbn: "978-0-678912-34-5",
    pages: 302,
    language: "English",
    publisher: "Philosophy Today",
    edition: "2nd Edition",
    subjects: ["Philosophy", "Consciousness", "Cognitive Science", "Ethics"],
    location: "Section E - Floor 3",
    callNumber: "128 MOO",
    format: "Paperback",
    price: "₹1,850",
    totalCopies: 3,
    availableCopies: 2
  },
  {
    title: "Quantum Physics Explained",
    author: "Prof. Alan Cooper",
    category: "Science",
    image: "/book-2.svg",
    rating: 4.8,
    description: "Making quantum mechanics accessible to everyone. This book breaks down complex quantum physics concepts into understandable explanations, complete with illustrations and practical applications in modern technology.",
    publishYear: 2024,
    isbn: "978-0-789123-45-6",
    pages: 334,
    language: "English",
    publisher: "Science World",
    edition: "3rd Edition",
    subjects: ["Quantum Physics", "Theoretical Physics", "Modern Physics"],
    location: "Section D - Floor 2",
    callNumber: "530.12 COO",
    format: "Hardcover",
    price: "₹3,100",
    totalCopies: 4,
    availableCopies: 3
  },
  {
    title: "Creative Writing Workshop",
    author: "Emma Thompson",
    category: "Fiction",
    image: "/book-3.svg",
    rating: 4.5,
    description: "A practical guide to developing your writing skills. This hands-on workshop guide includes exercises, prompts, and techniques for crafting compelling narratives, developing characters, and finding your unique voice.",
    publishYear: 2023,
    isbn: "978-0-891234-56-7",
    pages: 268,
    language: "English",
    publisher: "Writers Guild",
    edition: "1st Edition",
    subjects: ["Creative Writing", "Narrative Techniques", "Character Development"],
    location: "Section B - Floor 1",
    callNumber: "808.3 THO",
    format: "Paperback",
    price: "₹1,350",
    totalCopies: 6,
    availableCopies: 2
  },
  {
    title: "Machine Learning Mastery",
    author: "Dr. Kevin Johnson",
    category: "Technology",
    image: "/book-4.svg",
    rating: 4.9,
    description: "Advanced techniques in artificial intelligence and machine learning. This comprehensive guide covers neural networks, deep learning, natural language processing, and computer vision with practical Python implementations.",
    publishYear: 2024,
    isbn: "978-0-912345-67-8",
    pages: 512,
    language: "English",
    publisher: "AI Publications",
    edition: "2nd Edition",
    subjects: ["Machine Learning", "Artificial Intelligence", "Neural Networks", "Deep Learning"],
    location: "Section C - Floor 3",
    callNumber: "006.31 JOH",
    format: "Hardcover",
    price: "₹4,200",
    totalCopies: 8,
    availableCopies: 5
  },
  {
    title: "History of Ancient Civilizations",
    author: "Dr. Maria Rodriguez",
    category: "History",
    image: "/book-5.svg",
    rating: 4.6,
    description: "A comprehensive journey through ancient civilizations from Mesopotamia to the Roman Empire. This book explores the rise and fall of great civilizations, their contributions to human knowledge, and their lasting impact on modern society.",
    publishYear: 2023,
    isbn: "978-0-567123-89-0",
    pages: 456,
    language: "English",
    publisher: "Historical Society Press",
    edition: "4th Edition",
    subjects: ["Ancient History", "Civilizations", "Archaeology", "Cultural Studies"],
    location: "Section F - Floor 2",
    callNumber: "930 ROD",
    format: "Hardcover",
    price: "₹2,950",
    totalCopies: 7,
    availableCopies: 5
  },
  {
    title: "Modern Psychology",
    author: "Dr. Robert Kim",
    category: "Psychology",
    image: "/book-6.svg",
    rating: 4.7,
    description: "Understanding human behavior and mental processes in the 21st century. This textbook covers cognitive psychology, social psychology, developmental psychology, and clinical applications with current research findings.",
    publishYear: 2024,
    isbn: "978-0-234789-01-2",
    pages: 398,
    language: "English",
    publisher: "Psychology Press",
    edition: "8th Edition",
    subjects: ["Psychology", "Cognitive Science", "Behavioral Studies", "Mental Health"],
    location: "Section G - Floor 1",
    callNumber: "150 KIM",
    format: "Paperback",
    price: "₹2,450",
    totalCopies: 9,
    availableCopies: 6
  }
]

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      name: 'Library Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      membershipId: 'ADMIN001',
      phoneNumber: '+1234567890',
      address: 'Library Main Office'
    }
  })

  // Create a regular user for testing
  const userPassword = await bcrypt.hash('user123', 10)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'user@library.com' },
    update: {},
    create: {
      email: 'user@library.com',
      name: 'Test User',
      password: userPassword,
      role: 'MEMBER',
      membershipId: 'MEM001',
      phoneNumber: '+1234567891',
      address: '123 Test Street'
    }
  })

  // Create books
  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: {
        ...book,
        borrowedCopies: book.totalCopies - book.availableCopies
      }
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@library.com / admin123')
  console.log('Test user credentials: user@library.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
