import { NextRequest, NextResponse } from 'next/server';
import { projectDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const project = await projectDb.get(id);
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json(project);
    }

    const projects = await projectDb.getAll();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, blocks, description, url, thumbnail, slug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title' },
        { status: 400 }
      );
    }

    // Pastikan blocks adalah array (bisa kosong untuk project baru)
    const blocksArray = Array.isArray(blocks) ? blocks : [];

    const project = await projectDb.create(id, title, blocksArray, description, url, thumbnail, slug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, blocks, description, url, thumbnail, slug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl } = body;

    if (!id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title' },
        { status: 400 }
      );
    }

    // Pastikan blocks adalah array (bisa kosong)
    const blocksArray = Array.isArray(blocks) ? blocks : [];

    const project = await projectDb.update(id, title, blocksArray, description, url, thumbnail, slug, canvasBackground, coverImage, coverButtonText, coverEnabled, musicUrl);
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await projectDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

