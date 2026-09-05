import { NextRequest, NextResponse } from 'next/server';
import { importThemeFromJSON } from '@/lib/themeExportImport';

// POST - Import tema dari JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonString } = body;

    if (!jsonString || typeof jsonString !== 'string') {
      return NextResponse.json(
        { error: 'Field jsonString diperlukan dan harus berupa string JSON' },
        { status: 400 }
      );
    }

    const imported = importThemeFromJSON(jsonString);

    return NextResponse.json({
      success: true,
      ...imported,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal mengimpor tema' },
      { status: 400 }
    );
  }
}

