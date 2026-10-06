# GridFS implementation explanation

This document explains exactly what each part of the new GridFS implementation is doing.

## 1) `getGridFSBucket()`

```js
function getGridFSBucket() {
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('MongoDB connection not initialized');
    }

    return new mongoose.mongo.GridFSBucket(db, { bucketName: 'vehicleImages' });
}
```

This is the entry point to GridFS.

What it does:
- gets the active MongoDB database from the current Mongoose connection
- validates that the database is connected
- creates a GridFS bucket named `vehicleImages`

This bucket is used to handle file storage and retrieval with MongoDB.

Because a custom bucket name is used, MongoDB creates collections like:
- `vehicleImages.files`
- `vehicleImages.chunks`

These are the actual storage structures used by GridFS.

---

## 2) `serializeVehicle(vehicle)`

```js
function serializeVehicle(vehicle) {
    if (!vehicle) {
        return null;
    }

    const plainVehicle = vehicle.toObject ? vehicle.toObject() : { ...vehicle };

    if (plainVehicle.imagemId) {
        plainVehicle.imagem = `http://localhost:3000/api/vehicles/${plainVehicle._id}/imagem`;
    } else {
        plainVehicle.imagem = '';
    }

    return plainVehicle;
}
```

This function prepares the vehicle object before sending it to the frontend.

What it does:
- converts a Mongoose document into a plain object
- checks whether the vehicle has an `imagemId`
- if it does, it creates a frontend-accessible image URL
- if not, it sets `imagem` to an empty string

The generated address looks like:

```txt
http://localhost:3000/api/vehicles/<VEHICLE_ID>/imagem
```

This is important because the frontend expects something usable in the `imagem` field.

---

## 3) `storeVehicleImage(file)`

```js
async function storeVehicleImage(file) {
    if (!file) {
        return null;
    }

    const bucket = getGridFSBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype || 'application/octet-stream',
        });

        uploadStream.on('error', reject);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.end(file.buffer);
    });
}
```

This is the actual file upload to GridFS.

What it does:
- checks whether there is an uploaded file
- gets the GridFS bucket
- creates an upload stream with the original file name
- sets the content type metadata
- streams the file data from `file.buffer` into MongoDB
- resolves when the upload ends

The result of `uploadStream.id` is the MongoDB `ObjectId` of the stored GridFS file.

That `ObjectId` is saved into the vehicle document as `imagemId`.

This is the critical difference between a normal filesystem upload and GridFS:
- the file is stored in MongoDB
- the document stores the file ID, not the binary itself

---

## 4) `createVehicle(vehicleData, file)`

```js
async function createVehicle(vehicleData, file) {
    await connectDBUser();

    const imageId = await storeVehicleImage(file);
    if (imageId) {
        vehicleData.imagemId = imageId;
        vehicleData.imagemNome = file.originalname;
    }

    const createdVehicle = await Vehicle.create(vehicleData);
    return serializeVehicle(createdVehicle);
}
```

This is the main vehicle creation flow.

What it does:
- connects to MongoDB using the app user
- uploads the image to GridFS if a file exists
- stores the returned file ID in `imagemId`
- stores the original file name in `imagemNome`
- creates the vehicle record in the `veiculos` collection
- returns the saved vehicle already adapted for the frontend

So the document stores:
- normal fields like `nome`, `marca`, `preco`, `categoria`
- the GridFS file id in `imagemId`
- the original filename in `imagemNome`

---

## 5) `getAllVehicles()`

```js
async function getAllVehicles() {
    await connectDBUser();
    const vehicles = await Vehicle.find({}).lean();
    return vehicles.map(serializeVehicle);
}
```

This reads all vehicles from MongoDB and prepares each one for the client.

What it does:
- connects to the app database
- queries all vehicles in the `veiculos` collection
- maps each one through `serializeVehicle()`
- adds an image URL when `imagemId` exists

This is used by the list page.

---

## 6) `getVehicleById(id)`

```js
async function getVehicleById(id) {
    await connectDBUser();
    const vehicle = await Vehicle.findById(id).lean();
    return serializeVehicle(vehicle);
}
```

This reads a single vehicle by its Mongo `_id`.

It is used when the app requests one specific vehicle, and it also adds the image URL on the response.

---

## 7) `getVehicleByCat(categoria)`

```js
async function getVehicleByCat(categoria) {
    await connectDBUser();
    const vehicles = await Vehicle.find({ categoria }).lean();
    return vehicles.map(serializeVehicle);
}
```

This is the same idea as `getAllVehicles()`, but filtered by category.

It returns vehicles from a specific category and adds the image URL to each record.

---

## 8) `getVehicleImageStream(imageId)`

```js
async function getVehicleImageStream(imageId) {
    if (!imageId) {
        return null;
    }

    const bucket = getGridFSBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(imageId));
}
```

This is the file read operation for GridFS.

What it does:
- accepts the GridFS file ID previously stored in `imagemId`
- opens a download stream from the bucket
- returns a readable stream of binary data

This stream is later piped directly to the HTTP response so the browser receives the actual image file.

---

## How the route handles the upload

From the route file:

```js
const upload = multer({ storage: multer.memoryStorage() });
```

`multer` parses multipart form-data and stores the file in memory because we use `memoryStorage()`.

Then:

```js
router.post('/vehicles', upload.single('imagem'), vehicleController.createVehicle);
```

This means the request field named `imagem` is parsed as a single file upload.

The uploaded file object is available at:

```js
req.file
```

That object contains:
- `originalname`
- `mimetype`
- `buffer`
- `size`

Those values are exactly what `storeVehicleImage(file)` needs.

---

## How the controller serves the image

```js
exports.getVehicleImage = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    try {
        const vehicle = await vehicleModel.getVehicleById(id);
        if (!vehicle || !vehicle.imagemId) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }

        const imageStream = await vehicleModel.getVehicleImageStream(vehicle.imagemId);
        if (!imageStream) {
            return res.status(404).json({ message: 'Vehicle image not found' });
        }

        const fileInfo = await mongoose.connection.db.collection('fs.files').findOne({ _id: new mongoose.Types.ObjectId(vehicle.imagemId) });
        res.setHeader('Content-Type', fileInfo?.contentType || 'application/octet-stream');

        imageStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vehicle image', error: error.message });
    }
};
```

This controller does the exact download step:

1. loads the vehicle
2. confirms it has `imagemId`
3. opens GridFS download stream using that id
4. reads metadata from `fs.files`
5. sets content type
6. streams bytes to the browser

This is the endpoint behind the URL created in `serializeVehicle()`.

---

## Final summary

The new GridFS logic is doing the correct pattern:

- upload binary files into GridFS
- save the file ID in the vehicle document
- return an image URL to the frontend
- read the image back through a dedicated API endpoint

This is the correct MongoDB GridFS structure for large binary files like vehicle photos.

The important relationship is:

```txt
Vehicle document  --->  imagemId  --->  GridFS file
```

That means the database stores the actual image separately and only references it from the vehicle record.
