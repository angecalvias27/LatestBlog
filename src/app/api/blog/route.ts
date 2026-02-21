import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto";
import { NextResponse } from "next/server"
import path from "path";
import fs from 'fs';


export async function main() {
    try {
        // ouvrir la connexion prisma
        await prisma.$connect();
    } catch (error) {

    }
}

export const POST = async (req: Request) => {
    try {
        const formData = await req.formData();

        // Extraire les valeurs
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const image = formData.get('image') as File | null;


        // validation des champs obligatoires
        if (!title || !description || !category) {
            return NextResponse.json({ error: "Missing required fields", received: { title, description, category } }, { status: 400 });
        }

        // établir la connexion
        await main();

        let imageUrl: string | null = null;

        // Si une image est envoyée
        if (image) {
            try {

                // Conversion du fichier image en Buffer
                const buffer = Buffer.from(await image.arrayBuffer());

                // Génération d’un nom unique + nettoyage du nom original
                const fileName = `${randomUUID()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

                // Création du chemin vers le dossier public/uploads
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');

                // Chemin complet vers le fichier image
                const imagePath = path.join(uploadDir, fileName);

                // Création du dossier uploads s’il n’existe pas
                await fs.promises.mkdir(uploadDir, { recursive: true });

                // Écriture du fichier image sur le serveur
                await fs.promises.writeFile(imagePath, buffer);

                // URL accessible côté client
                imageUrl = `/uploads/${fileName}`;

            } catch (imageError) {

                // En cas d’erreur lors du traitement de l’image
                console.error("Erreur lors du traitement de l'image:", imageError);

                // On garde imageUrl à null
                imageUrl = null;
            }

        }
        const post = await prisma.post.create({
            data: {
                title,
                description,
                category,
                imageUrl
            }
        });
        return NextResponse.json({ message: "Post créé avec succès", post }, { status: 201 });
    } catch (error) {
        console.error("Erreur:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        return NextResponse.json({ error: "Erreur serveur", message: errorMessage }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}