import {Ai} from './vendor/@cloudflare/ai.js';

const allowedOrigins = [
    'http://localhost:63342',
    'http://127.0.0.1:5500',
    'https://kiprogram.pages.dev'
]


function handleCors(request) {
    // Make sure the necessary headers are present and valid
    const origin = request.headers.get('Origin');
    if (!origin || ! allowedOrigins.includes(origin)) {
        return new Response(null, {status: 403});
    }

    // Create headers to allow CORS requests
    let headers = new Headers({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // One day
    });

    // Respond to the preflight request
    return new Response(null, {headers, status: 204});
}


export default {
    async fetch(request, env) {


        // Check if the incoming request is a CORS preflight request
        if (request.method === 'OPTIONS') {
            // Handle CORS preflight requests
            return handleCors(request);
        }
        const ai = new Ai(env.AI);

        const url = new URL(request.url);
        const userMessage = url.searchParams.get("message");
        const task = url.searchParams.get("task");
        const messages = [
            {
                role: "system",
                content: `ich bin ein ai model, dass schülern hilft`,
            }
        ];

        if (task === 'hausaufgabe') {

            messages.push(
                {
                    role: "system",
                    content : "Du erstelltst hausaufgaben",
                },
                {
                    role: "user",
                    content: "Bitte hilf mir bei: " + userMessage
                });
        } else if (task === 'aufsatz') {
            messages.push(
                {
                    role: "system",
                    content : "Du erstelltst enen aufsatz",
                },
                {
                    role: "user",
                    content: "Bitte hilf mir bei: " + userMessage
                });
        } else {
          throw new Error('task is not defined');
        }



        const stream = await env.AI.run("@cf/thebloke/discolm-german-7b-v1-awq", {
            messages,
            stream: true
        });

        const origin = request.headers.get('Origin');
        let headers = new Headers({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400', // One day
            "Content-Type": "text/event-stream"
        });

        return new Response(stream,{ headers}  );

    }
};
