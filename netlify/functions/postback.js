const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
    const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const params = event.queryStringParameters || {};
    const userToken = params.user || params.aff_sub1 || params.subid || params.token;
    const offerId = params.offer || params.offer_id || '';
    const payout = parseFloat(params.payout || 0);

    if (!userToken) {
        return { statusCode: 400, body: 'Missing user token' };
    }

    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                user_token: userToken,
                ip_address: clientIp,
                completed: true,
                offer_id: offerId,
                payout: payout,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_token' });

        if (error) throw error;
        return { statusCode: 200, body: 'OK' };
    } catch (err) {
        return { statusCode: 500, body: 'Error: ' + err.message };
    }
};
