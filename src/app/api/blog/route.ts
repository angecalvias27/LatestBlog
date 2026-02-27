import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { blogPayloadSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function normalizePayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
  };
}

function getImageFromFormData(formData: FormData) {
  const input = formData.get("image");
  if (!(input instanceof File) || input.size === 0) return null;
  return input;
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/blog failed", error);
    return NextResponse.json(
      { error: "Impossible de recuperer les articles" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload = normalizePayload(formData);
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

    let imageUrl: string | null = null;
    const image = getImageFromFormData(formData);
    if (image) {
      const uploaded = await uploadImageToCloudinary(image);
      imageUrl = uploaded.secureUrl;
    }

    const post = await prisma.post.create({
      data: {
        ...parsedPayload.data,
        imageUrl,
      },
    });

    return NextResponse.json({ message: "Post cree avec succes", post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blog failed", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2031") {
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
