const { v4: uuid } = require("uuid");
const DEF = require("../definition")
const moment = require("moment-timezone");
const { authenticate } = require("../middleware.js");
const { accounts, documents } = require("../queries"); //model for postgres
const fs = require('fs');
const multer  = require('multer')
const multerS3 = require('multer-s3')
require('dotenv').config()
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3ACCESS_KEY_ID,
        secretAccessKey: process.env.S3SECRET_KEY,
    },
    region: process.env.S3REGION
  })

const BUCKET_NAME = process.env.AWS_BUCKET_NAME


const uploadDocument = (req, res) => {
    if (!req.file) return res.sendStatus(400)
    newDocument = {
        doc_id: req.file.key,
        user_id: req.user.id,
        name: req.file.originalname,
        date_created: moment().toISOString(),
        s3_bucket_path: req.file.location
    }
    documents.create(newDocument)
    .then((values) => {
        if(values) {
            return res.status(201).send(values)
        }
        new Error("Unable to upload document")
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error while saving to database"
        })
    })
};

const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: 'private',
      bucket: BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, {fieldName: file.fieldname})
      },
      key: (req, file, cb) => {
        cb(null, uuid())
      }
    })
  });

  const getDocuments = (req, res) => {
    documents.findAll({
        where: {
          user_id: req.user.id
        }
      })
      .then((values) => {
        res.send(values)
      })
      .catch((err) => {
        res.status(500).send({
            message: err.message || "Error while getting from database"
        })
      })
  };

  const getDocumentById = (req, res) => {
    const { user } = req;
    const {documentId} = req.params;
    documents.findOne({
        where: {
            doc_id: documentId
        }
    })
    .then((values) => {
            if (!values) return res.sendStatus(404);
            if (values.user_id != user.id) return res.sendStatus(403)
            res.send(values)
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error while getting from database"
        })
      })
  };

  const deleteDocumentById = (req, res) => {
    const { user } = req;
    const {documentId} = req.params;
    documents.findOne({
        where: {
            doc_id: documentId
        }
    })
    .then(async (values) => {
        if (!values) return res.sendStatus(404);
        if (values.user_id != user.id) return res.sendStatus(403)
        // // delete from s3
        const bucketParams = {  Bucket: BUCKET_NAME, Key: values.doc_id };
        try {
            const data = await s3.send(new DeleteObjectCommand(bucketParams)); //delete from s3
            // deleting from database
            documents.destroy({
                where: {
                    doc_id: documentId
                }
            })
            .then((values) => {
                res.sendStatus(204);
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error while getting from database"
                })
              })

          } catch (err) {
            console.log("Error", err);
          }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error while getting from database"
        })
      })
  };

const init = () => {
    const app = DEF.COM.EXPRESS_APP;
    if (!app) {
        console.error("Express app is not available");
        return;
    }
    app.post("/v1/documents",authenticate, upload.single("file"), uploadDocument);
    app.get("/v1/documents", authenticate, getDocuments);
    app.get("/v1/documents/:documentId", authenticate, getDocumentById);
    app.delete("/v1/documents/:documentId", authenticate, deleteDocumentById);
};

module.exports = {
    init,
}