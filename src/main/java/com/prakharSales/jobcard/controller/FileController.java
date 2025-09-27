package com.prakharSales.jobcard.controller;
import com.mongodb.client.gridfs.model.GridFSFile;
import com.prakharSales.jobcard.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String id) throws Exception {
        try (InputStream inputStream = fileService.downloadFile(id)) {
            byte[] fileBytes = inputStream.readAllBytes();

            // Determine content type from GridFS metadata
            GridFSFile file = fileService.getGridFSFile(id); // add this method
            String contentType = "application/octet-stream";
            if (file.getMetadata() != null && file.getMetadata().getString("contentType") != null) {
                contentType = file.getMetadata().getString("contentType");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileBytes);
        }
    }

}
