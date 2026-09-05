import { NextRequest, NextResponse } from 'next/server';
import { exportThemeToJSON } from '@/lib/themeExportImport';
import { Block } from '@/types/block';

// POST - Export tema dari data yang dikirim
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blocks, canvasBackground, deviceView, name, description } = body;

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Field blocks diperlukan dan harus berupa array' },
        { status: 400 }
      );
    }

    const jsonString = exportThemeToJSON(
      blocks as Block[],
      canvasBackground,
      deviceView,
      name || 'Untitled Theme',
      description
    );

    return NextResponse.json({
      success: true,
      themeData: JSON.parse(jsonString),
      jsonString,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

