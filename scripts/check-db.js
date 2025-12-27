
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmrdmzjswllpcibmdwfy.supabase.co'
const supabaseKey = 'sb_publishable_4UmZ_DnpoqokIiQC2B780g_Nvh3hQ5b'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("Connecting to Supabase...")
    const { data, error } = await supabase
        .from('products')
        .select('*')

    if (error) {
        console.error("ERROR:", error.message)
    } else {
        console.log("SUCCESS. Row count:", data.length)
        if (data.length > 0) {
            console.log("First product:", JSON.stringify(data[0], null, 2))
        }
    }
}

check()
