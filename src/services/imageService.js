module.exports = (bucket) => {
    return {
        uploader: async (folder, name, req, res, next) => {
            try {
                if (!req.file) {
                    throw new Error("Error, could not upload file");
                }
                const blob = bucket.file(folder + "/" + name);
                const blobWriter = blob.createWriteStream({
                    metadata: {
                        contentType: req.file.mimetype
                    },
                });
                // blobWriter.on('error', (err) => next(err));
                let publicURL = "";
                publicURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
                // podria borrarse esto
                blobWriter.on("finish", () => {
                    // publicURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
                    return publicURL;
                    // res.status(200).send({ fileName: req.file.originalname, fileLocation: publicUrl });
                });
                blobWriter.end(req.file.buffer);
                return publicURL;
            }
            catch (error) {
                res.status(400).send(`Error, could not upload file: ${error}`);
                return;
            }
        }
    }
}