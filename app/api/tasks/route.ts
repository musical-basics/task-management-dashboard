import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Fetch all tasks for this project (Flat list)
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, estimate, projectId, parentId } = body

        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    title,
                    estimate: estimate || 0,
                    project_id: projectId,
                    parent_id: parentId || null
                }
            ])
            .select()

        if (error) throw error

        return NextResponse.json(data[0])
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
