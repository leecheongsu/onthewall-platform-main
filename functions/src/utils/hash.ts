import * as crypto from 'crypto';

export function sha512(input: string): string {
    const hash = crypto.createHash('sha512');
    hash.update(input);
    return hash.digest('hex');
}

export function matchHashes(hash1: string, hash2: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(hash1, 'hex'), Buffer.from(hash2, 'hex'));
}