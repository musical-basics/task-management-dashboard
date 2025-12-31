import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name } = body

        const { data, error } = await supabase
            .from('categories')
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // NOTE: Projects referencing this category will have their category_id set to null 
        // because of `on delete set null` in the foreign key definition.
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
