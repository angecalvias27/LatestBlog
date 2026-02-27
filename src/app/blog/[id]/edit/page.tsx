"use client";

import Form from "@/components/Form";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

type PostPayload = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
};

const EditPostPage = ({ params }: EditPageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<PostPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        if (mounted) setError("Impossible de charger l'article");
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as { post: PostPayload };
      if (mounted) {
        setPost(payload.post);
      }
      setLoading(false);
    };

    fetchPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const response = await fetch(`/api/blog/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Une erreur est survenue");
      return;
    }

    router.push(`/blog/${id}`);
    router.refresh();
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <p>Chargement...</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="container mx-auto px-4 py-12">
        <p>Article introuvable</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Edit Post</h1>
      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
      <Form
        mode="edit"
        submitLabel="Mettre a jour"
        onSubmit={handleSubmit}
        initialValues={{
          title: post.title,
          description: post.description,
          category: post.category,
          imageUrl: post.imageUrl,
        }}
      />
    </section>
  );
};

export default EditPostPage;
