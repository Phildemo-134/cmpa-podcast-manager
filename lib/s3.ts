import AWS from 'aws-sdk'

// Configuration AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET!

interface UploadResult {
  url: string
  key: string
  bucket: string
}

interface DeleteResult {
  success: boolean
  error?: string
}

/**
 * Upload un fichier audio vers S3
 */
export async function uploadAudioToS3(
  file: File,
  userId: string,
  episodeId: string
): Promise<UploadResult> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET non configuré')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substr(2, 9)}.${fileExt}`
  const key = `audio/${userId}/${episodeId}/${fileName}`

  const params: AWS.S3.PutObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
    ACL: 'private', // Fichiers privés par défaut
    Metadata: {
      originalName: file.name,
      userId: userId,
      episodeId: episodeId,
      uploadedAt: new Date().toISOString(),
    },
  }

  try {
    const result = await s3.upload(params).promise()
    
    return {
      url: result.Location,
      key: result.Key!,
      bucket: result.Bucket!,
    }
  } catch (error) {
    console.error('Erreur upload S3:', error)
    throw new Error(`Échec de l'upload vers S3: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Génère une URL signée pour accéder au fichier audio
 */
export async function getSignedAudioUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET non configuré')
  }

  const params: AWS.S3.GetObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: key,
  }

  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      ...params,
      Expires: expiresIn,
    })
    return url
  } catch (error) {
    console.error('Erreur génération URL signée:', error)
    throw new Error(`Échec de génération de l'URL signée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

/**
 * Supprime un fichier audio de S3
 */
export async function deleteAudioFromS3(key: string): Promise<DeleteResult> {
  if (!BUCKET_NAME) {
    return { success: false, error: 'AWS_S3_BUCKET non configuré' }
  }

  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: key,
  }

  try {
    await s3.deleteObject(params).promise()
    return { success: true }
  } catch (error) {
    console.error('Erreur suppression S3:', error)
    return { 
      success: false, 
      error: `Échec de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
    }
  }
}

/**
 * Vérifie si un fichier existe dans S3
 */
export async function checkAudioExists(key: string): Promise<boolean> {
  if (!BUCKET_NAME) {
    return false
  }

  const params: AWS.S3.HeadObjectRequest = {
    Bucket: BUCKET_NAME,
    Key: key,
  }

  try {
    await s3.headObject(params).promise()
    return true
  } catch (error) {
    return false
  }
}
