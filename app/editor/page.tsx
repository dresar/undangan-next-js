'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditorLayout from '@/components/EditorLayout';
import { useEditorStore } from '@/store/useEditorStore';
import { generateSlug } from './[slug]/page';

export default function EditorPage() {
  const router = useRouter();
  const projectTitle = useEditorStore((state) => state.projectTitle);

  useEffect(() => {
    // Redirect to home if no title, or to slug if has title
    if (!projectTitle) {
      router.push('/home');
    } else {
      const slug = generateSlug(projectTitle);
      router.push(`/editor/${slug}`);
    }
  }, [projectTitle, router]);

  return null; // Will redirect
}

