import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET: Fetch all categories ordered by sort_order
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Create a new category
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, sort_order } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('categories')
            // @ts-ignore
            .insert([{ name, sort_order: sort_order || 0 }])
            .select()

        if (error) throw error

        return NextResponse.json(data[0])
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
