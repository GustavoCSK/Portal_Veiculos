# GridFS summary

This project now uses MongoDB GridFS to store vehicle images.

## Flow

1. The client sends a multipart form request with one or more files under the repeated `imagens` field.
2. The Express route uses `multer` to read the images into memory.
3. The controller calls `createVehicle(vehicleData, files)`.
4. The model calls `storeVehicleImage(file)` for each image.
5. `storeVehicleImage` opens a GridFS upload stream using `bucket.openUploadStream(...)`.
6. Each binary image is saved into GridFS.
7. MongoDB returns an `ObjectId` for each uploaded file.
8. The vehicle document stores all image IDs in `imagemIds` and filenames in `imagemNomes`.
9. The API returns a vehicle JSON payload with an `imagens` URL list.
10. When the frontend requests an indexed URL, the server reads that file from GridFS and sends the binary data back.

## Important concept

The vehicle document does not store the image bytes directly.
It stores a reference to the uploaded GridFS file.

The relationship is:

```txt
Vehicle document -> imagemIds[] -> GridFS files
```

## Main functions

### `getGridFSBucket()`
Creates the GridFS bucket for the project. It points to the database and uses the bucket name `vehicleImages`.

### `storeVehicleImage(file)`
Uploads a file to GridFS and returns the generated Mongo `ObjectId`.

### `createVehicle(vehicleData, files)`
Uploads every supplied image, stores their IDs in `imagemIds`, and saves the vehicle record.

### `getVehicleImageStream(imageId)`
Reads the file from GridFS using the saved `ObjectId` and returns a download stream.

### `serializeVehicle(vehicle)`
Adds the `imagens` URL list to the returned JSON.

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
- one or more files named `imagens` (up to 10 files per vehicle)

### Get image by vehicle

```txt
GET /api/vehicles/:id/imagens/:imageIndex
```

This reads the indexed GridFS file from `imagemIds` and returns its image bytes. A vehicle with one image uses index `0`.

## Example

A saved vehicle might look like:

```json
{
  "_id": "...",
  "nome": "Carro",
  "marca": "Fiat",
  "imagemIds": ["67f...", "67e..."],
  "imagemNomes": ["carro.png", "interior.png"],
  "imagens": [
    "http://localhost:3000/api/vehicles/123/imagens/0",
    "http://localhost:3000/api/vehicles/123/imagens/1"
  ]
}
```

Every vehicle uses the same `imagemIds` array shape, whether it has one image or several.
