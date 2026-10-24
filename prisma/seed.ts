
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      slug: "classic-roasted-makhana",
      name: "Classic Roasted Makhana",
      description: "Lightly roasted fox nuts for everyday snacking.",
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
      description: "A bold, tangy and spicy roasted snack.",
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
      description: "Savory cheese-seasoned fox nuts.",
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
      description: "Refreshing mint seasoning with a satisfying crunch.",
      flavor: "Pudina",
      weightGrams: 100,
      pricePaise: 15900,
      imageUrl: "/products/pudina.svg",
      stock: 50,
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

  console.log("Seed complete: 4 Makhana products added or updated.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
