"use client"

import Form from '@/components/Form'
import { useRouter } from 'next/navigation'

const page = () => {

  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/blog`, {
        method: 'POST',
        body: formData
      });
      if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong')
      }
      router.replace("/blog");
    } catch (error) {
      console.error("Something went wrong", error);

    }
  }

  return (
    <section className="container mx-auto py-12.5">
      <h1 className='text-2xl font-bold mb-8'>Add Post</h1>
      <Form onSubmit={handleSubmit}/>
    </section>
  )
}

export default page