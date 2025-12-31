import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// PATCH: Batch update projects (and optionally categories)
// Expects body: { projects: [{ id, sort_order, category_id }], categories: [{ id, sort_order }] }
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { projects, categories } = body

        const errors = []

        // 1. Update Projects
        if (projects && Array.isArray(projects)) {
            for (const p of projects) {
                const { error } = await supabase
                    .from('projects')
                    // @ts-ignore
                    .update({ sort_order: p.sort_order, category_id: p.category_id })
                    .eq('id', p.id)

                if (error) errors.push(`Project ${p.id}: ${error.message}`)
            }
        }

        // 2. Update Categories
        if (categories && Array.isArray(categories)) {
            for (const c of categories) {
                const { error } = await supabase
                    .from('categories')
                    // @ts-ignore
                    .update({ sort_order: c.sort_order })
                    .eq('id', c.id)

                if (error) errors.push(`Category ${c.id}: ${error.message}`)
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({ error: 'Some updates failed', details: errors }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
