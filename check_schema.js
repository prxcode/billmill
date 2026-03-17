
const { createClient } = require('@supabase/supabase-js');

// Helper to get environment variables (simulated for this script if not loaded)
// In a real Next.js app, these are process.env.NEXT_PUBLIC_SUPABASE_URLIn and process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// I need to read .env.local to get them.

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '.env.local')));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking "companies" table schema...');

    // Try to select the new column. If it fails, it doesn't exist.
    const { data, error } = await supabase
        .from('companies')
        .select('account_name, bank_name')
        .limit(1);

    if (error) {
        console.error('Error selecting account_name:', error);
        if (error.message.includes('does not exist') || error.message.includes('find the')) {
            console.log('CONFIRMED: account_name column does not exist or is not cached.');
        }
    } else {
        console.log('Success: account_name and bank_name columns exist and are accessible.');
    }
}

checkSchema();
