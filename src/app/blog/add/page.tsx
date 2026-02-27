"use client";

import Form from "@/components/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AddPostPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    const response = await fetch("/api/blog", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Something went wrong");
      return;
    }

    router.push("/blog");
    router.refresh();
  };

  return (
    <section className="container mx-auto py-12.5">
      <h1 className="mb-8 text-2xl font-bold">Add Post</h1>
      {error ? <p className="mb-4 text-sm text-red-500">{error}</p> : null}
      <Form mode="create" submitLabel="Add Post" onSubmit={handleSubmit} />
    </section>
  );
};

export default AddPostPage;
