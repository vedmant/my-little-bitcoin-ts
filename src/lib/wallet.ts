import { randomBytes } from 'crypto'
import secp256k1 from 'secp256k1'
import bs58 from 'bs58'

export interface KeyPair {
  private: string
  public: string
}

export interface Wallet extends KeyPair {
  name?: string
}


/**
 * Generate key pair
 *
 * @return {{private: string, public: string}}
 */
export function generateKeyPair (): KeyPair {
  // Generate private key
  let privKey
  do {
    privKey = randomBytes(32)
  } while (! secp256k1.privateKeyVerify(privKey))
  // Generate public key
  const pubKey = secp256k1.publicKeyCreate(privKey)

  return {
    private: privKey.toString('hex'),
    // Base58 format for public key, public key plays address role
    public: bs58.encode(pubKey),
  }
}

/**
 * Sign hex hash
 *
 * @param {string} privateKey
 * @param {string} hash
 * @return {string}
 */
export function signHash (privateKey: string, hash: string): string {
  return secp256k1.sign(Buffer.from(hash, 'hex'), Buffer.from(privateKey, 'hex')).signature.toString('base64')
}

/**
 * Verify hex hash signature
 *
 * @param {string} address
 * @param {string} signature
 * @param {string} hash
 * @return {bool}
 */
export function verifySignature (address: string, signature: string, hash: string): boolean {
  return secp256k1.verify(Buffer.from(hash, 'hex'), Buffer.from(signature, 'base64'), bs58.decode(address))
}
