import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// PATCH: Update project
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Await params for Next.js 15
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('projects')
            // @ts-ignore
            .update({ name })
            .eq('id', id)
            .select()

        if (error) throw error

        return NextResponse.json(data[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
