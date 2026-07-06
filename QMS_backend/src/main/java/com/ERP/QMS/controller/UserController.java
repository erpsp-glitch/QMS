package com.ERP.QMS.controller;

import com.ERP.QMS.dto.ApiResponse;
import com.ERP.QMS.model.User;
import com.ERP.QMS.model.UserRole;
import com.ERP.QMS.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAll()));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR','QMS_COORDINATOR')")
    public ResponseEntity<ApiResponse<List<User>>> getByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getByRole(role)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<User>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<User>> create(@RequestBody User user) {
        return ResponseEntity.ok(ApiResponse.ok("User created", userService.create(user)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','MR')")
    public ResponseEntity<ApiResponse<User>> update(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(ApiResponse.ok("Updated", userService.update(id, user)));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        userService.resetPassword(id, body.get("password"));
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
    }

    @PostMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        userService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.ok("Status toggled"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted"));
    }
}
