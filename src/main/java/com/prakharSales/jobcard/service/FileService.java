package com.prakharSales.jobcard.service;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import com.mongodb.client.model.Filters;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class FileService {

    private final GridFSBucket gridFSBucket;

    public FileService(MongoDatabaseFactory mongoDatabaseFactory) {
        this.gridFSBucket = GridFSBuckets.create(mongoDatabaseFactory.getMongoDatabase());
    }

    /**
     * Upload a file to GridFS and return its ObjectId as string
     */
    public String uploadFile(MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            GridFSUploadOptions options = new GridFSUploadOptions()
                    .chunkSizeBytes(358400) // 350 KB chunks
                    .metadata(new org.bson.Document("contentType", file.getContentType()));

            ObjectId fileId = gridFSBucket.uploadFromStream(file.getOriginalFilename(), inputStream, options);
            return fileId.toHexString();
        }
    }

    /**
     * Download a file from GridFS by ID
     */
    public InputStream downloadFile(String fileId) {
        return gridFSBucket.openDownloadStream(new ObjectId(fileId));
    }

    /**
     * Delete a file from GridFS by ID
     */
    public void deleteFile(String fileId) {
        gridFSBucket.delete(new ObjectId(fileId));
    }

    public GridFSFile getGridFSFile(String fileId) {
        return gridFSBucket.find(Filters.eq("_id", new ObjectId(fileId))).first();
    }
}
