import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const secret = process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345'

console.log('====================================================')
console.log('       DriveEase Validation & Auth Test Suite       ')
console.log('====================================================\n')

let passed = 0
let failed = 0

const assert = (name, condition) => {
  if (condition) {
    console.log(`✅ [PASS] ${name}`)
    passed++
  } else {
    console.error(`❌ [FAIL] ${name}`)
    failed++
  }
}

// 1. Email Regex Validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
assert('Email validation: valid format accepted', emailRegex.test('customer@driveease.com') === true)
assert('Email validation: missing @ rejected', emailRegex.test('customerdriveease.com') === false)
assert('Email validation: missing TLD rejected', emailRegex.test('customer@driveease') === false)
assert('Email validation: empty string rejected', emailRegex.test('') === false)

// 2. Password Length Validation
const validatePassword = (pwd) => typeof pwd === 'string' && pwd.trim().length >= 6
assert('Password validation: 6+ characters accepted', validatePassword('securePass1') === true)
assert('Password validation: < 6 characters rejected', validatePassword('12345') === false)
assert('Password validation: only spaces rejected', validatePassword('     ') === false)

// 3. JWT Token Generation & Verification
const testPayload = { id: '65f1234567890abcdef12345' }
const token = jwt.sign(testPayload, secret, { expiresIn: '7d' })
const decoded = jwt.verify(token, secret)
assert('JWT: Token signed and decoded payload matches', decoded.id === testPayload.id)

// 4. Bearer Prefix Stripping
let bearerToken = `Bearer ${token}`
if (bearerToken.startsWith('Bearer ')) {
  bearerToken = bearerToken.slice(7).trim()
}
const decodedBearer = jwt.verify(bearerToken, secret)
assert('JWT: Bearer prefix properly handled & verified', decodedBearer.id === testPayload.id)

// 5. Invalid Token Rejection
let caughtInvalid = false
try {
  jwt.verify('malformed.token.value', secret)
} catch {
  caughtInvalid = true
}
assert('JWT: Tampered/invalid token properly rejected', caughtInvalid === true)

// 6. Bcrypt Password Hashing & Verification
const plain = 'MySecret123!'
const salt = await bcrypt.genSalt(10)
const hash = await bcrypt.hash(plain, salt)
const matchCorrect = await bcrypt.compare(plain, hash)
const matchWrong = await bcrypt.compare('WrongPassword', hash)
assert('Bcrypt: Plaintext matches hashed password', matchCorrect === true)
assert('Bcrypt: Incorrect password rejected', matchWrong === false)

console.log('\n----------------------------------------------------')
console.log(`Results: ${passed} Passed, ${failed} Failed`)
console.log('====================================================\n')

if (failed > 0) {
  process.exit(1)
}
