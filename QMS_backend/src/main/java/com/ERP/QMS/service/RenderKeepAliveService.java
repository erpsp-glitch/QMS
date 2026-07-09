package com.ERP.QMS.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RenderKeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(RenderKeepAliveService.class);

    // RENDER_EXTERNAL_URL is automatically provided by Render
    // We fall back to empty string if it's not present (e.g. locally)
    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private final RestTemplate restTemplate;

    public RenderKeepAliveService() {
        this.restTemplate = new RestTemplate();
    }

    // Run every 14 minutes (840000 ms) to keep the Render free tier from sleeping (it sleeps after 15 mins)
    @Scheduled(fixedRate = 840000)
    public void pingRender() {
        if (renderExternalUrl != null && !renderExternalUrl.isEmpty()) {
            try {
                // We ping the actuator health endpoint or the root endpoint
                String url = renderExternalUrl + "/actuator/health";
                log.info("Pinging render server to keep alive: {}", url);
                restTemplate.getForObject(url, String.class);
                log.info("Ping successful");
            } catch (Exception e) {
                log.error("Error pinging render server", e);
            }
        } else {
            log.debug("RENDER_EXTERNAL_URL is not set. Skipping keep-alive ping.");
        }
    }
}
