import { prisma } from "@/lib/prisma";
import { objectIdSchema } from "@/lib/validation";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type BlogDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const BlogDetailsPage = async ({ params }: BlogDetailsPageProps) => {
  const { id } = await params;
  const parsedId = objectIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const post = await prisma.post.findUnique({
    where: {
      id: parsedId.data,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <section className="container mx-auto max-w-4xl px-4 py-12">
      <Link href="/blog" className="mb-6 inline-block text-sm text-primary">
        Retour a la liste
      </Link>
      <article className="space-y-6">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1000}
            height={500}
            className="h-auto w-full rounded-xl border object-cover"
          />
        ) : null}
        <div className="space-y-3">
          <p className="text-sm text-primary">{post.category}</p>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString("fr-FR")}</p>
        </div>
        <p className="whitespace-pre-line leading-7">{post.description}</p>
        <Link href={`/blog/${post.id}/edit`} className="inline-block rounded-md border px-4 py-2">
          Modifier cet article
        </Link>
      </article>
    </section>
  );
};

export default BlogDetailsPage;
