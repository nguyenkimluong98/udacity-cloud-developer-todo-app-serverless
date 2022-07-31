import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

// TODO: Implement the fileStogare logic
export const getAttachmentUrl = (todoId: string): string => {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}

export const getUploadUrl = async (todoId: string): Promise<string> => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}
