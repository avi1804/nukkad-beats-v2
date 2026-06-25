import { PrismaClient, Role } from '@prisma/client';
import { AuthUtils } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Admin account creation
  const adminEmail = process.env.ADMIN_EMAIL || 'nukkadbeatsofficial@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await AuthUtils.hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        fullName: 'System Admin',
        email: adminEmail,
        phone: '1234567890',
        passwordHash,
        role: Role.ADMIN,
        isVerified: true
      }
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // 2. Studio seed data
  const studios = [
    {
      name: 'NAMAS Studio 1',
      description: 'Premium recording and rehearsal space',
      capacity: 50,
      pricePerHour: 1000,
      isActive: true
    },
    {
      name: 'NAMAS Studio 2',
      description: 'Standard practice and jam room',
      capacity: 90,
      pricePerHour: 1400,
      isActive: true
    }
  ];

  for (const studio of studios) {
    const existingStudio = await prisma.studio.findFirst({
      where: { name: studio.name }
    });

    if (!existingStudio) {
      await prisma.studio.create({ data: studio });
      console.log(`✅ Studio created: ${studio.name}`);
    } else {
      console.log(`ℹ️ Studio already exists: ${studio.name}`);
    }
  }

  // 3. Category seed data
  const categories = [
    { name: 'Beverages', slug: 'beverages' },
    { name: 'Snacks', slug: 'snacks' },
    { name: 'Fast Food', slug: 'fast-food' },
    { name: 'Desserts', slug: 'desserts' }
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name }
    });

    if (!existingCategory) {
      await prisma.category.create({ data: category });
      console.log(`✅ Category created: ${category.name}`);
    } else {
      console.log(`ℹ️ Category already exists: ${category.name}`);
    }
  }

  // 4. Products seed data
  const products = [
    { name: 'Poha', categorySlug: 'snacks', description: 'Light, fluffy flattened rice cooked with turmeric, mustard seeds, and onions.', price: 35, image: '/images/menu/poha_new.png', rating: 4.8 },
    { name: 'Yellow Dhokla (8pc)', categorySlug: 'snacks', description: 'Spongy, steamed savory chickpea cakes garnished with mustard seeds and coconut.', price: 60, image: '/images/menu/yellow_dhokla.png', rating: 4.7 },
    { name: 'White Dhokla (8pc)', categorySlug: 'snacks', description: 'Traditional Gujarati soft, fermented rice and lentil flour steamed cakes.', price: 60, image: '/images/menu/white_dhokla.png', rating: 4.6 },
    { name: 'Sev Khamani', categorySlug: 'snacks', description: 'Crumbled, seasoned chana dal dhokla garnished generously with crunchy sev.', price: 60, image: '/images/menu/sev_khamani.png', rating: 4.8 },
    { name: 'Thepla (3pc) & Aloo Suki Sabji', categorySlug: 'snacks', description: 'Spiced fenugreek flatbreads served with a dry, flavorful potato side dish.', price: 85, image: '/images/menu/thepla_new.png', rating: 4.9 },
    { name: 'Punjabi Samosa (Big)', categorySlug: 'snacks', description: 'Golden-brown, crispy pastry stuffed with spiced potatoes and green peas.', price: 30, image: '/images/menu/samosa_new.png', rating: 4.9 },
    { name: 'Samosa Dahi Chaat', categorySlug: 'snacks', description: 'Crushed samosas topped with sweetened yogurt, tangy chutneys, and spices.', price: 70, image: '/images/menu/samosa_chaat.png', rating: 4.8 },
    { name: 'Dahi Vada (2pc)', categorySlug: 'snacks', description: 'Soft lentil dumplings soaked in sweet yogurt and topped with spice powders.', price: 80, image: '/images/menu/dahi_vada.png', rating: 4.7 },
    { name: 'Chutney Sandwiches', categorySlug: 'snacks', description: 'Fresh bread slices slathered with vibrant, spicy coriander-mint chutney.', price: 70, image: '/images/menu/chutney_sandwich.png', rating: 4.5 },
    { name: 'Cheese Chutney Sandwich', categorySlug: 'snacks', description: 'Classic chutney sandwich loaded with grated processed cheese.', price: 90, image: '/images/menu/cheese_chutney_sandwich.png', rating: 4.7 },
    { name: 'Vada Pav (1pc)', categorySlug: 'snacks', description: 'Mumbai\'s favorite street snack: batata vada in a soft bun with chutneys.', price: 40, image: '/images/menu/vada_pav_new.png', rating: 4.9 },

    { name: 'Sev Usal', categorySlug: 'fast-food', description: 'Spicy dried peas curry garnished with crunchy sev, onions, and lemon.', price: 60, image: '/images/menu/sev_usal_new.png', rating: 4.8 },
    { name: 'Sev Usal with Bread', categorySlug: 'fast-food', description: 'Spicy sev usal served alongside butter-toasted bread rolls.', price: 75, image: '/images/menu/sev_usal_bread.png', rating: 4.8 },
    { name: 'Idli (3pc)', categorySlug: 'fast-food', description: 'Steamed rice cakes served with hot sambhar and fresh coconut chutney.', price: 65, image: '/images/menu/idli_new.png', rating: 4.7 },
    { name: 'Idli (2pc) & Vada (2pc)', categorySlug: 'fast-food', description: 'A combination of steamed idlis and crispy fried lentil medu vadas.', price: 90, image: '/images/menu/idli_vada.png', rating: 4.8 },
    { name: 'Chole Kulcha (2pc)', categorySlug: 'fast-food', description: 'Spiced chickpeas paired with soft, leavened kulcha bread and salad.', price: 90, image: '/images/menu/chole_kulcha_new.png', rating: 4.9 },
    { name: 'Dal Pakvan', categorySlug: 'fast-food', description: 'Crispy fried flatbreads served with a thick, seasoned chana dal.', price: 70, image: '/images/menu/dal_pakwan.png', rating: 4.7 },
    { name: 'Ragda Patties (2pc)', categorySlug: 'fast-food', description: 'Fried potato patties drowned in a savory dried pea gravy and chutneys.', price: 80, image: '/images/menu/ragda_patties.png', rating: 4.8 },
    { name: 'Pav Bhaji (2pc Pav)', categorySlug: 'fast-food', description: 'A thick vegetable curry mashed and cooked with butter, served with pav.', price: 110, image: '/images/menu/pav_bhaji_new.png', rating: 4.9 },
    { name: 'Pav Bhaji with Pulav', categorySlug: 'fast-food', description: 'Classic pav bhaji accompanied by a fragrant vegetable tawa rice.', price: 160, image: '/images/menu/pav_bhaji_pulav.png', rating: 4.8 },
    { name: 'Puri Bhaji (5pc)', categorySlug: 'fast-food', description: 'Golden puffed fried puris served with a mildly spiced potato dry curry.', price: 80, image: '/images/menu/puri_bhaji.png', rating: 4.7 }
  ];

  for (const p of products) {
    const category = await prisma.category.findUnique({ where: { slug: p.categorySlug } });
    if (category) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: p.name, categoryId: category.id }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            name: p.name,
            categoryId: category.id,
            description: p.description,
            price: p.price,
            image: p.image,
            rating: p.rating,
            isAvailable: true
          }
        });
        console.log(`✅ Product created: ${p.name}`);
      } else {
        console.log(`ℹ️ Product already exists: ${p.name}`);
      }
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
