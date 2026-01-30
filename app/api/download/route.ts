import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const size = parseInt(searchParams.get('size') || '104857600'); // Default 100MB

    // Create a ReadableStream that generates zeros
    const stream = new ReadableStream({
        async start(controller) {
            const chunkSize = 1024 * 1024; // 1MB chunks for internal streaming
            let bytesSent = 0;
            const buffer = new Uint8Array(chunkSize); // Zero-filled buffer

            while (bytesSent < size) {
                const remaining = size - bytesSent;
                const toSend = Math.min(chunkSize, remaining);

                if (toSend < chunkSize) {
                    // Send partial chunk
                    controller.enqueue(buffer.slice(0, toSend));
                } else {
                    // Send full chunk
                    controller.enqueue(buffer);
                }

                bytesSent += toSend;

                // Optional: Yield to event loop to not block entirely (though Next.js handles streams well)
                // await new Promise(resolve => setTimeout(resolve, 0));
            }
            controller.close();
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="magic_data_shard_${Date.now()}.bin"`,
            'Content-Length': size.toString(),
        },
    });
}
