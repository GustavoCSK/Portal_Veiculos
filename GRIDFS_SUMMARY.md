# GridFS summary

This project now uses MongoDB GridFS to store vehicle images.

## Flow

1. The frontend sends a multipart form request with a file field named `imagem`.
2. The Express route uses `multer` to read the file into memory.
3. The controller calls `createVehicle(vehicleData, req.file)`.
4. The model calls `storeVehicleImage(file)`.
5. `storeVehicleImage` opens a GridFS upload stream using `bucket.openUploadStream(...)`.
6. The binary data is saved into GridFS.
7. MongoDB returns the uploaded file `ObjectId`.
8. The vehicle document stores that `ObjectId` in `imagemId`.
9. The API returns a vehicle JSON payload with an `imagem` URL like:
   `http://localhost:3000/api/vehicles/<vehicleId>/imagem`
10. When the frontend requests that URL, the server reads the file from GridFS and sends the binary data back.

## Important concept

The vehicle document does not store the image bytes directly.
It stores a reference to the uploaded GridFS file.

The relationship is:

```txt
Vehicle document -> imagemId -> GridFS file
```

## Main functions

### `getGridFSBucket()`
Creates the GridFS bucket for the project. It points to the database and uses the bucket name `vehicleImages`.

### `storeVehicleImage(file)`
Uploads a file to GridFS and returns the generated Mongo `ObjectId`.

### `createVehicle(vehicleData, file)`
Uploads the image if a file exists, stores `imagemId`, and saves the vehicle record.

### `getVehicleImageStream(imageId)`
Reads the file from GridFS using the saved `ObjectId` and returns a download stream.

### `serializeVehicle(vehicle)`
Adds the `imagem` URL to the returned JSON so the frontend can render it.

## Collections

GridFS creates these collections in MongoDB:

- `vehicleImages.files`
- `vehicleImages.chunks`

The vehicle records live in:

- `veiculos`

## Route behavior

### Upload

```txt
POST /api/vehicles
```

Multipart form with:
- text fields (`nome`, `marca`, etc.)
- file field named `imagem`

### Get image by vehicle

```txt
GET /api/vehicles/:id/imagem
```

This reads the GridFS file using the saved `imagemId` and returns the actual image bytes.

## Example

A saved vehicle might look like:

```json
{
  "_id": "...",
  "nome": "Carro",
  "marca": "Fiat",
  "imagemId": "67f...",
  "imagemNome": "carro.png",
  "imagem": "http://localhost:3000/api/vehicles/123/imagem"
}
```

This is the pattern used by the app.
