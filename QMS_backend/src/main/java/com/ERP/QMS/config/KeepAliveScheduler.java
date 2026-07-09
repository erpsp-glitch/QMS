package com.ERP.QMS.config;

package com.QMS.config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.net.HttpURLConnection;
import java.net.URL;
/**
 * Self-ping scheduler to prevent Render.com free tier from spinning down.
 * 
 * Render.com free tier spins down the server after 15 minutes of inactivity.
 * This scheduler pings the app's own health endpoint every 13 minutes,
 * keeping the server alive and avoiding cold starts.
 */
@Component
public class KeepAliveScheduler {
    private static final Logger logger = LoggerFactory.getLogger(KeepAliveScheduler.class);
    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;
    @Value("${server.port:8080}")
    private int serverPort;
    @Value("${server.servlet.context-path:}")
    private String contextPath;
    /**
     * Ping the health endpoint every 13 minutes (780000 ms).
     * This runs BEFORE Render's 15-minute inactivity timeout.
     * 
     * Initial delay of 60 seconds allows the app to fully start up first.
     */
    @Scheduled(fixedRate = 780000, initialDelay = 60000)
    public void keepAlive() {
        String url = buildHealthUrl();
        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                logger.info("[KeepAlive] Ping successful - Server is alive ({})", url);
            } else {
                logger.warn("[KeepAlive] Ping returned status {} ({})", responseCode, url);
            }
            connection.disconnect();
        } catch (Exception e) {
            logger.error("[KeepAlive] Ping failed for {}: {}", url, e.getMessage());
        }
    }
    /**
     * Build the health check URL.
     * Uses RENDER_EXTERNAL_URL if available (production), otherwise falls back to localhost.
     */
    private String buildHealthUrl() {
        if (renderExternalUrl != null && !renderExternalUrl.isBlank()) {
            // In production on Render: use the external URL
            String baseUrl = renderExternalUrl.endsWith("/") 
                ? renderExternalUrl.substring(0, renderExternalUrl.length() - 1) 
                : renderExternalUrl;
            return baseUrl + contextPath + "/health";
        }
        // Local development fallback
        return "http://localhost:" + serverPort + contextPath + "/health";
    }
}
