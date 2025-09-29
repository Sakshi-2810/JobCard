package com.prakharSales.jobcard.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class GoogleDriveService {

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    @Value("${google.refresh.token}")
    private String refreshToken;

    private Drive driveService;

    @PostConstruct
    public void init() throws Exception {
        // Build credential
        GoogleCredential credential = new GoogleCredential.Builder().setClientSecrets(clientId, clientSecret).setTransport(GoogleNetHttpTransport.newTrustedTransport()).setJsonFactory(JacksonFactory.getDefaultInstance()).build().setRefreshToken(refreshToken);

        driveService = new Drive.Builder(GoogleNetHttpTransport.newTrustedTransport(), JacksonFactory.getDefaultInstance(), credential).setApplicationName("JobCard App").build();
    }

    /**
     * Upload a single file and return direct link
     */
    public String uploadFile(MultipartFile multipartFile, String mimeType) throws Exception {
        log.info("Uploading file: {}", multipartFile.getOriginalFilename());
        File fileMetadata = new File();
        fileMetadata.setName(multipartFile.getOriginalFilename());
        fileMetadata.setParents(Collections.singletonList("19qObLNoHXx9sfGi3ialfliTW40Zd3xVM"));

        InputStream inputStream = multipartFile.getInputStream();
        InputStreamContent mediaContent = new InputStreamContent(mimeType, inputStream);

        File uploadedFile = driveService.files().create(fileMetadata, mediaContent).setFields("id, name, webViewLink").execute();

        log.info("File uploaded successfully: {} with ID: {}", uploadedFile.getName(), uploadedFile.getId());

        return "https://drive.google.com/file/d/" + uploadedFile.getId() + "/preview";
    }

    /**
     * Upload multiple files and return list of direct links
     */
    public List<String> uploadMultipleFiles(List<MultipartFile> files, List<String> mimeType) throws Exception {
        List<String> uploadedLinks = new ArrayList<>();

        int i=0;
        for (MultipartFile file : files) {
            String link = uploadFile(file, mimeType.get(i++));
            uploadedLinks.add(link);
        }

        return uploadedLinks;
    }

}
