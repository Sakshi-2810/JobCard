package com.prakharSales.jobcard.controller;

import com.prakharSales.jobcard.service.GoogleDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
public class GoogleDriveController {
    @Autowired
    private GoogleDriveService googleDriveService;

    @PostMapping("/uploadToDrive")
    public Map<String, Object> uploadToDrive(@RequestParam("file") List<MultipartFile> multipartFile) throws Exception {
        List<String> mimeType = multipartFile.stream().map(MultipartFile::getContentType).toList();
        List<String> files = googleDriveService.uploadFileToDrive(multipartFile, mimeType);
        return Map.of("fileUrl", files);
    }
}
