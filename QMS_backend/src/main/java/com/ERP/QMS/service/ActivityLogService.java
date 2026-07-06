package com.ERP.QMS.service;

import com.ERP.QMS.model.ActivityLog;
import com.ERP.QMS.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Async
    public void log(Long userId, String username, String module, String action,
                    String entityType, Long entityId, String ipAddress) {
        ActivityLog log = ActivityLog.builder()
            .userId(userId)
            .username(username)
            .module(module)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .ipAddress(ipAddress)
            .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecent(int limit) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)).getContent();
    }

    public List<ActivityLog> getByUser(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }
}
