package com.ERP.QMS.service;

import com.ERP.QMS.model.*;
import com.ERP.QMS.model.AuditPlan;
import com.ERP.QMS.model.AuditSchedule;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    @Value("${qms.company.name}")
    private String companyName;

    @Value("${qms.company.address}")
    private String companyAddress;

    @Value("${qms.company.gst}")
    private String companyGst;

    private static final DeviceRgb BRAND_COLOR = new DeviceRgb(40, 8, 130);
    private static final DeviceRgb BRAND_LIGHT = new DeviceRgb(237, 233, 255);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

    // ===== NC Summary Report =====
    public byte[] generateNcReport(List<NcTracking> ncList, String certName) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (PdfDocument pdf = new PdfDocument(new PdfWriter(bos));
             Document doc = new Document(pdf, PageSize.A4)) {

            doc.setMargins(40, 40, 40, 40);
            addHeader(doc, "NC/CAPA Summary Report", certName);

            // Table
            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 2.5f, 2f, 2f, 1.5f, 1.5f}))
                .setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"NC No.", "Description", "Department", "Responsible", "Target Date", "Status"};
            for (String h : headers) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(BRAND_COLOR).setPadding(6));
            }

            boolean alt = false;
            for (NcTracking nc : ncList) {
                DeviceRgb rowBg = alt ? BRAND_LIGHT : new DeviceRgb(255, 255, 255);
                table.addCell(cell(nc.getNcNumber(), rowBg));
                table.addCell(cell(truncate(nc.getNcDescription(), 80), rowBg));
                table.addCell(cell(nc.getDepartment() != null ? nc.getDepartment() : "-", rowBg));
                table.addCell(cell(nc.getResponsiblePerson() != null ? nc.getResponsiblePerson() : "-", rowBg));
                table.addCell(cell(nc.getTargetDate() != null ? nc.getTargetDate().format(DATE_FMT) : "-", rowBg));
                table.addCell(cell(nc.getStatus().name(), rowBg));
                alt = !alt;
            }
            doc.add(table);
            addFooter(doc);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return bos.toByteArray();
    }

    // ===== Document Master List =====
    public byte[] generateDocumentMasterList(List<com.ERP.QMS.model.Document> docs, String certName) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (PdfDocument pdf = new PdfDocument(new PdfWriter(bos));
             Document doc = new Document(pdf, PageSize.A4.rotate())) {

            doc.setMargins(40, 40, 40, 40);
            addHeader(doc, "Document Master List", certName);

            Table table = new Table(UnitValue.createPercentArray(new float[]{1.5f, 3f, 1.5f, 2f, 1f, 1.5f, 1.5f, 1.5f}))
                .setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"Doc No.", "Title", "Level", "Department", "Rev.", "Prepared By", "Eff. Date", "Status"};
            for (String h : headers) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(BRAND_COLOR).setPadding(6));
            }

            boolean alt = false;
            for (com.ERP.QMS.model.Document d : docs) {
                DeviceRgb rowBg = alt ? BRAND_LIGHT : new DeviceRgb(255, 255, 255);
                table.addCell(cell(d.getDocumentNumber(), rowBg));
                table.addCell(cell(truncate(d.getTitle(), 60), rowBg));
                table.addCell(cell(d.getLevel().name().replace("LEVEL_", "Level "), rowBg));
                table.addCell(cell(d.getDepartment() != null ? d.getDepartment().getName() : "-", rowBg));
                table.addCell(cell(d.getRevisionNumber(), rowBg));
                table.addCell(cell(d.getPreparedBy() != null ? d.getPreparedBy() : "-", rowBg));
                table.addCell(cell(d.getEffectiveDate() != null ? d.getEffectiveDate().format(DATE_FMT) : "-", rowBg));
                table.addCell(cell(d.getStatus().name(), rowBg));
                alt = !alt;
            }
            doc.add(table);
            addFooter(doc);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return bos.toByteArray();
    }

    // ===== KPI Monthly Report =====
    public byte[] generateKpiReport(List<KpiEntry> entries, String certName, String month, int year) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (PdfDocument pdf = new PdfDocument(new PdfWriter(bos));
             Document doc = new Document(pdf, PageSize.A4)) {

            doc.setMargins(40, 40, 40, 40);
            addHeader(doc, "KPI Report — " + month + " " + year, certName);

            Table table = new Table(UnitValue.createPercentArray(new float[]{2f, 3f, 1.5f, 1.5f, 1.5f, 1.5f}))
                .setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"KPI Code", "Title", "Target", "Actual", "Achievement %", "Status"};
            for (String h : headers) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(BRAND_COLOR).setPadding(6));
            }

            boolean alt = false;
            for (KpiEntry e : entries) {
                DeviceRgb rowBg = alt ? BRAND_LIGHT : new DeviceRgb(255, 255, 255);
                table.addCell(cell(e.getKpiMaster().getKpiCode(), rowBg));
                table.addCell(cell(truncate(e.getKpiMaster().getTitle(), 50), rowBg));
                table.addCell(cell(e.getTargetValue() != null ? String.valueOf(e.getTargetValue()) : "-", rowBg));
                table.addCell(cell(e.getActualValue() != null ? String.valueOf(e.getActualValue()) : "-", rowBg));
                table.addCell(cell(e.getAchievementPercent() != null ? e.getAchievementPercent() + "%" : "-", rowBg));
                table.addCell(cell(e.getStatus().name(), rowBg));
                alt = !alt;
            }
            doc.add(table);
            addFooter(doc);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return bos.toByteArray();
    }

    // ===== Audit Plan Report =====
    public byte[] generateAuditPlanReport(AuditPlan plan, List<AuditSchedule> schedules, List<NcTracking> ncs) {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (PdfDocument pdf = new PdfDocument(new PdfWriter(bos));
             Document doc = new Document(pdf, PageSize.A4)) {

            doc.setMargins(40, 40, 40, 40);
            String certName = plan.getCertification() != null ? plan.getCertification().getName() : "";
            addHeader(doc, "Audit Plan Report — " + plan.getAuditRefNo(), certName);

            // Plan details table
            Table info = new Table(UnitValue.createPercentArray(new float[]{2f, 3f, 2f, 3f}))
                .setWidth(UnitValue.createPercentValue(100)).setMarginBottom(10);

            String[][] rows = {
                {"Audit Ref No.", plan.getAuditRefNo(), "Type", plan.getAuditType() != null ? plan.getAuditType().name() : "-"},
                {"Lead Auditor", plan.getLeadAuditor() != null ? plan.getLeadAuditor() : "-", "Status", plan.getStatus() != null ? plan.getStatus().name() : "-"},
                {"Start Date", plan.getPlannedStartDate() != null ? plan.getPlannedStartDate().format(DATE_FMT) : "-", "End Date", plan.getPlannedEndDate() != null ? plan.getPlannedEndDate().format(DATE_FMT) : "-"},
                {"Approved By", plan.getApprovedBy() != null ? plan.getApprovedBy() : "-", "Approval", plan.getApprovalStatus() != null ? plan.getApprovalStatus().name() : "-"},
            };
            for (String[] row : rows) {
                info.addCell(new Cell().add(new Paragraph(row[0]).setBold().setFontSize(9)).setBackgroundColor(BRAND_LIGHT).setPadding(5));
                info.addCell(new Cell().add(new Paragraph(row[1]).setFontSize(9)).setPadding(5));
                info.addCell(new Cell().add(new Paragraph(row[2]).setBold().setFontSize(9)).setBackgroundColor(BRAND_LIGHT).setPadding(5));
                info.addCell(new Cell().add(new Paragraph(row[3]).setFontSize(9)).setPadding(5));
            }
            doc.add(info);

            if (plan.getScope() != null) {
                doc.add(new Paragraph("Scope:").setBold().setFontSize(10).setMarginTop(8));
                doc.add(new Paragraph(plan.getScope()).setFontSize(9).setFontColor(ColorConstants.DARK_GRAY));
            }

            // Schedules
            if (schedules != null && !schedules.isEmpty()) {
                doc.add(new Paragraph("Audit Schedule").setBold().setFontSize(11).setMarginTop(12));
                Table st = new Table(UnitValue.createPercentArray(new float[]{2f, 2f, 2f, 2f, 2f}))
                    .setWidth(UnitValue.createPercentValue(100));
                for (String h : new String[]{"Department", "Location", "Date", "Auditor", "Auditee"}) {
                    st.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE).setFontSize(9))
                        .setBackgroundColor(BRAND_COLOR).setPadding(5));
                }
                for (AuditSchedule s : schedules) {
                    boolean alt2 = schedules.indexOf(s) % 2 == 1;
                    DeviceRgb bg = alt2 ? BRAND_LIGHT : new DeviceRgb(255, 255, 255);
                    st.addCell(cell(s.getDepartment(), bg));
                    st.addCell(cell(s.getLocation(), bg));
                    st.addCell(cell(s.getAuditDate() != null ? s.getAuditDate().format(DATE_FMT) : "-", bg));
                    st.addCell(cell(s.getAuditor(), bg));
                    st.addCell(cell(s.getAuditee(), bg));
                }
                doc.add(st);
            }

            // NC Summary
            if (ncs != null && !ncs.isEmpty()) {
                doc.add(new Paragraph("NC Summary (" + ncs.size() + ")").setBold().setFontSize(11).setMarginTop(12));
                Table nt = new Table(UnitValue.createPercentArray(new float[]{2f, 1.5f, 3f, 2f, 1.5f}))
                    .setWidth(UnitValue.createPercentValue(100));
                for (String h : new String[]{"NC No.", "Type", "Description", "Responsible", "Status"}) {
                    nt.addHeaderCell(new Cell().add(new Paragraph(h).setBold().setFontColor(ColorConstants.WHITE).setFontSize(9))
                        .setBackgroundColor(BRAND_COLOR).setPadding(5));
                }
                for (NcTracking nc : ncs) {
                    boolean alt2 = ncs.indexOf(nc) % 2 == 1;
                    DeviceRgb bg = alt2 ? BRAND_LIGHT : new DeviceRgb(255, 255, 255);
                    nt.addCell(cell(nc.getNcNumber(), bg));
                    nt.addCell(cell(nc.getNcType() != null ? nc.getNcType().name() : "-", bg));
                    nt.addCell(cell(truncate(nc.getNcDescription(), 60), bg));
                    nt.addCell(cell(nc.getResponsiblePerson(), bg));
                    nt.addCell(cell(nc.getStatus().name(), bg));
                }
                doc.add(nt);
            }

            addFooter(doc);
        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage(), e);
        }
        return bos.toByteArray();
    }

    // ===== Helpers =====
    private void addHeader(Document doc, String title, String subtitle) {
        Table header = new Table(1).setWidth(UnitValue.createPercentValue(100));
        Cell headerCell = new Cell()
            .add(new Paragraph(companyName).setBold().setFontSize(16).setFontColor(ColorConstants.WHITE))
            .add(new Paragraph(companyAddress).setFontSize(8).setFontColor(ColorConstants.WHITE))
            .add(new Paragraph(title).setBold().setFontSize(13).setFontColor(ColorConstants.WHITE).setMarginTop(5))
            .add(new Paragraph(subtitle).setFontSize(10).setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(BRAND_COLOR)
            .setPadding(15)
            .setTextAlignment(TextAlignment.CENTER);
        header.addCell(headerCell);
        doc.add(header);
        doc.add(new Paragraph("Generated: " + LocalDate.now().format(DATE_FMT) + "  |  GST: " + companyGst)
            .setFontSize(8).setFontColor(ColorConstants.GRAY)
            .setTextAlignment(TextAlignment.RIGHT).setMarginTop(5).setMarginBottom(10));
    }

    private void addFooter(Document doc) {
        doc.add(new Paragraph("\nPrepared By: ________________    Reviewed By: ________________    Approved By: ________________")
            .setFontSize(9).setMarginTop(20));
        doc.add(new Paragraph(companyName + " | QMS Document | Confidential")
            .setFontSize(8).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));
    }

    private Cell cell(String text, DeviceRgb bg) {
        return new Cell().add(new Paragraph(text != null ? text : "-").setFontSize(9))
            .setBackgroundColor(bg).setPadding(5);
    }

    private String truncate(String s, int max) {
        if (s == null) return "-";
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}
