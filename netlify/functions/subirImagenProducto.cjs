const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const s3 = new AWS.S3({
    region: 'us-east-2',
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

exports.handler = async (event) => {
    try {
        const { fileBase64, contentType } = JSON.parse(event.body);

        if (!fileBase64 || !contentType) {
            return { statusCode: 400, body: 'Archivo inválido' };
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(contentType)) {
            return { statusCode: 415, body: 'Tipo no permitido' };
        }

        const extMap = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
        };

        const buffer = Buffer.from(fileBase64, 'base64');
        const key = `productos/${uuid()}/main.${extMap[contentType]}`;

        await s3.putObject({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                url: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`,
            }),
        };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Error subiendo imagen' };
    }
};
