import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Type changed to Promise
) {
    try {
        const { id } = await params // <--- AWAIT THE PARAMS HERE
        const body = await request.json()
        const { title, estimate } = body

        const { data, error } = await supabase
            .from('tasks')
            .update({ title, estimate })
            .eq('id', id)
            .select()

        if (error) throw error

        return NextResponse.json(data[0])
    } catch (error: any) {
        console.error("Patch Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Type changed to Promise
) {
    try {
        const { id } = await params // <--- AWAIT THE PARAMS HERE
        const { error } = await supabase.from('tasks').delete().eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
