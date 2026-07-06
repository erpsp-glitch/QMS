package com.ERP.QMS.service;

import com.ERP.QMS.dto.AuthRequest;
import com.ERP.QMS.dto.AuthResponse;
import com.ERP.QMS.model.User;
import com.ERP.QMS.model.UserRole;
import com.ERP.QMS.repository.UserRepository;
import com.ERP.QMS.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) {
            throw new RuntimeException("Account is disabled. Contact administrator.");
        }

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
        } catch (Exception e) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid credentials");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFullName());

        String token = jwtUtil.generateToken(userDetails, claims);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .token(token)
            .refreshToken(refreshToken)
            .userId(user.getId())
            .username(user.getUsername())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .role(user.getRole())
            .department(user.getDepartment() != null ? user.getDepartment().getName() : null)
            .employeeCode(user.getEmployeeCode())
            .build();
    }

    @Transactional
    public void createDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Administrator")
                .email("admin@dasskqms.com")
                .role(UserRole.SUPER_ADMIN)
                .active(true)
                .build();
            userRepository.save(admin);
        }
    }
}
