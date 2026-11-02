import ImageKit from 'imagekit'

let imagekit = null

try {
  if (
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  ) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    })
  } else {
    console.warn('⚠️ Notice: ImageKit credentials missing; image upload service disabled.')
  }
} catch (err) {
  console.warn('⚠️ Warning: Could not initialize ImageKit:', err.message)
}

export default imagekit
