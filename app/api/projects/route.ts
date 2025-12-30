import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, context, mode, emoji } = body

        const { data, error } = await supabase
            .from('projects')
            .insert([{ name, context, mode, emoji }])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data[0])
    } catch (err) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
