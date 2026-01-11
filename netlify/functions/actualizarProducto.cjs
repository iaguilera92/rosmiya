const AWS = require("aws-sdk");
const XLSX = require("xlsx");
require("dotenv").config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const REGION = process.env.MY_AWS_REGION || "us-east-1";
const FILE_KEY = "Productos.xlsx";

if (process.env.MY_AWS_ACCESS_KEY_ID && process.env.MY_AWS_SECRET_ACCESS_KEY) {
    AWS.config.update({
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
        region: REGION,
    });
} else {
    AWS.config.update({ region: REGION });
}

const s3 = new AWS.S3();

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
    console.log("📥 Petición recibida en actualizarProducto.cjs");

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "OK" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Método no permitido. Usa POST." }),
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Falta el body" }),
        };
    }

    try {
        const { producto } = JSON.parse(event.body);

        if (!producto || !producto.NombreProducto) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: "Falta el NombreProducto" }),
            };
        }

        // 🔹 Obtener Excel desde S3
        const s3Data = await s3
            .getObject({ Bucket: BUCKET_NAME, Key: FILE_KEY })
            .promise();

        const workbook = XLSX.read(s3Data.Body, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const hoja = workbook.Sheets[sheetName];
        let datos = XLSX.utils.sheet_to_json(hoja);

        // 🔹 Determinar si es nuevo o edición
        const esNuevo =
            producto.IdProducto === null ||
            producto.IdProducto === undefined ||
            producto.IdProducto === "" ||
            Number.isNaN(Number(producto.IdProducto));

        // 🔹 Calcular IdProducto AUTOINCREMENT si es nuevo
        let idFinal;

        if (esNuevo) {
            const maxId = Math.max(
                0,
                ...datos.map(row => Number(row.IdProducto) || 0)
            );
            idFinal = maxId + 1;
        } else {
            idFinal = Number(producto.IdProducto);
        }


        // 🔹 Buscar producto anterior (solo si existe)
        const productoAnterior = datos.find(
            (row) => Number(row.IdProducto) === idFinal
        );

        // 🔹 Resolver imagen final
        const imageFinal =
            producto.ImageUrl && producto.ImageUrl.trim() !== ""
                ? producto.ImageUrl
                : productoAnterior?.ImageUrl || "";

        // 🔹 Si es edición, eliminar registro anterior
        if (!esNuevo) {
            datos = datos.filter(
                (row) => Number(row.IdProducto) !== idFinal
            );
        }

        // 🔹 Construir producto final
        const nuevoProducto = {
            IdProducto: idFinal,
            NombreProducto: producto.NombreProducto,
            Descripcion: producto.Descripcion || "",
            Valor: producto.Valor,
            Stock: producto.Stock,
            ImageUrl: imageFinal,
            ConDescuento: producto.ConDescuento ? true : false,
            VideoUrl: producto.VideoUrl || "",
        };

        datos.push(nuevoProducto);

        // 🔹 Guardar Excel actualizado
        const nuevaHoja = XLSX.utils.json_to_sheet(datos);
        workbook.Sheets[sheetName] = nuevaHoja;

        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });

        await s3
            .putObject({
                Bucket: BUCKET_NAME,
                Key: FILE_KEY,
                Body: buffer,
                ContentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            .promise();

        console.log("✅ Producto guardado correctamente:", idFinal);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: esNuevo
                    ? "Producto creado exitosamente."
                    : "Producto actualizado exitosamente.",
                IdProducto: idFinal, // 🔥 devolver ID real al frontend
            }),
        };
    } catch (error) {
        console.error("❌ Error en actualizarProducto.cjs:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: "Error al guardar el producto en S3",
            }),
        };
    }
};
