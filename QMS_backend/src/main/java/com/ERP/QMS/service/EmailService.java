package com.ERP.QMS.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${qms.company.name}")
    private String companyName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, companyName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendBulkEmail(List<String> recipients, String subject, String htmlBody) {
        recipients.forEach(to -> sendEmail(to, subject, htmlBody));
    }

    public String buildNcReminderEmail(String ncNumber, String description, String responsiblePerson, String targetDate) {
        return """
            <html><body style='font-family:Arial,sans-serif;'>
            <div style='background:#280882;color:white;padding:20px;text-align:center;'>
              <h2>%s — QMS Non-Conformance Reminder</h2>
            </div>
            <div style='padding:20px;'>
              <p>Dear %s,</p>
              <p>This is a reminder that the following Non-Conformance is pending your action:</p>
              <table style='width:100%%;border-collapse:collapse;'>
                <tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold;'>NC Number</td><td style='padding:8px;border:1px solid #ddd;'>%s</td></tr>
                <tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold;'>Description</td><td style='padding:8px;border:1px solid #ddd;'>%s</td></tr>
                <tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold;'>Target Date</td><td style='padding:8px;border:1px solid #ddd;color:red;font-weight:bold;'>%s</td></tr>
              </table>
              <p>Please take immediate action to close this NC.</p>
              <p>Regards,<br><strong>QMS Team</strong></p>
            </div>
            </body></html>
            """.formatted(companyName, responsiblePerson, ncNumber, description, targetDate);
    }

    public String buildKpiReminderEmail(String kpiTitle, String month, String responsiblePerson) {
        return """
            <html><body style='font-family:Arial,sans-serif;'>
            <div style='background:#280882;color:white;padding:20px;text-align:center;'>
              <h2>%s — KPI Data Entry Reminder</h2>
            </div>
            <div style='padding:20px;'>
              <p>Dear %s,</p>
              <p>The KPI data entry for <strong>%s</strong> for the month of <strong>%s</strong> is pending.</p>
              <p>Please login to the QMS portal and update your KPI data.</p>
              <p>Regards,<br><strong>QMS Team</strong></p>
            </div>
            </body></html>
            """.formatted(companyName, responsiblePerson, kpiTitle, month);
    }
}
