async function testEdgeFunction() {
    const url = 'https://jjttzlyxiumjnilqufpi.supabase.co/functions/v1/stripe-checkout';
    const key = 'sb_publishable_Qdv0dQ7oA9TU-3VBnguP6Q_fgHJw6e-';

    try {
        console.log('Sending request to', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priceId: 'price_1TFZbJL7tpyyRFSSmYD7PY65' })
        });
        
        console.log('Status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testEdgeFunction();
