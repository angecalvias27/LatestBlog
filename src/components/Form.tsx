"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { blogPayloadSchema } from "@/lib/validation";
import Image from "next/image";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

type FormValues = {
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
};

type FormProps = {
  mode: "create" | "edit";
  submitLabel: string;
  onSubmit: (formData: FormData) => Promise<void>;
  initialValues?: FormValues;
};

const DEFAULT_VALUES: FormValues = {
  title: "",
  description: "",
  category: "",
  imageUrl: null,
};

const IMAGE_ERROR = "Seuls les fichiers image sont acceptes";

const Form = ({ mode, submitLabel, onSubmit, initialValues }: FormProps) => {
  const defaultValues = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const [values, setValues] = useState<FormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues.imageUrl ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImage(null);
      setImagePreview(values.imageUrl ?? null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImage(null);
      setFieldErrors((prev) => ({ ...prev, image: [IMAGE_ERROR] }));
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("category", values.category);

    if (image) {
      formData.append("image", image);
    }

    return formData;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = blogPayloadSchema.safeParse({
      title: values.title,
      description: values.description,
      category: values.category,
    });

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      await onSubmit(buildFormData());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mx-auto flex w-full max-w-4xl flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Input
          name="title"
          placeholder="Titre"
          type="text"
          value={values.title}
          className="w-full rounded-md border-input px-4 py-2 focus-visible:ring-primary"
          onChange={(event) => handleChange("title", event.target.value)}
        />
        {fieldErrors.title?.[0] ? <p className="text-sm text-red-500">{fieldErrors.title[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <Textarea
          name="description"
          placeholder="Description"
          value={values.description}
          className="min-h-32 rounded-md border-input px-4 py-2 focus-visible:ring-primary"
          onChange={(event) => handleChange("description", event.target.value)}
        />
        {fieldErrors.description?.[0] ? (
          <p className="text-sm text-red-500">{fieldErrors.description[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Select value={values.category} onValueChange={(value) => handleChange("category", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selectionner la categorie" />
          </SelectTrigger>
          <SelectContent>
            {BLOG_CATEGORIES.map((category) => (
              <SelectItem value={category} key={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.category?.[0] ? <p className="text-sm text-red-500">{fieldErrors.category[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <Input name="image" type="file" accept="image/*" className="cursor-pointer" onChange={handleImageChange} />
        {fieldErrors.image?.[0] ? <p className="text-sm text-red-500">{fieldErrors.image[0]}</p> : null}
      </div>

      {imagePreview ? (
        <Card className="border-2 border-primary/30">
          <CardContent className="p-4">
            <div className="relative w-full">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {mode === "edit" ? "Image actuelle" : "Apercu de l'image"}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    setImagePreview(null);
                    setImage(null);
                    setValues((prev) => ({ ...prev, imageUrl: null }));
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex max-h-[400px] w-full items-center justify-center overflow-hidden rounded-lg bg-muted">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={800}
                  height={400}
                  unoptimized
                  className="max-h-[300px] max-w-full object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Button type="submit" className="shadow-lg" disabled={isSubmitting}>
        {isSubmitting ? "Chargement..." : submitLabel}
      </Button>
    </form>
  );
};

export default Form;
