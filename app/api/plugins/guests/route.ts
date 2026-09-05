import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');
    const id = searchParams.get('id');

    if (!projectId && !id) {
      return NextResponse.json(
        { error: 'project_id or id is required' },
        { status: 400 }
      );
    }

    if (id) {
      const guests: any = await query(
        'SELECT * FROM guest_list WHERE id = ?',
        [id]
      );
      if (!guests || guests.length === 0) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }
      return NextResponse.json(guests[0]);
    }

    const guests: any = await query(
      'SELECT * FROM guest_list WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );

    return NextResponse.json(guests || []);
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
    const { project_id, name, phone, email, notes } = body;

    if (!project_id || !name) {
      return NextResponse.json(
        { error: 'project_id and name are required' },
        { status: 400 }
      );
    }

    const id = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCode = `${project_id}-${id}`;

    await query(
      `INSERT INTO guest_list (id, project_id, name, phone, email, status, qr_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, project_id, name, phone || null, email || null, 'pending', qrCode, notes || null]
    );

    const newGuest: any = await query(
      'SELECT * FROM guest_list WHERE id = ?',
      [id]
    );

    return NextResponse.json(newGuest[0], { status: 201 });
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
    const { id, name, phone, email, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE guest_list 
       SET name = ?, phone = ?, email = ?, status = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, phone || null, email || null, status || 'pending', notes || null, id]
    );

    const updatedGuest: any = await query(
      'SELECT * FROM guest_list WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedGuest[0]);
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

    await query('DELETE FROM guest_list WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

