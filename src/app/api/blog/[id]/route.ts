import {
  deleteImageFromCloudinary,
  extractPublicIdFromCloudinaryUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { blogPayloadSchema, objectIdSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getImageFromFormData(formData: FormData) {
  const input = formData.get("image");
  if (!(input instanceof File) || input.size === 0) return null;
  return input;
}

export async function GET(_req: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsedId = objectIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: parsedId.data },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (fetchError) {
    console.error("GET /api/blog/[id] failed", fetchError);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsedId = objectIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      category: String(formData.get("category") ?? ""),
    };
    const parsedPayload = blogPayloadSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsedPayload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const existingPost = await prisma.post.findUnique({ where: { id: parsedId.data } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let imageUrl = existingPost.imageUrl;
    const image = getImageFromFormData(formData);

    if (image) {
      const uploaded = await uploadImageToCloudinary(image);
      imageUrl = uploaded.secureUrl;

      const existingPublicId = extractPublicIdFromCloudinaryUrl(existingPost.imageUrl);
      if (existingPublicId) {
        await deleteImageFromCloudinary(existingPublicId).catch((deleteError) => {
          console.error("Cloudinary delete on update failed", deleteError);
        });
      }
    }

    const post = await prisma.post.update({
      where: { id: parsedId.data },
      data: {
        ...parsedPayload.data,
        imageUrl,
      },
    });

    return NextResponse.json({ message: "Post mis a jour", post }, { status: 200 });
  } catch (updateError) {
    console.error("PUT /api/blog/[id] failed", updateError);
    if (updateError instanceof Prisma.PrismaClientKnownRequestError && updateError.code === "P2031") {
      return NextResponse.json(
        {
          error:
            "MongoDB replica set requis par Prisma. Configurez MongoDB en replica set (ex: rs0).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsedId = objectIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  try {
    const existingPost = await prisma.post.findUnique({ where: { id: parsedId.data } });
    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({ where: { id: parsedId.data } });

    const publicId = extractPublicIdFromCloudinaryUrl(existingPost.imageUrl);
    if (publicId) {
      await deleteImageFromCloudinary(publicId).catch((deleteError) => {
        console.error("Cloudinary delete on post deletion failed", deleteError);
      });
    }

    return NextResponse.json({ message: "Post supprime" }, { status: 200 });
  } catch (deleteError) {
    console.error("DELETE /api/blog/[id] failed", deleteError);
    if (deleteError instanceof Prisma.PrismaClientKnownRequestError && deleteError.code === "P2031") {
      return NextResponse.json(
        {
          error:
            "MongoDB replica set requis par Prisma. Configurez MongoDB en replica set (ex: rs0).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
