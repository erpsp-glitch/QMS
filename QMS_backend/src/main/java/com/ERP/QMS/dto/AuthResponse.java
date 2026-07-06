package com.ERP.QMS.dto;

import com.ERP.QMS.model.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private UserRole role;
    private String department;
    private String employeeCode;
}
