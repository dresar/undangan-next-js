import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateHTML } from '@/lib/htmlExport';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project from database
    const results: any = await query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = results[0];
    
    // Parse blocks
    let blocks = [];
    try {
      if (typeof project.blocks === 'string') {
        blocks = JSON.parse(project.blocks);
      } else if (Array.isArray(project.blocks)) {
        blocks = project.blocks;
      }
    } catch (e) {
      console.error('Error parsing blocks:', e);
      blocks = [];
    }

    // Get custom CSS
    let customCSS = '';
    try {
      const cssResults: any = await query(
        'SELECT css_code FROM css_customizations WHERE project_id = ? AND is_global = 1',
        [projectId]
      );
      if (cssResults && cssResults.length > 0) {
        customCSS = cssResults.map((row: any) => row.css_code).join('\n\n');
      }
    } catch (e) {
      console.error('Error loading custom CSS:', e);
    }

    // Generate HTML
    const html = generateHTML({
      blocks,
      canvasBackground: project.canvasBackground || undefined,
      coverImage: project.coverImage || undefined,
      coverButtonText: project.coverButtonText || 'Buka Undangan',
      coverEnabled: Boolean(project.coverEnabled),
      musicUrl: project.musicUrl || undefined,
      customCSS,
      title: project.title || 'Digital Invitation',
    });

    return NextResponse.json({ html }, { status: 200 });
  } catch (error: any) {
    console.error('Error exporting HTML:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export HTML' },
      { status: 500 }
    );
  }
}

