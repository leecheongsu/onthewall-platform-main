import * as crypto from 'crypto';

export function sha512(input: string): string {
    const hash = crypto.createHash('sha512');
    hash.update(input);
    return hash.digest('hex');
}

export function sha512base64(input: string): string {
    const hash = crypto.createHash('sha512');
    hash.update(input);
    return hash.digest('base64');
}


export function matchHashes(hash1: string, hash2: string): boolean {
    const buf1 = Buffer.from(hash1, 'hex');
    const buf2 = Buffer.from(hash2, 'hex');

    if (crypto.timingSafeEqual) {
        return crypto.timingSafeEqual(buf1, buf2);
    } else {
        return constantTimeCompare(buf1, buf2);
    }
}

export function matchBase64Hashes(base64Hash1: string, base64Hash2: string): boolean {
    const buf1 = Buffer.from(base64Hash1, 'base64');
    const buf2 = Buffer.from(base64Hash2, 'base64');

    if (crypto.timingSafeEqual) {
        return crypto.timingSafeEqual(buf1, buf2);
    } else {
        return constantTimeCompare(buf1, buf2);
    }
}

function constantTimeCompare(buf1: Buffer, buf2: Buffer): boolean {
    if (buf1.length !== buf2.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < buf1.length; i++) {
        result |= buf1[i] ^ buf2[i];
    }
    return result === 0;
}