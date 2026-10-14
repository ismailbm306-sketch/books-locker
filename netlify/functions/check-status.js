const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
    const params = event.queryStringParameters || {};
    const userToken = params.token;

    if (!userToken) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Missing token' })
        };
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('completed')
            .eq('user_token', userToken)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ completed: data?.completed || false })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: false, error: err.message })
        };
    }
};
