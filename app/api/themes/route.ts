import { NextRequest, NextResponse } from 'next/server';
import { themeDb } from '@/lib/db';
import { validateThemeData } from '@/lib/themeExportImport';

// GET - Ambil semua tema atau tema spesifik
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const theme = await themeDb.get(id);
      if (!theme) {
        return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json(theme);
    }

    const themes = await themeDb.getAll();
    return NextResponse.json(themes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Simpan tema baru ke database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, themeData, previewUrl } = body;

    if (!id || !name || !themeData) {
      return NextResponse.json(
        { error: 'Field yang diperlukan: id, name, themeData' },
        { status: 400 }
      );
    }

    // Validasi struktur tema
    if (typeof themeData === 'string') {
      try {
        const parsed = JSON.parse(themeData);
        if (!validateThemeData(parsed)) {
          return NextResponse.json(
            { error: 'Format tema tidak valid' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'themeData harus berupa JSON yang valid' },
          { status: 400 }
        );
      }
    } else if (!validateThemeData(themeData)) {
      return NextResponse.json(
        { error: 'Format tema tidak valid' },
        { status: 400 }
      );
    }

    // Simpan sebagai JSON string
    const themeDataString = typeof themeData === 'string' 
      ? themeData 
      : JSON.stringify(themeData);

    const theme = await themeDb.create(id, name, themeDataString, description, previewUrl);
    return NextResponse.json(theme, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update tema yang sudah ada
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, themeData, previewUrl } = body;

    if (!id || !name || !themeData) {
      return NextResponse.json(
        { error: 'Field yang diperlukan: id, name, themeData' },
        { status: 400 }
      );
    }

    // Validasi struktur tema
    if (typeof themeData === 'string') {
      try {
        const parsed = JSON.parse(themeData);
        if (!validateThemeData(parsed)) {
          return NextResponse.json(
            { error: 'Format tema tidak valid' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { error: 'themeData harus berupa JSON yang valid' },
          { status: 400 }
        );
      }
    } else if (!validateThemeData(themeData)) {
      return NextResponse.json(
        { error: 'Format tema tidak valid' },
        { status: 400 }
      );
    }

    // Simpan sebagai JSON string
    const themeDataString = typeof themeData === 'string' 
      ? themeData 
      : JSON.stringify(themeData);

    const theme = await themeDb.update(id, name, themeDataString, description, previewUrl);
    return NextResponse.json(theme);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Hapus tema
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Parameter id diperlukan' }, { status: 400 });
    }

    await themeDb.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

