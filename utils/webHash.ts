async function encrypt(text: string, key: string): Promise<string> {
    const algorithm = 'AES-CBC';
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const keyBuffer = hexToArrayBuffer(key);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: algorithm, length: 256 },
        false,
        ['encrypt']
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: algorithm, iv },
        cryptoKey,
        new TextEncoder().encode(text)
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedBase64 = arrayBufferToBase64(encryptedArray);
    const ivBase64 = arrayBufferToBase64(iv);

    return `${ivBase64}:${encryptedBase64}`;
}

export async function generateEncryptedParams(params: Record<string, any>): Promise<string> {
    const secretKey = "6df755f2b7466a9733077b5fa8d1fd5c28263f34695fc9f9915ce047bf76a5b8";

    const queryString = new URLSearchParams(params).toString();
    const encryptedQueryString = await encrypt(queryString, secretKey);

    return encodeURIComponent(encryptedQueryString);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return bytes.buffer;
}

export async function decrypt(encryptedString: string, key: string): Promise<string> {
    const keyBuffer = hexToArrayBuffer(key);
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt']
    );

    const [ivBase64, encryptedBase64] = encryptedString.split(':');
    const iv = base64ToArrayBuffer(ivBase64);
    const encryptedTextBuffer = base64ToArrayBuffer(encryptedBase64);

    try {
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv: new Uint8Array(iv) },
            cryptoKey,
            new Uint8Array(encryptedTextBuffer)
        );
        return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
}
