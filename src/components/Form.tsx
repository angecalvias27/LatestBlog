"use client"

import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { X } from 'lucide-react'

const Form = ({ onSubmit }: { onSubmit: (formData: FormData) => Promise<void> }) => {

    const selectContent = [
        { id: 1, name: "Marketing & Promotion" },
        { id: 2, name: "Réseaux sociaux" },
        { id: 3, name: "Actualités" },
        { id: 4, name: "Éducation & Formation" },
        { id: 5, name: "Divertissement" },
        { id: 6, name: "Lifestyle" },
        { id: 7, name: "Business & Entrepreneuriat" },
        { id: 8, name: "Technologie" },
        { id: 9, name: "Inspiration & Motivation" },
        { id: 10, name: "Événements & Annonces" }
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: ''
    });

    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);



    /**
     * - permet de gérer le changement de valeurs des champs du formulaire
     * @param String {e}  - évènement déclenché par le champ du formulaire
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
        typeof e === 'string'
            ? setFormData(prev => ({ ...prev, category: e }))
            : setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    /**
     * permet de gérer le changement d'image
     * @param {e} String - 
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 1. Récupère le premier fichier sélectionné ou null si l'utilisateur annule
        const file = e.target.files?.[0] || null;
        // 2. Met à jour l'état de l'image (pour l'envoi futur au serveur/Cloudinary/etc.)
        setImage(file)

        if (file) {
            // 3. Initialise l'API FileReader pour lire le contenu du fichier côté client
            const reader = new FileReader();

            // 4. Définit l'action à exécuter une fois que la lecture du fichier est terminée
            reader.onload = () => {
                // Met à jour l'URL de prévisualisation avec le résultat (base64)
                setImagePreview(reader.result as string);
            };

            // 5. Lance la lecture du fichier en tant qu'URL de données (data:image/...)
            reader.readAsDataURL(file)
        } else {
            // 6. Si aucun fichier (annulation), on réinitialise la prévisualisation
            setImagePreview(null)
        }
    }



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('category', formData.category);

        if (image) form.append('image', image);

        // Afficher toutes les clés et valeurs
        await onSubmit(form);
    }
    return (
        <form className='w-300 mx-auto flex flex-col gap-6' onSubmit={e => handleSubmit(e)}>
            {/* Titre */}
            <Input
                name='title'
                placeholder='title'
                type='text'
                className='rounded-md px-4 w-full py-2 border-input focus-visible:ring-primary'
                onChange={(e) => handleChange(e)}
            />
            {/* Description */}
            <Textarea
                name='description'
                placeholder='Description'
                className='rounded-md px-4 py-2 border-input focus-visible:ring-primary min-h-32'
                onChange={(e) => handleChange(e)}
            />
            {/* Catégorie */}
            <Select name='category' onValueChange={(e) => handleChange(e)}>
                <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select the category" />
                </SelectTrigger>
                <SelectContent>
                    {selectContent.map((content) =>
                    (
                        <SelectItem
                            value={content.name}
                            key={content.id}
                        >
                            {content.name}
                        </SelectItem>
                    )
                    )}
                </SelectContent>
            </Select>
            {/* Image du blog */}
            <Input
                name='image'
                type='file'
                accept='image/*'
                className='cursor-pointer'
                onChange={(e) => handleImageChange(e)}
            />

            {/* Prévisualisation de l'image */}
            {imagePreview && (
                <Card className='border-2 border-primary/30'>
                    <CardContent className='p-4'>
                        <div className='relative w-full'>
                            <div className='flex justify-between items-center mb-3'>
                                <p className='text-sm font-medium text-muted-foreground'>Image Preview</p>
                                <Button
                                    type='button'
                                    variant='destructive'
                                    size='icon'
                                    onClick={() => {
                                        setImagePreview(null);
                                        setImage(null);
                                    }}
                                    className='h-8 w-8'
                                >
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                            <div className='w-full bg-m uted rounded-lg overflow-hidden flex items-center justify-center' style={{ maxHeight: '400px' }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className='max-w-full max-h-[300px] object-contain'
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* bouton de soumission */}
            <Button type='submit' className='shadow-lg'>
                Add Post
            </Button>
        </form>
    )
}

export default Form