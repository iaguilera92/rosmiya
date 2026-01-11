const AWS = require("aws-sdk");
const XLSX = require("xlsx");
require("dotenv").config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.MY_AWS_REGION || "us-east-1";
const FILE_KEY = "Productos.xlsx";

AWS.config.update({
    region: REGION,
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
    console.log("📥 eliminarProducto.cjs");

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: "Método no permitido" }),
        };
    }

    let idEliminar;

    try {
        const body = JSON.parse(event.body || "{}");
        idEliminar = Number(body.IdProducto);

        if (!Number.isFinite(idEliminar) || idEliminar <= 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: "IdProducto inválido",
                    recibido: body.IdProducto,
                }),
            };
        }

        const file = await s3.getObject({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
        }).promise();

        const workbook = XLSX.read(file.Body, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const actualizados = data.filter(
            row => Number(row.IdProducto) !== idEliminar
        );

        if (actualizados.length === data.length) {
            console.warn("⚠️ IdProducto no encontrado:", idEliminar);
        }

        const newSheet = XLSX.utils.json_to_sheet(actualizados);
        workbook.Sheets[sheetName] = newSheet;

        const buffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
            Body: buffer,
            ContentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: "Producto eliminado correctamente",
                IdProducto: idEliminar,
            }),
        };

    } catch (error) {
        console.error("❌ Error eliminarProducto:", error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: "Error interno al eliminar producto",
                error: error.message,
            }),
        };
    }
};
