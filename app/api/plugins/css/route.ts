import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    const blockId = searchParams.get('block_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    let cssData: any;
    if (blockId) {
      cssData = await query(
        'SELECT * FROM css_customizations WHERE project_id = ? AND block_id = ?',
        [projectId, blockId]
      );
    } else {
      cssData = await query(
        'SELECT * FROM css_customizations WHERE project_id = ? ORDER BY is_global DESC, created_at DESC',
        [projectId]
      );
    }

    return NextResponse.json(cssData || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, block_id, css_code, is_global } = body;

    if (!project_id || !css_code) {
      return NextResponse.json(
        { error: 'project_id and css_code are required' },
        { status: 400 }
      );
    }

    // Check if CSS already exists for this block/project
    let existing: any = [];
    if (block_id && !is_global) {
      existing = await query(
        'SELECT * FROM css_customizations WHERE project_id = ? AND block_id = ?',
        [project_id, block_id]
      );
    } else if (is_global) {
      existing = await query(
        'SELECT * FROM css_customizations WHERE project_id = ? AND is_global = 1',
        [project_id]
      );
    }

    let result;
    if (existing && existing.length > 0) {
      // Update existing
      await query(
        `UPDATE css_customizations 
         SET css_code = ?, updated_at = NOW()
         WHERE id = ?`,
        [css_code, existing[0].id]
      );
      result = existing[0];
    } else {
      // Create new
      const id = `css-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await query(
        `INSERT INTO css_customizations (id, project_id, block_id, css_code, is_global)
         VALUES (?, ?, ?, ?, ?)`,
        [id, project_id, block_id || null, css_code, is_global ? 1 : 0]
      );
      const newCss: any = await query(
        'SELECT * FROM css_customizations WHERE id = ?',
        [id]
      );
      result = newCss[0];
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await query('DELETE FROM css_customizations WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

