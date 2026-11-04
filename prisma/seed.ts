import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Starter catalogue. Prices are illustrative INR retail prices; confirm costs,
  // pack sizes, labels and stock before accepting live orders.
  const products = [
    {
      slug: "classic-roasted-makhana",
      name: "Classic Roasted Makhana",
      description: "A simple, gently roasted makhana snack with a light, satisfying crunch.",
      flavor: "Classic",
      weightGrams: 100,
      pricePaise: 14900,
      imageUrl: "/products/classic.svg",
      stock: 100,
      active: true,
    },
    {
      slug: "peri-peri-makhana",
      name: "Peri Peri Makhana",
      description: "A lively peri peri seasoning brings a tangy, chilli-forward kick to every handful.",
      flavor: "Peri Peri",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/peri-peri.svg",
      stock: 80,
      active: true,
    },
    {
      slug: "cheese-makhana",
      name: "Cheese Makhana",
      description: "A savoury cheese-style seasoning for a rich, moreish snack break.",
      flavor: "Cheese",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/cheese.svg",
      stock: 60,
      active: true,
    },
    {
      slug: "pudina-makhana",
      name: "Mint Pudina Makhana",
      description: "Cool, refreshing mint-inspired seasoning with a crisp roasted bite.",
      flavor: "Pudina",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/pudina.svg",
      stock: 50,
      active: true,
    },
    {
      slug: "himalayan-pink-salt-makhana",
      name: "Himalayan Pink Salt Makhana",
      description: "Roasted makhana with a clean, savoury pink-salt finish.",
      flavor: "Pink Salt",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/classic.svg",
      stock: 50,
      active: true,
    },
    {
      slug: "black-pepper-makhana",
      name: "Black Pepper Makhana",
      description: "A warming black-pepper seasoning adds a gently bold finish to roasted makhana.",
      flavor: "Black Pepper",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/classic.svg",
      stock: 45,
      active: true,
    },
    {
      slug: "cream-onion-makhana",
      name: "Cream & Onion Makhana",
      description: "A familiar creamy, onion-style savoury flavour in a crunchy makhana snack.",
      flavor: "Cream & Onion",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/cheese.svg",
      stock: 45,
      active: true,
    },
    {
      slug: "tandoori-masala-makhana",
      name: "Tandoori Masala Makhana",
      description: "A bold Indian-inspired tandoori masala seasoning with warm, savoury notes.",
      flavor: "Tandoori Masala",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/peri-peri.svg",
      stock: 40,
      active: true,
    },
    {
      slug: "achari-masala-makhana",
      name: "Achari Masala Makhana",
      description: "A tangy pickle-inspired masala flavour made for fans of punchy snacks.",
      flavor: "Achari Masala",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/peri-peri.svg",
      stock: 35,
      active: true,
    },
    {
      slug: "tomato-chilli-makhana",
      name: "Tomato Chilli Makhana",
      description: "A tangy tomato flavour meets a gentle chilli kick in every crunchy bite.",
      flavor: "Tomato Chilli",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/peri-peri.svg",
      stock: 40,
      active: true,
    },
    {
      slug: "sour-cream-herb-makhana",
      name: "Sour Cream & Herb Makhana",
      description: "A mellow, creamy-style herb seasoning for an easy savoury snack.",
      flavor: "Sour Cream & Herb",
      weightGrams: 100,
      pricePaise: 16900,
      imageUrl: "/products/cheese.svg",
      stock: 35,
      active: true,
    },
    {
      slug: "masala-makhana",
      name: "Desi Masala Makhana",
      description: "A balanced Indian masala-inspired seasoning with familiar savoury spice notes.",
      flavor: "Desi Masala",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/pudina.svg",
      stock: 50,
      active: true,
    },
    {
      slug: "classic-roasted-makhana-200g",
      name: "Classic Roasted Makhana Family Pack",
      description: "A larger 200 g pack of our simple, gently roasted classic makhana.",
      flavor: "Classic",
      weightGrams: 200,
      pricePaise: 27900,
      imageUrl: "/products/classic.svg",
      stock: 30,
      active: true,
    },
    {
      slug: "peri-peri-makhana-200g",
      name: "Peri Peri Makhana Family Pack",
      description: "A larger 200 g pack of tangy, chilli-forward peri peri makhana.",
      flavor: "Peri Peri",
      weightGrams: 200,
      pricePaise: 31900,
      imageUrl: "/products/peri-peri.svg",
      stock: 25,
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`Seed complete: ${products.length} Makhana products added or updated.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
