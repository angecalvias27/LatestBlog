import DeletePostButton from "@/components/DeletePostButton";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

const BlogPage = async () => {
  let posts: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string | null;
    createdAt: Date;
  }> = [];
  let hasDatabaseError = false;

  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("BlogPage failed to load posts", error);
    hasDatabaseError = true;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog</h1>
        <Link href="/blog/add" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Ajouter un article
        </Link>
      </div>

      {hasDatabaseError ? (
        <p className="text-red-500">
          Impossible de charger les articles. Verifiez `DATABASE_URL` et la connexion MongoDB.
        </p>
      ) : null}
      {!hasDatabaseError && posts.length === 0 ? <p>Aucun article pour le moment.</p> : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {post.imageUrl ? (
              <Image src={post.imageUrl} alt={post.title} width={600} height={350} className="h-56 w-full object-cover" />
            ) : null}
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString("fr-FR")}
                </p>
                <h2 className="line-clamp-2 text-xl font-semibold">{post.title}</h2>
                <p className="text-sm text-primary">{post.category}</p>
                <p className="line-clamp-3 text-muted-foreground">{post.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/blog/${post.id}`} className="rounded-md border px-3 py-2 text-sm">
                  Voir
                </Link>
                <Link href={`/blog/${post.id}/edit`} className="rounded-md border px-3 py-2 text-sm">
                  Editer
                </Link>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default BlogPage;
