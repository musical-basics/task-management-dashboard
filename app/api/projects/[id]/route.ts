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

// DELETE: Delete project
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Delete the project
        // Note: Tasks should be deleted via cascade if configured in Supabase, 
        // but let's assume standard deletion for now. 
        // If RLS is set up correctly, this should work.
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
