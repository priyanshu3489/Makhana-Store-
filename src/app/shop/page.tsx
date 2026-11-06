import { prisma } from "@/lib/prisma";
import ShopExperience from "@/components/ShopExperience";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const records = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
  });

  const products = records.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    flavor: product.flavor,
    weightGrams: product.weightGrams,
    description: product.description,
    pricePaise: product.pricePaise,
    compareAtPaise: product.compareAtPaise,
    stock: product.stock,
  }));

  return <ShopExperience products={products} />;
}
