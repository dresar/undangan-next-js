import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    const id = searchParams.get('id');

    if (id) {
      const templates: any = await query(
        'SELECT * FROM message_templates WHERE id = ?',
        [id]
      );
      if (!templates || templates.length === 0) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(templates[0]);
    }

    // Get all templates (default + project specific)
    let templates: any;
    if (projectId) {
      templates = await query(
        'SELECT * FROM message_templates WHERE project_id = ? OR project_id IS NULL ORDER BY is_default DESC, created_at DESC',
        [projectId]
      );
    } else {
      templates = await query(
        'SELECT * FROM message_templates ORDER BY is_default DESC, created_at DESC'
      );
    }

    return NextResponse.json(templates || []);
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
    const { name, template, is_default, project_id } = body;

    if (!name || !template) {
      return NextResponse.json(
        { error: 'Name and template are required' },
        { status: 400 }
      );
    }

    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await query(
      `INSERT INTO message_templates (id, name, template, is_default, project_id)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, template, is_default ? 1 : 0, project_id || null]
    );

    const newTemplate: any = await query(
      'SELECT * FROM message_templates WHERE id = ?',
      [id]
    );

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, template, is_default } = body;

    if (!id || !name || !template) {
      return NextResponse.json(
        { error: 'ID, name, and template are required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE message_templates 
       SET name = ?, template = ?, is_default = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, template, is_default ? 1 : 0, id]
    );

    const updatedTemplate: any = await query(
      'SELECT * FROM message_templates WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedTemplate[0]);
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

    // Check if template is default
    const template: any = await query(
      'SELECT is_default FROM message_templates WHERE id = ?',
      [id]
    );

    if (template && template.length > 0 && template[0].is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default template' },
        { status: 400 }
      );
    }

    await query('DELETE FROM message_templates WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

